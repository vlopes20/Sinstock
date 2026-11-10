# Frontend SINSTOCK

Todas as telas operacionais usam a API. Abra http://localhost:3000/frontend/ com o backend em execução. Os cadastros, movimentações, reservas e chamados são persistidos no MySQL.

A camada js/services/data.js adapta consultas e paginação; commerce.js reúne venda/reserva. core/api.js trata JSON, multipart, downloads, autenticação e falhas de conexão. A câmera usa ZXing 0.1.5, instalado pelo lockfile e copiado para assets/vendor no build; suas licenças acompanham o arquivo.

Configurações de idioma/moeda são Português do Brasil e BRL. Preferências individuais controlam notificações, quantidade por página e encerramento por inatividade.

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

Para validar o layout de todas as paginas no navegador:

```sh
npm --prefix frontend run check:responsive
# Inclui capturas para inspecao visual em .tmp/responsive/:
npm --prefix frontend run check:responsive -- --screenshots
```

O teste usa Edge no Windows, quando instalado, ou o Chromium do Playwright
(`npx --prefix frontend playwright install chromium`). Executa um servidor
estatico temporario com uma sessao ficticia apenas para conferir os layouts;
nao acessa o banco nem envia e-mails. O relatorio fica em
`.tmp/responsive/audit.json` e nao contem credenciais reais.

Sao verificadas as larguras de 320, 390, 600, 768, 850, 1024, 1280 e 1440 pixels,
incluindo uma viewport de 850 x 390 para celular na horizontal. Alem das paginas,
o teste abre abas, menus moveis e modais, confere a rolagem das tabelas e o
alcance dos botoes no fim dos formularios. Falhas de layout e erros JavaScript
fazem o comando falhar.

## Layout responsivo

- Ate 850px, a navegacao fica em um menu lateral com fundo de fechamento e foco
  de teclado contido; a busca ocupa uma segunda linha no cabecalho.
- Os cards e formularios reduzem o numero de colunas conforme o espaco disponivel.
  Tabelas mantem suas colunas e rolam dentro do painel, inclusive pelo teclado.
- Modais usam a altura visivel da tela (`dvh`) e rolagem interna para manter os
  campos e botoes acessiveis em celulares na vertical e horizontal.
- As ilustracoes do login e da recuperacao aparecem a partir de 1280px, deixando
  os formularios centralizados nas larguras menores.
- Regras comuns ficam em `styles/shared.css`; as telas de autenticacao usam
  `styles/login.css` e `styles/autenticacao.css`. Sempre execute o build ao editar.

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

- `index.html` e `pages/*.html`: edite cores, tamanhos e espacamentos nas classes
  Tailwind dos elementos, como nas paginas de cadastro e recuperacao de senha.
- `styles/*.css`: complementos de responsividade, estados interativos, tema e
  componentes criados pelo JavaScript. Esses complementos ainda usam `@apply`.
- `assets/styles/*.css`: arquivos gerados e versionados, utilizados pelas paginas.
  Nao edite esses arquivos manualmente: execute o build antes de publicar.
- `tailwind.config.cjs`: configuracao dos utilitarios e das fontes HTML/JS.
- `pages/*.html` e `js/*.js`: usam classes utilitarias diretamente.
  Use nomes completos nas strings para que o compilador detecte as classes.

Exemplo de componente:

```html
<div class="flex items-center gap-3 rounded-[18px] bg-white p-6">
  <h2 class="text-xl font-semibold text-gray-900">Resumo</h2>
</div>
```

Nomes como `sidebar`, `menu-item` e `help-tab` permanecem no HTML como referencias
para os scripts e os ajustes compartilhados. Nao remova esses nomes ao editar
as classes visuais. Valores especificos do desenho usam valores/propriedades
arbitrarios do Tailwind. As variaveis CSS de tema continuam em `:root`.

`utilities.css` compila as classes usadas no HTML das telas operacionais e do
login. Carregue-o antes dos complementos, para que os estados e ajustes
responsivos preservem sua prioridade. `dashboard.css` fornece o tema e o reset
compartilhados; cada tela carrega seu complemento depois dessa base.
`login.css` atende ao `index.html`. Ambos preservam o reset original, sem o Preflight do Tailwind.
`autenticacao.css` inclui o Preflight para as seis paginas que ja usavam Tailwind.
Isso evita alterar os estilos padrao de elementos nas telas migradas.

`shared.css` contem os complementos compartilhados da versao atual, incluindo
acessibilidade, estados do menu mobile, avisos e ajustes dos icones. As paginas
que o utilizam devem carrega-lo depois dos estilos especificos da tela.
Nao e necessario manter uma pasta `css/`: os navegadores carregam os arquivos
gerados em `assets/styles/`.

Gráficos e tabelas são preenchidos com respostas reais da API. Câmera e geolocalização dependem da autorização do navegador; os fluxos de código digitado e busca por cidade/CEP também estão disponíveis.

A validação de câmera usa vídeo EAN-13 simulado, sem acessar o dispositivo físico durante os testes. A geolocalização de testes também é simulada. Endereços só são consultados no OpenStreetMap quando o usuário aciona a busca; a API utiliza cache e limita as chamadas ao provedor.

Referencia: [diretiva @apply do Tailwind](https://v3.tailwindcss.com/docs/functions-and-directives#apply).
