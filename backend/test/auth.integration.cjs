require('reflect-metadata');
require('ts-node/register/transpile-only');
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { existsSync } = require('node:fs');
const { Test } = require('@nestjs/testing');
const { ConfigModule, ConfigService } = require('@nestjs/config');
const { JwtService } = require('@nestjs/jwt');
const { ValidationPipe } = require('@nestjs/common');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const { AuthModule } = require('../src/auth/auth.module');
const { PerfisModule } = require('../src/perfis/perfis.module');
const { PrismaService } = require('../src/prisma/prisma.service');
const { MailService } = require('../src/mail/mail.service');
const { mountFrontend } = require('../src/common/frontend.setup');
const { chromium } = require('./helpers/playwright.cjs');

// Real Nest controllers, services, bcrypt, JWT, guards and HTTP transport.
// Persistence and SMTP are isolated to avoid changing accounts or sending mail.
let app, base, browser;
const users = new Map(),
  resets = new Map(),
  sent = [];
const password = 'Teste-login-123!';
const secret = 'JBSWY3DPEHPK3PXP';
const select = (row, selection) =>
  !row
    ? null
    : selection
      ? Object.fromEntries(
          Object.keys(selection)
            .filter((key) => selection[key])
            .map((key) => [key, row[key]]),
        )
      : { ...row };
const lookup = (where) =>
  [...users.values()].find((user) =>
    where.id ? user.id === where.id : user.email === where.email,
  );
const update = (user, data) => {
  for (const [key, value] of Object.entries(data))
    user[key] = value?.increment ? user[key] + value.increment : value;
  return user;
};
const matchesReset = (row, where) =>
  Object.entries(where).every(([key, value]) =>
    key === 'expiresAt' ? row.expiresAt > value.gt : row[key] === value,
  );
const prisma = {
  usuarios: {
    findUnique: async ({ where, select: selection }) =>
      select(lookup(where), selection),
    create: async ({ data, select: selection }) => {
      const user = {
        ...data,
        id: users.size + 1,
        ativo: true,
        auth_version: 0,
        isTwoFactorEnable: false,
      };
      users.set(user.id, user);
      return select(user, selection);
    },
    update: async ({ where, data, select: selection }) =>
      select(update(lookup(where), data), selection),
    updateMany: async ({ where, data }) => {
      const user = lookup(where);
      if (!user || (where.ativo && !user.ativo)) return { count: 0 };
      update(user, data);
      return { count: 1 };
    },
  },
  perfis: {
    findMany: async () => [
      { id: 1, nome: 'Administrador' },
      { id: 2, nome: 'Operador' },
    ],
  },
  passwordResetToken: {
    create: async ({ data }) => {
      const row = { ...data, id: resets.size + 1, usedAt: null };
      resets.set(row.id, row);
      return { ...row };
    },
    findUnique: async ({ where }) => {
      const row = [...resets.values()].find(
        (row) => row.tokenHash === where.tokenHash,
      );
      return row ? { ...row, user: { ...users.get(row.userId) } } : null;
    },
    updateMany: async ({ where, data }) => {
      let count = 0;
      for (const row of resets.values())
        if (matchesReset(row, where)) {
          Object.assign(row, data);
          count++;
        }
      return { count };
    },
    deleteMany: async ({ where }) => {
      resets.delete(where.id);
      return { count: 1 };
    },
  },
  $transaction: async (callback) => callback(prisma),
};
async function request(route, body, token, method = body ? 'POST' : 'GET') {
  const response = await fetch(base + route, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, body: await response.json() };
}
async function login(email = 'admin@example.test') {
  const result = await request('/auth/login', { email, senha: password });
  assert.equal(result.status, 201);
  return result.body;
}
before(
  async () => {
    const hash = await bcrypt.hash(password, 10);
    for (const [id, email, role, mfa] of [
      [1, 'admin@example.test', 1, false],
      [2, 'operator@example.test', 2, false],
      [3, 'mfa@example.test', 2, true],
    ]) {
      users.set(id, {
        id,
        email,
        nome: `Pessoa ${id}`,
        perfil_id: role,
        ativo: true,
        senha_hash: hash,
        auth_version: 0,
        isTwoFactorEnable: mfa,
        twoFactorSecret: mfa ? secret : null,
        token_2fa: null,
        token_expiracao: null,
      });
    }
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              JWT_SECRET: 'test-only-secret-never-deploy',
              FRONTEND_URL: 'http://localhost/frontend/',
              SMTP_ENABLED: 'true',
              SMTP_HOST: 'test',
              SMTP_USER: 'test',
              SMTP_PASS: 'test',
            }),
          ],
        }),
        AuthModule,
        PerfisModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideProvider(MailService)
      .useValue({
        enviarEmail: async (mail) => {
          sent.push(mail);
          return true;
        },
      })
      .compile();
    app = module.createNestApplication({ logger: false });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    mountFrontend(app);
    await app.listen(0, '127.0.0.1');
    base = await app.getUrl();
  },
  { timeout: 30000 },
);
after(async () => {
  if (browser)
    await Promise.race([
      browser.close(),
      new Promise((resolve) => setTimeout(resolve, 3000).unref()),
    ]);
  if (app) {
    app.getHttpServer().closeAllConnections();
    await app.close();
  }
});

