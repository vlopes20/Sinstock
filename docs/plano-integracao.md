# Plano condicionado de comunicação entre frontend e backend

Data: 04/11/2026. Base: [análise](analise-frontend-backend.md) e [matriz de ações](matriz-integracao.md).

**Este plano não parte da premissa de que os contratos já estão coesos.** As fases iniciais resolvem as divergências identificadas. Nenhuma integração de negócio nova foi implementada durante o levantamento.

## 1. Princípios e resultado esperado

- Preservar o login, sessão, MFA de entrada, cadastro administrativo e recuperação de senha já integrados.
- Manter o frontend HTML/JavaScript e o backend NestJS; não há necessidade técnica demonstrada de trocar o framework para realizar esta integração.
- Banco e backend são a fonte dos dados operacionais. DOM, arrays e localStorage não decidem saldo, preço final, reserva ou status persistido.
- Fazer uma entrega vertical de cada domínio: contrato, persistência, interface, erros, permissões e testes.
- Não ocultar campos incompatíveis descartando-os no envio: cada campo da UI deve ser persistido, derivado de uma fonte definida ou explicitamente retirado do escopo.
- Mostrar sucesso de escrita somente depois da confirmação do servidor. Bloquear duplo clique enquanto uma operação está pendente.

## 2. Decisões de contrato a fechar na fase 0

| Tema | Proposta de direção | Impacto se não resolvido |
|---|---|---|
| Contexto de filial | Carregar `/filiais` e oferecer uma seleção comum; mesmo com uma filial, usar ID real | Movimentação, venda, reserva e alertas não possuem origem consistente |
| Estados comerciais e logísticos | Preservar distinção entre orçamento/reserva/venda/cancelamento; se separação/envio forem requisitos, modelar atendimento separadamente ou aprovar expansão explícita do enum | Traduções de status podem baixar/liberar estoque indevidamente |
| Reserva | Expiração explícita e validação no servidor; não equiparar automaticamente a todo pedido pendente | Pedidos podem desaparecer por expiração sem corresponder ao fluxo da UI |
| Pagamento/desconto | Persistir no pedido e calcular total no servidor; definir formas e tipo de desconto | Filtros/relatórios financeiros não podem ser reais |
| Preço | Definir quando o operador pode alterar preço e como o servidor autoriza a alteração | Enviar preço do navegador não estabelece política comercial |
| Produto | Aprovar SKU, descrição, unidade, ativo e observações ou reduzir o formulário | Cadastro envia campos rejeitados/perdidos |
| Fornecedor do produto | Definir vínculo único ou relação de múltiplos fornecedores; aproveitar histórico de NF sem confundi-lo com cadastro-base | Campo não tem persistência definida |
| Saldo inicial e validade | Registrar movimento inicial por filial e, quando aplicável, lote com número e validade | Catálogo não representa múltiplas origens/lotes |
| Estoque disponível | Total menos reservado, por filial/lote; mesma definição para venda, transferência, ajuste e alertas | Cada tela informa um saldo diferente |
| Quantidade | Definir operações com frações e ajuste de contagem zero; não assumir que Decimal no banco já habilita a UI/DTO | Regras aceitas em uma camada são recusadas em outra |
| Perfis/permissões | Definir ações de administrador, operador e demais perfis exibidos; fazer a regra valer em guards | Matriz visual não limita a API |
| Suporte | Definir criação pública/interna, escopo de leitura, prioridades e anexos | Chamados sem dono/limite funcional e campos não enviados |
| Configurações | Separar empresa, regras de estoque e preferências pessoais | Um formulário tenta salvar informações em domínios inexistentes |

Estas são decisões funcionais a validar durante a preparação. O plano pode avançar com cadastros básicos enquanto decisões de relatórios, anexos e preferências são refinadas, desde que as funcionalidades pendentes fiquem identificadas.

## 3. Organização proposta da comunicação

