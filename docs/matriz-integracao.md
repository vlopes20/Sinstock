# Matriz de ações do frontend e contratos do backend

Data: 04/11/2026. Esta matriz descreve a implementação existente e o trabalho necessário; endpoints marcados como **proposta** não existem hoje. O [inventário da API](inventario-api.md) contém os métodos, caminhos e entradas de todas as 79 operações. O [inventário do frontend](inventario-frontend.md) localiza funções e listeners nos arquivos.

Legenda: **Integrado** = existe chamada real; **Local** = DOM, arrays, logs ou alertas; **Lacuna** = contrato ausente; **Defeito** = implementação incompatível identificada. A disponibilidade de uma rota não significa que todas as suas regras de negócio foram testadas.

## 1. Autenticação e cadastros de acesso

Fontes: `frontend/index.html`, `pages/{login,cadastro,codigo,esquecisenha,autenticacao,redefinirsenha}.html`, `js/auth/*`.

| Tela/ação | Situação | Método/rota | Compatibilidade/trabalho |
|---|---|---|---|
| Login com e-mail/senha | Integrado | `POST /auth/login` | `{email, senha}`; distinguir `access_token` de desafio MFA |
| Mostrar/ocultar senha | Local, apropriado | Não exige API | Ação exclusivamente visual |
| Verificar sessão ao abrir tela | Integrado | `GET /auth/me` | Exige conta ativa e versão da sessão válida |
| Logout | Integrado | `POST /auth/logout` | Revoga sessões por versão; limpeza local permanece |
| Login legado `pages/login.html` | Redirecionamento | Nenhuma rota extra | Reutiliza o login principal |
| Solicitar recuperação | Integrado | `POST /auth/forgot-password` | `{email}`; resposta genérica para conta inexistente |
| Aviso “verifique seu e-mail” | Local, apropriado | Não exige nova API | Não é verificação de cadastro; representa o pedido de recuperação |
| Redefinir senha pelo link | Integrado | `POST /auth/reset-password` | `{token, senha}`; token no fragmento e uso único |
| Confirmar código TOTP | Integrado | `POST /auth/2fa/authenticate` | `{codigo}` e Bearer de pré-autenticação |
| Carregar perfis do cadastro | Integrado | `GET /perfis` | Usar IDs reais, não nomes como permissão |
| Cadastrar usuário por administrador | Integrado | `POST /users` | `{nome,email,senha,perfil_id}`; telefone opcional |
| Ativar autenticador | Lacuna na UI | `POST /auth/2fa/generate`, `POST /auth/2fa/enable` | Construir interface de QR/segredo e confirmação; proteger regeneração |
| Desativar/recuperar 2FA | Lacuna | Sem endpoint específico | Definir política e contrato antes de adicionar controle |

## 2. Dashboard e controles compartilhados

Fontes: `pages/dashboard.html`, `js/pages/dashboard.js`, `js/shared/ui.js`, `js/shared/layout.js`.

| Ação | Situação | Backend disponível | Compatibilidade/trabalho |
|---|---|---|---|
| Cards de pedidos, estoque e faturamento | Local | Produtos/pedidos/saldos existem, sem endpoint unificado de resumo | **Proposta:** resumo agregado no servidor, com período/filial |
| Gráfico de vendas 7/30 dias/mês | Local | `GET /dashboard/graficos/movimentacoes-semanal` | API mede entradas/saídas de unidades em sete dias; não representa receita |
| Estoque por categoria | Sem gráfico equivalente nesta tela | `GET /dashboard/graficos/stock-categoria` | Consumir na análise de estoque ou ajustar visual conforme a métrica |
| Produtos críticos | Local/sem integração | `GET /dashboard/graficos/produtos-criticos` | Definir saldo disponível e mínimo antes de renderizar |
| Alertas rápidos | Local | `GET /alertas`, `/alertas/estoque-baixo`, `/alertas/vencimentos` | Estoque e vencimento atendidos parcialmente; pedidos atrasados não têm prazo/entrega modelados |
| Busca global | Local/aviso de demonstração | `GET /busca-global?termo=...` | API busca produtos, fornecedores, lotes e NF; não busca pedidos/clientes anunciados no placeholder |
| Sininho/lista de notificações | Local | `GET /notificacoes`, `PATCH /notificacoes/:id/ler` | Trocar contador e lista fictícios por dados reais; definir escopo de leitura |
| Varredura de alertas | Sem ação integrada | `POST /notificacoes/executar-varredura` | Definir permissão; não disparar automaticamente a cada renderização |
| Atualização em tempo real | Ausente | `GET /dashboard/realtime-stream` (SSE) | Endpoint existe, mas faltam emissões dos serviços e transporte autenticado na UI |
| Data, menu móvel, abas, toasts e atalhos | Local, apropriado | Não exigem API | Preservar comportamento responsivo e acessível |
| Identidade e botão Sair | Integrado | `/auth/me`, `/auth/logout` | Não substituir por usuário fictício da página |