test('credentials, active account, profile sanitization and logout revocation', async () => {
  assert.equal(
    (
      await request('/auth/login', {
        email: 'admin@example.test',
        senha: 'incorrect',
      })
    ).status,
    401,
  );
  assert.equal(
    (await request('/auth/login', { email: 'bad', senha: password })).status,
    400,
  );
  users.get(2).ativo = false;
  assert.equal(
    (
      await request('/auth/login', {
        email: 'operator@example.test',
        senha: password,
      })
    ).status,
    401,
  );
  users.get(2).ativo = true;
  const session = await login();
  const profile = await request('/auth/me', null, session.access_token);
  assert.equal(profile.status, 200);
  assert.equal(profile.body.nome, 'Pessoa 1');
  for (const key of [
    'senha_hash',
    'twoFactorSecret',
    'token_2fa',
    'token_expiracao',
    'auth_version',
  ])
    assert.equal(key in profile.body, false);
  assert.equal(
    (await request('/auth/logout', {}, session.access_token)).status,
    201,
  );
  assert.equal(
    (await request('/auth/me', null, session.access_token)).status,
    401,
  );
  const expired = app
    .get(JwtService)
    .sign({ sub: 1, version: users.get(1).auth_version }, { expiresIn: -1 });
  assert.equal((await request('/auth/me', null, expired)).status, 401);
});
test('MFA challenge cannot access private routes; correct TOTP completes login', async () => {
  const challenge = await login('mfa@example.test');
  assert.equal(challenge.mfaRequired, true);
  assert.equal(challenge.access_token, undefined);
  assert.equal(
    (await request('/auth/me', null, challenge.preAuthToken)).status,
    401,
  );
  assert.equal(
    (
      await request(
        '/auth/2fa/authenticate',
        { codigo: 'abc' },
        challenge.preAuthToken,
      )
    ).status,
    400,
  );
  const codigo = speakeasy.totp({ secret, encoding: 'base32' });
  let invalid = '000000';
  while (
    speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: invalid,
      window: 1,
    })
  )
    invalid = String(Number(invalid) + 1).padStart(6, '0');
  assert.equal(
    (
      await request(
        '/auth/2fa/authenticate',
        { codigo: invalid },
        challenge.preAuthToken,
      )
    ).status,
    401,
  );
  const result = await request(
    '/auth/2fa/authenticate',
    { codigo },
    challenge.preAuthToken,
  );
  assert.equal(result.status, 201);
  assert.ok(result.body.access_token);
  users.get(3).ativo = false;
  assert.equal(
    (
      await request(
        '/auth/2fa/authenticate',
        { codigo },
        challenge.preAuthToken,
      )
    ).status,
    401,
  );
  users.get(3).ativo = true;
});
test('user creation requires administrator and never returns password hashes', async () => {
  const operator = await login('operator@example.test');
  const body = {
    nome: 'Criado',
    email: 'created@example.test',
    senha: password,
    perfil_id: 2,
  };
  assert.equal(
    (await request('/users', body, operator.access_token)).status,
    403,
  );
  const admin = await login();
  const created = await request('/users', body, admin.access_token);
  assert.equal(created.status, 201);
  assert.equal(created.body.senha_hash, undefined);
  assert.ok((await login('created@example.test')).access_token);
});
test('password reset uses opaque, expiring, single-use tokens and revokes previous sessions', async () => {
  const old = await login('created@example.test');
  const absent = await request('/auth/forgot-password', {
    email: 'missing@example.test',
  });
  const known = await request('/auth/forgot-password', {
    email: 'created@example.test',
  });
  assert.deepEqual(absent, known);
  const link = sent.at(-1).conteudoHtml.match(/href="([^"]+)"/)[1];
  const token = new URLSearchParams(new URL(link).hash.slice(1)).get('token');
  assert.equal(token.length, 64);
  assert.ok([...resets.values()].every((row) => row.tokenHash !== token));
  const body = { token, senha: 'Senha-nova-456!' };
  assert.equal((await request('/auth/reset-password', body)).status, 201);
  assert.equal((await request('/auth/reset-password', body)).status, 400);
  assert.equal((await request('/auth/me', null, old.access_token)).status, 401);
  assert.equal(
    (
      await request('/auth/login', {
        email: 'created@example.test',
        senha: body.senha,
      })
    ).status,
    201,
  );
  await request('/auth/forgot-password', { email: 'created@example.test' });
  const last = [...resets.values()].at(-1);
  last.expiresAt = new Date(0);
  const expired = new URLSearchParams(
    new URL(sent.at(-1).conteudoHtml.match(/href="([^"]+)"/)[1]).hash.slice(1),
  ).get('token');
  assert.equal(
    (await request('/auth/reset-password', { token: expired, senha: password }))
      .status,
    400,
  );
});

