# Pacote de QA para revisao - SINSTOCK

Base auditada: develop, commit 4c3eddc. Branch local: qa/testes-busca-global. Sem commit/push/merge. Este resumo representa o estado final; contagens 49/67 nos relatorios detalhados sao historicas.

## Validacao final repetida nesta rodada

- Jest: 92 testes aprovados em 11 suites, zero falhas e bloqueados (9,243 s).
- TypeScript: aprovado; diff --check: aprovado; node --check frontend/js/core/api.js: aprovado.
- ESLint sem cache nos 15 arquivos TypeScript modificados/criados: tres erros preexistentes em stock.service.ts:171/172/173 (no-base-to-string), zero avisos e nenhum erro novo. Lint global nao declarado limpo; JS nao faz parte do lint TypeScript.
- Nenhuma alteracao de schema, migration, seed, lockfile, credenciais ou MySQL. Nesta rodada somente docs/qa foi escrita.
- Verificados todos os caminhos locais para commit: sem .env, artefatos dist/coverage/node_modules/.tmp, chaves privadas ou padroes comuns de tokens. Fixtures de testes sao ficticias. Inspecao estatica nao equivale a certificacao universal de ausencia de segredos.
- Expectativas originais preservadas; sem skip/only/todo, supressoes ESLint ou TypeScript introduzidas nos testes. Ajustes de helper/tipagem acompanham assinatura do controller, sem reduzir assercoes.

IMPORTANTE: dois testes de caracterizacao aprovados documentam reutilizacao TOTP. O total verde nao significa que TOTP tenha protecao contra replay.

## Mudancas corrigidas

1. Busca: autorizacao individual antes de consultar produtos, fornecedores, lotes e notas; grupos negados vazios; total somente permitido; criterios por fornecedor condicionados.
2. Politica compartilhada preserva administrador, flags admin/todas, fallback operacoes e restricao de escrita de filiais.
3. Estoque: rejeicao de duplicidade encontrada, numeros nao finitos, retentativa limitada ao erro transacional, sem repetir trabalho confirmado por erro de publicacao.
4. Frontend: evento 401 independe de JSON no corpo, preservando excecoes de login/token explicito.
5. SSE: revalidacao por evento inclui permissao atual dashboard.ler, alem de ativo/versao/expiracao.

## Contratos revisados estaticamente

| Area | Contrato preservado | Limite da evidencia |
|---|---|---|
| Busca | endpoint/DTO; resultados.produtos/fornecedores/lotes/notas_fiscais; campos e filtros; limite por grupo | frontend/shared/connected.js aceita [] e mostra Nenhum resultado; nao houve navegador/HTTP real |
| Permissoes | ler/criar/editar/excluir, administrador e fallback existentes | flags administrativas e regra de lotes precisam ratificacao; estrategia JWT nao foi alterada |
| Estoque | respostas de change/write, chave produto/filial/lote, transacoes e ordem de locks | dados duplicados/nao finitos agora falham explicitamente; nao comprova rollback MySQL |
| SSE | /dashboard/realtime-stream, frame data com mesmo payload, Bearer no fetch | encerramento so em evento; frontend pode tentar reconectar e receber 403; sem teste de transporte real |
| Sessao | evento sinstock:unauthorized, limpeza e reason=expired; excecao auth:false/token explicito | logout offline limpa local, nao garante revogacao no servidor |

A alteracao de permissoes nao exige novo token para a proxima consulta JWT ou proximo evento SSE. Nao ha garantia de revogacao instantanea entre leitura e entrega.

## Condicoes antes de integrar

- Ratificar lotes -> saldos-estoque.ler e campos relacionados das visoes (produto no lote, fornecedor na nota).
- Aceitar/documentar bloqueio de operacoes quando ha duplicidade; definir conciliacao separada.
- Rever tratamento de erro pos-commit: transacao nao repete internamente, mas erro continua propagado; idempotencia de nova requisicao do cliente continua pendente.
- Tratar TOTP como risco aberto ou implementar estrategia persistente aprovada em outra etapa. Nao entregar como corrigido.
- Validacao HTTP/navegador e concorrencia/DDL precisam ambiente isolado autorizado antes de alegar homologacao completa.
- CI com lint global obrigatorio continuara falhando devido a divida preexistente. Nao mudar regras para aprovar.
- Rever 39 vulnerabilidades de dependencias; nenhuma atualizacao aplicada. Auditoria e snapshot da rodada anterior, nao nova consulta nesta rodada.

Nao existe bloqueio para revisao humana do diff. As condicoes acima impedem declarar integracao/homologacao automatica e irrestrita.

## Documentos

- matriz-rastreabilidade.md: problema, evidencia, teste e estado.
- pull-request.md: texto pronto para copiar; nenhum PR publicado.
- arquivos-commit.md: lista explicita de arquivos para staging futuro; nenhum git add executado.
- relatorio-busca-global.md: historico antes/depois.
- integridade-estoque.md: propostas SQL nao executaveis e cenarios de concorrencia.
- autenticacao-sessoes.md: evidencia TOTP e proposta atomica.
- dependencias.md e dependencias-audit.json: snapshot npm e triagem.

## Reproducao segura

```powershell
npm.cmd test -- --runInBand --no-cache --coverage=false
npm.cmd run typecheck
git diff --check
node --check frontend/js/core/api.js
```

Jest seleciona somente *.spec.ts em backend/src. Nao executar test:stock/test:e2e ou migrations a partir deste pacote. Dependencias e Prisma Client ja instalados/gerados nesta maquina; nova maquina exige preparacao separada autorizada.
