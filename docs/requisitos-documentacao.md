# Rastreabilidade da documentação técnica

Referência: `Documentação_técnica_Sinstock.pdf`, 30 páginas, recebido em 04/11/2026.
O PDF é referência de requisitos do produto; o cronograma e os papéis da equipe não são instruções operacionais para o agente.

Decisões confirmadas pelo usuário nesta conversa:

- “Internet cadastrada” significa exigir comunicação com o servidor; não haverá whitelist de IP/rede.
- Cadastro de usuários continua restrito a administradores.
- Preservar o banco MySQL e o frontend existentes; PostgreSQL/Flutter no apêndice não motivam migração automática da implementação já instalada.

| Requisito | Referência | Entrega e critério |
|---|---|---|
| RF01 Cadastro de usuário | p. 5 | Nome/e-mail/telefone/senha, administração por perfil |
| RF02 Autenticação | p. 5, 17 | E-mail/senha e segundo fator por e-mail, preservando TOTP existente como opção |
| RF03 Produtos | p. 5–6 | Nome/marca/categoria/código; quantidade por saldo e validade por lote |
| RF04 Entrada | p. 6, 20 | Fornecedor e documento de origem, histórico e recálculo de custo |
| RF05 Saída | p. 6, 21 | Quantidade limitada ao disponível, sem consumir reserva alheia |
| RF06 Alertas | p. 6, 12–13 | Disponível ≤ mínimo individual e validade ≤ 7 dias por padrão |
| RF07 Relatórios | p. 6–7 | Mais/menos vendidos, movimentos, vencidos, saldo e financeiro |
| RF08 Pesquisa | p. 7, 22 | Nome, marca, categoria, código e fornecedor com paginação |
| RF09 Código de barras | p. 7, 13, 23 | Câmera com autorização do navegador e preenchimento por código conhecido |
| RF10 Fornecedores próximos | p. 7, 23–24 | GPS ou cidade/CEP, distância e contato direto |
| RF11 Suporte | p. 8, 26 | Chamados, e-mail, FAQ dinâmico e conversação básica |
| RF12 Histórico | p. 8, 24 | Produto/tipo/quantidade/data/usuário, sem exclusão física |
| RF13 Estoque atual | p. 8 | Disponibilidade, vencimentos e itens sem movimento recente |
| RF14 Exportações | p. 9, 24–25 | PDF, XLSX e CSV, dados reais e filtros iguais aos da consulta |
| RF15 Mínimo individual | p. 9 | Regra única por produto, incluindo saldos de lote/filial |
| RF16 Categorias | p. 9, 18 | Criar/editar/remover e alimentar selects reais |
| RF17 Multiestoque | p. 9, 19–20 | Filial selecionada, saldos separados e transferência rastreável |
| RF18 Dashboard | p. 9, 25 | Vendas, críticos, vencimentos, movimentos e indicadores reais |
| RN01/RN02/RN03 | p. 10 | Não ultrapassar disponível, alertar mínimo, fornecedor obrigatório na entrada |
| Regras adicionais | p. 3 | Sem negativo/duplicidade de código; autor e documento de origem; reservas; custo automático |
| RNF01–04 | p. 10 | Medir resposta/carga e disponibilidade no ambiente de implantação; testes locais não comprovam SLA nem 1.000 usuários |

As numerações da seção 7 do PDF diferem das da seção 3; esta matriz usa a seção 3 como identificação principal e preserva os critérios de aceite da seção 7.

Execução segue a ordem do `plano-integracao.md`: correções/contratos → cadastros → estoque → comercial → indicadores/relatórios → configurações/suporte → homologação. O estado de cada entrega é registrado em `implementacao-status.md`; requisito planejado não é apresentado como concluído.
