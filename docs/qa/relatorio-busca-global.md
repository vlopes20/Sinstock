# QA SINSTOCK - correcoes e regressao

Base: develop 4c3eddc. Trabalho: qa/testes-busca-global. Sem commit ou push.

## Evidencia antes e depois

- Busca: originalmente 2 testes aprovados e 8 falhas. Apos correcao, os mesmos 10 passaram.
- Acrescentados 2 casos de inferencia de fornecedor pelos filtros de produtos.
- Politica compartilhada: 11 casos de administrador, flags admin/todas, operacoes, negacao explicita, JSON e filiais.
- Estoque: 6 casos; antes da defesa contra duplicidade, 1 falhou e 5 passaram.
- HTTP 401: 6 casos; antes da correcao, 2 falharam e 4 passaram.
- Regressao Jest completa: 49 testes aprovados em 6 suites, incluindo 14 casos existentes de e-mail com transporte simulado.
- TypeScript: aprovado. Lint geral: reprovado, 429 erros e 15 avisos na primeira verificacao, incluindo arquivos fora do diff e formatacao dos novos arquivos. Nao se declara baseline limpo.

## Correcoes

1. Politica pura compartilhada entre PermissionsGuard e busca; mantidas regras administrativas e fallback existentes.
2. Controller transmite usuario autenticado; cada grupo e autorizado antes de findMany. Grupos negados retornam [] e nao entram no total.
3. Pesquisa de produto por nome do fornecedor exige leitura de fornecedores.
4. Saldos duplicados sao detectados com findMany/take 2 antes de alterar um registro arbitrario. Nao repara nem elimina dados.
5. Evento de sessao expirada e emitido antes da leitura/interpretacao do corpo HTTP 401. Login e token explicito mantem suas excecoes.

Lotes usam saldos-estoque.ler, recurso ja existente para a visao de estoque. Este mapeamento requer ratificacao da equipe; nao foi criada permissao nova. Nome do produto no lote e nome do fornecedor na nota continuam parte das respectivas visoes existentes.

## Limites e pendencias

- UNIQUE com lote NULL continua sem garantia de unicidade no MySQL. Proposta: avaliar coluna gerada normalizando lote nulo e indice unico; auditar duplicidades antes de qualquer migration. Nenhuma migration preparada/aplicada nesta rodada.
- FKs independentes nao garantem produto/lote coerentes no banco. Aplicacao rejeita lote de outro produto; teste simulado aprovado. Avaliar FK composta em proposta separada.
- Bloqueio de produto e transacoes existentes preservados. Mocks nao comprovam concorrencia, rollback, triggers ou constraints reais.
- TOTP nao registra passo consumido. Correcao robusta requer armazenamento persistente e operacao atomica, portanto pendente de desenho e autorizacao de schema. Cache em memoria nao resolve multiplas instancias/reinicios.
- Revogacao JWT e pre-autenticacao: controles estaticos existentes preservados; suite de integracao nao executada nesta rodada. Ampliar unidade de estrategias e cenarios de concorrencia em rodada futura.
- Nao foram executados test:stock, test:e2e, migrations, seed, MySQL ou SMTP.
- Arquitetura depende de build/dist e dependencia de navegador do frontend; nao foi declarada aprovada nesta rodada.

## Reproducao segura

npm.cmd test -- --runInBand --no-cache --coverage=false
npm.cmd run typecheck

Jest seleciona somente *.spec.ts em backend/src. Prisma e mockado nas suites novas; frontend usa VM e fetch simulado. Nao importar AppModule ou conectar clientes reais.

## Apresentacao

Usar a comparacao 2/10 antes e 10/10 depois como evidencia da correcao principal. Os dois casos adicionais demonstram preservacao da busca autorizada por fornecedor e remocao do criterio quando negado. Demonstracao funcional com banco e preparacao do ambiente continuam pendentes de autorizacao especifica.

## Revisao final de tipagem e lint

- Executadas novamente as seis suites Jest isoladas: 49 aprovados, zero falhas, zero bloqueados (4,971 s na ultima execucao).
- TypeScript (`npm.cmd run typecheck`): aprovado.
- `git diff --check`: aprovado; Git apenas informa conversao futura LF/CRLF, sem erro de whitespace.
- `node --check frontend/js/core/api.js`: aprovado. O lint do repositorio seleciona TypeScript; nao se declara lint ESLint do JavaScript aprovado.
- ESLint, sem cache, nos nove arquivos TypeScript modificados/criados: quatro erros e zero avisos. Oito arquivos estao sem erros/avisos.
- Todos os erros introduzidos foram eliminados. Nenhuma regra de ESLint/TypeScript foi relaxada; nenhum teste foi removido, ignorado ou teve suas expectativas reduzidas.
- Persistem exclusivamente quatro erros preexistentes em stock.service.ts: no-unsafe-member-access em 81 (.code do erro capturado), no-base-to-string em 151/152/153 (serializacao de quantidade e saldos). Comparacao com HEAD confirma as mesmas regras em 81/145/146/147; deslocamento devido a seis linhas novas da defesa contra duplicidade.
- O total historico de 429 erros e 15 avisos acima nao representa o resultado final. Nao foi executada uma nova varredura global; a verificacao final cobre os arquivos deste diff.

