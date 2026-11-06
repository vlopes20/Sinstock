# Integridade de estoque: investigacao e propostas

Branch: qa/testes-busca-global. Base auditada: 4c3eddc. Sem MySQL, migrations, seed ou alteracao do schema Prisma.

## Evidencias e classificacao

| Prioridade | Evidencia | Conclusao |
|---|---|---|
| Alta, estrutural | schema.prisma:249/257; chave UNIQUE inclui lote_id opcional | MySQL admite varias linhas com NULL nessa chave. Nao foram constatadas duplicidades reais. A defesa balance/findMany/take 2 rejeita ambiguidades, sem reparar dados. |
| Alta, estrutural | FKs independentes em itens_entrada, itens_venda, saldos e logs; stock.service.ts:94 | Existencia de produto/lote nao garante correspondencia no banco. A aplicacao verifica propriedade do lote, inclusive lote inexistente. |
| Media, defensiva | stock.service.ts:47; teste de erro P2034 no publicador depois do commit | Antes: uma falha de publicacao com esse codigo repetia trabalho ja confirmado 3 vezes. Depois: uma transacao e uma publicacao, sem retry apos commit. Erro injetado; nao demonstra ocorrencia no ambiente real. |
| Media, defensiva | stock.service.ts:111; Decimal NaN/Infinity | Antes: NaN, Infinity e reserva NaN chegavam a create. Depois: valores nao finitos rejeitados antes da consulta/escrita. DTOs HTTP ja possuem validacao numerica; trata-se de defesa da camada de servico, nao bypass HTTP demonstrado. |

## Revisao dos caminhos de escrita

- MovimentacoesService: saida/ajuste e transferencia usam stock.write; duas alteracoes de saldo e dois logs de transferencia compartilham o callback transacional. Entrada delega ao servico de notas.
- PedidosService: checkout/reserva, confirmacao, cancelamento e atendimento usam stock.write. Confirmacao/cancelamento rel?em o pedido bloqueado com FOR UPDATE antes de decidir status/expiracao.
- NotasFiscaisEntradaService: criacao, recebimento, estorno e ajuste usam stock.write. Recebimento/estorno releem nota bloqueada antes de alterar saldo/status/custo.
- StockService centraliza create/update de saldos. Produtos sao bloqueados sem repeticao e em ordem crescente; cobre tambem criacao de saldo ainda inexistente. Ordem de locks permanece produto antes de pedido/nota.
- Logs e auditoria usam o cliente tx. Check de saldo e triggers imutaveis constam nas migrations existentes; sua aplicacao no banco nao foi verificada.
- Callback que falha rejeita a transacao; evento e emitido somente depois de sucesso. Mocks verificam propagacao e ordem, nao desfazem nem comprovam persistencia MySQL.

## Testes e resultados reais

Novo arquivo stock.transactions.spec.ts: 18 testes. Primeira execucao compilavel: 14 aprovados/4 falhas; apos correcao: 18 aprovados.

Cobertura: cinco conjuntos invalidos de produtos; locks ordenados e unicos; produto ausente; falha do callback sem evento; conflito transitorio; limite de tres tentativas; erro de publicacao sem repetir commit; tres deltas nao finitos; reserva nao finita; lote ausente; normalizacao undefined/null.

Regressao completa: 67 aprovados, zero falhas, sete suites. TypeScript e git diff --check aprovados. Lint do novo teste: zero erros/avisos. Servico: tres erros no-base-to-string preexistentes, agora em 171/172/173. O erro preexistente .code foi resolvido pelo tratamento unknown necessario para a retentativa.

## Proposta A: unicidade sem lote

Rascunho de migration, NAO executado e fora de backend/prisma/migrations. Requer decisao da equipe, compatibilidade MySQL/Prisma e janela de implantacao. Confirmar que IDs de lote sao positivos e que 0 nao e um ID real. Nao apagar ou somar saldos automaticamente.

Pre-validacoes futuras, em ambiente autorizado:

```sql
SELECT filial_id, produto_id, lote_id, COUNT(*) AS registros
FROM saldos_estoque
GROUP BY filial_id, produto_id, lote_id HAVING COUNT(*) > 1;
SELECT id FROM lotes WHERE id <= 0;
```

