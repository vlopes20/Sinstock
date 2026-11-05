require('reflect-metadata');
require('dotenv/config');
require('ts-node/register/transpile-only');
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { Test } = require('@nestjs/testing');
const { ValidationPipe } = require('@nestjs/common');

// Real MySQL, HTTP, validation and JWT. Only SMTP is replaced.
// A uniquely named disposable database is migrated, then dropped in after().
const database =
  'sinstock_test_' + Date.now() + '_' + randomBytes(3).toString('hex');
const originalUrl = process.env.DATABASE_URL;
let adminConnection, app, prisma, base, token, operatorToken, readonlyToken;
let product,
  otherProduct,
  branch,
  otherBranch,
  supplier,
  lot,
  receipt,
  reservation;
const sentMail = [];
const password = 'Integration-stock-123!';
const { PrismaService } = require('../src/prisma/prisma.service');
const call = async (path, method = 'GET', body, bearer = token) => {
  const response = await fetch(base + path, {
    method,
    headers: {
      ...(bearer ? { authorization: 'Bearer ' + bearer } : {}),
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, body: await response.json() };
};
const ok = async (path, method, body) => {
  const result = await call(path, method, body);
  assert.ok(
    result.status >= 200 && result.status < 300,
    JSON.stringify(result),
  );
  return result.body;
};
const stock = async (filial = branch.id, lote = lot.id) =>
  prisma.saldos_estoque.findFirst({
    where: { produto_id: product.id, filial_id: filial, lote_id: lote },
  });

before(
  async () => {
    const source = new URL(originalUrl);
    adminConnection = await mysql.createConnection({
      host: source.hostname,
      port: Number(source.port || 3306),
      user: decodeURIComponent(source.username),
      password: decodeURIComponent(source.password),
    });
    assert.match(database, /^sinstock_test_[0-9]+_[a-f0-9]+$/);
    await adminConnection.query(
      'CREATE DATABASE `' +
        database +
        '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
    );
    source.pathname = '/' + database;
    process.env.DATABASE_URL = source.toString();
    process.env.THROTTLE_LIMIT = '100000';
    process.env.SMTP_ENABLED = 'false';
    execFileSync(
      process.execPath,
      [require.resolve('prisma/build/index.js'), 'migrate', 'deploy'],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 120000,
      },
    );
    const { AppModule } = require('../src/app.module');
    const { MailService } = require('../src/mail/mail.service');
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(MailService)
      .useValue({
        enviarEmail: async (mail) => {
          sentMail.push(mail);
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
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(
      new (require('../src/common/filters/prisma-exception.filter').PrismaExceptionFilter)(),
    );
    require('../src/common/frontend.setup').mountFrontend(app);
    await app.listen(0, '127.0.0.1');
    base = await app.getUrl();
    prisma = app.get(PrismaService);
    await prisma.perfis.createMany({
      data: [
        { id: 1, nome: 'Administrador', permissoes: { admin: true } },
        { id: 2, nome: 'Operador', permissoes: { operacoes: true } },
        {
          id: 3,
          nome: 'Consulta',
          permissoes: { produtos: { ler: true }, filiais: { ler: true } },
        },
      ],
    });
    const hash = await bcrypt.hash(password, 4);
    for (const id of [1, 2, 3]) {
      await prisma.usuarios.create({
        data: {
          perfil_id: id,
          nome: 'Teste ' + id,
          email: 'teste' + id + '@example.com',
          senha_hash: hash,
        },
      });
    }
    token = (
      await call(
        '/auth/login',
        'POST',
        { email: 'teste1@example.com', senha: password },
        null,
      )
    ).body.access_token;
    operatorToken = (
      await call(
        '/auth/login',
        'POST',
        { email: 'teste2@example.com', senha: password },
        null,
      )
    ).body.access_token;
    readonlyToken = (
      await call(
        '/auth/login',
        'POST',
        { email: 'teste3@example.com', senha: password },
        null,
      )
    ).body.access_token;
    const category = await ok('/categorias', 'POST', { nome: 'Alimentos' });
    supplier = await ok('/fornecedores', 'POST', {
      nome_juridico: 'Fornecedor de teste',
      cnpj: '12345678000190',
    });
    branch = await ok('/filiais', 'POST', { nome: 'Matriz' });
    otherBranch = await ok('/filiais', 'POST', { nome: 'Filial' });
    product = await ok('/produtos', 'POST', {
      nome: 'Produto concorrente',
      marca: 'Marca teste',
      categoria_id: category.id,
      fornecedor_id: supplier.id,
      codigo_barras: '7890000000010',
      preco_venda: 12,
      estoque_minimo: 3,
    });
    otherProduct = await ok('/produtos', 'POST', {
      nome: 'Outro produto',
      categoria_id: category.id,
      preco_venda: 5,
    });
  },
  { timeout: 180000 },
);

after(async () => {
  try {
    if (app) await app.close();
  } finally {
    if (adminConnection) {
      assert.match(database, /^sinstock_test_[0-9]+_[a-f0-9]+$/);
      await adminConnection.query('DROP DATABASE IF EXISTS `' + database + '`');
      await adminConnection.end();
    }
    process.env.DATABASE_URL = originalUrl;
  }
});

test('authentication, administrative registration and resource permissions', async () => {
  assert.equal((await call('/produtos', 'GET', null, null)).status, 401);
  assert.equal(
    (await call('/filiais', 'POST', { nome: 'Não permitido' }, operatorToken))
      .status,
    403,
  );
  assert.equal(
    (await call('/produtos', 'POST', { nome: 'Não permitido' }, readonlyToken))
      .status,
    403,
  );
  assert.equal(
    (await call('/produtos', 'GET', null, readonlyToken)).status,
    200,
  );
  assert.equal(
    (await call('/users', 'POST', { nome: 'X' }, operatorToken)).status,
    403,
  );
});

test('strict validation, boolean false, duplicate barcode and automatic cost', async () => {
  assert.equal(
    (
      await call('/produtos', 'POST', {
        nome: 'Duplicado',
        categoria_id: product.categoria_id,
        codigo_barras: product.codigo_barras,
        preco_venda: 1,
      })
    ).status,
    409,
  );
  assert.equal(
    (await call('/produtos/' + product.id, 'PATCH', { custo_medio: 999 }))
      .status,
    400,
  );
  assert.equal(
    (await call('/filiais/' + branch.id, 'PATCH', { intruso: true })).status,
    400,
  );
  assert.equal(
    (await call('/produtos?apenas_estoque_baixo=talvez')).status,
    400,
  );
  assert.equal((await call('/movimentacoes/historico?limit=-1')).status, 400);
  assert.equal(
    (
      await call('/notas-fiscais-entrada', 'POST', {
        fornecedor_id: supplier.id,
        filial_id: branch.id,
        numero_nf: 'bad',
        data_emissao: '2026-11-01',
        itens: [],
      })
    ).status,
    400,
  );
});

test('receipt persists author, branch, lot, computed total and weighted cost', async () => {
  receipt = await ok('/notas-fiscais-entrada', 'POST', {
    fornecedor_id: supplier.id,
    filial_id: branch.id,
    numero_nf: 'NF-001',
    data_emissao: '2026-11-01',
    total: 999,
    itens: [
      {
        produto_id: product.id,
        quantidade: 10,
        custo_unitario: 4,
        lote: { numero_lote: 'L-1', data_validade: '2099-01-01' },
      },
    ],
  });
  lot = receipt.itens_entrada[0].lotes;
  assert.equal(receipt.usuario_id, 1);
  assert.equal(Number(receipt.total), 40);
  assert.equal(Number((await stock()).quantidade), 10);
  assert.equal(
    Number(
      (await prisma.produtos.findUnique({ where: { id: product.id } }))
        .custo_medio,
    ),
    4,
  );
  assert.equal(
    (
      await call('/movimentacoes', 'POST', {
        produto_id: product.id,
        filial_id: branch.id,
        tipo: 'ENTRADA',
        quantidade: 5,
      })
    ).status,
    400,
  );
  const wrongLot = await call('/notas-fiscais-entrada', 'POST', {
    fornecedor_id: supplier.id,
    filial_id: branch.id,
    numero_nf: 'WRONG-LOT',
    data_emissao: '2026-11-01',
    itens: [
      {
        produto_id: otherProduct.id,
        quantidade: 1,
        custo_unitario: 1,
        lote_id: lot.id,
      },
    ],
  });
  assert.equal(wrongLot.status, 400);
  assert.equal(
    await prisma.notas_fiscais_entrada.count(),
    1,
    'Failed receipt must roll back',
  );
});

test('pending receipts have no stock effect and can only be received once', async () => {
  const pending = await ok('/notas-fiscais-entrada', 'POST', {
    fornecedor_id: supplier.id,
    filial_id: otherBranch.id,
    numero_nf: 'PENDING',
    data_emissao: '2026-11-01',
    status: 'PENDENTE',
    itens: [
      {
        produto_id: product.id,
        lote_id: lot.id,
        quantidade: 2,
        custo_unitario: 10,
      },
    ],
  });
  assert.equal(await stock(otherBranch.id), null);
  const results = await Promise.all([
    call('/notas-fiscais-entrada/' + pending.id + '/receber', 'PATCH'),
    call('/notas-fiscais-entrada/' + pending.id + '/receber', 'PATCH'),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 400]);
  assert.equal(Number((await stock(otherBranch.id)).quantidade), 2);
  assert.equal(
    Number(
      (await prisma.produtos.findUnique({ where: { id: product.id } }))
        .custo_medio,
    ),
    5,
  );
});

test('reservation protects available stock from withdrawals, transfers, adjustments and estorno', async () => {
  reservation = await ok('/pedidos/reservar', 'POST', {
    filial_id: branch.id,
    itens: [{ produto_id: product.id, lote_id: lot.id, quantidade: 8 }],
    minutos_expiracao: 15,
  });
  assert.equal(Number((await stock()).quantidade_reservada), 8);
  for (const tipo of ['SAIDA', 'AJUSTE']) {
    assert.equal(
      (
        await call('/movimentacoes', 'POST', {
          produto_id: product.id,
          filial_id: branch.id,
          lote_id: lot.id,
          tipo,
          quantidade: tipo === 'SAIDA' ? 3 : 7,
          observacao: 'Contagem',
        })
      ).status,
      400,
    );
  }
  assert.equal(
    (
      await call('/movimentacoes/transferencia', 'POST', {
        produto_id: product.id,
        filial_origem_id: branch.id,
        filial_destino_id: otherBranch.id,
        lote_id: lot.id,
        quantidade: 3,
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await call('/notas-fiscais-entrada/' + receipt.id + '/estorno', 'PATCH', {
        motivo: 'Teste',
      })
    ).status,
    400,
  );
  assert.equal(Number((await stock()).quantidade), 10);
  assert.equal(
    (
      await prisma.notas_fiscais_entrada.findUnique({
        where: { id: receipt.id },
      })
    ).status,
    'RECEBIDA',
  );
});

test('critical stock sums lots per branch and counts available quantities', async () => {
  const alerts = await ok('/alertas?filial_id=' + branch.id);
  const low = alerts.alertas.estoque_baixo.find(
    (a) => a.produto_id === product.id,
  );
  assert.equal(Number(low.quantidade_atual), 2);
  const filtered = await ok(
    '/produtos?filial_id=' + branch.id + '&apenas_estoque_baixo=true',
  );
  assert.ok(filtered.dados.some((p) => p.id === product.id));
  const unfiltered = await ok('/produtos?apenas_estoque_baixo=false');
  assert.equal(unfiltered.meta.total, 2);
  assert.equal((await ok('/produtos?busca=Marca%20teste')).meta.total, 1);
  assert.equal(
    (await ok('/produtos?busca=Fornecedor%20de%20teste')).meta.total,
    1,
  );
});

test('parallel checkout cannot oversell and rejects client price changes', async () => {
  const body = {
    filial_id: branch.id,
    itens: [{ produto_id: product.id, lote_id: lot.id, quantidade: 2 }],
  };
  assert.equal(
    (
      await call('/pedidos/checkout', 'POST', {
        ...body,
        itens: [{ ...body.itens[0], preco_unitario: 0.01 }],
      })
    ).status,
    400,
  );
  const results = await Promise.all([
    call('/pedidos/checkout', 'POST', body),
    call('/pedidos/checkout', 'POST', body),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [201, 400]);
  assert.equal(Number((await stock()).quantidade), 8);
  const sale = results.find((r) => r.status === 201).body;
  const cancellations = await Promise.all([
    call('/pedidos/' + sale.pedido_id + '/cancelar', 'PATCH'),
    call('/pedidos/' + sale.pedido_id + '/cancelar', 'PATCH'),
  ]);
  assert.deepEqual(cancellations.map((r) => r.status).sort(), [200, 400]);
  assert.equal(Number((await stock()).quantidade), 10);
});

test('parallel confirmation consumes a reservation exactly once', async () => {
  const responses = await Promise.all([
    call('/pedidos/' + reservation.pedido_id + '/confirmar', 'PATCH'),
    call('/pedidos/' + reservation.pedido_id + '/confirmar', 'PATCH'),
  ]);
  assert.deepEqual(responses.map((r) => r.status).sort(), [200, 400]);
  assert.equal(Number((await stock()).quantidade), 2);
  assert.equal(Number((await stock()).quantidade_reservada), 0);
  await ok('/pedidos/' + reservation.pedido_id + '/cancelar', 'PATCH');
  assert.equal(Number((await stock()).quantidade), 10);
});

test('transfer is atomic and keeps its lot and author on both branches', async () => {
  const transfer = await ok('/movimentacoes/transferencia', 'POST', {
    produto_id: product.id,
    filial_origem_id: branch.id,
    filial_destino_id: otherBranch.id,
    lote_id: lot.id,
    quantidade: 2.5,
    observacao: 'Reposição',
  });
  assert.equal(Number((await stock()).quantidade), 7.5);
  assert.equal(Number((await stock(otherBranch.id)).quantidade), 4.5);
  const logs = await prisma.logs_movimentacoes.findMany({
    where: { referencia: transfer.referencia },
  });
  assert.equal(logs.length, 2);
  assert.ok(logs.every((l) => l.usuario_id === 1 && l.lote_id === lot.id));
  await ok('/movimentacoes/transferencia', 'POST', {
    produto_id: product.id,
    filial_origem_id: otherBranch.id,
    filial_destino_id: branch.id,
    lote_id: lot.id,
    quantidade: 2.5,
  });
});

test('adjusting a receipt updates stock, total, audit and weighted cost together', async () => {
  await ok('/notas-fiscais-entrada/lotes/' + lot.id, 'PATCH', {
    item_entrada_id: receipt.itens_entrada[0].id,
    quantidade: 12,
    custo_unitario: 6,
    motivo: 'Correção do recebimento',
  });
  assert.equal(Number((await stock()).quantidade), 12);
  assert.equal(
    Number(
      (
        await prisma.notas_fiscais_entrada.findUnique({
          where: { id: receipt.id },
        })
      ).total,
    ),
    72,
  );
  assert.equal(
    Number(
      (await prisma.produtos.findUnique({ where: { id: product.id } }))
        .custo_medio,
    ),
    6.57,
  );
});

test('simultaneous estorno runs once and does not touch another branch', async () => {
  const result = await Promise.all([
    call('/notas-fiscais-entrada/' + receipt.id + '/estorno', 'PATCH', {
      motivo: 'Devolução',
    }),
    call('/notas-fiscais-entrada/' + receipt.id + '/estorno', 'PATCH', {
      motivo: 'Duplicada',
    }),
  ]);
  assert.deepEqual(result.map((r) => r.status).sort(), [200, 400]);
  assert.equal(Number((await stock()).quantidade), 0);
  assert.equal(Number((await stock(otherBranch.id)).quantidade), 2);
  assert.equal(
    Number(
      (await prisma.produtos.findUnique({ where: { id: product.id } }))
        .custo_medio,
    ),
    10,
  );
});

test('expiry cleanup and concurrent cancellation release each reservation once', async () => {
  const reserve = await ok('/pedidos/reservar', 'POST', {
    filial_id: otherBranch.id,
    itens: [{ produto_id: product.id, lote_id: lot.id, quantidade: 2 }],
  });
  await prisma.pedidos_venda.update({
    where: { id: reserve.pedido_id },
    data: { reservado_ate: new Date(Date.now() - 60000) },
  });
  const service = app.get(
    require('../src/pedidos/pedidos.service').PedidosService,
  );
  await Promise.all([
    service.limparReservasExpiradas(),
    service.limparReservasExpiradas(),
  ]);
  assert.equal(Number((await stock(otherBranch.id)).quantidade_reservada), 0);
  assert.equal(Number((await stock(otherBranch.id)).quantidade), 2);
  assert.equal(
    (await call('/pedidos/' + reserve.pedido_id + '/confirmar', 'PATCH'))
      .status,
    400,
  );
});

test('database constraints and triggers protect stock and immutable history', async () => {
  await assert.rejects(
    prisma.saldos_estoque.update({
      where: { id: (await stock()).id },
      data: { quantidade: -1 },
    }),
  );
  const log = await prisma.logs_movimentacoes.findFirst();
  await assert.rejects(
    prisma.logs_movimentacoes.delete({ where: { id: log.id } }),
  );
  await assert.rejects(
    prisma.logs_movimentacoes.update({
      where: { id: log.id },
      data: { observacao: 'Alterado' },
    }),
  );
  const audit = await prisma.logAuditoriaEstoque.findFirst();
  await assert.rejects(
    prisma.logAuditoriaEstoque.delete({ where: { id: audit.id } }),
  );
  await assert.rejects(
    prisma.logAuditoriaEstoque.update({
      where: { id: audit.id },
      data: { acao: 'Alterado' },
    }),
  );
  const history = await ok(
    '/movimentacoes/historico?filial_id=' + branch.id + '&limit=2',
  );
  assert.equal(history.dados.length, 2);
  assert.ok(history.meta.total > 2);
  assert.ok(
    history.dados.every((l) => typeof l.id === 'string' && l.usuarios.nome),
  );
});

test(
  'catalog screens persist real CRUD, survive reload and keep failed forms open',
  { timeout: 120000 },
  async () => {
    const { chromium } = require('../frontend/node_modules/playwright');
    const browser = await chromium.launch({
      headless: true,
      executablePath:
        'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    });
    try {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
      });
      await context.addInitScript(
        (access) => sessionStorage.setItem('sinstock.access', access),
        token,
      );
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(base + '/frontend/pages/produtos.html');
      await page.getByRole('button', { name: 'Gerenciar categorias' }).click();
      const categoryDialog = page.locator('.catalog-modal-overlay.active');
      await categoryDialog
        .locator('[name="nome"]')
        .fill('Categoria pelo navegador');
      await categoryDialog
        .getByRole('button', { name: 'Salvar', exact: true })
        .click();
      await categoryDialog
        .getByRole('cell', { name: 'Categoria pelo navegador', exact: true })
        .waitFor();
      const category = await prisma.categorias.findUnique({
        where: { nome: 'Categoria pelo navegador' },
      });
      assert.ok(category);
      await page.keyboard.press('Escape');
      await page
        .locator('#productCategory option')
        .filter({ hasText: 'Categoria pelo navegador' })
        .waitFor({ state: 'attached' });

      for (const resource of ['filiais', 'clientes']) {
        await page.locator('[data-catalog="' + resource + '"]').click();
        const dialog = page.locator('.catalog-modal-overlay.active');
        await dialog.locator('[name="nome"]').fill('Novo ' + resource);
        if (resource === 'clientes')
          await dialog.locator('[name="email"]').fill('cliente@example.com');
        await dialog
          .getByRole('button', { name: 'Salvar', exact: true })
          .click();
        const row = dialog
          .getByRole('row')
          .filter({ hasText: 'Novo ' + resource });
        await row.waitFor();
        await row.getByRole('button', { name: 'Editar' }).click();
        await dialog.locator('[name="nome"]').fill('Editado ' + resource);
        await dialog
          .getByRole('button', { name: 'Salvar', exact: true })
          .click();
        const updated = dialog
          .getByRole('row')
          .filter({ hasText: 'Editado ' + resource });
        await updated.waitFor();
        page.once('dialog', (prompt) => prompt.accept());
        await updated.getByRole('button', { name: 'Excluir' }).click();
        await updated.waitFor({ state: 'detached' });
        await page.keyboard.press('Escape');
      }

      await page.goto(base + '/frontend/pages/fornecedores.html');
      await page
        .locator('#supplierCategory option')
        .filter({ hasText: 'Categoria pelo navegador' })
        .waitFor({ state: 'attached' });
      await page.locator('#openSupplierModal').click();
      await page.locator('#companyName').fill('Fornecedor navegador Ltda');
      await page.locator('#tradeName').fill('Fornecedor navegador');
      await page.locator('#supplierCnpj').fill('98.765.432/0001-10');
      await page.locator('#supplierEmail').fill('fornecedor@example.com');
      await page.locator('#supplierPhone').fill('11999999999');
      await page
        .locator('#supplierCategory')
        .selectOption('Categoria pelo navegador');
      await page.locator('#supplierCity').fill('São Paulo');
      await page.locator('#supplierState').selectOption('SP');
      await page.locator('#supplierZip').fill('01001-000');
      await page.locator('#supplierForm button[type="submit"]').click();
      await page.locator('#supplierModal.active').waitFor({ state: 'hidden' });
      await page
        .locator('#suppliersTableBody')
        .getByText('Fornecedor navegador', { exact: true })
        .waitFor();
      const newSupplier = await prisma.fornecedores.findUnique({
        where: { cnpj: '98765432000110' },
      });
      assert.equal(newSupplier.cidade, 'São Paulo');
      assert.equal(newSupplier.categoria, 'Categoria pelo navegador');
      await page.reload();
      await page
        .locator('#suppliersTableBody')
        .getByText('Fornecedor navegador', { exact: true })
        .waitFor();
      await page
        .locator('#suppliersTableBody tr')
        .filter({ hasText: 'Fornecedor navegador Ltda' })
        .getByRole('button', { name: 'Editar' })
        .click();
      await page.locator('#contactPerson').fill('Contato atualizado');
      await page.locator('#supplierForm button[type="submit"]').click();
      await page.locator('#supplierModal.active').waitFor({ state: 'hidden' });
      assert.equal(
        (
          await prisma.fornecedores.findUnique({
            where: { id: newSupplier.id },
          })
        ).contato,
        'Contato atualizado',
      );

      await page.goto(base + '/frontend/pages/produtos.html');
      await page
        .locator('#productSupplier option')
        .filter({ hasText: 'Fornecedor navegador' })
        .waitFor({ state: 'attached' });
      await page.locator('#openProductModal').click();
      await page.locator('#productName').fill('Produto <b>navegador</b>');
      await page.locator('#productBrand').fill('Marca navegador');
      await page.locator('#productSku').fill('BROWSER-01');
      await page.locator('#productBarcode').fill('7899876543210');
      await page.locator('#productCategory').selectOption(String(category.id));
      await page
        .locator('#productSupplier')
        .selectOption(String(newSupplier.id));
      await page.locator('#productPrice').fill('29.90');
      await page.locator('#minimumStock').fill('2.5');
      await page.locator('#productForm button[type="submit"]').click();
      await page.locator('#productModal.active').waitFor({ state: 'hidden' });
      await page
        .locator('#productsTableBody')
        .getByText('Produto <b>navegador</b>', { exact: true })
        .waitFor();
      assert.equal(
        await page.locator('#productsTableBody b').count(),
        0,
        'Names must be rendered as text',
      );
      const item = await prisma.produtos.findUnique({
        where: { sku: 'BROWSER-01' },
      });
      assert.equal(item.fornecedor_id, newSupplier.id);
      assert.equal(Number(item.estoque_minimo), 2.5);
      assert.equal(Number(item.custo_medio), 0);
      await page.reload();
      const productRow = page
        .locator('#productsTableBody tr')
        .filter({ hasText: 'Produto <b>navegador</b>' });
      await productRow.getByRole('button', { name: 'Editar' }).click();
      await page.locator('#productPrice').fill('35.50');
      await page.route('**/produtos/' + item.id, (route) =>
        route.abort('failed'),
      );
      await page.locator('#productForm button[type="submit"]').click();
      await page
        .locator('#productForm [data-form-error]')
        .getByText('Não foi possível conectar ao servidor.', { exact: false })
        .waitFor();
      assert.equal(await page.locator('#productModal.active').count(), 1);
      assert.equal(
        Number(
          (await prisma.produtos.findUnique({ where: { id: item.id } }))
            .preco_venda,
        ),
        29.9,
      );
      await page.unroute('**/produtos/' + item.id);
      await page.locator('#productForm button[type="submit"]').click();
      await page.locator('#productModal.active').waitFor({ state: 'hidden' });
      assert.equal(
        Number(
          (await prisma.produtos.findUnique({ where: { id: item.id } }))
            .preco_venda,
        ),
        35.5,
      );
      await page.locator('#productSearch').fill('inexistente-abcd');
      await page
        .locator('#productsTableBody')
        .getByText('Nenhum produto encontrado.', { exact: false })
        .waitFor();
      await page.locator('#productSearch').fill('Marca navegador');
      await productRow.getByRole('button', { name: 'Excluir' }).waitFor();
      page.once('dialog', (prompt) => prompt.accept());
      await productRow.getByRole('button', { name: 'Excluir' }).click();
      await page
        .locator('#productsTableBody')
        .getByText('Nenhum produto encontrado.', { exact: false })
        .waitFor();
      assert.equal(
        await prisma.produtos.findUnique({ where: { id: item.id } }),
        null,
      );
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  },
);

test(
  'stock screen registers receipts, transfers, lot adjustments and estorno with real balances',
  { timeout: 120000 },
  async () => {
    const { chromium } = require('../frontend/node_modules/playwright');
    const browser = await chromium.launch({
      headless: true,
      executablePath:
        'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    });
    try {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
      });
      await context.addInitScript(
        (access) => sessionStorage.setItem('sinstock.access', access),
        token,
      );
      const page = await context.newPage(),
        errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(base + '/frontend/pages/estoque.html');
      await page
        .locator('#movementProduct option[value="' + product.id + '"]')
        .waitFor({ state: 'attached' });
      await page.locator('#stockBranch').selectOption(String(branch.id));
      await page.locator('#openMovementModal').click();
      await page.locator('#movementProduct').selectOption(String(product.id));
      await page.locator('#movementQuantity').fill('5');
      await page.locator('#movementReason').fill('Recebimento pelo navegador');
      await page.locator('#movementSupplier').selectOption(String(supplier.id));
      await page.locator('#movementReference').fill('NF-BROWSER');
      await page.locator('#movementCost').fill('8.00');
      await page.locator('#movementNewLot').fill('LOT-BROWSER');
      await page.locator('#movementExpiry').fill('2099-12-31');
      await page.locator('#movementForm button[type="submit"]').click();
      await page.locator('#movementModal.active').waitFor({ state: 'hidden' });
      const note = await prisma.notas_fiscais_entrada.findFirst({
        where: { numero_nf: 'NF-BROWSER' },
        include: { itens_entrada: true },
      });
      const newLot = note.itens_entrada[0].lote_id;
      assert.equal(Number((await stock(branch.id, newLot)).quantidade), 5);
      assert.equal(note.observacao, 'Recebimento pelo navegador');
      await page.locator('[data-tab="movements"]').click();
      await page
        .locator('#movementTableBody')
        .getByText('Recebimento pelo navegador', { exact: true })
        .waitFor();
      await page.locator('#openMovementModal').click();
      await page.locator('#movementType').selectOption('transferencia');
      await page.locator('#movementProduct').selectOption(String(product.id));
      await page
        .locator('#movementLot option[value="' + newLot + '"]')
        .waitFor({ state: 'attached' });
      await page.locator('#movementLot').selectOption(String(newLot));
      await page
        .locator('#movementDestination')
        .selectOption(String(otherBranch.id));
      await page.locator('#movementQuantity').fill('1.5');
      await page.locator('#movementReason').fill('Transferência navegador');
      await page.locator('#movementForm button[type="submit"]').click();
      await page.locator('#movementModal.active').waitFor({ state: 'hidden' });
      assert.equal(Number((await stock(branch.id, newLot)).quantidade), 3.5);
      assert.equal(
        Number((await stock(otherBranch.id, newLot)).quantidade),
        1.5,
      );

      await page.locator('[data-tab="inventory"]').click();
      await page
        .locator('#stockTableBody [data-lots="' + product.id + '"]')
        .click();
      await page
        .locator('[data-api-dialog] [data-adjust="' + newLot + '"]')
        .click();
      const lotForm = page.locator('[data-api-dialog] form');
      await lotForm
        .locator('[name="item"]')
        .selectOption(String(note.itens_entrada[0].id));
      await lotForm.locator('[name="quantidade"]').fill('7');
      await lotForm.locator('[name="custo"]').fill('9');
      await lotForm
        .locator('[name="motivo"]')
        .fill('Contagem da nota corrigida');
      await lotForm.locator('[type="submit"]').click();
      await lotForm.waitFor({ state: 'detached' });
      assert.equal(Number((await stock(branch.id, newLot)).quantidade), 5.5);
      assert.equal(
        Number(
          (
            await prisma.notas_fiscais_entrada.findUnique({
              where: { id: note.id },
            })
          ).total,
        ),
        63,
      );

      await page.locator('[data-tab="receipts"]').click();
      await page.locator('#receiptsBody [data-note="' + note.id + '"]').click();
      const cancel = page.locator('[data-api-dialog] form');
      await cancel.locator('[name="motivo"]').fill('Devolução');
      await cancel.locator('[type="submit"]').click();
      await cancel
        .locator('[data-form-error]')
        .getByText('Saldo disponível insuficiente', { exact: false })
        .waitFor();
      assert.equal(
        (
          await prisma.notas_fiscais_entrada.findUnique({
            where: { id: note.id },
          })
        ).status,
        'RECEBIDA',
      );
      await page.keyboard.press('Escape');
      await ok('/movimentacoes/transferencia', 'POST', {
        produto_id: product.id,
        filial_origem_id: otherBranch.id,
        filial_destino_id: branch.id,
        lote_id: newLot,
        quantidade: 1.5,
      });
      await page.locator('#refreshStock').click();
      await page.locator('#receiptsBody [data-note="' + note.id + '"]').click();
      const retry = page.locator('[data-api-dialog] form');
      await retry.locator('[name="motivo"]').fill('Devolução após retorno');
      await retry.locator('[type="submit"]').click();
      await retry.waitFor({ state: 'detached' });
      assert.equal(Number((await stock(branch.id, newLot)).quantidade), 0);
      assert.equal(
        (
          await prisma.notas_fiscais_entrada.findUnique({
            where: { id: note.id },
          })
        ).status,
        'CANCELADA',
      );
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  },
);

test(
  'sales and orders screens reserve, confirm, update delivery and cancel without conflicting statuses',
  { timeout: 120000 },
  async () => {
    await ok('/notas-fiscais-entrada', 'POST', {
      fornecedor_id: supplier.id,
      filial_id: otherBranch.id,
      numero_nf: 'COMMERCIAL-UI',
      data_emissao: '2026-11-01',
      itens: [
        {
          produto_id: product.id,
          lote_id: lot.id,
          quantidade: 10,
          custo_unitario: 10,
        },
      ],
    });
    const before = Number((await stock(otherBranch.id)).quantidade);
    const { chromium } = require('../frontend/node_modules/playwright');
    const browser = await chromium.launch({
      headless: true,
      executablePath:
        'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    });
    try {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
      });
      await context.addInitScript(
        (access) => sessionStorage.setItem('sinstock.access', access),
        token,
      );
      const page = await context.newPage(),
        errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(base + '/frontend/pages/pedidos.html');
      await page
        .locator('#ordersBranch option[value="' + otherBranch.id + '"]')
        .waitFor({ state: 'attached' });
      await page.locator('#ordersBranch').selectOption(String(otherBranch.id));
      await page.locator('#openOrderModal').click();
      await page
        .locator(
          '#saleProducts .sale-product-select option[value="' +
            product.id +
            '"]',
        )
        .waitFor({ state: 'attached' });
      await page
        .locator('#saleProducts .sale-product-select')
        .selectOption(String(product.id));
      await page.locator('#saleProducts .sale-product-quantity').fill('4');
      await page.locator('#saleDiscount').fill('2');
      await page.locator('#salePayment').selectOption('PIX');
      await page.locator('#orderForm [type="submit"]').click();
      await page.locator('#orderForm').waitFor({ state: 'detached' });
      const order = await prisma.pedidos_venda.findFirst({
        where: { status: 'ORCAMENTO', filial_id: otherBranch.id },
        orderBy: { id: 'desc' },
      });
      assert.equal(Number(order.total), 46);
      assert.equal(
        Number((await stock(otherBranch.id)).quantidade_reservada),
        4,
      );
      await page.locator('[data-order="' + order.id + '"]').click();
      await page.locator('[data-api-dialog] [data-confirm]').click();
      await page.locator('[data-api-dialog]').waitFor({ state: 'detached' });
      assert.equal(
        Number((await stock(otherBranch.id)).quantidade),
        before - 4,
      );
      assert.equal(
        Number((await stock(otherBranch.id)).quantidade_reservada),
        0,
      );
      await page.locator('[data-order="' + order.id + '"]').click();
      await page
        .locator('[data-api-dialog] [name="atendimento"]')
        .selectOption('EM_SEPARACAO');
      await page.locator('[data-api-dialog] form [type="submit"]').click();
      await page.locator('[data-api-dialog]').waitFor({ state: 'detached' });
      const prepared = await prisma.pedidos_venda.findUnique({
        where: { id: order.id },
      });
      assert.equal(prepared.status, 'CONCLUIDO');
      assert.equal(prepared.atendimento, 'EM_SEPARACAO');
      await page.goto(base + '/frontend/pages/vendas.html');
      await page.locator('[data-tab="salesHistory"]').click();
      await page.locator('[data-order="' + order.id + '"]').click();
      page.once('dialog', (prompt) => prompt.accept());
      await page.locator('[data-api-dialog] [data-cancel-order]').click();
      await page.locator('[data-api-dialog]').waitFor({ state: 'detached' });
      assert.equal(Number((await stock(otherBranch.id)).quantidade), before);
      await page.locator('#salesBranch').selectOption(String(otherBranch.id));
      await page.locator('#openSaleModal').click();
      await page
        .locator(
          '#saleProducts .sale-product-select option[value="' +
            product.id +
            '"]',
        )
        .waitFor({ state: 'attached' });
      await page
        .locator('#saleProducts .sale-product-select')
        .selectOption(String(product.id));
      await page
        .locator('#saleProducts .sale-product-quantity')
        .fill(String(before + 1));
      await page.locator('#salePayment').selectOption('DINHEIRO');
      await page.locator('#newSaleForm [type="submit"]').click();
      await page
        .locator('#newSaleForm [data-form-error]')
        .getByText('Saldo disponível insuficiente', { exact: false })
        .waitFor();
      assert.equal(Number((await stock(otherBranch.id)).quantidade), before);
      await page.locator('#saleProducts .sale-product-quantity').fill('3');
      await page.locator('#newSaleForm [type="submit"]').click();
      await page.locator('#newSaleForm').waitFor({ state: 'detached' });
      assert.equal(
        Number((await stock(otherBranch.id)).quantidade),
        before - 3,
      );
      const sale = await prisma.pedidos_venda.findFirst({
        orderBy: { id: 'desc' },
      });
      assert.equal(sale.pagamento, 'DINHEIRO');
      assert.equal(Number(sale.total), 36);
      const stats = await ok(
        '/pedidos/resumo/periodo?filial_id=' + otherBranch.id,
      );
      assert.ok(stats.faturamento >= 36 && stats.confirmados >= 1);
      assert.ok(
        stats.pagamentos.some((group) => group.pagamento === 'DINHEIRO'),
      );
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  },
);

test('dashboard and alerts use the same available stock and seven-day expiry boundary', async () => {
  const today = new Date().toISOString().slice(0, 10);
  const validity = (days) =>
    new Date(new Date(today).getTime() + days * 86400000)
      .toISOString()
      .slice(0, 10);
  for (const days of [7, 8])
    await ok('/notas-fiscais-entrada', 'POST', {
      fornecedor_id: supplier.id,
      filial_id: branch.id,
      numero_nf: 'EXPIRY-' + days,
      data_emissao: today,
      itens: [
        {
          produto_id: product.id,
          quantidade: 4,
          custo_unitario: 2,
          lote: {
            numero_lote: 'EXPIRY-' + days,
            data_validade: validity(days),
          },
        },
      ],
    });
  const result = await ok('/alertas?filial_id=' + branch.id);
  assert.ok(
    result.alertas.lotes_vencendo.some((lot) => lot.numero_lote === 'EXPIRY-7'),
  );
  assert.ok(
    !result.alertas.lotes_vencendo.some(
      (lot) => lot.numero_lote === 'EXPIRY-8',
    ),
  );
  assert.ok(
    !result.alertas.estoque_baixo.some((row) => row.produto_id === product.id),
    'Separate low lots must be summed before comparison',
  );
  const dashboard = await ok('/dashboard/resumo?filial_id=' + branch.id);
  const actual = await ok(
    '/saldos-estoque/resumo/atual?filial_id=' + branch.id,
  );
  assert.deepEqual(dashboard.estoque, actual);
  assert.deepEqual(dashboard.alertas, result);
  assert.equal(dashboard.semanal.length, 7);
  assert.ok(dashboard.recentes.length && dashboard.categorias.length);
  const category = await ok(
    '/dashboard/graficos/stock-categoria?filial_id=' + branch.id,
  );
  assert.equal(
    category.reduce((sum, item) => sum + item.quantidadeTotal, 0),
    actual.disponivel,
  );
  assert.equal(
    (await ok('/busca-global?termo=Marca%20teste')).resultados.produtos[0].id,
    product.id,
  );
  assert.ok(
    (
      await ok('/busca-global?termo=Fornecedor%20de%20teste')
    ).resultados.produtos.some((item) => item.id === product.id),
  );
  assert.ok(
    !(await ok('/busca-global?termo=COMMERCIAL-UI&filial_id=' + branch.id))
      .resultados.notas_fiscais.length,
  );
});

test('notification scans are idempotent and read state belongs to the signed-in user', async () => {
  const scans = await Promise.all([
    call('/notificacoes/executar-varredura', 'POST'),
    call('/notificacoes/executar-varredura', 'POST'),
  ]);
  assert.deepEqual(
    scans.map((result) => result.status),
    [201, 201],
  );
  const count = await prisma.notificacoes.count();
  await ok('/notificacoes/executar-varredura', 'POST');
  assert.equal(await prisma.notificacoes.count(), count);
  const adminBefore = await ok('/notificacoes');
  assert.ok(adminBefore.nao_lidas > 0);
  const operatorBefore = (
    await call('/notificacoes', 'GET', undefined, operatorToken)
  ).body;
  await ok('/notificacoes/' + adminBefore.dados[0].id + '/ler', 'PATCH');
  assert.equal(
    (await ok('/notificacoes')).nao_lidas,
    adminBefore.nao_lidas - 1,
  );
  assert.equal(
    (await call('/notificacoes', 'GET', undefined, operatorToken)).body
      .nao_lidas,
    operatorBefore.nao_lidas,
  );
  assert.equal(
    (
      await call(
        '/notificacoes/executar-varredura',
        'POST',
        undefined,
        operatorToken,
      )
    ).status,
    403,
  );
  assert.equal((await call('/notificacoes?lida=talvez')).status, 400);
});

test(
  'dashboard, notification drawer and global search render API results in the browser',
  { timeout: 120000 },
  async () => {
    const { chromium } = require('../frontend/node_modules/playwright');
    const browser = await chromium.launch({
      headless: true,
      executablePath:
        'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    });
    try {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
      });
      await context.addInitScript(
        (access) => sessionStorage.setItem('sinstock.access', access),
        token,
      );
      const page = await context.newPage(),
        errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(base + '/frontend/pages/dashboard.html');
      await page
        .locator('#dashboardOrders')
        .getByText('—', { exact: true })
        .waitFor({ state: 'hidden' });
      await page
        .locator('#dashboardLiveStatus')
        .getByText('Conectado:', { exact: false })
        .waitFor();
      const previousStock = await page.locator('#dashboardStock').textContent();
      await ok('/movimentacoes', 'POST', {
        produto_id: product.id,
        filial_id: branch.id,
        tipo: 'AJUSTE',
        quantidade: 1,
        observacao: 'Conferência do stream',
      });
      await page.waitForFunction(
        (previous) =>
          document.getElementById('dashboardStock').textContent !== previous,
        previousStock,
      );
      await page.locator('#dashboardAlerts [data-alert="expiry"]').click();
      await page
        .locator('[data-api-dialog]')
        .getByText('Lote EXPIRY-7', { exact: false })
        .waitFor();
      await page.keyboard.press('Escape');
      await page.locator('.notification').click();
      await page
        .locator('[data-api-dialog] .notification-list article')
        .first()
        .waitFor();
      const read = page.locator('[data-api-dialog] [data-read]').first();
      const id = await read.getAttribute('data-read');
      await read.click();
      await page
        .locator('[data-api-dialog] [data-read="' + id + '"]')
        .waitFor({ state: 'detached' });
      assert.ok(
        await prisma.leituraNotificacao.findUnique({
          where: {
            notificacao_id_usuario_id: {
              notificacao_id: Number(id),
              usuario_id: 1,
            },
          },
        }),
      );
      await page.keyboard.press('Escape');
      await page.locator('.search-box input').fill('Marca teste');
      await page.locator('.search-box input').press('Enter');
      await page
        .locator('[data-api-dialog]')
        .getByRole('link', { name: product.nome, exact: true })
        .click();
      await page.waitForURL('**/produtos.html?busca=*');
      await page
        .locator('#productsTableBody')
        .getByText(product.nome, { exact: true })
        .waitFor();
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  },
);

test('reports aggregate real sales/stock and export matching PDF, XLSX and safe CSV', async () => {
  const types = [
    'categorias',
    'vendas',
    'estoque',
    'movimentacoes',
    'mais-vendidos',
    'menos-vendidos',
    'vencidos',
    'vencimento',
    'sem-movimento',
  ];
  for (const tipo of types) {
    const result = await ok('/relatorios?tipo=' + tipo + '&limite=100');
    assert.ok(Array.isArray(result.dados) && result.colunas.length > 0);
    assert.equal(result.dados.length, result.meta.total);
  }
  const sales = await ok('/relatorios?tipo=vendas&filial_id=' + otherBranch.id);
  assert.ok(sales.dados.length > 0);
  const summary = await ok(
    '/pedidos/resumo/periodo?filial_id=' + otherBranch.id,
  );
  assert.equal(
    sales.dados.reduce((sum, row) => sum + Number(row.total), 0),
    summary.faturamento,
  );
  const stockReport = await ok(
    '/relatorios?tipo=estoque&filial_id=' + otherBranch.id,
  );
  const available = await ok(
    '/saldos-estoque/resumo/atual?filial_id=' + otherBranch.id,
  );
  assert.equal(
    stockReport.dados.reduce((sum, row) => sum + Number(row.disponivel), 0),
    available.disponivel,
  );
  assert.equal(
    (
      await ok(
        '/relatorios?tipo=vendas&data_inicio=2000-01-01&data_fim=2000-01-02',
      )
    ).meta.total,
    0,
  );
  assert.equal(
    (
      await call(
        '/relatorios?tipo=vendas&data_inicio=2027-01-01&data_fim=2026-01-01',
      )
    ).status,
    400,
  );
  assert.equal((await call('/relatorios?tipo=invalido')).status, 400);
  for (const format of ['pdf', 'xlsx', 'csv']) {
    const response = await fetch(
      base +
        '/relatorios/exportar?tipo=vendas&filial_id=' +
        otherBranch.id +
        '&formato=' +
        format,
      { headers: { authorization: 'Bearer ' + token } },
    );
    assert.equal(response.status, 200, await response.clone().text());
    const bytes = Buffer.from(await response.arrayBuffer());
    if (format === 'pdf')
      assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
    if (format === 'xlsx') {
      assert.equal(bytes.subarray(0, 2).toString(), 'PK');
      const ExcelJS = require('exceljs'),
        workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(bytes);
      assert.equal(workbook.worksheets[0].rowCount, sales.meta.total + 1);
      assert.equal(
        workbook.worksheets[0].getRow(2).getCell(7).value,
        Number(sales.dados[0].total),
      );
    }
    if (format === 'csv') {
      assert.ok(bytes.toString('utf8').includes('"Faturamento"'));
      assert.equal(
        bytes.toString('utf8').split('\r\n').length,
        sales.meta.total + 1,
      );
    }
  }
  const formula = await ok('/produtos', 'POST', {
    nome: '=HYPERLINK("https://example.invalid")',
    categoria_id: product.categoria_id,
    preco_venda: 1,
  });
  const csvResponse = await fetch(
    base +
      '/relatorios/exportar?tipo=estoque&produto_id=' +
      formula.id +
      '&formato=csv',
    { headers: { authorization: 'Bearer ' + token } },
  );
  assert.ok((await csvResponse.text()).includes('"\'=HYPERLINK'));
});

test(
  'report screen applies filters and downloads all three formats',
  { timeout: 120000 },
  async () => {
    const { chromium } = require('../frontend/node_modules/playwright');
    const browser = await chromium.launch({
      headless: true,
      executablePath:
        'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    });
    try {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        acceptDownloads: true,
      });
      await context.addInitScript(
        (access) => sessionStorage.setItem('sinstock.access', access),
        token,
      );
      const page = await context.newPage(),
        errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(base + '/frontend/pages/relatorios.html');
      await page
        .locator('#reportTitle')
        .getByText('Vendas por categoria', { exact: true })
        .waitFor();
      await page.locator('#reportType').selectOption('vendas');
      await page.locator('#reportBranch').selectOption(String(otherBranch.id));
      await page.locator('#applyReportFilters').click();
      await page
        .locator('#reportTitle')
        .getByText('Vendas confirmadas', { exact: true })
        .waitFor();
      for (const formato of ['csv', 'xlsx', 'pdf']) {
        await page.locator('#reportFormat').selectOption(formato);
        const download = page.waitForEvent('download');
        await page.locator('#exportReport').click();
        assert.equal(
          (await download).suggestedFilename(),
          'sinstock-vendas.' + formato,
        );
      }
      await page.locator('#startDate').fill('2027-01-01');
      await page.locator('#endDate').fill('2026-01-01');
      await page.locator('#applyReportFilters').click();
      await page
        .locator('#reportError')
        .getByText('A data inicial deve ser anterior à final.', { exact: true })
        .waitFor();
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  },
);

test('settings persist, protect mandatory stock rules and enforce account permissions', async () => {
  assert.equal(
    (
      await call(
        '/configuracoes/empresa',
        'PATCH',
        { nome: 'Proibido' },
        operatorToken,
      )
    ).status,
    403,
  );
  await ok('/configuracoes/empresa', 'PATCH', {
    nome: 'Empresa de integração',
    email: 'empresa@example.com',
    cidade: 'São Paulo',
    estado: 'SP',
  });
  assert.equal(
    (await ok('/configuracoes/publicas')).empresa.nome,
    'Empresa de integração',
  );
  assert.equal(
    (
      await call('/configuracoes/estoque', 'PATCH', {
        bloquear_negativo: false,
      })
    ).status,
    400,
  );
  assert.equal(
    (await call('/configuracoes/estoque', 'PATCH', { dias_validade: 30 }))
      .status,
    400,
  );
  assert.equal(
    (await call('/users', 'GET', undefined, operatorToken)).status,
    403,
  );
  assert.equal(
    (await call('/users/1/status', 'PATCH')).status,
    400,
    'Last active admin must be preserved',
  );
  assert.equal((await call('/users/1', 'PATCH', { ativo: null })).status, 400);
  const profile = await ok('/perfis', 'POST', {
    nome: 'Consulta relatórios',
    permissoes: { relatorios: { ler: true } },
  });
  await ok('/perfis/' + profile.id, 'PATCH', {
    nome: profile.nome,
    permissoes: { relatorios: { ler: true }, produtos: { ler: false } },
  });
  assert.equal(
    (await ok('/perfis/' + profile.id)).permissoes.produtos.ler,
    false,
  );
  assert.equal(
    (await call('/perfis/1', 'PATCH', { nome: 'Admin', permissoes: {} }))
      .status,
    400,
  );
});

test('email second factor uses expiring single-use codes and password changes revoke sessions', async () => {
  const created = await ok('/users', 'POST', {
    nome: 'Conta e-mail',
    email: 'mfa@example.com',
    senha: password,
    perfil_id: 2,
  });
  const login = await call(
    '/auth/login',
    'POST',
    { email: created.email, senha: password },
    null,
  );
  const access = login.body.access_token;
  assert.ok(access);
  const setup = await call(
    '/auth/2fa/email/setup',
    'POST',
    { senha_atual: password },
    access,
  );
  assert.equal(setup.status, 201);
  const setupCode = sentMail
    .at(-1)
    .conteudoHtml.match(/<strong>(\d{6})<\/strong>/)[1];
  assert.equal(
    (
      await call(
        '/auth/2fa/email/enable',
        'POST',
        { challenge_id: setup.body.challengeId, codigo: setupCode },
        access,
      )
    ).status,
    201,
  );
  assert.equal((await call('/auth/me', 'GET', undefined, access)).status, 401);
  const mfa = await call(
    '/auth/login',
    'POST',
    { email: created.email, senha: password },
    null,
  );
  assert.equal(mfa.body.method, 'EMAIL');
  assert.ok(!mfa.body.access_token && mfa.body.preAuthToken);
  assert.equal(
    (await call('/produtos', 'GET', undefined, mfa.body.preAuthToken)).status,
    401,
  );
  const code = sentMail
    .at(-1)
    .conteudoHtml.match(/<strong>(\d{6})<\/strong>/)[1];
  const wrong = code === '111111' ? '222222' : '111111';
  assert.equal(
    (
      await call(
        '/auth/2fa/authenticate',
        'POST',
        { codigo: wrong },
        mfa.body.preAuthToken,
      )
    ).status,
    401,
  );
  const results = await Promise.all([
    call(
      '/auth/2fa/authenticate',
      'POST',
      { codigo: code },
      mfa.body.preAuthToken,
    ),
    call(
      '/auth/2fa/authenticate',
      'POST',
      { codigo: code },
      mfa.body.preAuthToken,
    ),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [201, 401]);
  const verified = results.find((r) => r.status === 201).body.access_token;
  const profile = (await call('/auth/me', 'GET', undefined, verified)).body;
  assert.equal(profile.two_factor_method, 'EMAIL');
  assert.ok(!('twoFactorSecret' in profile) && !('senha_hash' in profile));
  const preferences = await call(
    '/configuracoes/preferencias',
    'PATCH',
    { notificar_estoque: false, itens_por_pagina: 20 },
    verified,
  );
  assert.equal(preferences.body.notificar_estoque, false);
  assert.equal(
    (await call('/configuracoes/preferencias', 'GET', undefined, verified)).body
      .itens_por_pagina,
    20,
  );
  assert.equal(
    (
      await call(
        '/auth/password',
        'PATCH',
        { senha_atual: 'errada', nova_senha: 'Nova-senha-456!' },
        verified,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await call(
        '/auth/password',
        'PATCH',
        { senha_atual: password, nova_senha: 'Nova-senha-456!' },
        verified,
      )
    ).status,
    200,
  );
  assert.equal(
    (await call('/auth/me', 'GET', undefined, verified)).status,
    401,
  );
});

test('support scopes tickets to owners, exchanges messages, validates attachments and maintains FAQ', async () => {
  const { randomUUID } = require('node:crypto');
  const request_id = randomUUID();
  const own = await call(
    '/chamados',
    'POST',
    {
      request_id,
      titulo: 'Chamado do operador',
      descricao: 'Não consigo localizar uma nota.',
      prioridade: 'MEDIA',
    },
    operatorToken,
  );
  assert.equal(own.status, 201);
  assert.equal(own.body.usuario_id, 2);
  assert.equal(own.body.email_solicitante, 'teste2@example.com');
  assert.equal(own.body.email_enviado, true);
  const repeated = await call(
    '/chamados',
    'POST',
    {
      request_id,
      titulo: 'Chamado do operador',
      descricao: 'Não consigo localizar uma nota.',
    },
    operatorToken,
  );
  assert.equal(repeated.body.id, own.body.id);
  assert.equal(
    (await call('/chamados', 'POST', { titulo: 'X', descricao: 'X' }, null))
      .status,
    401,
  );
  assert.equal(
    (await call('/chamados/' + own.body.id, 'GET', undefined, readonlyToken))
      .status,
    403,
  );
  const another = await prisma.usuarios.create({
    data: {
      nome: 'Outro operador',
      email: 'other@example.com',
      perfil_id: 2,
      senha_hash: await bcrypt.hash(password, 4),
    },
  });
  const jwt = app
    .get(require('@nestjs/jwt').JwtService)
    .sign({ sub: another.id, version: another.auth_version });
  assert.equal(
    (await call('/chamados/' + own.body.id, 'GET', undefined, jwt)).status,
    404,
  );
  assert.equal(
    (await call('/chamados', 'GET', undefined, jwt)).body.meta.total,
    0,
  );
  await ok('/chamados/' + own.body.id + '/mensagens', 'POST', {
    mensagem: 'Pode informar o número da nota?',
  });
  assert.equal(
    (
      await call(
        '/chamados/' + own.body.id + '/mensagens',
        'POST',
        { mensagem: 'NF-001' },
        operatorToken,
      )
    ).status,
    201,
  );
  const ticket = await ok('/chamados/' + own.body.id);
  assert.equal(ticket.mensagens.length, 2);
  assert.ok(ticket.mensagens.every((message) => message.autor.nome));
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aFZkAAAAASUVORK5CYII=',
    'base64',
  );
  const form = new FormData();
  form.append('arquivo', new Blob([png], { type: 'image/png' }), 'tela.png');
  const upload = await fetch(base + '/chamados/' + own.body.id + '/anexos', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + operatorToken },
    body: form,
  });
  assert.equal(upload.status, 201);
  const attachment = await upload.json();
  const file = await fetch(base + '/chamados/anexos/' + attachment.id, {
    headers: { authorization: 'Bearer ' + operatorToken },
  });
  assert.equal(file.status, 200);
  assert.deepEqual(Buffer.from(await file.arrayBuffer()), png);
  assert.equal(
    (await call('/chamados/anexos/' + attachment.id, 'GET', undefined, jwt))
      .status,
    404,
  );
  const invalid = new FormData();
  invalid.append(
    'arquivo',
    new Blob(['<script>bad</script>'], { type: 'image/png' }),
    'spoof.png',
  );
  assert.equal(
    (
      await fetch(base + '/chamados/' + own.body.id + '/anexos', {
        method: 'POST',
        headers: { authorization: 'Bearer ' + operatorToken },
        body: invalid,
      })
    ).status,
    415,
  );
  assert.equal(
    (
      await call('/chamados/' + own.body.id + '/status', 'PATCH', {
        status: 'INVALIDO',
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await call(
        '/chamados/' + own.body.id + '/status',
        'PATCH',
        { status: 'RESOLVIDO' },
        operatorToken,
      )
    ).status,
    403,
  );
  await ok('/chamados/' + own.body.id + '/status', 'PATCH', {
    status: 'RESOLVIDO',
  });
  assert.equal(
    (
      await call(
        '/chamados/' + own.body.id + '/status',
        'PATCH',
        { status: 'FECHADO' },
        operatorToken,
      )
    ).status,
    200,
  );
  assert.ok((await ok('/chamados/' + own.body.id)).data_fechamento);
  assert.equal(
    (
      await call(
        '/chamados/' + own.body.id + '/mensagens',
        'POST',
        { mensagem: 'Depois do fechamento' },
        operatorToken,
      )
    ).status,
    400,
  );
  assert.ok((await ok('/chamados/faq')).length >= 3);
  const faq = await ok('/chamados/faq', 'POST', {
    pergunta: 'Pergunta de integração',
    resposta: 'Resposta inicial',
    ordem: 99,
  });
  await ok('/chamados/faq/' + faq.id, 'PATCH', {
    pergunta: faq.pergunta,
    resposta: 'Resposta atualizada',
    ordem: 99,
  });
  assert.equal(
    (await ok('/chamados/faq?busca=Pergunta%20de%20integração'))[0].resposta,
    'Resposta atualizada',
  );
  await ok('/chamados/faq/' + faq.id, 'DELETE');
  assert.equal(
    (await ok('/chamados/faq?busca=Pergunta%20de%20integração')).length,
    0,
  );
});

test('nearby suppliers use coordinates or registered locality without inventing locations', async () => {
  const near = await ok('/fornecedores', 'POST', {
    nome_juridico: 'Fornecedor próximo',
    cnpj: '00000000000191',
    cidade: 'São Paulo',
    cep: '01001-000',
    estado: 'SP',
    latitude: -23.5505,
    longitude: -46.6333,
    telefone: '11999999999',
  });
  const far = await ok('/fornecedores', 'POST', {
    nome_juridico: 'Fornecedor distante',
    cnpj: '00000000000192',
    cidade: 'Rio de Janeiro',
    latitude: -22.9068,
    longitude: -43.1729,
  });
  const nearby = await ok(
    '/fornecedores/proximos?latitude=-23.5505&longitude=-46.6333&raio_km=10',
  );
  assert.ok(
    nearby.dados.some(
      (item) => item.id === near.id && Number(item.distancia_km) < 0.001,
    ),
  );
  assert.ok(!nearby.dados.some((item) => item.id === far.id));
  assert.ok(nearby.sem_coordenadas >= 1);
  assert.ok(
    (await ok('/fornecedores/proximos?cep=01001000')).dados.some(
      (item) => item.id === near.id,
    ),
  );
  assert.ok(
    (await ok('/fornecedores/proximos?cidade=Rio%20de%20Janeiro')).dados.some(
      (item) => item.id === far.id,
    ),
  );
  assert.equal(
    (await call('/fornecedores/proximos?latitude=200&longitude=0')).status,
    400,
  );
  assert.equal((await call('/fornecedores/proximos?latitude=10')).status, 400);
});

test(
  'camera decodes a simulated EAN-13 video and fills the known product',
  { timeout: 120000 },
  async () => {
    const path = require('node:path'),
      fs = require('node:fs');
    fs.mkdirSync('.tmp', { recursive: true });
    const videoPath = path.resolve('.tmp/camera-' + database + '.y4m');
    const code = require('./helpers/barcode-video.cjs')(
      videoPath,
      '789123456789',
    );
    const item = await ok('/produtos', 'POST', {
      nome: 'Produto câmera',
      categoria_id: product.categoria_id,
      codigo_barras: code,
      preco_venda: 8,
    });
    const { chromium } = require('../frontend/node_modules/playwright');
    const browser = await chromium.launch({
      headless: true,
      executablePath:
        'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
      args: [
        '--use-fake-device-for-media-stream',
        '--use-fake-ui-for-media-stream',
        '--use-file-for-fake-video-capture=' + videoPath,
      ],
    });
    try {
      const context = await browser.newContext({
        permissions: ['camera'],
        viewport: { width: 390, height: 844 },
      });
      await context.addInitScript((access) => {
        sessionStorage.setItem('sinstock.access', access);
        const original = navigator.mediaDevices.getUserMedia.bind(
          navigator.mediaDevices,
        );
        navigator.mediaDevices.getUserMedia = async (constraints) => {
          const stream = await original(constraints);
          window.testCameraTracks = stream.getTracks();
          return stream;
        };
      }, token);
      const page = await context.newPage(),
        errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(base + '/frontend/pages/produtos.html');
      await page.locator('#openProductModal').click();
      await page.locator('#scanProductBarcode').click();
      await page.waitForFunction(
        (id) => document.getElementById('productId').value === String(id),
        item.id,
      );
      assert.equal(
        await page.locator('#productName').inputValue(),
        'Produto câmera',
      );
      assert.equal(await page.locator('[data-camera-dialog]').count(), 0);
      assert.equal(
        await page.evaluate(() =>
          window.testCameraTracks.every(
            (track) => track.readyState === 'ended',
          ),
        ),
        true,
      );
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
      fs.unlinkSync(videoPath);
    }
  },
);

test(
  'settings screen persists company, users, permissions and personal preferences',
  { timeout: 120000 },
  async () => {
    const { chromium } = require('../frontend/node_modules/playwright');
    const browser = await chromium.launch({
      headless: true,
      executablePath:
        'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    });
    try {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
      });
      await context.addInitScript(
        (access) => sessionStorage.setItem('sinstock.access', access),
        token,
      );
      const page = await context.newPage(),
        errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(base + '/frontend/pages/configuracoes.html');
      await page.waitForFunction(
        () =>
          document.getElementById('companyName').value ===
          'Empresa de integração',
      );
      await page.locator('#companyPhone').fill('11988887777');
      const companySaved = page.waitForResponse(
        (response) =>
          response.url().endsWith('/configuracoes/empresa') &&
          response.request().method() === 'PATCH',
      );
      await page.locator('#companyForm [type="submit"]').click();
      await companySaved;
      await page.locator('[data-tab="usersSettings"]').click();
      await page.locator('#openUserModal').click();
      await page.locator('#userForm [name="nome"]').fill('Usuário pelo painel');
      await page.locator('#userForm [name="email"]').fill('painel@example.com');
      await page.locator('#userForm [name="telefone"]').fill('11911112222');
      await page.locator('#userForm [name="perfil"]').selectOption('2');
      await page.locator('#userForm [name="senha"]').fill('Painel-senha-123!');
      await page.locator('#userForm [type="submit"]').click();
      await page.locator('#userForm').waitFor({ state: 'detached' });
      await page
        .locator('#usersTableBody')
        .getByText('Usuário pelo painel', { exact: true })
        .waitFor();
      assert.equal(
        (
          await prisma.usuarios.findUnique({
            where: { email: 'painel@example.com' },
          })
        ).telefone,
        '11911112222',
      );
      const role = await prisma.perfis.findUnique({
        where: { nome: 'Consulta relatórios' },
      });
      await page.locator('#permissionProfile').selectOption(String(role.id));
      await page
        .locator(
          '#permissionRows [data-resource="dashboard"][data-action="ler"]',
        )
        .check();
      await page.locator('#permissionsForm [type="submit"]').click();
      await page.waitForFunction(() =>
        document
          .querySelector('.shared-toast')
          ?.textContent.includes('Permissões salvas'),
      );
      assert.equal(
        (await prisma.perfis.findUnique({ where: { id: role.id } })).permissoes
          .dashboard.ler,
        true,
      );
      await page.locator('[data-tab="systemSettings"]').click();
      await page.locator('#itemsPerPage').selectOption('20');
      await page.locator('#systemForm [type="submit"]').click();
      await page.waitForFunction(
        () => window.SinstockSession.user.preferencias?.itens_por_pagina === 20,
      );
      await page.reload();
      await page.locator('[data-tab="systemSettings"]').click();
      await page.waitForFunction(
        () => document.getElementById('itemsPerPage').value === '20',
      );
      await page.locator('[data-tab="securitySettings"]').click();
      await page.locator('#currentPassword').fill('senha incorreta');
      await page.locator('#newPassword').fill('Nao-deve-ser-salva-123!');
      await page.locator('#confirmPassword').fill('Nao-deve-ser-salva-123!');
      await page.locator('#passwordForm [type="submit"]').click();
      await page
        .locator('#passwordForm [data-form-error]')
        .getByText('A senha atual está incorreta.', { exact: true })
        .waitFor();
      assert.ok(page.url().includes('configuracoes.html'));
      assert.equal(
        (await ok('/configuracoes/publicas')).empresa.telefone,
        '11988887777',
      );
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  },
);

test(
  'help screen creates a ticket with attachment, sends messages and maintains a FAQ entry',
  { timeout: 120000 },
  async () => {
    const { chromium } = require('../frontend/node_modules/playwright');
    const browser = await chromium.launch({
      headless: true,
      executablePath:
        'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    });
    try {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
      });
      await context.addInitScript(
        (access) => sessionStorage.setItem('sinstock.access', access),
        token,
      );
      const page = await context.newPage(),
        errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(base + '/frontend/pages/ajuda.html');
      await page.locator('#faqList details').first().waitFor();
      await page.locator('#openTicketModal').click();
      await page.locator('#ticketSubject').fill('Chamado no navegador');
      await page
        .locator('#ticketDescription')
        .fill('Descrição pelo formulário.');
      await page.locator('#ticketAttachment').setInputFiles({
        name: 'tela.png',
        mimeType: 'image/png',
        buffer: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aFZkAAAAASUVORK5CYII=',
          'base64',
        ),
      });
      await page.locator('#ticketForm [type="submit"]').click();
      await page.locator('#ticketForm').waitFor({ state: 'detached' });
      const created = await prisma.chamados_suporte.findFirst({
        where: { assunto: 'Chamado no navegador' },
      });
      assert.ok(
        created &&
          (await prisma.anexoChamado.count({
            where: { chamado_id: created.id },
          })),
      );
      await page.locator('[data-tab="tickets"]').click();
      await page.locator('[data-ticket="' + created.id + '"]').click();
      await page
        .locator('#replyForm [name="mensagem"]')
        .fill('Mensagem com <b>texto</b>.');
      await page.locator('#replyForm [type="submit"]').click();
      await page
        .locator('.support-messages')
        .getByText('Mensagem com <b>texto</b>.', { exact: true })
        .waitFor();
      assert.equal(await page.locator('.support-messages b').count(), 0);
      await page.keyboard.press('Escape');
      await page.locator('[data-tab="helpCenter"]').click();
      await page.locator('#newFaq').click();
      await page
        .locator('[data-api-dialog] [name="pergunta"]')
        .fill('FAQ criada pelo navegador');
      await page
        .locator('[data-api-dialog] [name="resposta"]')
        .fill('Resposta persistida.');
      await page.locator('[data-api-dialog] [type="submit"]').click();
      await page
        .locator('#faqList')
        .getByText('FAQ criada pelo navegador', { exact: true })
        .waitFor();
      assert.ok(
        await prisma.faq.findFirst({
          where: { pergunta: 'FAQ criada pelo navegador' },
        }),
      );
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  },
);

test(
  'nearby supplier screen supports GPS and a city fallback',
  { timeout: 120000 },
  async () => {
    const { chromium } = require('../frontend/node_modules/playwright');
    const browser = await chromium.launch({
      headless: true,
      executablePath:
        'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    });
    try {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        permissions: ['geolocation'],
        geolocation: { latitude: -23.5505, longitude: -46.6333 },
      });
      await context.addInitScript(
        (access) => sessionStorage.setItem('sinstock.access', access),
        token,
      );
      const page = await context.newPage();
      await page.goto(base + '/frontend/pages/fornecedores.html');
      await page.locator('#openNearbyModal').click();
      await page.locator('[data-api-dialog] [data-gps]').click();
      await page
        .locator('[data-api-dialog] tbody')
        .getByText('Fornecedor próximo', { exact: true })
        .waitFor();
      await page.locator('#nearbyForm [name="cidade"]').fill('Rio de Janeiro');
      await page.locator('#nearbyForm [type="submit"]').click();
      await page
        .locator('[data-api-dialog] tbody')
        .getByText('Fornecedor distante', { exact: true })
        .waitFor();
    } finally {
      await browser.close();
    }
  },
);
test(
  'fractional quantities preserve minimum alerts and monetary rounding in checkout',
  { timeout: 120000 },
  async () => {
    const item = await ok('/produtos', 'POST', {
      nome: 'Produto fracionado',
      categoria_id: product.categoria_id,
      preco_venda: 0.15,
      estoque_minimo: 0.3,
    });
    for (const quantity of [0.1, 0.2])
      await ok('/notas-fiscais-entrada', 'POST', {
        filial_id: branch.id,
        fornecedor_id: supplier.id,
        numero_nf: 'FRAC-' + quantity,
        data_emissao: new Date().toISOString(),
        itens: [
          { produto_id: item.id, quantidade: quantity, custo_unitario: 0.1 },
        ],
      });
    const balance = await prisma.saldos_estoque.findFirst({
      where: { produto_id: item.id, filial_id: branch.id },
    });
    assert.ok(
      (await ok('/alertas?filial_id=' + branch.id)).alertas.estoque_baixo.some(
        (row) => row.produto_id === item.id,
      ),
    );
    const { chromium } = require('../frontend/node_modules/playwright');
    const browser = await chromium.launch({
      headless: true,
      executablePath:
        'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    });
    try {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
      });
      await context.addInitScript(
        (access) => sessionStorage.setItem('sinstock.access', access),
        token,
      );
      const page = await context.newPage();
      await page.goto(
        base +
          '/frontend/pages/estoque.html?busca=Produto%20fracionado&filial_id=' +
          branch.id,
      );
      await page
        .locator('#stockTableBody tr')
        .filter({ hasText: item.nome })
        .getByText('Estoque baixo', { exact: true })
        .waitFor();
      await page.goto(base + '/frontend/pages/vendas.html');
      await page
        .locator('#salesBranch option[value="' + branch.id + '"]')
        .waitFor({ state: 'attached' });
      await page.locator('#salesBranch').selectOption(String(branch.id));
      await page.locator('#openSaleModal').click();
      await page
        .locator('.sale-product-select option[value="' + item.id + '"]')
        .waitFor({ state: 'attached' });
      await page.locator('.sale-product-select').selectOption(String(item.id));
      await page.locator('.sale-product-quantity').fill('0.1');
      assert.ok(
        (await page.locator('#saleTotal').textContent()).includes('0,02'),
      );
      await page.locator('#salePayment').selectOption('PIX');
      await page.locator('#newSaleForm [type="submit"]').click();
      await page.locator('#newSaleForm').waitFor({ state: 'detached' });
      const sale = await prisma.pedidos_venda.findFirst({
        orderBy: { id: 'desc' },
      });
      assert.equal(Number(sale.total), 0.02);
      assert.equal(
        (await ok('/saldos-estoque/' + balance.id)).saldo_disponivel,
        0.2,
      );
    } finally {
      await browser.close();
    }
  },
);