## 3. Estoque

Fontes: `pages/estoque.html`, `js/pages/estoque.js`, `js/shared/stock-model.js`.

| Ação | Situação | Método/rota | Compatibilidade/trabalho |
|---|---|---|---|
| Listar saldos | HTML estático | `GET /saldos-estoque` | Resposta é por produto/filial/lote; a UI mostra uma linha por produto. Definir agrupamento e contexto de filial |
| Busca/categoria/status | Filtro das linhas presentes | `/produtos`, `/saldos-estoque` | Saldo não implementa busca/categoria herdados da paginação; estender consulta ou compor serviço adequado |
| Cards de disponibilidade/valor/mínimo | Local | Saldos/produtos/alertas | Agregar no servidor; nunca usar só a página atual da tabela para totais globais |
| Abrir/cancelar movimentação | Local | Não exige API | Manter modal; preencher opções com produtos/filiais reais |
| Selecionar produto | Defeito | `GET /produtos`, `/produtos/codigo-barras/:codigo` | Select atual permanece vazio; código por barras é oportunidade de ação complementar |
| Salvar entrada/saída/ajuste | Defeito | `POST /movimentacoes` | Mapear tipo para enum maiúsculo, produto para ID e informar filial/lote. Handler referencia ID inexistente |
| Data/motivo/fornecedor/referência | Sem persistência correspondente | DTO só oferece `observacao`, hoje ignorada pelo serviço | Definir campos de movimento ou encaminhar recebimento fiscal para NF |
| Ajustar quantidade a zero | Incompatibilidade | `CreateMovimentacaoDto.quantidade >= 1` | Modelo local prevê zero; decidir regra e alinhar DTO, formulário e saldo reservado |
| Histórico de movimentos | Tabela sem integração | `GET /movimentacoes/historico` | ID do log é string; faltam filtros por tipo/período/paginação equivalentes à UI |
| Transferir entre filiais | Sem UI | `POST /movimentacoes/transferencia` | Construir origem/destino, saldo disponível e lote, após correções de integridade |
| Receber por NF e controlar lote | Sem fluxo completo | `POST /notas-fiscais-entrada` | Exige itens, fornecedor, filial, número da NF e lote quando aplicável; corrigir backend antes |

## 4. Produtos

Fontes: `pages/produtos.html`, `js/pages/produtos.js`.

| Ação | Situação | Método/rota | Compatibilidade/trabalho |
|---|---|---|---|
| Lista, busca e paginação | HTML/filtro local | `GET /produtos` | Converter `dados/meta`; paginação real usa `pagina/limite` |
| Categoria | Opções fixas | `GET /categorias` | Carregar IDs; oferecer manutenção separada ou cadastro mínimo de categorias |
| Filtrar ativo/inativo | Lacuna | Sem campo/consulta correspondente | Adicionar `ativo` ao modelo/DTO/filtro ou retirar o controle do escopo inicial |
| Filtrar estoque | Local | `apenas_estoque_baixo` parcial | Corrigir parsing booleano, cálculo do mínimo e filtro de sem estoque |
| Criar produto | Alerta de sucesso | `POST /produtos` | DTO não aceita o objeto atual completo; ver tabela de campos abaixo |
| Abrir detalhe/editar | Ações desabilitadas ou sem implementação | `GET /produtos/:id`, `PATCH /produtos/:id` | Usar ID real; preencher e enviar apenas o contrato aprovado |
| Excluir/inativar | Ação sem integração | `DELETE /produtos/:id` | Excluir pode ser recusado por vínculos; inativar exigirá campo próprio |
| Estoque inicial | Campo do formulário, sem gravação | `POST /movimentacoes` | Operação separada, com origem e filial; definir atomicidade/repetição |
| Validade | Campo único do formulário | Modelo `lotes`, via NF/ajuste de lote | Produto pode ter vários lotes/validades; não transformar em data única no catálogo |