test('recovery explicitly reports unavailable SMTP without trying to send messages', async () => {
  const config = app.get(ConfigService);
  const before = sent.length;
  config.set('SMTP_ENABLED', 'false');
  try {
    assert.equal(
      (await request('/auth/forgot-password', { email: 'admin@example.test' }))
        .status,
      503,
    );
    assert.equal(sent.length, before);
  } finally {
    config.set('SMTP_ENABLED', 'true');
  }
});

test(
  'browser: login errors, session restoration, admin form, logout, protected routes, MFA and recovery',
  { timeout: 90000 },
  async () => {
    const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
    browser = await chromium.launch({
      headless: true,
      ...(existsSync(edge) ? { executablePath: edge } : {}),
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(base + '/frontend/pages/dashboard.html');
    await page.waitForURL('**/frontend/index.html');
    await page.locator('#usuario').fill('admin@example.test');
    await page.locator('#senha').fill('incorrect');
    await page.locator('button[type=submit]').click();
    await page.waitForFunction(() =>
      document.querySelector('#loginMessage').textContent.includes('inválidas'),
    );
    assert.equal(
      await page.evaluate(() => sessionStorage.getItem('sinstock.access')),
      null,
    );
    await page.locator('#senha').fill(password);
    await page.locator('button[type=submit]').click();
    await page.waitForURL('**/pages/dashboard.html');
    await page.locator('#sessionLogout').waitFor();
    assert.equal(
      (
        await page.locator('.user > span:not(.user-arrow)').textContent()
      ).trim(),
      'Pessoa 1',
    );
    await page.reload();
    await page.locator('#sessionLogout').waitFor();
    await page.goto(base + '/frontend/pages/cadastro.html');
    await page.waitForFunction(
      () =>
        !document.querySelector('[type=submit]').disabled &&
        document.querySelector('#perfil_id').options.length === 3,
    );
    await page.locator('#nome').fill('Novo no navegador');
    await page.locator('#email').fill('browser@example.test');
    await page.locator('#senha').fill(password);
    await page.locator('#perfil_id').selectOption('2');
    await page.locator('[type=submit]').click();
    await page.waitForFunction(() =>
      document
        .querySelector('#formMessage')
        .textContent.includes('Usuário cadastrado'),
    );
    await page.goto(base + '/frontend/pages/dashboard.html');
    await page.locator('#sessionLogout').click();
    await page.waitForURL('**/frontend/index.html');
    assert.equal(
      await page.evaluate(() => sessionStorage.getItem('sinstock.access')),
      null,
    );
    await page.locator('#usuario').fill('mfa@example.test');
    await page.locator('#senha').fill(password);
    await page.locator('[type=submit]').click();
    await page.waitForURL('**/pages/codigo.html');
    assert.equal(
      await page.evaluate(() => sessionStorage.getItem('sinstock.access')),
      null,
    );
    const code = speakeasy.totp({ secret, encoding: 'base32' });
    for (let i = 0; i < 6; i++)
      await page.locator('.otp-input').nth(i).fill(code[i]);
    await page.locator('[type=submit]').click();
    await page.waitForURL('**/pages/dashboard.html');
    await page.locator('#sessionLogout').waitFor();
    await page.locator('#sessionLogout').click();
    await page.waitForURL('**/frontend/index.html');
    await page.locator('#forgotPassword').click();
    await page.locator('#email').fill('browser@example.test');
    await page.locator('[type=submit]').click();
    await page.waitForURL('**/pages/autenticacao.html');
    const recovery = new URL(
      sent.at(-1).conteudoHtml.match(/href="([^"]+)"/)[1],
    );
    await page.goto(base + recovery.pathname + recovery.hash);
    await page.locator('#novaSenha').fill('Nova-senha-browser!');
    await page.locator('#confirmarSenha').fill('diferente');
    await page.locator('[type=submit]').click();
    await page.waitForFunction(() =>
      document
        .querySelector('#formMessage')
        .textContent.includes('não coincidem'),
    );
    await page.locator('#confirmarSenha').fill('Nova-senha-browser!');
    await page.locator('[type=submit]').click();
    await page.getByText('Entrar com a nova senha', { exact: true }).click();
    await page.locator('#usuario').fill('browser@example.test');
    await page.locator('#senha').fill('Nova-senha-browser!');
    await page.locator('[type=submit]').click();
    await page.waitForURL('**/pages/dashboard.html');
    await page.locator('#sessionLogout').waitFor();
    assert.deepEqual(errors, []);
    await context.close();
  },
);
