# Telas e contratos atuais

Esta matriz descreve a implementação posterior ao diagnóstico inicial. Listas paginadas usam SinstockData para adaptar {dados, meta} e o formato legado {data, meta}.

| Tela | Funções | Rotas principais |
|---|---|---|
| Login | Credenciais e desafio de segundo fator | POST /auth/login; GET /auth/me |
| Código | TOTP ou e-mail, reenvio controlado | POST /auth/2fa/authenticate; POST /auth/2fa/email/resend |
| Recuperação / redefinição | Solicitar link e consumir token único | POST /auth/forgot-password; POST /auth/reset-password |
| Cadastro | Usuário criado por administrador, telefone e perfil | GET /perfis; POST /users |
| Dashboard | Filial/período, vendas, saldo, validade, mínimos, categorias e histórico | GET /dashboard/resumo; GET /filiais |
| Produtos | Busca completa, filtros, páginas, criar/editar/excluir/inativar, código por câmera, custo calculado | GET/POST /produtos; GET/PATCH/DELETE /produtos/:id; GET /produtos/resumo; GET /produtos/codigo-barras/:codigo |
| Cadastros auxiliares | Categorias, filiais e clientes, disponíveis nas telas operacionais | GET/POST /categorias e /filiais; PATCH/DELETE /categorias/:id e /filiais/:id; GET/POST /clientes; PATCH/DELETE /clientes/:id |
| Fornecedores | Dados comerciais e coordenadas, filtros, edição/inativação/exclusão | GET/POST /fornecedores; GET/PATCH/DELETE /fornecedores/:id; GET /fornecedores/resumo |
| Fornecedores próximos | GPS, cidade/CEP, raio e contato direto | GET /fornecedores/proximos; GET /integracoes/coordenadas |
| Estoque | Filial, saldo físico/reservado/disponível, mínimos, produtos sem movimento | GET /produtos; GET /saldos-estoque/resumo/atual; GET /produtos/:id |
| Movimentações | Saída, contagem e transferência com motivo e autor da sessão | POST /movimentacoes; POST /movimentacoes/transferencia; GET /movimentacoes/historico |
| Recebimentos | Documento, fornecedor, filial, lote, custo, pendência, recebimento e estorno | GET/POST /notas-fiscais-entrada; GET /notas-fiscais-entrada/:id; PATCH /:id/receber e /:id/estorno |
| Ajuste de lote | Dados de validade, item de origem, quantidade/custo, recálculo e auditoria | PATCH /notas-fiscais-entrada/lotes/:loteId |
| Vendas | Carrinho por filial/lote, código/câmera, cliente, pagamento, desconto e observação | POST /pedidos/checkout; GET /pedidos; GET /pedidos/resumo/periodo |
| Pedidos | Reserva temporária, confirmação, cancelamento, atendimento separado do comercial | POST /pedidos/reservar; GET /pedidos/:id; PATCH /pedidos/:id/confirmar, /cancelar e /atendimento |
| Relatórios | Categorias, vendas, ranking, estoque, movimentos, vencidos, validade e inatividade | GET /relatorios; GET /relatorios/exportar; GET /relatorios/movimentacoes/pdf (compatibilidade) |
| Empresa e estoque | Dados empresariais e padrões para novos produtos/alertas | GET /configuracoes/publicas; PATCH /configuracoes/empresa e /estoque |
| Usuários e permissões | Listar, criar, editar, ativar/desativar, criar perfil e salvar permissões | GET/POST /users; PATCH /users/:id e /:id/status; GET/POST /perfis; PATCH /perfis/:id |
| Segurança | Senha atual, nova senha, TOTP/e-mail, desativação com confirmação e revogação de sessões | PATCH /auth/password; POST /auth/2fa/generate, /enable, /email/setup, /email/enable, /email/disable-code e /disable |
| Preferências | Notificações, página e inatividade, persistidas por usuário | GET/PATCH /configuracoes/preferencias |
| Ajuda | FAQ do banco, manutenção administrativa, chamados do usuário ou todos para administradores | GET/POST /chamados; GET /chamados/:id; GET/POST /chamados/faq; PATCH/DELETE /chamados/faq/:id |
| Conversa e anexos | Mensagens, status, envio de PNG/JPEG/PDF e download autorizado | POST /chamados/:id/mensagens e /anexos; PATCH /chamados/:id/status; GET /chamados/anexos/:id |
| Cabeçalho compartilhado | Busca, notificações e leitura individual | GET /busca-global; GET /notificacoes; PATCH /notificacoes/:id/ler; POST /notificacoes/executar-varredura (admin) |

As páginas legadas de login redirecionam para os fluxos de autenticação atuais. As funções de demonstração local de estoque foram retiradas do carregamento das páginas; operações não são enfileiradas offline.

Permissões são verificadas na API. Perfil 1 administra usuários, empresa, padrões de estoque, permissões e FAQ. Perfis operacionais usam o mapa de permissões por recurso/ação; o frontend trata respostas de acesso negado e não simula sucesso.