| Campo do formulário | Campo do contrato atual | Situação |
|---|---|---|
| `nome` | `nome` | Direto |
| `categoria` | `categoria_id` | Trocar slug/nome por ID |
| `codigoBarras` | `codigo_barras` | Renomear e normalizar |
| `custo` | `custo_medio` | Definir quem atualiza o custo médio após recebimentos |
| `preco` | `preco_venda` | Converter para número válido e política monetária |
| `estoqueMinimo` | `estoque_minimo` | Converter e preservar precisão |
| `descricao`, `sku`, `unidade`, `status`, `observacao` | Inexistentes | Exigem mudança de contrato/schema ou redução explícita de escopo |
| `fornecedor` | Sem relação direta no produto | Decidir relação de um ou vários fornecedores; NF já registra fornecedor |
| `estoqueInicial`, `validade` | Saldo/movimentação/lote | Não enviar como campos extras para `POST /produtos` |

## 5. Fornecedores

Fontes: `pages/fornecedores.html`, `js/pages/fornecedores.js`.

| Ação | Situação | Método/rota | Compatibilidade/trabalho |
|---|---|---|---|
| Listar/buscar/paginar | HTML/filtro local | `GET /fornecedores` | Array completo; definir busca/paginação no servidor |
| Categoria/status | Filtro local | Sem campos correspondentes | Modelar ou remover do contrato inicial |
| Criar | Log/alerta | `POST /fornecedores` | `razaoSocial → nome_juridico`; `uf → estado`; CNPJ normalizado |
| Detalhar/editar/remover | Ações sem integração/desabilitadas | `GET/PATCH/DELETE /fornecedores/:id` | Tratar vínculos de notas e conflitos de CNPJ |
| Endereço/CEP | Preenchimento manual | `GET /integracoes/cep/:cep` | Campos retornados `logradouro/localidade/uf` precisam de adaptação |
| Coordenadas/distância | Sem consumidor | `/integracoes/coordenadas`, `/integracoes/distancia-ceps` | Só integrar se houver uso definido pela tela |
| Nome fantasia/IE/contato/prazo/pagamento/notas | Sem persistência | Sem campos atuais | Decidir extensões antes de exibir sucesso de cadastro |

## 6. Pedidos

Fontes: `pages/pedidos.html`, `js/pages/pedidos.js`. O modal é criado por JavaScript.

| Ação | Situação | Método/rota | Compatibilidade/trabalho |
|---|---|---|---|
| Listar e paginar | Linhas HTML; paginação DOM | `GET /pedidos` | Array sem filtros/paginação; adicionar contrato de lista |
| Buscar/filtrar status/período | Filtro local | Lista atual não recebe esses filtros | Definir parâmetros e ordenação |
| Selecionar cliente/produto | Opções fictícias por nome | `GET /clientes`, `GET /produtos` | Enviar IDs; permitir consumidor sem cadastro se regra aprovada |
| Adicionar/remover item e calcular total | Cálculo local | `itens[]` de checkout/reserva | Manter prévia no navegador; servidor valida/calcula o valor final |
| Criar pedido pendente | Insere linha local | `POST /pedidos/reservar` é apenas candidato | Reserva expira; decidir se atende ao conceito comercial de pendência |
| Concluir venda imediata | Sem API na tela | `POST /pedidos/checkout` | Exige filial, saldo disponível e itens reais |
| Confirmar reserva | Sem API na tela | `PATCH /pedidos/:id/confirmar` | Só `ORCAMENTO` não expirado |
| Mudar para separação/enviado | Troca de classe/texto local | Sem endpoint/estado equivalente | Não traduzir automaticamente para `CONCLUIDO` |
| Cancelar | Troca local de status | `PATCH /pedidos/:id/cancelar` | Atualizar UI só após estorno/liberação de reserva confirmados |
| Detalhes | Sem integração | `GET /pedidos/:id` | Usar cliente, itens, filial e estado real |
| Pagamento/desconto/observação | Cálculo/apresentação local | Sem persistência atual | Acrescentar contrato/schema ou retirar explicitamente esses dados da versão inicial |