### Ajustes desta revisao

Tipagem do request do guard; tupla de promises com payloads gerados pelo Prisma na busca; tipos dos mocks, argumentos e sandbox do frontend; remocao de assertions desnecessarias e formatacao pelos criterios do ESLint. Preservados filtros, contrato de resposta, defesa de estoque e fluxo HTTP 401.

### Resumo para revisao dos desenvolvedores

A busca verifica cada recurso antes da consulta e preserva os grupos autorizados. A politica e compartilhada com o guard, incluindo administrador e fallback existentes. Estoque falha explicitamente diante de saldos duplicados. Frontend notifica expiracao para 401 mesmo com corpo nao JSON. Evidencia principal: 2/10 antes, 10/10 depois; com regressao adicional, 49/49.

Pronto para revisao tecnica, sem erros novos de lint. Lint global nao esta limpo. Ratificar lotes -> saldos-estoque.ler e campos relacionados das visoes antes de integrar. Unicidade NULL, FK composta, persistencia TOTP, testes reais de concorrencia e atualizacao de dependencias continuam pendentes; nenhuma regra pendente foi modificada nesta revisao.

### Arquivos locais para revisao

Modificados: permissions.guard.ts, busca-global.controller.ts, busca-global.service.ts, stock.service.ts, frontend/js/core/api.js.
Novos: permission-policy.ts, permission-policy.spec.ts, busca-global.authorization.spec.ts, frontend-api.spec.ts, stock.service.spec.ts, docs/qa/relatorio-busca-global.md, docs/qa/dependencias.md e docs/qa/dependencias-audit.json.
Branch qa/testes-busca-global; sem commit, push, merge ou alteracao da develop. Nenhum acesso ao MySQL, migration, seed ou alteracao do schema.

## Rodada posterior: integridade de estoque

Consulte integridade-estoque.md para evidencia, limites, DDL candidato e matriz de concorrencia. Foram preservados os 49 testes anteriores e acrescentados 18: total final 67 testes aprovados em sete suites, sem falhas. TypeScript e diff --check aprovados. Retentativa restrita a erros da transacao; publicacao pos-commit nao repete trabalho. Deltas/reservas nao finitos rejeitados antes de escrever. Sem mudanca de schema ou migration executavel criada.

Lint desta rodada: novo teste limpo; stock.service.ts tem tres erros preexistentes de serializacao. O antigo erro .code foi eliminado com narrowing de unknown. Nenhuma regra relaxada. O resultado 49/49 acima e historico, nao o total final.

## Rodada posterior: autenticacao e sessoes

Consulte autenticacao-sessoes.md. Preservados 67 testes e adicionados 25: total final 92 aprovados em 11 suites. TypeScript e diff --check aprovados; lint nos 15 arquivos TypeScript envolvidos mantem somente tres erros preexistentes no estoque, sem novos erros/avisos.

Corrigida revalidacao de dashboard.ler em SSE aberto. Confirmada reutilizacao TOTP com relogio falso e emissao simulada repetida: vulnerabilidade continua pendente de persistencia atomica. Os testes de caracterizacao aprovados documentam esse defeito; nao significam protecao contra replay. Separacao de tokens, inatividade/revogacao de identidade, permissoes atuais, expiracao criptografica e limpeza local de sessao possuem testes isolados conforme limites descritos no novo relatorio.

## Consolidacao para revisao

Estado final repetido: 92 testes aprovados em 11 suites (9,243 s), TypeScript, diff --check e sintaxe JS aprovados. Lint dos 15 arquivos TypeScript: tres erros preexistentes, nenhum novo/aviso. Nenhum teste enfraquecido/ignorado; dois testes TOTP caracterizam defeito persistente e nao representam correcao.

Leia README.md para o estado atual, matriz-rastreabilidade.md para cobertura e pull-request.md para o texto proposto. arquivos-commit.md lista todos os arquivos locais, inclusive nao rastreados. Nenhum codigo de producao foi alterado nesta rodada; somente documentacao. Nenhum commit ou staging executado.
