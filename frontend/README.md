# Frontend SINSTOCK

As paginas HTML usam Tailwind CSS 3.4 compilado localmente. Essa versao preserva
os utilitarios das paginas de autenticacao que anteriormente usavam o Play CDN.
Nao e necessario carregar Tailwind pela internet ao abrir as paginas.

## Desenvolvimento

Na raiz do repositorio:

```sh
npm ci --prefix frontend
npm run build:frontend
```

Para recompilar ao editar HTML, JavaScript ou estilos:

```sh
npm run watch:frontend
```

Para conferir se os arquivos gerados estao atualizados:

```sh
npm run check:frontend
```

Para identificar imagens, scripts, estilos e paginas locais ausentes:

```sh
npm --prefix frontend run check:links
```

As dependencias do frontend ficam em `frontend/package.json` e possuem seu
proprio lockfile. Nao e necessario instalar o backend para compilar os estilos.

## Onde editar

```text
frontend/
  index.html          Entrada do sistema
  pages/              Demais paginas HTML
  js/                 Scripts das paginas e integracoes
  styles/             Fontes Tailwind editaveis
  assets/
    images/           Imagens
    styles/           CSS compilado pelo Tailwind
  scripts/            Compilacao e verificacao de caminhos
```

- `styles/*.css`: fontes Tailwind; os componentes existentes usam `@apply`.
- `assets/styles/*.css`: arquivos gerados e versionados, utilizados pelas paginas.
  Nao edite esses arquivos manualmente: execute o build antes de publicar.
- `tailwind.config.cjs`: configuracao dos utilitarios e das fontes HTML/JS.
- `pages/*.html` e `js/*.js`: tambem podem usar classes utilitarias diretamente.
  Use nomes completos nas strings para que o compilador detecte as classes.

Exemplo de componente:

```css
.example-card {
    @apply flex items-center gap-[12px] rounded-[18px];
}
```

As classes de componentes, seletores de estado e media queries foram mantidos
para preservar a cascata e os seletores usados por menus, filtros e modais no
JavaScript. Valores especificos do desenho usam valores/propriedades arbitrarios
do Tailwind. As variaveis CSS de tema continuam declaradas em `:root`.

`dashboard.css` fornece a base compartilhada das telas administrativas; cada
tela continua carregando seu complemento depois dessa base. `login.css` atende
ao `index.html`. Ambos preservam o reset original, sem o Preflight do Tailwind.
`autenticacao.css` inclui o Preflight para as seis paginas que ja usavam Tailwind.
Isso evita alterar os estilos padrao de elementos nas telas migradas.

`shared.css` contem os complementos compartilhados da versao atual, incluindo
acessibilidade, estados do menu mobile, avisos e ajustes dos icones. As paginas
que o utilizam devem carrega-lo depois dos estilos especificos da tela.
Nao e necessario manter uma pasta `css/`: os navegadores carregam os arquivos
gerados em `assets/styles/`.

As dimensoes estaticas dos graficos usam classes Tailwind no HTML. Valores
calculados em tempo de execucao (posicao de menus, animacoes e filtros) continuam
sob controle do JavaScript.

Referencia: [diretiva @apply do Tailwind](https://v3.tailwindcss.com/docs/functions-and-directives#apply).