## 7. Vendas

Fontes: `pages/vendas.html`, `js/pages/vendas.js`.

| Ação | Situação | Backend disponível | Compatibilidade/trabalho |
|---|---|---|---|
| Nova venda | Alerta de sucesso | `POST /pedidos/checkout` | Não é necessário criar outro CRUD de venda sem antes definir o domínio comum |
| Cliente/itens | Valores fixos/nomes; quantidade string | `/clientes`, `/produtos`, DTO de checkout | Adaptar para IDs, quantidades/preços e filial |
| Desconto/pagamento | Cálculo/campos locais | Ausentes no contrato | Mesma decisão de Pedidos |
| Histórico e filtros | HTML/filtro local | `GET /pedidos` | Filtrar vendas concluídas no servidor; persistir pagamento para poder filtrá-lo |
| Detalhe/cancelamento | Ações desabilitadas | `GET /pedidos/:id`, `PATCH /pedidos/:id/cancelar` | Compartilhar serviço com Pedidos |
| Receita/ticket médio/cancelamentos por período | Valores estáticos | Sem endpoint agregado correspondente | Criar agregações sobre dados reais |
| Gráfico de receita e meios de pagamento | Estático | Sem endpoint equivalente | Não reutilizar contagem de movimentações como receita |

## 8. Relatórios

Fontes: `pages/relatorios.html`, `js/pages/relatorios.js`. Abas usam `data-report-tab`.

| Ação | Situação | Backend disponível | Compatibilidade/trabalho |
|---|---|---|---|
| Abas geral/vendas/estoque/movimentos | Alternância local | Apenas parte das consultas operacionais | Definir DTOs de métricas e períodos para cada aba |
| Aplicar/limpar filtros | Log/alerta e limpeza dos campos | Filtros parciais em outros módulos | Aplicar data/filial/categoria no servidor; reset deve recarregar os dados |
| Cards e ranking | HTML estático | Sem resumo/ranking de vendas | Criar contratos agregados, sem somar somente a página exibida |
| CSV | Exporta tabela HTML | Sem endpoint CSV equivalente | Pode continuar local só se exportar o resultado completo autorizado; caso contrário usar exportação do servidor |
| Gerar relatório/imprimir | `window.print()` | `GET /relatorios/movimentacoes/pdf` | PDF de movimentos não cobre todos os relatórios da UI |
| Auditoria Excel | Sem consumidor | `GET /auditoria/estoque/exportar-excel` | Baixar Blob; conectar registro dos eventos antes de considerar histórico completo |
| Auditoria PDF | Sem consumidor | `GET /auditoria/estoque/exportar-pdf` | Mesmo cuidado com população e permissões |

## 9. Configurações

Fontes: `pages/configuracoes.html`, `js/pages/configuracoes.js`.