```text
frontend/js/
  core/
    config.js                 URL/origem e configuração pública
    api.js                    JSON, autenticação, timeout e erros comuns
    format.js                 Datas, moeda, quantidades e rótulos aprovados
  services/                   NOVO: adaptadores por domínio
    catalogos.js               Categorias, filiais, clientes e seleções
    produtos.js
    fornecedores.js
    estoque.js                 Saldos, movimentos, recebimentos e lotes
    pedidos.js                 Pedidos e vendas usam a mesma fonte
    dashboard.js
    relatorios.js
    usuarios.js
    configuracoes.js
    suporte.js
  auth/                       Fluxos existentes, preservados
  pages/                      Eventos e coordenação de cada página
  shared/                     Componentes de tabela/modal/menus reutilizáveis
```

Essa estrutura é proposta, não uma descrição de diretórios já criados. Os serviços do frontend recebem/produzem contratos de domínio; não importam HTML nem manipulam tabelas diretamente. Os scripts de página controlam carregamento, formulário e renderização.

### Cliente HTTP

1. Reutilizar `SinstockAPI.request` para JSON, Bearer, cancelamento e erros 401/429.
2. Montar filtros com `URLSearchParams`; não concatenar textos de busca sem codificação.
3. Acrescentar download autenticado para `Blob`, validando `Content-Type` e nome do arquivo; não tentar interpretar PDF/Excel como JSON.
4. Identificar corretamente erros de validação, conflito, permissão e saldo insuficiente, preservando o formulário.
5. Definir timeouts de exportação de forma específica se necessário, sem remover cancelamento.
6. Para SSE, usar transporte autenticado que suporte header Bearer ou rever a arquitetura de sessão. Implementar emissões antes de exibir “tempo real”.

### Contratos de dados

- Contrato comum de tabela no frontend: `{ items, page, pageSize, totalItems, totalPages }`.
- Adaptadores traduzem os envelopes atuais (`dados`, `data`, arrays). Evoluir a API para um padrão documentado sem quebrar os fluxos autenticados já existentes.
- IDs de entidades são reais e tipados. IDs de logs BigInt serializados permanecem strings.
- Valores monetários e quantidades devem ter precisão definida; o servidor calcula resultados com tipos apropriados. Não validar valor final apenas com soma JavaScript no navegador.
- Datas de ocorrência (`DateTime`) e datas civis (`Date`, como validade) têm tratamento distinto; usar convenção explícita de timezone e limites de período.
- Rótulos traduzidos da UI são mapeados para enums canônicos em um lugar comum, sem comparações dispersas de textos de tabelas.
- Totais globais e indicadores vêm de agregações próprias, não da soma de uma página da listagem.
- Documentar request e response DTOs no OpenAPI, incluindo paginação, erros e respostas de download.

## 4. Fases de execução

### Fase 0 — Correções e contratos mínimos

**Backend:** corrigir alerta por filial, parsing do filtro booleano, mínimo/definição de estoque baixo, DTO concreto de atualização de filial, DTO de histórico com limites e duplicação de DTOs de nota fiscal. Fechar os campos de cada cadastro e a política de autorização.

**Integridade de estoque:** corrigir recebimento/estorno por filial/lote, campos dos logs, autor obtido da sessão, reconciliação de ajuste e proteção de saldo reservado. Implementar transições condicionais/controle de concorrência em confirmação, cancelamento e expiração.

**Frontend:** corrigir campo inexistente no handler do estoque, carregar opções reais no fluxo que será integrado e remover mensagens de sucesso fictício das ações que continuarem pendentes. Não preservar duas formas de cadastrar usuário com comportamentos diferentes.

**Estrutura:** alinhar Prisma gerado, versão de Node, README, seed e comandos de teste. Evitar que uma instalação nova sobrescreva senha administrativa.

**Aceite:** consultas de alertas filtradas sem 500; DTOs recusam entradas fora do contrato; nenhum sucesso fictício nas ações liberadas; testes isolados de estoque demonstram saldo e logs corretos, inclusive em concorrência. Estas correções devem ser revisáveis separadamente da conexão das telas.

### Fase 1 — Cadastros-base e contexto operacional