DDL candidato (coluna gerada evita inserir valor sentinela na FK):

```sql
ALTER TABLE saldos_estoque
  ADD COLUMN lote_unicidade INT GENERATED ALWAYS AS (COALESCE(lote_id, 0)) STORED,
  ADD UNIQUE INDEX uk_saldos_filial_produto_lote_normalizado
    (filial_id, produto_id, lote_unicidade);
```

Manter inicialmente a chave original e as FKs. Avaliar introspeccao de coluna gerada e drift do Prisma antes de incorporar a migration. Alternativa: lote obrigatorio representativo, mas muda regra de negocio e nao foi implementada.

Rollback planejado: retirar somente o indice novo e a coluna gerada, com autorizacao; isso remove a garantia e nao reconcilia dados. DDL MySQL pode fazer commit implicito: nao prometer rollback transacional da migration.

## Proposta B: coerencia produto/lote no banco

Rascunho parcial sujeito a revisao de relacionamentos Prisma; nenhuma mudanca do schema foi feita:

```sql
ALTER TABLE lotes ADD UNIQUE INDEX uk_lotes_id_produto (id, produto_id);
ALTER TABLE saldos_estoque ADD CONSTRAINT fk_saldos_lote_produto
  FOREIGN KEY (lote_id, produto_id) REFERENCES lotes(id, produto_id)
  ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE itens_entrada ADD CONSTRAINT fk_entrada_lote_produto
  FOREIGN KEY (lote_id, produto_id) REFERENCES lotes(id, produto_id)
  ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE itens_venda ADD CONSTRAINT fk_venda_lote_produto
  FOREIGN KEY (lote_id, produto_id) REFERENCES lotes(id, produto_id)
  ON DELETE RESTRICT ON UPDATE NO ACTION;
```

Pre-validar divergencias com JOIN entre cada tabela e lotes antes do DDL. FKs compostas permitem lote NULL; nao substituem a proposta A. Manter/remover FKs antigas precisa ser planejado com nomes/indices reais. A composicao requer representacao coerente no Prisma antes de integrar.

Logs: FK atual do lote usa SET NULL, enquanto produto_id e obrigatorio e historico tem trigger imutavel. Nao aplicar cegamente FK composta SET NULL, pois afetaria tambem produto_id. Equipe deve decidir preservacao do historico e exclusao de lotes; proposta conservadora e restringir exclusao, mas isso muda comportamento e nao foi aplicado.

## Validacao real pendente (somente banco isolado autorizado)

1. Duas entradas simultaneas criando saldo sem lote: uma unica linha e quantidade correta.
2. Saidas concorrentes contra mesmo saldo/reserva: nunca vender acima do disponivel.
3. Transferencias inversas concorrentes: conservacao da quantidade total e avaliacao de deadlock/retry.
4. Confirmacao/cancelamento/expiracao da mesma reserva: uma unica transicao e uma unica liberacao/baixa.
5. Recebimento e estorno simultaneos: status, saldo, custo e logs coerentes.
6. Falha depois de alterar origem, destino, item, log ou auditoria: rollback de todos os dados.
7. Erro P2034 real e repeticao do callback: sem efeitos externos antes do commit.
8. Insercoes com lote de outro produto: rejeicao das FKs propostas; lote NULL permitido se regra mantida.
9. Migration com dados invalidos: interromper em pre-validacao, sem limpeza automatica.

## Decisoes pendentes

Aprovar coluna gerada/normalizacao; conciliacao de duplicidades existentes; FKs compostas e politica de exclusao/historico; destino de erro de publicacao pos-commit (ainda e propagado, mas nao repete a transacao); idempotencia de requisicoes apos falha de notificacao. Outbox persistente exige desenho separado. Nao foram alteradas essas regras.

## Reproducao segura

npm.cmd test -- --runInBand --no-cache --coverage=false
npm.cmd run typecheck

Sem uso de AppModule, lifecycle Prisma, cron ou SMTP nos testes novos. As suites de integracao permanecem proibidas nesta rodada.
