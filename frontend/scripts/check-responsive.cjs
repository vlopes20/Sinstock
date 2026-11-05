const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const out = path.resolve(root, '../.tmp/responsive');
const assert = require('node:assert/strict');
const screenshots = process.argv.includes('--screenshots');
// Layout-only fixtures: never connect to a database, send mail or mutate accounts.
fs.mkdirSync(out, { recursive: true });
const server = http.createServer((req, res) => {
  let file = path.resolve(
    root,
    '.' +
      decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(
        /^\/frontend/,
        '',
      ),
  );
  if (file === root) file = path.join(root, 'index.html');
  if (!file.startsWith(root + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  fs.readFile(file, (error, data) => {
    if (error) {
      res.writeHead(404).end();
      return;
    }
    res.setHeader(
      'Content-Type',
      {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.png': 'image/png',
      }[path.extname(file)] || 'application/octet-stream',
    );
    res.end(data);
  });
});
async function measure(page) {
  return page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const outside = [...document.querySelectorAll('body *')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        if (
          !r.width ||
          !r.height ||
          getComputedStyle(el).visibility === 'hidden' ||
          el.closest('svg')
        )
          return false;
        if (r.right <= width + 1 && r.left >= -1) return false;
        for (
          let parent = el.parentElement;
          parent && parent !== document.body;
          parent = parent.parentElement
        )
          if (
            ['auto', 'scroll', 'hidden', 'clip'].includes(
              getComputedStyle(parent).overflowX,
            )
          )
            return false;
        return true;
      })
      .map((el) => ({
        tag: el.tagName,
        class: String(el.className).slice(0, 100),
        right: Math.round(el.getBoundingClientRect().right),
      }));
    const problems = [];
    const search = document
      .querySelector('.topbar .search-box')
      ?.getBoundingClientRect();
    const actions = document
      .querySelector('.topbar-right')
      ?.getBoundingClientRect();
    if (
      search &&
      actions &&
      search.top < actions.bottom &&
      actions.top < search.bottom &&
      search.right > actions.left + 1
    )
      problems.push('Busca sobreposta aos controles do cabecalho');
    const language = document
      .querySelector('.auth-language, .language')
      ?.getBoundingClientRect();
    const title = document
      .querySelector('.auth-content h1, .login-header h1')
      ?.getBoundingClientRect();
    if (language && title && title.top < language.bottom + 12)
      problems.push('Titulo sobreposto ao seletor de idioma');
    const dialog = document.querySelector('[role="dialog"].active > div');
    if (dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        r.top < -1 ||
        r.bottom > innerHeight + 1 ||
        r.left < -1 ||
        r.right > width + 1
      )
        problems.push('Modal fora da area visivel');
    }
    return {
      width,
      scrollWidth: document.documentElement.scrollWidth,
      outside: outside.slice(0, 12),
      problems,
    };
  });
}
async function main() {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const browser = await chromium.launch({
    headless: true,
    ...(fs.existsSync(edge) ? { executablePath: edge } : {}),
  });
  const results = [];
  try {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      sessionStorage.setItem('sinstock.access', 'layout-test');
      sessionStorage.setItem('sinstock.preAuth', 'layout-test');
    });
    let role = 1;
    await context.route('**/auth/me', (route) =>
      route.fulfill({
        json: {
          id: 1,
          nome: 'Administrador Responsabilidade de Operacoes',
          ativo: true,
          perfil_id: role,
          email: 'layout@example.test',
        },
      }),
    );
    await context.route('**/perfis', (route) =>
      route.fulfill({
        json: [
          { id: 1, nome: 'Administrador' },
          { id: 2, nome: 'Operador' },
        ],
      }),
    );
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const pages = [
      'index.html',
      ...fs
        .readdirSync(path.join(root, 'pages'))
        .filter((x) => x.endsWith('.html'))
        .map((x) => 'pages/' + x),
    ];
    const widths = process.env.AUDIT_WIDTHS
      ? process.env.AUDIT_WIDTHS.split(',').map(Number)
      : [320, 390, 600, 768, 850, 1024, 1280, 1440];
    for (const width of widths) {
      // Width 850 also exercises a short landscape viewport.
      await page.setViewportSize({
        width,
        height: width === 850 ? 390 : width < 500 ? 740 : 900,
      });
      for (const file of pages) {
        await page.goto(base + '/frontend/' + file, {
          waitUntil: 'networkidle',
        });
        await page.evaluate(() => document.fonts.ready);
        const states = [['default', await measure(page)]];
        if ([320, 768, 850, 1024].includes(width)) {
          const visitedModals = new Set();
          async function inspectModals() {
            for (const trigger of await page
              .locator('button[id^="open"][id$="Modal"]')
              .all()) {
              const id = await trigger.getAttribute('id');
              if (
                visitedModals.has(id) ||
                !(await trigger.isVisible()) ||
                !(await trigger.isEnabled())
              )
                continue;
              visitedModals.add(id);
              await trigger.click();
              const dialog = page.locator('[role="dialog"].active');
              await dialog.waitFor({ state: 'visible' });
              states.push(['modal:' + id, await measure(page)]);
              const lastButton = dialog.locator('button').last();
              await lastButton.scrollIntoViewIfNeeded();
              const reachable = await lastButton.evaluate((el) => {
                const r = el.getBoundingClientRect();
                return r.top >= 0 && r.bottom <= innerHeight + 1;
              });
              assert.ok(reachable, file + ': botoes do modal inacessiveis');
              if (screenshots)
                await page.screenshot({
                  path: path.join(
                    out,
                    `${width}-${path.basename(file, '.html')}-modal.png`,
                  ),
                  fullPage: true,
                });
              await page.keyboard.press('Escape');
              await dialog.waitFor({ state: 'hidden' });
            }
          }
          const toggle = page.locator('.mobile-menu-toggle');
          if (await toggle.isVisible()) {
            await toggle.click();
            assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
            assert.equal(
              await page.locator('main').evaluate((el) => el.inert),
              true,
            );
            states.push(['mobile-menu', await measure(page)]);
            await page.keyboard.press('Escape');
            assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
            assert.equal(
              await page.locator('main').evaluate((el) => el.inert),
              false,
            );
          }
          await inspectModals();
          for (const tab of await page.locator('[data-tab]').all()) {
            if (!(await tab.isVisible())) continue;
            await tab.click();
            states.push([
              'tab:' + (await tab.getAttribute('data-tab')),
              await measure(page),
            ]);
            await inspectModals();
          }
        }
        const tableScrolls = await page
          .locator('[class*="-table-container"]')
          .evaluateAll((containers) =>
            containers
              .filter((el) => el.clientWidth && el.scrollWidth > el.clientWidth)
              .map((el) => {
                el.scrollLeft = el.scrollWidth;
                const moved = el.scrollLeft > 0;
                el.scrollLeft = 0;
                return moved;
              }),
          );
        assert.ok(
          tableScrolls.every(Boolean),
          file + ': tabela sem rolagem horizontal',
        );
        for (const [state, metrics] of states) {
          const row = { file, width, state, ...metrics };
          results.push(row);
          if (
            metrics.scrollWidth > width + 1 ||
            metrics.outside.length ||
            metrics.problems.length
          )
            console.log(JSON.stringify(row));
        }
        if (screenshots && [390, 1024, 1440].includes(width)) {
          await page.goto(base + '/frontend/' + file, {
            waitUntil: 'networkidle',
          });
          await page.screenshot({
            path: path.join(
              out,
              `${width}-${path.basename(file, '.html')}.png`,
            ),
            fullPage: true,
          });
        }
      }
      console.log('Largura concluida: ' + width);
    }
    role = 2;
    await page.setViewportSize({ width: 390, height: 740 });
    await page.goto(base + '/frontend/pages/configuracoes.html', {
      waitUntil: 'networkidle',
    });
    assert.equal(
      await page.locator('[data-admin-only]').evaluateAll(nodes => nodes.some(node => node.getClientRects().length > 0)),
      false,
      'Botao de administrador visivel para operador',
    );
    await page.locator('.mobile-menu-toggle').click();
    assert.equal(await page.locator('main').evaluate((el) => el.inert), true);
    await page.setViewportSize({ width: 1024, height: 740 });
    await page.waitForFunction(() => !document.querySelector('main').inert);
    assert.equal(await page.locator('.menu-backdrop').isVisible(), false);
    assert.equal(await page.locator('.sidebar').isVisible(), true);
    fs.writeFileSync(
      path.join(out, 'audit.json'),
      JSON.stringify({ results, errors }, null, 2),
    );
    const failures = results.filter(
      (row) =>
        row.scrollWidth > row.width + 1 ||
        row.outside.length ||
        row.problems?.length,
    );
    console.log(
      'Auditoria: ' +
        results.length +
        ' estados; erros JS: ' +
        errors.length +
        '; falhas de layout: ' +
        failures.length,
    );
    assert.equal(errors.length, 0, 'Erros JavaScript durante a auditoria');
    assert.equal(
      failures.length,
      0,
      'Falhas de layout; consulte .tmp/responsive/audit.json',
    );
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
  server.close();
});
