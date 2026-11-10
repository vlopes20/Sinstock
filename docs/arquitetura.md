# Organização do projeto

Os comandos de instalação, build, execução e testes são executados na raiz do repositório. O pacote npm da raiz contém as dependências da API e as ferramentas compartilhadas; o pacote `frontend/package.json` contém as ferramentas de CSS e navegador. Não há um terceiro pacote npm em `backend/`.

```text
Sinstock/
  backend/
    src/                    Código TypeScript da API NestJS
      common/               Recursos compartilhados e resolução de caminhos
      <domínio>/            Módulo, controller, service, DTOs e guards
    prisma/
      schema.prisma         Modelo do banco
      migrations/           Migrações SQL versionadas
      seed.ts               Entrada de compatibilidade do bootstrap local
    scripts/                Administração local, SMTP e integridade do banco
    test/                   Integração HTTP, banco e navegador
      helpers/              Auxiliares usados pelas suítes
  frontend/
    index.html              Login
    pages/                  Páginas da aplicação
    js/                     Scripts da interface e cliente da API
    styles/                 CSS fonte com Tailwind
    assets/                 CSS compilado, imagens e bibliotecas distribuídas
    scripts/                Build de CSS e verificações da interface
    package.json            Dependências próprias do frontend
  scripts/                  Verificações da estrutura do repositório
  docs/                     Manuais, contratos e evidências de validação
  dist/                     API compilada; entrada dist/main.js; ignorado
  coverage/                 Cobertura de testes; ignorado
  .tmp/                     Artefatos temporários e credenciais locais; ignorado
  node_modules/             Dependências da API; ignorado
  .env                      Configuração local; ignorada
  .env.example              Modelo de configuração versionado
  package.json              Comandos principais e dependências da API
  nest-cli.json             Entrada backend/src/main.ts
  tsconfig.json             Tipos do backend e configuração Prisma
  tsconfig.build.json       Compila apenas backend/src, sem testes
  prisma.config.ts          Schema e migrações em backend/prisma
  eslint.config.mjs         Análise do TypeScript do backend
```

## Compilação e inicialização

`npm.cmd run start:prod` executa o build e inicia `dist/main.js`. O comando pode ser repetido depois de encerrar a instância anterior. O build mantém o cache incremental dentro de `dist/`, junto dos arquivos que ele descreve. Assim, limpar a saída também limpa o cache.

`npm.cmd run start:dev` usa o compilador do NestJS com observação de alterações. Não use `tsx` para iniciar a aplicação: a injeção de dependências precisa dos metadados emitidos pelo TypeScript.

O servidor localiza o `.env` e o `frontend/` a partir da própria localização, tanto no código fonte quanto no compilado. Não depende do diretório atual do processo. Para distribuir a aplicação compilada, preserve na raiz `package.json`, `prisma.config.ts`, `frontend/`, `dist/` e as dependências instaladas; forneça as variáveis de ambiente ou um `.env` local.

O frontend é servido pela API em `/frontend/`. Somente `index.html`, `pages/`, `js/` e `assets/` são publicados. Configurações, ferramentas, fontes de estilos e dependências npm não são expostas.

## Prisma e arquivos gerados

Há uma única estratégia para o cliente Prisma: `prisma-client-js`, gerado em `node_modules` e importado como `@prisma/client`. Execute `npm.cmd run db:generate` após instalar dependências ou alterar o schema. O antigo `backend/prisma/generated/` e o alias para `src/generated/prisma` foram retirados.

Migrações ficam em `backend/prisma/migrations/`. Execute `npm.cmd run db:migrate` para aplicá-las e `npm.cmd run db:status` para consultar o estado. O bootstrap cria somente o primeiro administrador local e usa `.tmp/admin-local.json` na raiz, independentemente do diretório de execução.

CSS e bibliotecas de navegador em `frontend/assets/` permanecem versionados porque são os arquivos distribuídos pelo servidor. Atualize-os com `npm.cmd run build:frontend`; não edite o CSS compilado manualmente.

## Testes e verificações

| Comando | Finalidade |
| --- | --- |
| `npm.cmd run build` | Compilar a API em `dist/` |
| `npm.cmd run check:architecture` | Conferir a entrada compilada, caminhos em outro diretório e resolução das suítes/dependências |
| `npm.cmd run typecheck` | Verificar tipos sem emitir arquivos |
| `npm.cmd test -- --runInBand` | Testes unitários em `backend/src/**/*.spec.ts` |
| `npm.cmd run test:auth` | Autenticação HTTP/navegador com persistência e SMTP isolados |
| `npm.cmd run test:stock` | Integração com banco MySQL temporário e navegador |
| `npm.cmd run test:e2e` | Executar as duas suítes de integração existentes |
| `npm.cmd run check:frontend` | Conferir CSS compilado e referências locais |
| `npm.cmd --prefix frontend run check:responsive` | Conferir layouts em múltiplas larguras |
| `npm.cmd run stock:check` | Consultar integridade do banco configurado, sem alterar dados |
| `npm.cmd run lint` | Analisar o código TypeScript da API |

O navegador dos testes pertence às dependências do frontend e é resolvido com `createRequire` a partir de `frontend/package.json`. Os testes não presumem uma pasta `backend/frontend/` nem dependem de uma posição fixa do pacote Playwright em `node_modules`.

## Documentação e artefatos históricos

O [manual de acesso local](manual-acesso-local.md) descreve a operação atual. Inventários e relatórios datados registram o estado observado quando foram produzidos; caminhos iniciados por `src/` nesses inventários se referem ao código da API, hoje em `backend/src/`.

Arquivos gerados antigos, o cache TypeScript anterior e o snapshot Repomix foram guardados localmente em `.tmp/architecture-backup/` durante a reorganização. Não são necessários para instalar ou executar o sistema e ficam fora do versionamento.

## Validação da reorganização — 05/11/2026

- Build da API, verificação de tipos e geração do cliente Prisma concluídos.
- 5 verificações de estrutura, 14 testes unitários, 6 testes de autenticação e 30 testes de estoque aprovados.
- 262 referências locais em 16 páginas conferidas; 12 folhas de estilo compiladas conferidas.
- 239 estados de layout aprovados, sem erros JavaScript nem falhas de layout.
- Modo de desenvolvimento e servidor compilado iniciados; o frontend respondeu com HTTP 200 inclusive com o processo iniciado em outra pasta.
- As 9 migrações do banco local estão aplicadas. A suíte de estoque usou banco temporário, sem inserir dados de teste no banco principal.

O comando de lint agora encontra os fontes corretos, mas ainda aponta problemas existentes de tipagem e formatação em módulos de negócio. Eles não foram ocultados com desativação de regras. O relatório local da execução fica em `.tmp/architecture-lint.log`.
