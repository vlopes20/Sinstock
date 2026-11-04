const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pages = ['index.html', ...fs.readdirSync(path.join(root, 'pages'), { recursive: true })
  .filter((file) => file.endsWith('.html')).map((file) => path.join('pages', file))];
const missing = new Map();
let checked = 0;

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  for (const tag of html.matchAll(/<(?:script|link|img|a)\b[^>]*>/gi)) {
    for (const match of tag[0].matchAll(/\b(?:src|href)\s*=\s*(["'])(.*?)\1/gi)) {
      const href = match[2];
      if (!href || /^(?:[a-z][a-z\d+.-]*:|\/\/|#|\?)/i.test(href)) continue;
      const relative = decodeURIComponent(href.split(/[?#]/)[0]);
      const target = relative.startsWith('/')
        ? path.resolve(root, '.' + relative)
        : path.resolve(root, path.dirname(page), relative);
      checked++;
      if (!fs.existsSync(target)) {
        const name = path.relative(root, target).split(path.sep).join('/');
        if (!missing.has(name)) missing.set(name, []);
        missing.get(name).push(page.split(path.sep).join('/'));
      }
    }
  }
}

console.log(`${checked} referencias locais verificadas em ${pages.length} paginas.`);
for (const [file, references] of missing) {
  console.error(`Ausente: ${file}\n  Referenciado em: ${[...new Set(references)].join(', ')}`);
}
if (missing.size) process.exitCode = 1;
