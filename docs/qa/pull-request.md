# Titulo sugerido

Corrige autorizacao da busca, defesas de estoque e revogacao SSE com regressao de QA

# Descricao

A busca global verificava apenas sua propria permissao e podia devolver recursos negados ao usuario. Agora aplica a politica compartilhada antes de cada consulta Prisma, retorna listas vazias para grupos negados e preserva o contrato consumido pelo frontend. Criterios de produto por fornecedor exigem leitura do fornecedor.

A mudanca tambem rejeita saldos duplicados e valores nao finitos antes de escrever, impede retentativa de transacao ja confirmada por falha de notificacao, trata 401 independentemente do formato do corpo e revalida permissoes durante entrega de eventos SSE.

## Validacao

- 92 testes unitarios isolados aprovados em 11 suites; preservadas as expectativas dos testes que reproduziram os defeitos.
- TypeScript, git diff --check e sintaxe JS aprovados.
- Lint de arquivos TypeScript locais: nenhum erro novo; tres erros preexistentes no-base-to-string em stock.service.ts.
- Sem MySQL, SMTP, migrations, seed, schema ou upgrades de dependencias.

## Pontos para revisao

- Ratificar uso de saldos-estoque.ler para lotes e campos relacionados nas visoes.
- Duplicidades existentes passam a bloquear operacoes; reconciliacao nao inclusa.
- SSE revalida no proximo evento; conexao ociosa nao encerra imediatamente.
- TOTP continua reutilizavel: testes de caracterizacao aprovados documentam o defeito, nao sua correcao. Persistencia atomica depende de decisao e alteracao estrutural futura.
- Erro de publicacao apos commit continua propagado; idempotencia de repeticao pelo cliente nao esta implementada.
- Testes simulados nao homologam concorrencia, rollback real, transporte HTTP ou navegador. Dependencias possuem 39 vulnerabilidades no snapshot documentado, sem correcao automatica.

## Documentacao

Ver docs/qa/README.md, matriz-rastreabilidade.md, autenticacao-sessoes.md e integridade-estoque.md. Textos incluem propostas de banco somente em Markdown, nao migrations executaveis.

Base: develop (4c3eddc). Origem: qa/testes-busca-global. Este arquivo e um rascunho; nenhum PR foi criado/publicado.
