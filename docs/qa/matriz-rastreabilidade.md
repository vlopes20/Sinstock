# Matriz de rastreabilidade de QA

Todos os testes citados estao em backend/src. Resultado final 92/92 em 11 suites; nem todo risco esta corrigido.

| ID | Problema / evidencia | Teste automatizado | Correcao / proposta | Resultado e limite |
|---|---|---|---|---|
| AUTHZ-01 | busca executava quatro consultas sem autorizacao individual | busca-global/busca-global.authorization.spec.ts: recursos negados, consultas nao chamadas e total | controller encaminha usuario; service aplica politica antes de Prisma | Antes 2/10; depois 10/10; mais 2 criterios de fornecedor aprovados |
| AUTHZ-02 | risco de divergencia na politica compartilhada | auth/permission-policy.spec.ts: 11 casos | politica pura compartilhada, regras existentes | 11 aprovados; flags e lotes exigem revisao de regra |
| STOCK-01 | duplicidade sem lote atualizava linha arbitraria | common/services/stock.service.spec.ts: duplicate balances | findMany/take 2 rejeita ambiguidades | aprovado; nao impede duplicidade no banco |
| STOCK-02 | produto/lote incoerentes | stock.service.spec.ts: lote de outro produto; stock.transactions.spec.ts: missing lot | validacao central existente preservada | rejeita antes de escrever; FK composta e proposta |
| STOCK-03 | NaN/Infinity em deltas/reservas | stock.transactions.spec.ts: numeric integrity | verifica valores finitos antes de escrever | casos reprovados antes, aprovados depois; DTO HTTP nao explorado |
| STOCK-04 | erro pos-commit P2034 repetia transacao | stock.transactions.spec.ts: never retries committed work | catch restrito a transacao | antes 3 transacoes; depois 1 |
| STOCK-05 | reservas, limites e aritmetica | stock.service.spec.ts: saldo/reserva invalidos e Decimal | defesas existentes | 6 casos do arquivo aprovados; concorrencia real pendente |
| STOCK-06 | locks, conflitos, callback rejeitado | stock.transactions.spec.ts: transaction boundaries | locks ordenados e maximo tres tentativas preservados | arquivo 18/18; nao comprova rollback/isolamento MySQL |
| SESSION-01 | 401 HTML/texto nao disparava expiracao | busca-global/frontend-api.spec.ts | evento antes de parse JSON | 6/6; antes 2 falhas |
| SESSION-02 | limpeza e logout offline | auth/frontend-session.spec.ts | comportamento existente verificado | 2/2; nao garante revogacao remota offline |
| SESSION-03 | pre-auth, identidade/versao, permissoes e expiracao | auth/session-security.spec.ts | estrategias existentes verificadas com mocks | 13/13; expiracao testada via JwtService, nao endpoint Passport |
| SSE-01 | permissao removida mantinha entrega em stream | dashboards/dashboard-session.spec.ts | canAccess por evento com perfil atual | 5/5; antes entregava 2 em vez de 1 no caso revogado |
| TOTP-01 | mesmo codigo aceito repetidamente | auth/totp-replay.spec.ts: known defect | proposta de consumo persistente/atomico; sem correcao | 5/5 de caracterizacao, dois demonstram replay; risco aberto |
| MAIL-01 | regressao em configuracao/transporte | mail/smtp.config.spec.ts, mail/mail.service.spec.ts | sem alteracao | 14 testes preexistentes aprovados, transporte mockado |
| DB-01 | UNIQUE com NULL e FKs independentes | proposta em integridade-estoque.md | DDL candidato somente em Markdown | nao executado, decisoes e banco isolado necessarios |
| DEP-01 | 39 pacotes vulneraveis no snapshot npm | dependencias-audit.json | triagem em dependencias.md | sem upgrade; explorabilidade nao demonstrada |

## Distribuicao por suite

Busca 12; politica 11; estoque 6; transacoes 18; HTTP frontend 6; sessoes/JWT 13; TOTP 5; SSE 5; limpeza frontend 2; duas suites de e-mail somam 14. Total: 92.
