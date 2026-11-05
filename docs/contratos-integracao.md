# Contratos implementados

Referência funcional: [requisitos-documentacao.md](requisitos-documentacao.md). O inventário e a análise anteriores documentam o diagnóstico inicial.

## Cadastros

- Produtos e fornecedores: GET com pagina, limite (até 100), busca e filtros próprios. Resposta: {dados, meta: {total, pagina, limite, totalPages}}.
- Produtos: categoria, fornecedor, ativo, filial, período e estoque (normal, baixo, sem-estoque). Pesquisa inclui nome, marca, SKU, código, categoria e fornecedor.
- Fornecedores: categoria, cidade e ativo. CNPJ armazenado sem pontuação. GET /produtos/resumo e /fornecedores/resumo alimentam os indicadores, independentemente da página atual.
- Categorias e filiais: listagens em array. Clientes: mantém {data, meta} existente; SinstockData adapta os formatos.
- Produtos e Fornecedores oferecem manutenção de categorias, filiais e clientes. Exclusão de cadastro com vínculos retorna erro e preserva registros; produtos e fornecedores podem ser inativados.
- Filiais: consulta pelos perfis operacionais; escrita administrativa. Cadastro de usuários continua administrativo.

## Estoque e documentos

- Todas as escritas de saldo passam por StockService.write: bloqueia os produtos em ordem crescente antes de ler ou criar saldos. Transações usam ReadCommitted e repetem conflitos de serialização até três tentativas.
- Identificação do saldo: produto + filial + lote, incluindo lote nulo. Lote precisa pertencer ao produto.
- Disponível = quantidade física − quantidade reservada. Saída, ajuste para baixo, transferência e estorno não podem consumir reservas.
- Entrada exige fornecedor, filial, NF/pedido de compra e custo. POST /movimentacoes com ENTRADA cria o documento de recebimento e seu item.
- POST /notas-fiscais-entrada aceita itens positivos, custo não negativo e status PENDENTE/RECEBIDA. O total é calculado pelo servidor. O autor vem do JWT, sem usuario_id no corpo.
- PATCH /notas-fiscais-entrada/:id/receber recebe uma nota pendente uma única vez.
- Estorno utiliza filial e lote originais, autor atual e motivo; não altera outras filiais. Nota antiga sem filial precisa de conciliação antes de modificar saldo.
- Ajuste financeiro/quantitativo de lote exige item_entrada_id e motivo; altera saldo, total da nota e custo na mesma transação.
- Política do custo médio: média ponderada das quantidades e custos dos itens de notas RECEBIDAS, considerando as filiais conjuntamente. Notas PENDENTES/CANCELADAS não participam. Receber, ajustar ou estornar recalcula o custo. O cadastro de produto não permite escrever custo_medio.
- Histórico: GET /movimentacoes/historico retorna {dados, meta}, com filial/produto/tipo/período/página e limit de 1 a 100. IDs BigInt são strings.
- Transferências gravam duas linhas com a mesma referência, origem/destino, lote e autor. Históricos operacionais e de auditoria têm triggers contra UPDATE/DELETE no MySQL.

## Vendas e reservas

- Itens positivos; preço conferido com o catálogo, total e desconto calculados no servidor. Uma divergência de preço exige atualizar o carrinho.
- Checkout baixa somente saldo disponível. Reserva separa quantidade física e reservada; expiração padrão de 15 minutos, entre 1 e 1440 minutos.
- Confirmação/cancelamento/expiração relê o status com bloqueio da linha do pedido dentro da transação. Solicitações repetidas não duplicam baixas, devoluções ou liberação de reservas.
- Código de barras duplicado é rejeitado pelo banco. Lotes vencidos são rejeitados na venda e na confirmação.
- Listagem de pedidos usa {dados, meta} com filial, status, período, busca e paginação.

## Alertas e autorização