Ordem: categorias → filiais → fornecedores/clientes → produtos.

1. Implementar seleção comum de filial e carregamento dos catálogos pelos endpoints existentes.
2. Disponibilizar manutenção mínima de categorias/filiais/clientes, em telas próprias ou modais com responsabilidades claras.
3. Integrar listagens, filtros, paginação, cadastro, edição e exclusão/inativação conforme contrato aprovado.
4. Tratar CNPJ/código de barras duplicados e registros vinculados.
5. Dividir os handlers de Produtos/Fornecedores em renderização e adaptadores HTTP; eliminar opções fictícias.

**Aceite:** registro criado aparece após reload e em outra sessão autorizada; IDs reais alimentam os selects; erro não limpa o formulário; operador e administrador respeitam a política definida; totais e paginação correspondem ao servidor.

### Fase 2 — Estoque, lotes e recebimentos

1. Integrar tabela de saldos e seu agrupamento por produto/filial/lote.
2. Integrar entrada, saída e ajuste ao servidor, com saldo disponível e mensagens reais.
3. Integrar histórico, filtros, paginação e detalhamento de origem.
4. Incluir recebimento por NF e lote quando exigido pelo negócio; estorno apenas após correções e testes.
5. Integrar transferência entre filiais e alertas de mínimo/vencimento.
6. Registrar auditoria operacional e adicional com autor correto.

**Aceite:** entrada altera o saldo da filial/lote correto; saída/transferência não consomem estoque reservado; ajuste não viola reserva; estorno mantém consistência; erro faz rollback; todos os valores continuam corretos após reload. Testes devem incluir múltiplos lotes/filiais, ajuste zero conforme decisão e requisições concorrentes.

### Fase 3 — Pedidos e vendas

1. Integrar ambas as telas ao mesmo serviço `pedidos` do frontend/backend.
2. Carregar clientes/produtos reais e incluir filial em todos os contratos necessários.
3. Integrar checkout, reserva, confirmação, expiração e cancelamento.
4. Implementar pagamento/desconto/observações e o fluxo de atendimento aprovado, com migrações se necessário.
5. Substituir alterações de status feitas só no DOM por transições permitidas no servidor.
6. Recarregar pedido, saldo, histórico e indicadores após cada operação confirmada.

**Aceite:** checkout baixa estoque uma vez; reserva só reduz disponível; confirmação converte corretamente; cancelamento estorna/libera conforme estado anterior; expiração não duplica efeitos; repetição/concorrência não produz saldo incorreto; relatórios respeitam o estado comercial.

### Fase 4 — Dashboard, busca, alertas e notificações

1. Criar os endpoints agregados de vendas/faturamento/pedidos que faltam para o desenho atual ou ajustar os gráficos à métrica aprovada.
2. Integrar estoque por categoria e produtos críticos com definições consistentes.
3. Implementar busca global com os tipos de resultado efetivamente suportados; alinhar o placeholder.
4. Integrar notificações/lista/contador/leitura e a política de visibilidade.
5. Alimentar SSE pelas mutações e testar reconexão/expiração de sessão; se adiado, usar atualização explícita sem prometer tempo real.

**Aceite:** valores são obtidos do banco, filtros de período/filial têm significado definido, não existem séries fictícias em produção e atualizações aparecem após mutações.

### Fase 5 — Relatórios e exportações

1. Definir resumos/listas/rankings para geral, vendas, estoque e movimentos.
2. Aplicar filtros no servidor sobre o resultado completo autorizado.
3. Integrar PDF existente de movimentos e exports de auditoria com download autenticado.
4. Implementar os exports adicionais realmente necessários. Separar exportar tabela, gerar relatório e backup geral.
5. Validar moeda, quantidades, datas e período do arquivo contra o mesmo contrato da tela.

**Aceite:** exportação contém o conjunto definido pelo filtro, não somente a página visível; limites e permissão são claros; PDF/Excel abrem corretamente; nenhum relatório de auditoria é apresentado como completo se seus eventos ainda não foram ligados.

