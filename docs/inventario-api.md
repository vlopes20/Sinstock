# Inventário das rotas da API

Levantamento estático dos controllers e DTOs em 04/11/2026. Guards indicados pelo código, sem presumir que Swagger documenta toda a validação.

| Método | Rota | Proteção | Handler | Entrada | Fonte |
|---|---|---|---|---|---|
| GET | `/alertas` | UseGuards(JwtAuthGuard) | obterDashboard | Query: ConsultaAlertasDto | [src/alertas/alertas.controller.ts:14](../src/alertas/alertas.controller.ts#L14) |
| GET | `/alertas/estoque-baixo` | UseGuards(JwtAuthGuard) | obterEstoqueBaixo | Query: ConsultaAlertasDto | [src/alertas/alertas.controller.ts:20](../src/alertas/alertas.controller.ts#L20) |
| GET | `/alertas/vencimentos` | UseGuards(JwtAuthGuard) | obterVencimentos | Query: ConsultaAlertasDto | [src/alertas/alertas.controller.ts:26](../src/alertas/alertas.controller.ts#L26) |
| GET | `/auditoria/estoque/exportar-excel` | UseGuards(JwtAuthGuard) | exportarExcelStream | Query: ConsultaAuditoriaDto | [src/auditoria/auditoria.controller.ts:28](../src/auditoria/auditoria.controller.ts#L28) |
| GET | `/auditoria/estoque/exportar-pdf` | UseGuards(JwtAuthGuard) | exportarPdfStream | Query: ConsultaAuditoriaDto | [src/auditoria/auditoria.controller.ts:71](../src/auditoria/auditoria.controller.ts#L71) |
| POST | `/auth/login` | Pública (sem guard JWT) | login | Body: LoginDto | [src/auth/auth.controller.ts:38](../src/auth/auth.controller.ts#L38) |
| GET | `/auth/me` | UseGuards(JwtAuthGuard) | me | Request: RequestWithUser | [src/auth/auth.controller.ts:44](../src/auth/auth.controller.ts#L44) |
| POST | `/auth/logout` | UseGuards(JwtAuthGuard) | logout | Request: RequestWithUser | [src/auth/auth.controller.ts:50](../src/auth/auth.controller.ts#L50) |
| POST | `/auth/forgot-password` | Pública (sem guard JWT) | forgotPassword | Body: ForgotPasswordDto | [src/auth/auth.controller.ts:56](../src/auth/auth.controller.ts#L56) |
| POST | `/auth/reset-password` | Pública (sem guard JWT) | resetPassword | Body: ResetPasswordDto | [src/auth/auth.controller.ts:62](../src/auth/auth.controller.ts#L62) |
| POST | `/auth/2fa/generate` | UseGuards(JwtAuthGuard) | generate2FA | Request: RequestWithUser | [src/auth/auth.controller.ts:68](../src/auth/auth.controller.ts#L68) |
| POST | `/auth/2fa/enable` | UseGuards(JwtAuthGuard) | enable2FA | Request: RequestWithUser; Body: TwoFactorCodeDto | [src/auth/auth.controller.ts:77](../src/auth/auth.controller.ts#L77) |
| POST | `/auth/2fa/authenticate` | UseGuards(PreAuthGuard) | authenticate2FA | Request: RequestWithUser; Body: TwoFactorCodeDto | [src/auth/auth.controller.ts:87](../src/auth/auth.controller.ts#L87) |
| GET | `/busca-global` | UseGuards(JwtAuthGuard) | buscar | Query: BuscaGlobalDto | [src/busca-global/busca-global.controller.ts:14](../src/busca-global/busca-global.controller.ts#L14) |
| POST | `/categorias` | UseGuards(JwtAuthGuard) | criar | Body: CreateCategoriaDto | [src/categorias/categorias.controller.ts:25](../src/categorias/categorias.controller.ts#L25) |
| GET | `/categorias` | UseGuards(JwtAuthGuard) | listar |  | [src/categorias/categorias.controller.ts:31](../src/categorias/categorias.controller.ts#L31) |
| GET | `/categorias/:id` | UseGuards(JwtAuthGuard) | buscarPorId | Param: number | [src/categorias/categorias.controller.ts:37](../src/categorias/categorias.controller.ts#L37) |
| PATCH | `/categorias/:id` | UseGuards(JwtAuthGuard) | atualizar | Param: number; Body: UpdateCategoriaDto | [src/categorias/categorias.controller.ts:43](../src/categorias/categorias.controller.ts#L43) |
| DELETE | `/categorias/:id` | UseGuards(JwtAuthGuard) | remover | Param: number | [src/categorias/categorias.controller.ts:52](../src/categorias/categorias.controller.ts#L52) |
| POST | `/chamados` | Pública (sem guard JWT) | criar | Body: CriarChamadoDto | [src/chamados/chamados.controller.ts:22](../src/chamados/chamados.controller.ts#L22) |
| GET | `/chamados` | UseGuards(JwtAuthGuard) | listarTodos |  | [src/chamados/chamados.controller.ts:28](../src/chamados/chamados.controller.ts#L28) |
| GET | `/chamados/:id` | UseGuards(JwtAuthGuard) | buscarPorId | Param: number | [src/chamados/chamados.controller.ts:36](../src/chamados/chamados.controller.ts#L36) |
| PATCH | `/chamados/:id/status` | UseGuards(JwtAuthGuard) | atualizarStatus | Param: number; Body: chamados_suporte_status | [src/chamados/chamados.controller.ts:44](../src/chamados/chamados.controller.ts#L44) |
| POST | `/clientes` | UseGuards(JwtAuthGuard) | create | Body: CreateClienteDto | [src/clientes/clientes.controller.ts:26](../src/clientes/clientes.controller.ts#L26) |
| GET | `/clientes` | UseGuards(JwtAuthGuard) | findAll | Query: ClienteFilterDto | [src/clientes/clientes.controller.ts:32](../src/clientes/clientes.controller.ts#L32) |
| GET | `/clientes/:id` | UseGuards(JwtAuthGuard) | findOne | Param: number | [src/clientes/clientes.controller.ts:38](../src/clientes/clientes.controller.ts#L38) |
| PATCH | `/clientes/:id` | UseGuards(JwtAuthGuard) | update | Param: number; Body: UpdateClienteDto | [src/clientes/clientes.controller.ts:44](../src/clientes/clientes.controller.ts#L44) |
| GET | `/dashboard/graficos/stock-categoria` | UseGuards(JwtAuthGuard) | getStockPorCategoria |  | [src/dashboards/dashboard.controller.ts:14](../src/dashboards/dashboard.controller.ts#L14) |
| GET | `/dashboard/graficos/movimentacoes-semanal` | UseGuards(JwtAuthGuard) | getMovimentacoesSemanal |  | [src/dashboards/dashboard.controller.ts:22](../src/dashboards/dashboard.controller.ts#L22) |
| GET | `/dashboard/graficos/produtos-criticos` | UseGuards(JwtAuthGuard) | getProdutosCriticos |  | [src/dashboards/dashboard.controller.ts:31](../src/dashboards/dashboard.controller.ts#L31) |
| GET (SSE) | `/dashboard/realtime-stream` | UseGuards(JwtAuthGuard) | streamStockEvents |  | [src/dashboards/dashboard.controller.ts:39](../src/dashboards/dashboard.controller.ts#L39) |
| POST | `/filiais` | UseGuards(JwtAuthGuard) | create | Body: CreateFilialDto | [src/filiais/filiais.controller.ts:21](../src/filiais/filiais.controller.ts#L21) |
| GET | `/filiais` | UseGuards(JwtAuthGuard) | findAll |  | [src/filiais/filiais.controller.ts:26](../src/filiais/filiais.controller.ts#L26) |
| GET | `/filiais/:id` | UseGuards(JwtAuthGuard) | findOne | Param: number | [src/filiais/filiais.controller.ts:31](../src/filiais/filiais.controller.ts#L31) |
| PATCH | `/filiais/:id` | UseGuards(JwtAuthGuard) | update | Param: number; Body: Partial<CreateFilialDto> | [src/filiais/filiais.controller.ts:36](../src/filiais/filiais.controller.ts#L36) |
| DELETE | `/filiais/:id` | UseGuards(JwtAuthGuard) | remove | Param: number | [src/filiais/filiais.controller.ts:44](../src/filiais/filiais.controller.ts#L44) |
| POST | `/fornecedores` | UseGuards(JwtAuthGuard) | criar | Body: CreateFornecedorDto | [src/fornecedores/fornecedores.controller.ts:25](../src/fornecedores/fornecedores.controller.ts#L25) |
| GET | `/fornecedores` | UseGuards(JwtAuthGuard) | listar |  | [src/fornecedores/fornecedores.controller.ts:31](../src/fornecedores/fornecedores.controller.ts#L31) |
| GET | `/fornecedores/:id` | UseGuards(JwtAuthGuard) | buscarPorId | Param: number | [src/fornecedores/fornecedores.controller.ts:37](../src/fornecedores/fornecedores.controller.ts#L37) |
| PATCH | `/fornecedores/:id` | UseGuards(JwtAuthGuard) | atualizar | Param: number; Body: UpdateFornecedorDto | [src/fornecedores/fornecedores.controller.ts:43](../src/fornecedores/fornecedores.controller.ts#L43) |
| DELETE | `/fornecedores/:id` | UseGuards(JwtAuthGuard) | remover | Param: number | [src/fornecedores/fornecedores.controller.ts:52](../src/fornecedores/fornecedores.controller.ts#L52) |
| GET | `/integracoes/cep/:cep` | UseGuards(JwtAuthGuard) | buscarPorCep | Param: ConsultaCepDto | [src/integracoes/integracoes.controller.ts:16](../src/integracoes/integracoes.controller.ts#L16) |
| GET | `/integracoes/coordenadas` | UseGuards(JwtAuthGuard) | obterCoordenadas | Query: ConsultaCoordenadasDto | [src/integracoes/integracoes.controller.ts:22](../src/integracoes/integracoes.controller.ts#L22) |
| GET | `/integracoes/distancia-ceps` | UseGuards(JwtAuthGuard) | calcularDistanciaCeps | Query: ConsultaDistanciaCepsDto | [src/integracoes/integracoes.controller.ts:32](../src/integracoes/integracoes.controller.ts#L32) |
| POST | `/movimentacoes` | UseGuards(JwtAuthGuard) | registrarMovimentacao | Body: CreateMovimentacaoDto; Request: RequestWithUser | [src/movimentacoes/movimentacoes.controller.ts:36](../src/movimentacoes/movimentacoes.controller.ts#L36) |
| POST | `/movimentacoes/transferencia` | UseGuards(JwtAuthGuard) | transferirSaldo | Body: CreateTransferenciaDto; Request: RequestWithUser | [src/movimentacoes/movimentacoes.controller.ts:48](../src/movimentacoes/movimentacoes.controller.ts#L48) |
| GET | `/movimentacoes/historico` | UseGuards(JwtAuthGuard) | listarHistorico | Query: number; Query: number; Query: number | [src/movimentacoes/movimentacoes.controller.ts:60](../src/movimentacoes/movimentacoes.controller.ts#L60) |
| POST | `/notas-fiscais-entrada` | UseGuards(JwtAuthGuard) | criar | Body: CreateNotaFiscalEntradaDto | [src/notas-fiscais-entrada/notas-fiscais-entrada.controller.ts:25](../src/notas-fiscais-entrada/notas-fiscais-entrada.controller.ts#L25) |
| GET | `/notas-fiscais-entrada` | UseGuards(JwtAuthGuard) | listar |  | [src/notas-fiscais-entrada/notas-fiscais-entrada.controller.ts:31](../src/notas-fiscais-entrada/notas-fiscais-entrada.controller.ts#L31) |
| GET | `/notas-fiscais-entrada/:id` | UseGuards(JwtAuthGuard) | buscarPorId | Param: number | [src/notas-fiscais-entrada/notas-fiscais-entrada.controller.ts:37](../src/notas-fiscais-entrada/notas-fiscais-entrada.controller.ts#L37) |
| PATCH | `/notas-fiscais-entrada/:id/estorno` | UseGuards(JwtAuthGuard) | estornar | Param: number; Body: EstornoNotaFiscalDto | [src/notas-fiscais-entrada/notas-fiscais-entrada.controller.ts:43](../src/notas-fiscais-entrada/notas-fiscais-entrada.controller.ts#L43) |
| PATCH | `/notas-fiscais-entrada/lotes/:loteId` | UseGuards(JwtAuthGuard) | ajustarLote | Param: number; Body: AjusteLoteDto | [src/notas-fiscais-entrada/notas-fiscais-entrada.controller.ts:52](../src/notas-fiscais-entrada/notas-fiscais-entrada.controller.ts#L52) |
| GET | `/notificacoes` | UseGuards(JwtAuthGuard) | listar | Query: string | [src/notificacoes/notificacoes.controller.ts:22](../src/notificacoes/notificacoes.controller.ts#L22) |
| PATCH | `/notificacoes/:id/ler` | UseGuards(JwtAuthGuard) | marcarComoLida | Param: number | [src/notificacoes/notificacoes.controller.ts:29](../src/notificacoes/notificacoes.controller.ts#L29) |
| POST | `/notificacoes/executar-varredura` | UseGuards(JwtAuthGuard) | executarVarredura |  | [src/notificacoes/notificacoes.controller.ts:35](../src/notificacoes/notificacoes.controller.ts#L35) |
| POST | `/pedidos/checkout` | UseGuards(JwtAuthGuard) | realizarCheckout | Body: CreateCheckoutDto; Req: RequestWithUser | [src/pedidos/pedidos.controller.ts:20](../src/pedidos/pedidos.controller.ts#L20) |
| POST | `/pedidos/reservar` | UseGuards(JwtAuthGuard) | criarReserva | Body: CreateReservaDto; Req: RequestWithUser | [src/pedidos/pedidos.controller.ts:25](../src/pedidos/pedidos.controller.ts#L25) |
| PATCH | `/pedidos/:id/confirmar` | UseGuards(JwtAuthGuard) | confirmarReserva | Param: number; Req: RequestWithUser | [src/pedidos/pedidos.controller.ts:30](../src/pedidos/pedidos.controller.ts#L30) |
| GET | `/pedidos` | UseGuards(JwtAuthGuard) | listarTodos |  | [src/pedidos/pedidos.controller.ts:35](../src/pedidos/pedidos.controller.ts#L35) |
| GET | `/pedidos/:id` | UseGuards(JwtAuthGuard) | buscarPorId | Param: number | [src/pedidos/pedidos.controller.ts:40](../src/pedidos/pedidos.controller.ts#L40) |
| PATCH | `/pedidos/:id/cancelar` | UseGuards(JwtAuthGuard) | cancelarPedido | Param: number; Req: RequestWithUser | [src/pedidos/pedidos.controller.ts:45](../src/pedidos/pedidos.controller.ts#L45) |
| POST | `/perfis` | UseGuards(JwtAuthGuard); UseGuards(RolesGuard); Roles(1) | create | Body: CreatePerfilDto | [src/perfis/perfis.controller.ts:21](../src/perfis/perfis.controller.ts#L21) |
| GET | `/perfis` | UseGuards(JwtAuthGuard) | findAll |  | [src/perfis/perfis.controller.ts:28](../src/perfis/perfis.controller.ts#L28) |
| GET | `/perfis/:id` | UseGuards(JwtAuthGuard) | findOne | Param: number | [src/perfis/perfis.controller.ts:33](../src/perfis/perfis.controller.ts#L33) |
| POST | `/produtos` | UseGuards(JwtAuthGuard) | criar | Body: CreateProdutoDto | [src/produtos/produtos.controller.ts:28](../src/produtos/produtos.controller.ts#L28) |
| GET | `/produtos` | UseGuards(JwtAuthGuard) | listar | Query: FiltroProdutosDto | [src/produtos/produtos.controller.ts:34](../src/produtos/produtos.controller.ts#L34) |
| GET | `/produtos/codigo-barras/:codigo` | UseGuards(JwtAuthGuard) | buscarPorCodigoBarras | Param: string; Query: BuscaCodigoBarrasDto | [src/produtos/produtos.controller.ts:40](../src/produtos/produtos.controller.ts#L40) |
| GET | `/produtos/:id` | UseGuards(JwtAuthGuard) | buscarPorId | Param: number | [src/produtos/produtos.controller.ts:52](../src/produtos/produtos.controller.ts#L52) |
| PATCH | `/produtos/:id` | UseGuards(JwtAuthGuard) | atualizar | Param: number; Body: UpdateProdutoDto | [src/produtos/produtos.controller.ts:58](../src/produtos/produtos.controller.ts#L58) |
| DELETE | `/produtos/:id` | UseGuards(JwtAuthGuard) | remover | Param: number | [src/produtos/produtos.controller.ts:67](../src/produtos/produtos.controller.ts#L67) |
| GET | `/relatorios/movimentacoes/pdf` | UseGuards(JwtAuthGuard) | baixarRelatorioMovimentacoes | Query: RelatorioMovimentacoesDto; Res: Response | [src/relatorios/relatorios.controller.ts:20](../src/relatorios/relatorios.controller.ts#L20) |
| GET | `/saldos-estoque` | UseGuards(JwtAuthGuard) | findAll | Query: SaldosEstoqueFilterDto | [src/saldos-estoque/saldos-estoque.controller.ts:14](../src/saldos-estoque/saldos-estoque.controller.ts#L14) |
| GET | `/saldos-estoque/:id` | UseGuards(JwtAuthGuard) | findOne | Param: number | [src/saldos-estoque/saldos-estoque.controller.ts:21](../src/saldos-estoque/saldos-estoque.controller.ts#L21) |
| POST | `/users` | UseGuards(JwtAuthGuard); UseGuards(RolesGuard); Roles(1) | create | Body: CreateUserDto | [src/usuario/users.controller.ts:24](../src/usuario/users.controller.ts#L24) |
| GET | `/users/profile` | UseGuards(JwtAuthGuard) | getProfile | CurrentUser: any | [src/usuario/users.controller.ts:31](../src/usuario/users.controller.ts#L31) |
| GET | `/users` | UseGuards(JwtAuthGuard) | findAll |  | [src/usuario/users.controller.ts:36](../src/usuario/users.controller.ts#L36) |
| GET | `/users/:id` | UseGuards(JwtAuthGuard) | findOne | Param: number | [src/usuario/users.controller.ts:41](../src/usuario/users.controller.ts#L41) |
| PATCH | `/users/:id` | UseGuards(JwtAuthGuard); UseGuards(RolesGuard); Roles(1) | update | Param: number; Body: UpdateUserDto | [src/usuario/users.controller.ts:46](../src/usuario/users.controller.ts#L46) |
| PATCH | `/users/:id/status` | UseGuards(JwtAuthGuard); UseGuards(RolesGuard); Roles(1) | toggleStatus | Param: number | [src/usuario/users.controller.ts:56](../src/usuario/users.controller.ts#L56) |

## DTOs

### ConsultaAlertasDto

Fonte: [src/alertas/dto/consulta-alertas.dto.ts](../src/alertas/dto/consulta-alertas.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| filial_id? | number | IsOptional; Type(() => Number); IsInt({ message: 'O ID da filial deve ser um número inteiro.' }); Min(1, { message: 'O ID da filial deve ser maior que zero.' }) |
| dias_vencimento? | number | IsOptional; Type(() => Number); IsInt({ message: 'Os dias de vencimento devem ser um número inteiro.' }); Min(1, { message: 'O parâmetro de dias para vencimento deve ser de pelo menos 1 dia.' }); Max(365, { message: 'O parâmetro de dias para vencimento não pode exceder 365 dias.' }) |

### ConsultaAuditoriaDto

Fonte: [src/auditoria/dto/consulta-auditoria.dto.ts](../src/auditoria/dto/consulta-auditoria.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| usuarioId? | string | ApiPropertyOptional({ description: 'Filtrar por ID do Utilizador' }); IsOptional; IsString |
| acao? | string | ApiPropertyOptional({ description: 'Filtrar por Tipo de Ação (ex: SAIDA_ESTOQUE, CRIACAO)' }); IsOptional; IsString |
| recurso? | string | ApiPropertyOptional({ description: 'Filtrar por Recurso (ex: PRODUTO, REQUISICAO)' }); IsOptional; IsString |
| recursoId? | string | ApiPropertyOptional({ description: 'Filtrar por ID do Recurso' }); IsOptional; IsString |
| dataInicio? | Date | ApiPropertyOptional({ description: 'Data Inicial (YYYY-MM-DD)' }); IsOptional; Type(() => Date); IsDate |
| dataFim? | Date | ApiPropertyOptional({ description: 'Data Final (YYYY-MM-DD)' }); IsOptional; Type(() => Date); IsDate |
| page? | number | ApiPropertyOptional({ description: 'Página atual (Paginação)', default: 1 }); IsOptional; Type(() => Number); IsInt; Min(1) |
| limit? | number | ApiPropertyOptional({ description: 'Itens por página (Paginação)', default: 20 }); IsOptional; Type(() => Number); IsInt; Min(1) |

### LoginDto

Fonte: [src/auth/dto/login.dto.ts](../src/auth/dto/login.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| email | string | IsEmail({}, { message: 'Informe um e-mail válido' }) |
| senha | string | IsString; IsNotEmpty({ message: 'A senha é obrigatória' }) |

### ForgotPasswordDto

Fonte: [src/auth/dto/recovery.dto.ts](../src/auth/dto/recovery.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| email | string | IsEmail; MaxLength(100) |

### ResetPasswordDto

Fonte: [src/auth/dto/recovery.dto.ts](../src/auth/dto/recovery.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| token | string | IsString; Matches(/^[a-f0-9]{64}$/) |
| senha | string | IsString; MinLength(8); MaxLength(72) |

### TwoFactorCodeDto

Fonte: [src/auth/dto/recovery.dto.ts](../src/auth/dto/recovery.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| codigo | string | IsString; Matches(/^\d{6}$/, {     message: 'Informe os 6 dígitos do aplicativo autenticador.',   }) |

### BuscaGlobalDto

Fonte: [src/busca-global/dto/busca-global.dto.ts](../src/busca-global/dto/busca-global.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| termo | string | IsString({ message: 'O termo de busca deve ser um texto.' }); MinLength(2, { message: 'O termo de busca deve ter pelo menos 2 caracteres.' }) |
| filial_id? | number | IsOptional; Type(() => Number); IsInt({ message: 'O ID da filial deve ser um número inteiro.' }); Min(1, { message: 'O ID da filial deve ser maior que zero.' }) |
| limite? | number | IsOptional; Type(() => Number); IsInt({ message: 'O limite deve ser um número inteiro.' }); Min(1); Max(50, {message: 'O limite não deve ser superior a 50.'}) |

### CreateCategoriaDto

Fonte: [src/categorias/dto/create-categoria.dto.ts](../src/categorias/dto/create-categoria.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| nome | string | IsString; IsNotEmpty; MaxLength(100) |
| descricao? | string | IsString; IsOptional |

### UpdateCategoriaDto

Fonte: [src/categorias/dto/update-categoria.dto.ts](../src/categorias/dto/update-categoria.dto.ts). extends PartialType(CreateCategoriaDto)

| Campo | Tipo | Validação/decoradores |
|---|---|---|

### CriarChamadoDto

Fonte: [src/chamados/dto/criar-chamado.dto.ts](../src/chamados/dto/criar-chamado.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| titulo | string | ApiProperty({ example: 'Problema no leitor de código de barras' }); IsString; IsNotEmpty |
| descricao | string | ApiProperty({ example: 'O leitor USB da bancada 2 deixou de bipar itens de stock.' }); IsString; IsNotEmpty |
| prioridade | PrioridadeChamado | ApiProperty({ enum: PrioridadeChamado, default: PrioridadeChamado.MEDIA }); IsEnum(PrioridadeChamado) |
| emailSolicitante | string | ApiProperty({ example: 'suporte@empresa.com' }); IsString; IsNotEmpty |

### ClienteFilterDto

Fonte: [src/clientes/dto/cliente-filter.dto.ts](../src/clientes/dto/cliente-filter.dto.ts). extends PaginacaoFiltroDto

| Campo | Tipo | Validação/decoradores |
|---|---|---|

### CreateClienteDto

Fonte: [src/clientes/dto/create-cliente.dto.ts](../src/clientes/dto/create-cliente.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| nome | string | ApiProperty({ description: 'Nome completo ou razão social do cliente', example: 'João da Silva' }); IsString({ message: 'O nome deve ser um texto.' }); IsNotEmpty({ message: 'O nome do cliente é obrigatório.' }); MaxLength(150, { message: 'O nome pode ter no máximo 150 caracteres.' }) |
| cpf_cnpj? | string | ApiPropertyOptional({ description: 'CPF ou CNPJ do cliente', example: '123.456.789-00' }); IsString({ message: 'O CPF/CNPJ deve ser um texto.' }); IsOptional; MaxLength(20, { message: 'O CPF/CNPJ pode ter no máximo 20 caracteres.' }) |
| telefone? | string | ApiPropertyOptional({ description: 'Telefone de contato', example: '(11) 98765-4321' }); IsString({ message: 'O telefone deve ser um texto.' }); IsOptional; MaxLength(20, { message: 'O telefone pode ter no máximo 20 caracteres.' }) |
| email? | string | ApiPropertyOptional({ description: 'Endereço de e-mail do cliente', example: 'joao.silva@email.com' }); IsEmail({}, { message: 'Formato de e-mail inválido.' }); IsOptional; MaxLength(100, { message: 'O e-mail pode ter no máximo 100 caracteres.' }) |

### UpdateClienteDto

Fonte: [src/clientes/dto/update-cliente.dto.ts](../src/clientes/dto/update-cliente.dto.ts). extends PartialType(CreateClienteDto)

| Campo | Tipo | Validação/decoradores |
|---|---|---|

### PaginacaoFiltroDto

Fonte: [src/common/dto/paginacao-filtro.dto.ts](../src/common/dto/paginacao-filtro.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| pagina? | number | IsOptional; Type(() => Number); IsInt({ message: 'A página deve ser um número inteiro.' }); Min(1, { message: 'A página mínima é 1.' }) |
| limite? | number | IsOptional; Type(() => Number); IsInt({ message: 'O limite deve ser um número inteiro.' }); Min(1, { message: 'O limite mínimo por página é 1.' }); Max(100, { message: 'O limite máximo por página é 100.' }) |
| busca? | string | IsOptional; IsString |
| ordenar_por? | string | IsOptional; IsString |
| ordem? | 'asc' \| 'desc' | IsOptional; IsIn(['asc', 'desc'], { message: 'A ordem deve ser "asc" ou "desc".' }) |

### CreateFilialDto

Fonte: [src/filiais/dto/create-filial.dto.ts](../src/filiais/dto/create-filial.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| nome | string | IsString; Length(2, 100) |
| endereco? | string | IsOptional; IsString |

### CreateFornecedorDto

Fonte: [src/fornecedores/dto/create-fornecedor.dto.ts](../src/fornecedores/dto/create-fornecedor.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| nome_juridico | string | IsString; IsNotEmpty |
| cnpj | string | IsString; IsNotEmpty |
| telefone? | string | IsString; IsOptional |
| email? | string | IsEmail; IsOptional |
| cep? | string | IsString; IsOptional |
| cidade? | string | IsString; IsOptional |
| estado? | string | IsString; IsOptional |
| endereco? | string | IsString; IsOptional |
| latitude? | number | IsNumber; IsOptional |
| longitude? | number | IsNumber; IsOptional |

### UpdateFornecedorDto

Fonte: [src/fornecedores/dto/update-fornecedor.dto.ts](../src/fornecedores/dto/update-fornecedor.dto.ts). extends PartialType(CreateFornecedorDto)

| Campo | Tipo | Validação/decoradores |
|---|---|---|

### ConsultaCepDto

Fonte: [src/integracoes/dto/consulta-cep.dto.ts](../src/integracoes/dto/consulta-cep.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| cep | string | ApiProperty({     description: 'CEP para busca (8 dígitos com ou sem hífen)',     example: '01001000',   }); IsString; IsNotEmpty; Matches(/^[0-9]{5}-?[0-9]{3}$/, {     message: 'O CEP deve conter 8 dígitos no formato 00000000 ou 00000-000.',   }) |

### ConsultaCoordenadasDto

Fonte: [src/integracoes/dto/consulta-coordenadas.dto.ts](../src/integracoes/dto/consulta-coordenadas.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| logradouro | string | ApiProperty({ description: 'Logradouro / Nome da rua', example: 'Avenida Paulista' }); IsString; IsNotEmpty |
| cidade | string | ApiProperty({ description: 'Nome do município', example: 'São Paulo' }); IsString; IsNotEmpty |
| uf | string | ApiProperty({ description: 'Sigla do estado (2 caracteres)', example: 'SP' }); IsString; Length(2, 2, { message: 'A UF deve ter exatamente 2 caracteres.' }) |

### ConsultaDistanciaCepsDto

Fonte: [src/integracoes/dto/consulta-distancia-ceps.dto.ts](../src/integracoes/dto/consulta-distancia-ceps.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| cep_origem | string | ApiProperty({ description: 'CEP de origem', example: '01001000' }); IsString; IsNotEmpty; Matches(/^[0-9]{5}-?[0-9]{3}$/, {     message: 'O CEP de origem deve conter 8 dígitos no formato 00000000 ou 00000-000.',   }) |
| cep_destino | string | ApiProperty({ description: 'CEP de destino', example: '04538132' }); IsString; IsNotEmpty; Matches(/^[0-9]{5}-?[0-9]{3}$/, {     message: 'O CEP de destino deve conter 8 dígitos no formato 00000000 ou 00000-000.',   }) |
| raio_maximo_km? | number | ApiPropertyOptional({ description: 'Raio máximo em KM para validação', example: 15 }); IsOptional; Type(() => Number); IsNumber; Min(0.1) |

### CreateMovimentacaoDto

Fonte: [src/movimentacoes/dto/create-movimentacao.dto.ts](../src/movimentacoes/dto/create-movimentacao.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| produto_id | number | ApiProperty({ description: 'ID do produto' }); IsInt; Min(1) |
| filial_id | number | ApiProperty({ description: 'ID da filial onde ocorre a movimentação' }); IsInt; Min(1) |
| lote_id? | number | ApiPropertyOptional({ description: 'ID do lote (opcional)' }); IsOptional; IsInt; Min(1) |
| tipo | TipoMovimentacao | ApiProperty({ enum: TipoMovimentacao, description: 'Tipo da movimentação' }); IsEnum(TipoMovimentacao) |
| quantidade | number | ApiProperty({ description: 'Quantidade movimentada' }); IsInt; Min(1) |
| observacao? | string | ApiPropertyOptional({ description: 'Observação ou justificativa' }); IsOptional; IsString |

### CreateTransferenciaDto

Fonte: [src/movimentacoes/dto/create-transferencia.dto.ts](../src/movimentacoes/dto/create-transferencia.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| produto_id | number | ApiProperty({ description: 'ID do produto' }); IsInt; Min(1) |
| filial_origem_id | number | ApiProperty({ description: 'ID da filial de origem' }); IsInt; Min(1) |
| filial_destino_id | number | ApiProperty({ description: 'ID da filial de destino' }); IsInt; Min(1) |
| lote_id? | number | ApiPropertyOptional({ description: 'ID do lote (opcional)' }); IsOptional; IsInt; Min(1) |
| quantidade | number | ApiProperty({ description: 'Quantidade transferida' }); IsInt; Min(1) |
| observacao? | string | ApiPropertyOptional({ description: 'Observação ou justificativa' }); IsOptional; IsString |

### AjusteLoteDto

Fonte: [src/notas-fiscais-entrada/dto/ajuste-lote.dto.ts](../src/notas-fiscais-entrada/dto/ajuste-lote.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| numero_lote? | string | IsString; IsOptional |
| data_fabricacao? | string | IsDateString; IsOptional |
| data_validade? | string | IsDateString; IsOptional |
| quantidade? | number | IsNumber; IsPositive; IsOptional |
| custo_unitario? | number | IsNumber; Min(0); IsOptional |

### CreateLoteDto

Fonte: [src/notas-fiscais-entrada/dto/create-item-entrada.dto.ts](../src/notas-fiscais-entrada/dto/create-item-entrada.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| numero_lote | string | IsString; IsNotEmpty |
| data_fabricacao? | string | IsDateString; IsOptional |
| data_validade | string | IsDateString; IsNotEmpty |

### CreateItemEntradaDto

Fonte: [src/notas-fiscais-entrada/dto/create-item-entrada.dto.ts](../src/notas-fiscais-entrada/dto/create-item-entrada.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| produto_id | number | IsInt; IsNotEmpty |
| quantidade | number | IsNumber; IsPositive |
| custo_unitario | number | IsNumber; Min(0) |
| lote_id? | number | IsInt; IsOptional |
| lote? | CreateLoteDto | IsOptional; ValidateNested; Type(() => CreateLoteDto) |

### CreateLoteDto

Fonte: [src/notas-fiscais-entrada/dto/create-nota-fiscal-entrada.dto.ts](../src/notas-fiscais-entrada/dto/create-nota-fiscal-entrada.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| numero_lote | string | IsString; IsNotEmpty |
| data_fabricacao? | string | IsDateString; IsOptional |
| data_validade | string | IsDateString; IsNotEmpty |

### CreateItemEntradaDto

Fonte: [src/notas-fiscais-entrada/dto/create-nota-fiscal-entrada.dto.ts](../src/notas-fiscais-entrada/dto/create-nota-fiscal-entrada.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| produto_id | number | IsNumber; IsNotEmpty |
| quantidade | number | IsNumber; IsNotEmpty |
| custo_unitario | number | IsNumber; IsNotEmpty |
| lote_id? | number | IsNumber; IsOptional |
| lote? | CreateLoteDto | IsOptional; ValidateNested; Type(() => CreateLoteDto) |

### CreateNotaFiscalEntradaDto

Fonte: [src/notas-fiscais-entrada/dto/create-nota-fiscal-entrada.dto.ts](../src/notas-fiscais-entrada/dto/create-nota-fiscal-entrada.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| fornecedor_id | number | IsNumber; IsNotEmpty |
| usuario_id | number | IsNumber; IsNotEmpty |
| filial_id? | number | IsNumber; IsOptional |
| numero_nf | string | IsString; IsNotEmpty |
| data_emissao | string | IsDateString; IsNotEmpty |
| data_recebimento? | string | IsDateString; IsOptional |
| total | number | IsNumber; IsNotEmpty |
| status? | string | IsString; IsOptional |
| itens | CreateItemEntradaDto[] | IsArray; ValidateNested({ each: true }); Type(() => CreateItemEntradaDto) |

### EstornoNotaFiscalDto

Fonte: [src/notas-fiscais-entrada/dto/estorno-nota-fiscal.dto.ts](../src/notas-fiscais-entrada/dto/estorno-nota-fiscal.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| motivo | string | IsString; IsNotEmpty |

### ItemCheckoutDto

Fonte: [src/pedidos/dto/create-checkout.dto.ts](../src/pedidos/dto/create-checkout.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| produto_id | number | IsInt |
| lote_id? | number | IsOptional; IsInt |
| quantidade | number | IsNumber; IsPositive |
| preco_unitario | number | IsNumber; IsPositive |

### CreateCheckoutDto

Fonte: [src/pedidos/dto/create-checkout.dto.ts](../src/pedidos/dto/create-checkout.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| cliente_id? | number | IsOptional; IsInt |
| filial_id | number | IsInt |
| itens | ItemCheckoutDto[] | IsArray; ValidateNested({ each: true }); Type(() => ItemCheckoutDto) |

### CreateReservaDto

Fonte: [src/pedidos/dto/create-reserva.dto.ts](../src/pedidos/dto/create-reserva.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| filial_id | number | IsInt; IsNotEmpty |
| cliente_id? | number | IsInt; IsOptional |
| minutos_expiracao? | number | IsInt; IsOptional |
| itens | ItemCheckoutDto[] | IsArray; ValidateNested({ each: true }); Type(() => ItemCheckoutDto) |

### CreatePerfilDto

Fonte: [src/perfis/dto/create-perfil.dto.ts](../src/perfis/dto/create-perfil.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| nome | string | IsString; IsNotEmpty({ message: 'O nome do perfil é obrigatório' }) |
| permissoes | Record<string, any> | IsObject({ message: 'As permissões devem ser um objeto JSON válido' }); IsNotEmpty({ message: 'As permissões são obrigatórias' }) |

### BuscaCodigoBarrasDto

Fonte: [src/produtos/dto/busca-codigo-barras.dto.ts](../src/produtos/dto/busca-codigo-barras.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| filial_id? | number | ApiPropertyOptional({ description: 'ID da filial para filtrar o saldo disponível' }); IsOptional; Type(() => Number); IsInt; Min(1) |

### CreateProdutoDto

Fonte: [src/produtos/dto/create-produto.dto.ts](../src/produtos/dto/create-produto.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| categoria_id | number | IsInt; IsNotEmpty |
| nome | string | IsString; IsNotEmpty; MaxLength(150) |
| marca? | string | IsString; IsOptional; MaxLength(100) |
| codigo_barras? | string | IsString; IsOptional; MaxLength(100) |
| estoque_minimo? | number | IsNumber; IsOptional; Min(0); Type(() => Number) |
| preco_venda | number | IsNumber; IsNotEmpty; Min(0); Type(() => Number) |
| custo_medio? | number | IsNumber; IsOptional; Min(0); Type(() => Number) |

### FiltroProdutosDto

Fonte: [src/produtos/dto/filtro-produtos.dto.ts](../src/produtos/dto/filtro-produtos.dto.ts). extends PaginacaoFiltroDto

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| categoria_id? | number | IsOptional; Type(() => Number); IsInt; Min(1) |
| apenas_estoque_baixo? | boolean | IsOptional; Type(() => Boolean); IsBoolean |
| data_inicio? | string | IsOptional |
| data_fim? | string | IsOptional |

### UpdateProdutoDto

Fonte: [src/produtos/dto/update-produto.dto.ts](../src/produtos/dto/update-produto.dto.ts). extends PartialType(CreateProdutoDto)

| Campo | Tipo | Validação/decoradores |
|---|---|---|

### RelatorioMovimentacoesDto

Fonte: [src/relatorios/dto/relatorio-movimentacoes.dto.ts](../src/relatorios/dto/relatorio-movimentacoes.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| data_inicio? | Date | ApiPropertyOptional({ description: 'Data de início (YYYY-MM-DD)' }); IsOptional; Type(() => Date); IsDate |
| data_fim? | Date | ApiPropertyOptional({ description: 'Data de fim (YYYY-MM-DD)' }); IsOptional; Type(() => Date); IsDate |
| filial_id? | number | ApiPropertyOptional({ description: 'Filtrar por filial' }); IsOptional; Type(() => Number); IsInt |
| produto_id? | number | ApiPropertyOptional({ description: 'Filtrar por produto' }); IsOptional; Type(() => Number); IsInt |

### SaldosEstoqueFilterDto

Fonte: [src/saldos-estoque/dto/saldos-estoque-filter.dto.ts](../src/saldos-estoque/dto/saldos-estoque-filter.dto.ts). extends PaginacaoFiltroDto

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| filial_id? | number | ApiPropertyOptional({ description: 'ID da filial para filtragem' }); IsOptional; Type(() => Number); IsInt |
| produto_id? | number | ApiPropertyOptional({ description: 'ID do produto para filtragem' }); IsOptional; Type(() => Number); IsInt |

### CreateUserDto

Fonte: [src/usuario/dto/create-user.dto.ts](../src/usuario/dto/create-user.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| nome | string | IsString; IsNotEmpty |
| email | string | IsEmail; IsNotEmpty |
| senha | string | IsString; MinLength(6) |
| perfil_id | number | IsNumber; IsNotEmpty |
| telefone? | string | IsString; IsOptional |

### UpdateUserDto

Fonte: [src/usuario/dto/update-user.dto.ts](../src/usuario/dto/update-user.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| nome? | string | IsString; IsOptional |
| email? | string | IsEmail({}, { message: 'E-mail inválido.' }); IsOptional |
| senha? | string | IsString; MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }); IsOptional |
| perfil_id? | number | IsInt; IsOptional |
| telefone? | string | IsString; IsOptional |
| ativo? | boolean | IsBoolean; IsOptional |


## Serviços e métodos internos

Estes métodos não são todos rotas públicas. A tabela de operações acima é a fonte para o que está exposto por HTTP.

| Serviço | Métodos e linhas |
|---|---|
| [src/alertas/alertas.service.ts](../src/alertas/alertas.service.ts) | `verificarEstoqueMinimo` (linha 9); `verificarLotesVencimento` (linha 37); `obterDashboardAlertas` (linha 73) |
| [src/auditoria/auditoria.service.ts](../src/auditoria/auditoria.service.ts) | `registrarLog` (linha 20); `listarHistorico` (linha 39) |
| [src/auth/auth.service.ts](../src/auth/auth.service.ts) | `login` (linha 20); `authenticateTwoFactor` (linha 70); `logout` (linha 110); `getProfile` (linha 115) |
| [src/auth/password-recovery.service.ts](../src/auth/password-recovery.service.ts) | `request` (linha 20); `reset` (linha 68) |
| [src/auth/two-factor.service.ts](../src/auth/two-factor.service.ts) | `generateTwoFactorSecret` (linha 10); `verifyTwoFactorCode` (linha 29); `enableTwoFactor` (linha 38) |
| [src/busca-global/busca-global.service.ts](../src/busca-global/busca-global.service.ts) | `buscar` (linha 9) |
| [src/categorias/categorias.service.ts](../src/categorias/categorias.service.ts) | `criar` (linha 11); `listar` (linha 24); `buscarPorId` (linha 30); `atualizar` (linha 42); `remover` (linha 58) |
| [src/chamados/chamados.service.ts](../src/chamados/chamados.service.ts) | `criar` (linha 14); `listarTodos` (linha 38); `atualizarStatus` (linha 44); `buscarPorId` (linha 69) |
| [src/clientes/clientes.service.ts](../src/clientes/clientes.service.ts) | `create` (linha 18); `findAll` (linha 38); `findOne` (linha 87); `update` (linha 111); `remove` (linha 129) |
| [src/common/services/excel.service.ts](../src/common/services/excel.service.ts) | `gerarExcel` (linha 13) |
| [src/common/services/pdf.service.ts](../src/common/services/pdf.service.ts) | `gerarBuffer` (linha 42); `gerarRelatorioTabela` (linha 53) |
| [src/dashboards/dashboard.service.ts](../src/dashboards/dashboard.service.ts) | `notificarMovimentacao` (linha 21); `obterStreamRealTime` (linha 28); `obterStockPorCategoria` (linha 35); `obterMovimentacoesSeteDias` (linha 76); `obterProdutosCriticos` (linha 132) |
| [src/filiais/filiais.service.ts](../src/filiais/filiais.service.ts) | `create` (linha 14); `findAll` (linha 22); `findOne` (linha 34); `update` (linha 53); `remove` (linha 67) |
| [src/fornecedores/fornecedores.service.ts](../src/fornecedores/fornecedores.service.ts) | `criar` (linha 14); `listar` (linha 28); `buscarPorId` (linha 34); `atualizar` (linha 46); `remover` (linha 65) |
| [src/integracoes/integracoes.service.ts](../src/integracoes/integracoes.service.ts) | `buscarPorCep` (linha 21); `obterCoordenadas` (linha 56); `calcularDistanciaEmKm` (linha 82); `calcularDistanciaEntreCeps` (linha 96) |
| [src/mail/mail.service.ts](../src/mail/mail.service.ts) | `enviarEmail` (linha 31) |
| [src/movimentacoes/movimentacoes.service.ts](../src/movimentacoes/movimentacoes.service.ts) | `registrarMovimentacao` (linha 17); `transferirSaldo` (linha 127); `listarHistorico` (linha 255) |
| [src/notas-fiscais-entrada/notas-fiscais-entrada.service.ts](../src/notas-fiscais-entrada/notas-fiscais-entrada.service.ts) | `criar` (linha 15); `listar` (linha 161); `buscarPorId` (linha 177); `estornar` (linha 199); `ajustarLote` (linha 263) |
| [src/notificacoes/notificacoes.service.ts](../src/notificacoes/notificacoes.service.ts) | `dispararNotificacoesDiarias` (linha 16); `listarNotificacoes` (linha 49); `marcarComoLida` (linha 56) |
| [src/pedidos/pedidos.service.ts](../src/pedidos/pedidos.service.ts) | `processarCheckout` (linha 12); `criarReserva` (linha 95); `confirmarReserva` (linha 168); `cancelarPedido` (linha 249); `limparReservasExpiradas` (linha 334); `listarTodos` (linha 386); `buscarPorId` (linha 402) |
| [src/perfis/perfis.service.ts](../src/perfis/perfis.service.ts) | `create` (linha 15); `findAll` (linha 34); `findOne` (linha 44) |
| [src/prisma/prisma.service.ts](../src/prisma/prisma.service.ts) | `onModuleInit` (linha 30); `onModuleDestroy` (linha 34) |
| [src/produtos/produtos.service.ts](../src/produtos/produtos.service.ts) | `criar` (linha 17); `listar` (linha 35); `buscarPorId` (linha 108); `atualizar` (linha 124); `remover` (linha 145); `buscarPorCodigoBarras` (linha 162) |
| [src/relatorios/relatorios.service.ts](../src/relatorios/relatorios.service.ts) | `gerarPdfMovimentacoes` (linha 13) |
| [src/saldos-estoque/saldos-estoque.service.ts](../src/saldos-estoque/saldos-estoque.service.ts) | `findAll` (linha 9); `findOne` (linha 70) |
| [src/usuario/users.service.ts](../src/usuario/users.service.ts) | `create` (linha 18); `update` (linha 56); `toggleStatus` (linha 111); `findByEmail` (linha 126); `revokeSessions` (linha 155); `findById` (linha 162); `findOne` (linha 192); `findAll` (linha 196); `setTwoFactorSecret` (linha 215); `enableTwoFactor` (linha 224); `findByIdWithSecrets` (linha 233) |