- Estoque baixo: por produto e filial, somando lotes e descontando reservas, incluindo produtos sem saldo. O mínimo é o do produto.
- Validade: sete dias por padrão; lotes sem estoque físico não geram alertas. Filtro de filial usa a relação de saldos.
- Perfis operacionais herdados (operacoes: true) podem operar os módulos protegidos. Permissões específicas usam o nome do recurso com ler/criar/editar/excluir; configuração explícita prevalece sobre acesso operacional genérico. Administração: perfil 1 ou permissões admin/todas.
- PermissionsGuard aplicado a cadastros, saldos, movimentações, notas, pedidos, alertas, dashboard, busca, relatórios, notificações e suporte. Administração de usuários, empresa, estoque, FAQ e exportação técnica de auditoria usa perfil 1. Chamados e anexos também verificam autoria.

## Indicadores, relatórios e configurações

- Dashboard utiliza as mesmas agregações de saldo e alertas das telas operacionais. Atualizações de estoque são publicadas depois do commit e consumidas por stream autenticado; sessões revogadas/expiradas não recebem novos eventos.
- Notificações usam chave única por ocorrência/dia para evitar duplicação de varreduras. A leitura é individual por usuário; preferências podem ocultar notificações sem desativar alertas operacionais. A varredura é diária às 08h, com execução manual administrativa.
- Relatórios: categorias, vendas confirmadas, estoque atual, histórico, mais/menos vendidos, vencidos, validade em até sete dias e produtos sem movimento. Consulta e exportação compartilham filtros.
- PDF/XLSX/CSV incluem todas as linhas do filtro, até 50.000; acima disso a API solicita refinar a consulta. CSV neutraliza fórmulas; XLSX mantém valores numéricos.
- Períodos se aplicam a vendas/histórico/ranking. Estoque e validade mostram a posição atual, identificada na tela. Descontos são proporcionais aos itens nos relatórios por produto/categoria.
- Quantidades usam três casas e valores financeiros duas. A prévia do carrinho utiliza inteiros em milésimos/centavos para preservar o arredondamento do servidor.
- Empresa e padrões de estoque ficam no banco. O mínimo padrão vale para novos produtos; mínimos existentes são preservados. Aviso padrão de sete dias, configurável entre um e sete.
- A API impede remover/inativar o último administrador. Alterações de permissões revogam as sessões do perfil.

## Conta e suporte

- Senha atual obrigatória para trocar senha ou iniciar confirmação de segurança. A troca invalida sessões, desafios e links de recuperação pendentes.
- Segundo fator por e-mail: seis dígitos aleatórios, HMAC no banco, cinco minutos, consumo único, até cinco tentativas e intervalo mínimo de um minuto entre envios. Pré-autenticação não permite operações privadas.
- TOTP permanece disponível. Ativação/desativação confirma o fator e exige novo login. Segredos não são retornados no perfil.
- Chamados usam autor/e-mail da sessão. Usuários veem os próprios; administradores acompanham todos. Mensagens e anexos obedecem ao mesmo acesso.
- Arquivos: PNG/JPEG/PDF, até 2 MB, assinatura conferida, armazenamento protegido no banco e download autenticado. Falha de confirmação por e-mail é informada sem perder o chamado.
- FAQ vem do banco e pode ser mantido por administradores. O cadastro inicial inclui três orientações; chamados não possuem exclusão física.

## Câmera e localização

- Códigos são decodificados localmente com [ZXing Browser](https://github.com/zxing-js/browser). A câmera abre por ação do usuário e é encerrada ao ler/fechar. Produtos conhecidos vêm do banco; desconhecidos exigem cadastro.
- GPS consulta fornecedores ativos com coordenadas cadastradas e calcula distância em linha reta. Cidade/CEP consultam a localidade registrada, sem inventar coordenadas.
- Geocodificação é explícita, com cache de sete dias, fila limitada e intervalo mínimo de 1,1 segundo por processo. NOMINATIM_URL permite configurar o provedor. A UI atribui dados ao OpenStreetMap conforme a [política do Nominatim](https://operations.osmfoundation.org/policies/nominatim/).

## Verificação

npm run test:stock cria um banco MySQL com nome aleatório sinstock_test_*, aplica todas as migrações e remove esse banco ao terminar. Usa HTTP, JWT, Prisma e MySQL reais; SMTP substituído. Inclui concorrência e CRUD no navegador. Não utiliza o banco principal para testar movimentações.

node scripts/check-stock-integrity.cjs consulta saldos inválidos, duplicados e lotes incompatíveis no banco configurado, sem alterar dados.