### Fase 6 — Configurações, segurança da conta e suporte

1. Usar gestão real de usuários/perfis e unificar cadastro com a tela já funcional.
2. Implementar alteração de senha própria com senha atual e revogação de sessões.
3. Integrar ativação/gestão de 2FA conforme política aprovada.
4. Criar persistência e rotas de empresa/regras/preferências que forem mantidas na UI.
5. Conectar chamados com identidade, enum e escopo corretos; decidir anexos e FAQ.

**Aceite:** nenhuma configuração desaparece indevidamente após reload; ações administrativas são negadas no backend a usuários sem permissão; mudança de senha é real; chamado pode ser acompanhado pelo solicitante autorizado; controles sem implementação não simulam sucesso.

### Fase 7 — Homologação integrada

- Banco de teste separado, com fixtures de categoria, filial, fornecedor, cliente, produto, saldo e lote. Não depender de produtos fictícios do HTML.
- Jornada completa: cadastrar base → receber estoque → reservar/vender → confirmar/cancelar → consultar histórico/alertas → gerar relatório.
- Verificar usuário operador/administrador, token expirado, recurso inexistente, conflito, validação, indisponibilidade e duplo envio.
- Verificar duas sessões, concorrência e rollback de operações financeiras/estoque.
- Reexecutar autenticação, SMTP/recuperação quando alterados e auditoria responsiva nas páginas modificadas.
- Documentar comandos de instalação, migração, bootstrap e execução sem senhas fixas ou seed destrutivo.

**Aceite final:** todas as ações liberadas têm correspondência na matriz, contrato documentado, persistência real e teste relevante. O aviso de demonstração só sai de cada domínio depois desse aceite.

## 5. Backlog de contratos adicionais

Todos os itens desta tabela são **propostas**, não rotas existentes.

| Necessidade | Proposta inicial | Observação |
|---|---|---|
| Trocar a própria senha | `PATCH /auth/password` | Senha atual + nova; usuário da sessão; revogar sessões |
| Atualizar permissões de perfil | `PATCH /perfis/:id` | Exige política/guard de permissões; não basta salvar JSON |
| Resumo do dashboard | `GET /dashboard/resumo` | Período e filial; sem somar só a página de pedidos |
| Receita por período | `GET /dashboard/graficos/vendas` | Receita de vendas concluídas e regra para cancelamentos |
| Métricas de vendas/pagamento | `GET /pedidos/metricas` | Registrar antes de `:id`; depende de schema financeiro |
| Relatórios por domínio | `GET /relatorios/{geral,vendas,estoque,movimentacoes}` | Resumos JSON com filtros explícitos |
| Empresa | `GET/PATCH /configuracoes/empresa` | Acesso administrativo |
| Regras de estoque | `GET/PATCH /configuracoes/estoque` | Definir escopo global/filial e efeitos reais |
| Preferências | `GET/PATCH /users/me/preferencias` | Dados do usuário autenticado |
| Consulta de auditoria | `GET /auditoria/estoque` | Paginação, filtros e autorização; diferente de download |
| FAQ | `GET /faq` | Só se deixar de ser conteúdo estático |
| Anexos de chamado | Contrato de upload a definir | Validar necessidade antes de criar armazenamento |

Novas rotas estáticas como `/pedidos/metricas` devem ser declaradas antes de rotas dinâmicas como `/pedidos/:id`. Rotas de consulta existentes devem ser estendidas com DTOs de filtro/paginação, não duplicadas apenas para combinar com o nome da tela.

## 6. Sequência recomendada para a próxima entrega

Iniciar com **fase 0 e a primeira entrega vertical de categorias/filiais/produtos**, mantendo a autenticação estável. Depois liberar estoque e só então checkout/reservas. Dashboard e relatórios passam a consumir métricas derivadas de operações já confiáveis.

Não iniciar conectando simultaneamente todos os botões aos endpoints atuais: isso propagaria divergências de estados, saldos e campos para as telas e tornaria a validação mais difícil.