| Ação | Situação | Backend disponível | Compatibilidade/trabalho |
|---|---|---|---|
| Salvar dados da empresa | Log/alerta | Sem modelo/controller de empresa | **Proposta:** configuração persistida de empresa; filial atual só tem nome/endereço |
| Listar usuários | HTML estático | `GET /users` | Renderizar sem hash; normalizar perfil/status |
| Cadastrar pelo modal | Insere linha; senha não usada | `POST /users` | Unificar com `cadastro.html`, já integrado, evitando dois cadastros divergentes |
| Editar usuário/alternar status | Botões desabilitados | `PATCH /users/:id`, `PATCH /users/:id/status` | Somente administrador; campo `ativo` booleano |
| Último acesso | Valor fictício | Sem coluna/registro | Criar rastreamento se for requisito |
| Salvar matriz de permissões | Alerta | Criar/listar perfil disponíveis, sem atualização | Definir modelo de autorização; criar atualização e aplicar guard de permissões |
| Configurações de estoque | Log/alerta | Sem modelo/config persistida | Definir quais regras são globais, por filial ou por produto |
| Alterar própria senha | Alerta; senha atual ignorada | Reset por token e edição administrativa são outros fluxos | **Proposta:** `PATCH /auth/password` com senha atual/nova e revogação de sessão |
| Encerramento por inatividade | Checkbox | JWT expira em um dia, sem mecanismo configurável de inatividade | Definir política e implementação no servidor/cliente |
| Preferências idioma/moeda/data/itens | Log/alerta | Sem persistência de preferências | Definir preferências por usuário e formatação; moeda de exibição não equivale a conversão cambial |
| Exportar dados do sistema | Alerta de pendência | Sem exportação geral | Não tratar exports de auditoria como backup completo |

## 10. Ajuda e suporte

Fontes: `pages/ajuda.html`, `js/pages/ajuda.js`.

| Ação | Situação | Método/rota | Compatibilidade/trabalho |
|---|---|---|---|
| FAQ, busca e categorias | Conteúdo HTML e filtro local | Modelo `faq` sem API | Pode ser conteúdo estático deliberado; se editável, criar contrato de FAQ |
| Listar chamados | HTML estático | `GET /chamados` | Definir escopo por usuário/administrador; hoje lista global |
| Abrir chamado | Insere linha/código temporário | `POST /chamados` | `assunto → titulo`, prioridade para enum e email do solicitante |
| Selecionar categoria/página | Sem persistência | Sem campos atuais | Modelar ou não solicitar esses dados |
| Anexar arquivo | Input sem upload | Sem endpoint de anexos | Implementar upload/limites e vínculo ou retirar controle |
| Ver detalhe/atualizar status | Botões desabilitados | `GET /chamados/:id`, `PATCH /chamados/:id/status` | Validar enum e permissão; não enviar rótulo traduzido como enum |
| Contato/documentação | Conteúdo local | Não exige API por padrão | Decidir canais reais e substituir conteúdo fictício quando aplicável |

## 11. Dependências sem tela própria

| Domínio | API atual | Necessidade para comunicação |
|---|---|---|
| Categorias | Criar/listar/detalhar/editar/remover | Dados reais para catálogo e filtros |
| Filiais | Criar/listar/detalhar/editar/remover | Contexto de saldo, checkout, reserva, recebimento e alertas |
| Clientes | Criar/listar/detalhar/editar | Seleção/cadastro mínimo no fluxo comercial; exclusão de serviço não está exposta |
| NF/lotes | Criar/listar/detalhar/estornar/ajustar lote | Origem do estoque e controle de validade; corrigir integridade primeiro |
| Transferência | `POST /movimentacoes/transferencia` | UI específica quando existir mais de uma filial |
| Busca por código de barras | `GET /produtos/codigo-barras/:codigo` | Entrada de venda/estoque com resultado e saldo real |
| Auditoria | Dois exports; serviço interno de histórico | Registrar eventos e avaliar tela/consulta JSON, sem confundir com histórico operacional |

## 12. Critério para classificar uma ação como integrada

1. Endpoint e proteção corretos, DTO aceito, IDs reais e campos integralmente tratados.
2. Leitura apresenta loading, vazio e erro; filtro/paginação usa o mesmo conjunto de dados do servidor.
3. Escrita só mostra sucesso depois da persistência; erro mantém o formulário e não cria linha local fictícia.
4. Atualização aparece após recarregar e em outra sessão autorizada.
5. Operações com estoque passam por regras de saldo disponível, filial, lote, reserva e concorrência.
6. Dados derivados são recalculados/consultados após a escrita, preservando responsividade e acessibilidade.
