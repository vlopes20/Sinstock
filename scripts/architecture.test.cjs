const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pkg = require('../package.json');

test('compilation emits the executable declared by start:prod', () => {
  const entry = pkg.scripts['start:prod'].replace(/^node /, '');
  assert.equal(entry, 'dist/main.js');
  assert.ok(
    existsSync(path.join(root, entry)),
    'Execute npm run build primeiro.',
  );
  assert.ok(!existsSync(path.join(root, 'dist/backend')));
  assert.ok(!existsSync(path.join(root, 'dist/src')));
});

test('source and compiled resource paths work outside the project cwd', () => {
  for (const [modulePath, loader] of [
    [
      'backend/src/common/project-paths.ts',
      ['-r', 'ts-node/register/transpile-only'],
    ],
    ['dist/common/project-paths.js', []],
  ]) {
    const code = `console.log(JSON.stringify(require(${JSON.stringify(path.join(root, modulePath))})))`;
    const result = JSON.parse(
      execFileSync(process.execPath, [...loader, '-e', code], {
        cwd: path.dirname(root),
        env: {
          ...process.env,
          TS_NODE_PROJECT: path.join(root, 'tsconfig.json'),
          NODE_PATH: path.join(root, 'node_modules'),
        },
        encoding: 'utf8',
      }),
    );
    assert.equal(result.projectRoot, root);
    assert.equal(result.frontendRoot, path.join(root, 'frontend'));
    assert.equal(result.environmentFile, path.join(root, '.env'));
  }
});

test('integration commands point to existing suites', () => {
  for (const name of ['test:auth', 'test:stock']) {
    const file = pkg.scripts[name].split(' ').at(-1);
    assert.ok(existsSync(path.join(root, file)), file);
  }
  assert.ok(existsSync(path.join(root, pkg.jest.rootDir)));
});

test('Prisma uses one generated client, installed outside versioned sources', () => {
  const schema = readFileSync(
    path.join(root, 'backend/prisma/schema.prisma'),
    'utf8',
  );
  assert.match(schema, /provider\s*=\s*"prisma-client-js"/);
  assert.ok(!existsSync(path.join(root, 'backend/prisma/generated')));
  assert.ok(require.resolve('@prisma/client'));
});

test('integration suites resolve the frontend browser dependency', () => {
  const { chromium } = require('../backend/test/helpers/playwright.cjs');
  assert.equal(typeof chromium.launch, 'function');
});
