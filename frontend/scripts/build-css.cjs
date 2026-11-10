const fs = require('node:fs/promises');
const { watch } = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const config = require('../tailwind.config.cjs');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'assets', 'styles');
const check = process.argv.includes('--check');
const watchMode = process.argv.includes('--watch');

async function build() {
  await fs.mkdir(path.join(root, 'assets/vendor'), { recursive: true });
  const decoderFiles = [
    ['@zxing/browser/umd/zxing-browser.min.js', 'zxing-browser.min.js'],
    ['@zxing/browser/LICENSE', 'zxing-browser.LICENSE'],
    ['@zxing/library/LICENSE', 'zxing-library.LICENSE'],
  ];
  for (const [source, name] of decoderFiles) {
    const content = await fs.readFile(path.join(root, 'node_modules', source));
    const destination = path.join(root, 'assets/vendor', name);
    if (check) {
      if (!content.equals(await fs.readFile(destination)))
        throw new Error(name + ' desatualizado.');
    } else await fs.writeFile(destination, content);
  }
  const vendor = path.join(root, 'assets', 'vendor', 'lucide.min.js');
  const lucide = await fs.readFile(
    path.join(root, 'node_modules/lucide/dist/umd/lucide.min.js'),
    'utf8',
  );
  if (check) {
    if (
      (await fs.readFile(vendor, 'utf8')).replace(/\r\n/g, '\n') !==
      lucide.replace(/\r\n/g, '\n')
    )
      throw new Error('Lucide desatualizado: execute npm run build.');
  } else {
    await fs.mkdir(path.dirname(vendor), { recursive: true });
    await fs.writeFile(vendor, lucide);
  }
  const files = (await fs.readdir(path.join(root, 'styles')))
    .filter((file) => file.endsWith('.css'))
    .sort();
  await fs.mkdir(output, { recursive: true });
  for (const file of files) {
    const from = path.join(root, 'styles', file);
    const to = path.join(output, file);
    const result = await postcss([
      tailwindcss({
        ...config,
        content: [
          path.join(root, 'index.html'),
          path.join(root, 'pages/**/*.html'),
          path.join(root, 'js/**/*.js'),
        ],
        // Only the pages previously using the CDN need Tailwind's full reset.
        corePlugins: { preflight: file === 'autenticacao.css' },
      }),
    ]).process(await fs.readFile(from, 'utf8'), { from, to, map: false });
    result.root.walkRules((rule) => {
      rule.raws.semicolon = true;
    });
    const compiled = result.root
      .toString()
      .replace(/[\t ]+$/gm, '')
      .trimEnd();
    const css =
      '/* Gerado por npm run build. Edite styles/' +
      file +
      '. */\n' +
      compiled +
      '\n';
    if (check) {
      if (
        (await fs.readFile(to, 'utf8')).replace(/\r\n/g, '\n') !==
        css.replace(/\r\n/g, '\n')
      ) {
        throw new Error(`${file} desatualizado: execute npm run build.`);
      }
    } else {
      await fs.writeFile(to, css);
    }
  }
  console.log(
    `${files.length} folhas Tailwind ${check ? 'verificadas' : 'compiladas'}.`,
  );
}

async function main() {
  await build();
  if (!watchMode) return;
  let timer;
  let queue = Promise.resolve();
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      queue = queue.then(build).catch((error) => console.error(error));
    }, 150);
  };
  for (const dir of ['styles', 'pages', 'js']) {
    watch(path.join(root, dir), { recursive: true }, schedule);
  }
  watch(path.join(root, 'index.html'), schedule);
  watch(path.join(root, 'tailwind.config.cjs'), () => {
    console.log(
      'Configuracao alterada: reinicie npm run watch para aplica-la.',
    );
  });
  console.log('Observando styles/, pages/, js/ e index.html...');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
