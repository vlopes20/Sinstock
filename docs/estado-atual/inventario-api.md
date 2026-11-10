# Inventário das rotas da API

Levantamento estático dos controllers e DTOs em 05/11/2026. Guards indicados pelo código, sem presumir que Swagger documenta toda a validação.

| Método | Rota | Proteção | Handler | Entrada | Fonte |
|---|---|---|---|---|---|
| GET | `/alertas` | UseGuards(JwtAuthGuard, PermissionsGuard) | obterDashboard | Query: ConsultaAlertasDto | [src/alertas/alertas.controller.ts:19](../../src/alertas/alertas.controller.ts#L19) |
| GET | `/alertas/estoque-baixo` | UseGuards(JwtAuthGuard, PermissionsGuard) | obterEstoqueBaixo | Query: ConsultaAlertasDto | [src/alertas/alertas.controller.ts:27](../../src/alertas/alertas.controller.ts#L27) |
| GET | `/alertas/vencimentos` | UseGuards(JwtAuthGuard, PermissionsGuard) | obterVencimentos | Query: ConsultaAlertasDto | [src/alertas/alertas.controller.ts:33](../../src/alertas/alertas.controller.ts#L33) |
| GET | `/auditoria/estoque/exportar-excel` | Roles(1); UseGuards(JwtAuthGuard, RolesGuard) | exportarExcelStream | Query: ConsultaAuditoriaDto | [src/auditoria/auditoria.controller.ts:31](../../src/auditoria/auditoria.controller.ts#L31) |
| GET | `/auditoria/estoque/exportar-pdf` | Roles(1); UseGuards(JwtAuthGuard, RolesGuard) | exportarPdfStream | Query: ConsultaAuditoriaDto | [src/auditoria/auditoria.controller.ts:80](../../src/auditoria/auditoria.controller.ts#L80) |
| PATCH | `/auth/password` | UseGuards(JwtAuthGuard) | changePassword | Request: RequestWithUser; Body: ChangePasswordDto | [src/auth/auth.controller.ts:46](../../src/auth/auth.controller.ts#L46) |
| POST | `/auth/2fa/email/setup` | UseGuards(JwtAuthGuard) | setupEmail | Request: RequestWithUser; Body: ConfirmPasswordDto | [src/auth/auth.controller.ts:55](../../src/auth/auth.controller.ts#L55) |
| POST | `/auth/2fa/email/enable` | UseGuards(JwtAuthGuard) | enableEmail | Request: RequestWithUser; Body: EmailSetupDto | [src/auth/auth.controller.ts:62](../../src/auth/auth.controller.ts#L62) |
| POST | `/auth/2fa/email/disable-code` | UseGuards(JwtAuthGuard) | disableCode | Request: RequestWithUser; Body: ConfirmPasswordDto | [src/auth/auth.controller.ts:69](../../src/auth/auth.controller.ts#L69) |
| POST | `/auth/2fa/disable` | UseGuards(JwtAuthGuard) | disable | Request: RequestWithUser; Body: DisableTwoFactorDto | [src/auth/auth.controller.ts:79](../../src/auth/auth.controller.ts#L79) |
| POST | `/auth/2fa/email/resend` | UseGuards(PreAuthGuard) | resend | Request: RequestWithUser | [src/auth/auth.controller.ts:86](../../src/auth/auth.controller.ts#L86) |
| POST | `/auth/login` | Pública (sem guard JWT) | login | Body: LoginDto | [src/auth/auth.controller.ts:93](../../src/auth/auth.controller.ts#L93) |
| GET | `/auth/me` | UseGuards(JwtAuthGuard) | me | Request: RequestWithUser | [src/auth/auth.controller.ts:99](../../src/auth/auth.controller.ts#L99) |
| POST | `/auth/logout` | UseGuards(JwtAuthGuard) | logout | Request: RequestWithUser | [src/auth/auth.controller.ts:105](../../src/auth/auth.controller.ts#L105) |
| POST | `/auth/forgot-password` | Pública (sem guard JWT) | forgotPassword | Body: ForgotPasswordDto | [src/auth/auth.controller.ts:111](../../src/auth/auth.controller.ts#L111) |
| POST | `/auth/reset-password` | Pública (sem guard JWT) | resetPassword | Body: ResetPasswordDto | [src/auth/auth.controller.ts:117](../../src/auth/auth.controller.ts#L117) |
| POST | `/auth/2fa/generate` | UseGuards(JwtAuthGuard) | generate2FA | Request: RequestWithUser | [src/auth/auth.controller.ts:123](../../src/auth/auth.controller.ts#L123) |
| POST | `/auth/2fa/enable` | UseGuards(JwtAuthGuard) | enable2FA | Request: RequestWithUser; Body: TwoFactorCodeDto | [src/auth/auth.controller.ts:132](../../src/auth/auth.controller.ts#L132) |
| POST | `/auth/2fa/authenticate` | UseGuards(PreAuthGuard) | authenticate2FA | Request: RequestWithUser; Body: TwoFactorCodeDto | [src/auth/auth.controller.ts:142](../../src/auth/auth.controller.ts#L142) |
| GET | `/busca-global` | UseGuards(JwtAuthGuard, PermissionsGuard) | buscar | Query: BuscaGlobalDto | [src/busca-global/busca-global.controller.ts:19](../../src/busca-global/busca-global.controller.ts#L19) |
| POST | `/categorias` | UseGuards(JwtAuthGuard, PermissionsGuard) | criar | Body: CreateCategoriaDto | [src/categorias/categorias.controller.ts:30](../../src/categorias/categorias.controller.ts#L30) |
| GET | `/categorias` | UseGuards(JwtAuthGuard, PermissionsGuard) | listar |  | [src/categorias/categorias.controller.ts:36](../../src/categorias/categorias.controller.ts#L36) |
| GET | `/categorias/:id` | UseGuards(JwtAuthGuard, PermissionsGuard) | buscarPorId | Param: number | [src/categorias/categorias.controller.ts:42](../../src/categorias/categorias.controller.ts#L42) |
| PATCH | `/categorias/:id` | UseGuards(JwtAuthGuard, PermissionsGuard) | atualizar | Param: number; Body: UpdateCategoriaDto | [src/categorias/categorias.controller.ts:48](../../src/categorias/categorias.controller.ts#L48) |
| DELETE | `/categorias/:id` | UseGuards(JwtAuthGuard, PermissionsGuard) | remover | Param: number | [src/categorias/categorias.controller.ts:57](../../src/categorias/categorias.controller.ts#L57) |
| POST | `/chamados` | UseGuards(JwtAuthGuard, PermissionsGuard) | criar | Body: CriarChamadoDto; Req: UserRequest | [src/chamados/chamados.controller.ts:42](../../src/chamados/chamados.controller.ts#L42) |
| GET | `/chamados` | UseGuards(JwtAuthGuard, PermissionsGuard) | listar | Query: FiltroChamadosDto; Req: UserRequest | [src/chamados/chamados.controller.ts:46](../../src/chamados/chamados.controller.ts#L46) |
| GET | `/chamados/faq` | UseGuards(JwtAuthGuard, PermissionsGuard) | faq | Query: FiltroFaqDto; Req: UserRequest | [src/chamados/chamados.controller.ts:50](../../src/chamados/chamados.controller.ts#L50) |
| POST | `/chamados/faq` | UseGuards(JwtAuthGuard, PermissionsGuard); UseGuards(RolesGuard); Roles(1) | createFaq | Body: FaqDto | [src/chamados/chamados.controller.ts:54](../../src/chamados/chamados.controller.ts#L54) |
| PATCH | `/chamados/faq/:id` | UseGuards(JwtAuthGuard, PermissionsGuard); UseGuards(RolesGuard); Roles(1) | updateFaq | Param: number; Body: FaqDto | [src/chamados/chamados.controller.ts:60](../../src/chamados/chamados.controller.ts#L60) |
| DELETE | `/chamados/faq/:id` | UseGuards(JwtAuthGuard, PermissionsGuard); UseGuards(RolesGuard); Roles(1) | deleteFaq | Param: number | [src/chamados/chamados.controller.ts:66](../../src/chamados/chamados.controller.ts#L66) |
| GET | `/chamados/anexos/:id` | UseGuards(JwtAuthGuard, PermissionsGuard) | attachment | Param: string; Req: UserRequest; Res: Response | [src/chamados/chamados.controller.ts:72](../../src/chamados/chamados.controller.ts#L72) |
| GET | `/chamados/:id` | UseGuards(JwtAuthGuard, PermissionsGuard) | detalhe | Param: number; Req: UserRequest | [src/chamados/chamados.controller.ts:89](../../src/chamados/chamados.controller.ts#L89) |
| PATCH | `/chamados/:id/status` | UseGuards(JwtAuthGuard, PermissionsGuard) | status | Param: number; Body: StatusChamadoDto; Req: UserRequest | [src/chamados/chamados.controller.ts:93](../../src/chamados/chamados.controller.ts#L93) |
| POST | `/chamados/:id/mensagens` | UseGuards(JwtAuthGuard, PermissionsGuard) | mensagem | Param: number; Body: MensagemChamadoDto; Req: UserRequest | [src/chamados/chamados.controller.ts:101](../../src/chamados/chamados.controller.ts#L101) |
| POST | `/chamados/:id/anexos` | UseGuards(JwtAuthGuard, PermissionsGuard) | upload | Param: number; UploadedFile: { originalname: string; buffer: Buffer }; Req: UserRequest | [src/chamados/chamados.controller.ts:109](../../src/chamados/chamados.controller.ts#L109) |
| DELETE | `/clientes/:id` | UseGuards(JwtAuthGuard, PermissionsGuard) | remove | Param: number | [src/clientes/clientes.controller.ts:32](../../src/clientes/clientes.controller.ts#L32) |
| POST | `/clientes` | UseGuards(JwtAuthGuard, PermissionsGuard) | create | Body: CreateClienteDto | [src/clientes/clientes.controller.ts:37](../../src/clientes/clientes.controller.ts#L37) |
| GET | `/clientes` | UseGuards(JwtAuthGuard, PermissionsGuard) | findAll | Query: ClienteFilterDto | [src/clientes/clientes.controller.ts:43](../../src/clientes/clientes.controller.ts#L43) |
| GET | `/clientes/:id` | UseGuards(JwtAuthGuard, PermissionsGuard) | findOne | Param: number | [src/clientes/clientes.controller.ts:51](../../src/clientes/clientes.controller.ts#L51) |
| PATCH | `/clientes/:id` | UseGuards(JwtAuthGuard, PermissionsGuard) | update | Param: number; Body: UpdateClienteDto | [src/clientes/clientes.controller.ts:59](../../src/clientes/clientes.controller.ts#L59) |
| GET | `/configuracoes/publicas` | UseGuards(JwtAuthGuard) | publicSettings |  | [src/configuracoes/configuracoes.controller.ts:16](../../src/configuracoes/configuracoes.controller.ts#L16) |
| GET | `/configuracoes/preferencias` | UseGuards(JwtAuthGuard) | preferences | Req: UserRequest | [src/configuracoes/configuracoes.controller.ts:20](../../src/configuracoes/configuracoes.controller.ts#L20) |
| PATCH | `/configuracoes/preferencias` | UseGuards(JwtAuthGuard) | savePreferences | Req: UserRequest; Body: PreferencesDto | [src/configuracoes/configuracoes.controller.ts:24](../../src/configuracoes/configuracoes.controller.ts#L24) |
| PATCH | `/configuracoes/empresa` | UseGuards(JwtAuthGuard); UseGuards(RolesGuard); Roles(1) | company | Req: UserRequest; Body: CompanySettingsDto | [src/configuracoes/configuracoes.controller.ts:28](../../src/configuracoes/configuracoes.controller.ts#L28) |
| PATCH | `/configuracoes/estoque` | UseGuards(JwtAuthGuard); UseGuards(RolesGuard); Roles(1) | stock | Req: UserRequest; Body: StockSettingsDto | [src/configuracoes/configuracoes.controller.ts:34](../../src/configuracoes/configuracoes.controller.ts#L34) |
| GET | `/dashboard/resumo` | UseGuards(JwtAuthGuard, PermissionsGuard) | resumo | Query: FiltroPedidosDto | [src/dashboards/dashboard.controller.ts:29](../../src/dashboards/dashboard.controller.ts#L29) |
| GET | `/dashboard/graficos/stock-categoria` | UseGuards(JwtAuthGuard, PermissionsGuard) | getStockPorCategoria | Query: FilialQueryDto | [src/dashboards/dashboard.controller.ts:34](../../src/dashboards/dashboard.controller.ts#L34) |
| GET | `/dashboard/graficos/movimentacoes-semanal` | UseGuards(JwtAuthGuard, PermissionsGuard) | getMovimentacoesSemanal | Query: FilialQueryDto | [src/dashboards/dashboard.controller.ts:42](../../src/dashboards/dashboard.controller.ts#L42) |
| GET | `/dashboard/graficos/produtos-criticos` | UseGuards(JwtAuthGuard, PermissionsGuard) | getProdutosCriticos | Query: FilialQueryDto | [src/dashboards/dashboard.controller.ts:51](../../src/dashboards/dashboard.controller.ts#L51) |
| GET (SSE) | `/dashboard/realtime-stream` | UseGuards(JwtAuthGuard, PermissionsGuard) | streamStockEvents | Req: {
      user: { userId: number; version: number; expiresAt: number };
    } | [src/dashboards/dashboard.controller.ts:59](../../src/dashboards/dashboard.controller.ts#L59) |
| POST | `/filiais` | UseGuards(JwtAuthGuard, PermissionsGuard) | create | Body: CreateFilialDto | [src/filiais/filiais.controller.ts:27](../../src/filiais/filiais.controller.ts#L27) |
| GET | `/filiais` | UseGuards(JwtAuthGuard, PermissionsGuard) | findAll |  | [src/filiais/filiais.controller.ts:32](../../src/filiais/filiais.controller.ts#L32) |
| GET | `/filiais/:id` | UseGuards(JwtAuthGuard, PermissionsGuard) | findOne | Param: number | [src/filiais/filiais.controller.ts:37](../../src/filiais/filiais.controller.ts#L37) |
| PATCH | `/filiais/:id` | UseGuards(JwtAuthGuard, PermissionsGuard) | update | Param: number; Body: UpdateFilialDto | [src/filiais/filiais.controller.ts:42](../../src/filiais/filiais.controller.ts#L42) |
| DELETE | `/filiais/:id` | UseGuards(JwtAuthGuard, PermissionsGuard) | remove | Param: number | [src/filiais/filiais.controller.ts:47](../../src/filiais/filiais.controller.ts#L47) |
| POST | `/fornecedores` | UseGuards(JwtAuthGuard, PermissionsGuard) | criar | Body: CreateFornecedorDto | [src/fornecedores/fornecedores.controller.ts:33](../../src/fornecedores/fornecedores.controller.ts#L33) |
| GET | `/fornecedores` | UseGuards(JwtAuthGuard, PermissionsGuard) | listar | Query: FiltroFornecedoresDto | [src/fornecedores/fornecedores.controller.ts:39](../../src/fornecedores/fornecedores.controller.ts#L39) |
| GET | `/fornecedores/resumo` | UseGuards(JwtAuthGuard, PermissionsGuard) | resumo |  | [src/fornecedores/fornecedores.controller.ts:45](../../src/fornecedores/fornecedores.controller.ts#L45) |
| GET | `/fornecedores/proximos` | UseGuards(JwtAuthGuard, PermissionsGuard) | proximos | Query: ProximosFornecedoresDto | [src/fornecedores/fornecedores.controller.ts:50](../../src/fornecedores/fornecedores.controller.ts#L50) |
| GET | `/fornecedores/:id` | UseGuards(JwtAuthGuard, PermissionsGuard) | buscarPorId | Param: number | [src/fornecedores/fornecedores.controller.ts:55](../../src/fornecedores/fornecedores.controller.ts#L55) |
| PATCH | `/fornecedores/:id` | UseGuards(JwtAuthGuard, PermissionsGuard) | atualizar | Param: number; Body: UpdateFornecedorDto | [src/fornecedores/fornecedores.controller.ts:61](../../src/fornecedores/fornecedores.controller.ts#L61) |
| DELETE | `/fornecedores/:id` | UseGuards(JwtAuthGuard, PermissionsGuard) | remover | Param: number | [src/fornecedores/fornecedores.controller.ts:70](../../src/fornecedores/fornecedores.controller.ts#L70) |
| GET | `/integracoes/cep/:cep` | UseGuards(JwtAuthGuard, PermissionsGuard) | buscarPorCep | Param: ConsultaCepDto | [src/integracoes/integracoes.controller.ts:21](../../src/integracoes/integracoes.controller.ts#L21) |
| GET | `/integracoes/coordenadas` | UseGuards(JwtAuthGuard, PermissionsGuard) | obterCoordenadas | Query: ConsultaCoordenadasDto | [src/integracoes/integracoes.controller.ts:27](../../src/integracoes/integracoes.controller.ts#L27) |
| GET | `/integracoes/distancia-ceps` | UseGuards(JwtAuthGuard, PermissionsGuard) | calcularDistanciaCeps | Query: ConsultaDistanciaCepsDto | [src/integracoes/integracoes.controller.ts:39](../../src/integracoes/integracoes.controller.ts#L39) |
| POST | `/movimentacoes` | UseGuards(JwtAuthGuard, PermissionsGuard) | registrarMovimentacao | Body: CreateMovimentacaoDto; Request: RequestWithUser | [src/movimentacoes/movimentacoes.controller.ts:42](../../src/movimentacoes/movimentacoes.controller.ts#L42) |
| POST | `/movimentacoes/transferencia` | UseGuards(JwtAuthGuard, PermissionsGuard) | transferirSaldo | Body: CreateTransferenciaDto; Request: RequestWithUser | [src/movimentacoes/movimentacoes.controller.ts:54](../../src/movimentacoes/movimentacoes.controller.ts#L54) |
| GET | `/movimentacoes/historico` | UseGuards(JwtAuthGuard, PermissionsGuard) | listarHistorico | Query: HistoricoMovimentacoesDto | [src/movimentacoes/movimentacoes.controller.ts:66](../../src/movimentacoes/movimentacoes.controller.ts#L66) |
| POST | `/notas-fiscais-entrada` | UseGuards(JwtAuthGuard, PermissionsGuard) | criar | Body: CreateNotaFiscalEntradaDto; Req: { user: { userId: number } } | [src/notas-fiscais-entrada/notas-fiscais-entrada.controller.ts:33](../../src/notas-fiscais-entrada/notas-fiscais-entrada.controller.ts#L33) |
| GET | `/notas-fiscais-entrada` | UseGuards(JwtAuthGuard, PermissionsGuard) | listar | Query: FiltroNotasDto | [src/notas-fiscais-entrada/notas-fiscais-entrada.controller.ts:42](../../src/notas-fiscais-entrada/notas-fiscais-entrada.controller.ts#L42) |
| GET | `/notas-fiscais-entrada/:id` | UseGuards(JwtAuthGuard, PermissionsGuard) | buscarPorId | Param: number | [src/notas-fiscais-entrada/notas-fiscais-entrada.controller.ts:48](../../src/notas-fiscais-entrada/notas-fiscais-entrada.controller.ts#L48) |
| PATCH | `/notas-fiscais-entrada/:id/estorno` | UseGuards(JwtAuthGuard, PermissionsGuard) | estornar | Param: number; Body: EstornoNotaFiscalDto; Req: { user: { userId: number } } | [src/notas-fiscais-entrada/notas-fiscais-entrada.controller.ts:56](../../src/notas-fiscais-entrada/notas-fiscais-entrada.controller.ts#L56) |
| PATCH | `/notas-fiscais-entrada/:id/receber` | UseGuards(JwtAuthGuard, PermissionsGuard) | receber | Param: number; Req: { user: { userId: number } } | [src/notas-fiscais-entrada/notas-fiscais-entrada.controller.ts:66](../../src/notas-fiscais-entrada/notas-fiscais-entrada.controller.ts#L66) |
| PATCH | `/notas-fiscais-entrada/lotes/:loteId` | UseGuards(JwtAuthGuard, PermissionsGuard) | ajustarLote | Param: number; Body: AjusteLoteDto; Req: { user: { userId: number } } | [src/notas-fiscais-entrada/notas-fiscais-entrada.controller.ts:74](../../src/notas-fiscais-entrada/notas-fiscais-entrada.controller.ts#L74) |
| GET | `/notificacoes` | UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard) | listar | Query: FiltroNotificacoesDto; Req: { user: { userId: number } } | [src/notificacoes/notificacoes.controller.ts:31](../../src/notificacoes/notificacoes.controller.ts#L31) |
| PATCH | `/notificacoes/:id/ler` | UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard) | marcarComoLida | Param: number; Req: { user: { userId: number } } | [src/notificacoes/notificacoes.controller.ts:40](../../src/notificacoes/notificacoes.controller.ts#L40) |
| POST | `/notificacoes/executar-varredura` | UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard); Roles(1) | executarVarredura |  | [src/notificacoes/notificacoes.controller.ts:49](../../src/notificacoes/notificacoes.controller.ts#L49) |
| POST | `/pedidos/checkout` | UseGuards(JwtAuthGuard, PermissionsGuard) | realizarCheckout | Body: CreateCheckoutDto; Req: RequestWithUser | [src/pedidos/pedidos.controller.ts:38](../../src/pedidos/pedidos.controller.ts#L38) |
| POST | `/pedidos/reservar` | UseGuards(JwtAuthGuard, PermissionsGuard) | criarReserva | Body: CreateReservaDto; Req: RequestWithUser | [src/pedidos/pedidos.controller.ts:46](../../src/pedidos/pedidos.controller.ts#L46) |
| PATCH | `/pedidos/:id/confirmar` | UseGuards(JwtAuthGuard, PermissionsGuard) | confirmarReserva | Param: number; Req: RequestWithUser | [src/pedidos/pedidos.controller.ts:51](../../src/pedidos/pedidos.controller.ts#L51) |
| GET | `/pedidos` | UseGuards(JwtAuthGuard, PermissionsGuard) | listarTodos | Query: FiltroPedidosDto | [src/pedidos/pedidos.controller.ts:59](../../src/pedidos/pedidos.controller.ts#L59) |
| GET | `/pedidos/:id` | UseGuards(JwtAuthGuard, PermissionsGuard) | buscarPorId | Param: number | [src/pedidos/pedidos.controller.ts:64](../../src/pedidos/pedidos.controller.ts#L64) |
| GET | `/pedidos/resumo/periodo` | UseGuards(JwtAuthGuard, PermissionsGuard) | resumo | Query: FiltroPedidosDto | [src/pedidos/pedidos.controller.ts:69](../../src/pedidos/pedidos.controller.ts#L69) |
| PATCH | `/pedidos/:id/atendimento` | UseGuards(JwtAuthGuard, PermissionsGuard) | atendimento | Param: number; Body: UpdateAtendimentoDto; Req: RequestWithUser | [src/pedidos/pedidos.controller.ts:74](../../src/pedidos/pedidos.controller.ts#L74) |
| PATCH | `/pedidos/:id/cancelar` | UseGuards(JwtAuthGuard, PermissionsGuard) | cancelarPedido | Param: number; Req: RequestWithUser | [src/pedidos/pedidos.controller.ts:87](../../src/pedidos/pedidos.controller.ts#L87) |
| POST | `/perfis` | UseGuards(JwtAuthGuard); UseGuards(RolesGuard); Roles(1) | create | Body: CreatePerfilDto | [src/perfis/perfis.controller.ts:22](../../src/perfis/perfis.controller.ts#L22) |
| GET | `/perfis` | UseGuards(JwtAuthGuard) | findAll |  | [src/perfis/perfis.controller.ts:29](../../src/perfis/perfis.controller.ts#L29) |
| GET | `/perfis/:id` | UseGuards(JwtAuthGuard); UseGuards(RolesGuard); Roles(1) | findOne | Param: number | [src/perfis/perfis.controller.ts:34](../../src/perfis/perfis.controller.ts#L34) |
| PATCH | `/perfis/:id` | UseGuards(JwtAuthGuard); UseGuards(RolesGuard); Roles(1) | update | Param: number; Body: CreatePerfilDto | [src/perfis/perfis.controller.ts:41](../../src/perfis/perfis.controller.ts#L41) |
| POST | `/produtos` | UseGuards(JwtAuthGuard, PermissionsGuard) | criar | Body: CreateProdutoDto | [src/produtos/produtos.controller.ts:33](../../src/produtos/produtos.controller.ts#L33) |
| GET | `/produtos` | UseGuards(JwtAuthGuard, PermissionsGuard) | listar | Query: FiltroProdutosDto | [src/produtos/produtos.controller.ts:39](../../src/produtos/produtos.controller.ts#L39) |
| GET | `/produtos/codigo-barras/:codigo` | UseGuards(JwtAuthGuard, PermissionsGuard) | buscarPorCodigoBarras | Param: string; Query: BuscaCodigoBarrasDto | [src/produtos/produtos.controller.ts:47](../../src/produtos/produtos.controller.ts#L47) |
| GET | `/produtos/resumo` | UseGuards(JwtAuthGuard, PermissionsGuard) | resumo |  | [src/produtos/produtos.controller.ts:56](../../src/produtos/produtos.controller.ts#L56) |
| GET | `/produtos/:id` | UseGuards(JwtAuthGuard, PermissionsGuard) | buscarPorId | Param: number | [src/produtos/produtos.controller.ts:61](../../src/produtos/produtos.controller.ts#L61) |
| PATCH | `/produtos/:id` | UseGuards(JwtAuthGuard, PermissionsGuard) | atualizar | Param: number; Body: UpdateProdutoDto | [src/produtos/produtos.controller.ts:67](../../src/produtos/produtos.controller.ts#L67) |
| DELETE | `/produtos/:id` | UseGuards(JwtAuthGuard, PermissionsGuard) | remover | Param: number | [src/produtos/produtos.controller.ts:76](../../src/produtos/produtos.controller.ts#L76) |
| GET | `/relatorios` | UseGuards(JwtAuthGuard, PermissionsGuard) | consultar | Query: ConsultaRelatorioDto | [src/relatorios/relatorios.controller.ts:20](../../src/relatorios/relatorios.controller.ts#L20) |
| GET | `/relatorios/exportar` | UseGuards(JwtAuthGuard, PermissionsGuard) | exportar | Query: ConsultaRelatorioDto; Res: Response | [src/relatorios/relatorios.controller.ts:24](../../src/relatorios/relatorios.controller.ts#L24) |
| GET | `/relatorios/movimentacoes/pdf` | UseGuards(JwtAuthGuard, PermissionsGuard) | legacyPdf | Query: RelatorioMovimentacoesDto; Res: Response | [src/relatorios/relatorios.controller.ts:29](../../src/relatorios/relatorios.controller.ts#L29) |
| GET | `/saldos-estoque` | UseGuards(JwtAuthGuard, PermissionsGuard) | findAll | Query: SaldosEstoqueFilterDto | [src/saldos-estoque/saldos-estoque.controller.ts:27](../../src/saldos-estoque/saldos-estoque.controller.ts#L27) |
| GET | `/saldos-estoque/:id` | UseGuards(JwtAuthGuard, PermissionsGuard) | findOne | Param: number | [src/saldos-estoque/saldos-estoque.controller.ts:40](../../src/saldos-estoque/saldos-estoque.controller.ts#L40) |
| GET | `/saldos-estoque/resumo/atual` | UseGuards(JwtAuthGuard, PermissionsGuard) | resumo | Query: FilialQueryDto | [src/saldos-estoque/saldos-estoque.controller.ts:46](../../src/saldos-estoque/saldos-estoque.controller.ts#L46) |
| POST | `/users` | UseGuards(JwtAuthGuard); UseGuards(RolesGuard); Roles(1) | create | Body: CreateUserDto | [src/usuario/users.controller.ts:24](../../src/usuario/users.controller.ts#L24) |
| GET | `/users/profile` | UseGuards(JwtAuthGuard) | getProfile | CurrentUser: any | [src/usuario/users.controller.ts:31](../../src/usuario/users.controller.ts#L31) |
| GET | `/users` | UseGuards(JwtAuthGuard); UseGuards(RolesGuard); Roles(1) | findAll |  | [src/usuario/users.controller.ts:36](../../src/usuario/users.controller.ts#L36) |
| GET | `/users/:id` | UseGuards(JwtAuthGuard); UseGuards(RolesGuard); Roles(1) | findOne | Param: number | [src/usuario/users.controller.ts:43](../../src/usuario/users.controller.ts#L43) |
| PATCH | `/users/:id` | UseGuards(JwtAuthGuard); UseGuards(RolesGuard); Roles(1) | update | Param: number; Body: UpdateUserDto | [src/usuario/users.controller.ts:50](../../src/usuario/users.controller.ts#L50) |
| PATCH | `/users/:id/status` | UseGuards(JwtAuthGuard); UseGuards(RolesGuard); Roles(1) | toggleStatus | Param: number | [src/usuario/users.controller.ts:60](../../src/usuario/users.controller.ts#L60) |

## DTOs

### ConsultaAlertasDto

Fonte: [src/alertas/dto/consulta-alertas.dto.ts](../../src/alertas/dto/consulta-alertas.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| filial_id? | number | IsOptional; Type(() => Number); IsInt({ message: 'O ID da filial deve ser um número inteiro.' }); Min(1, { message: 'O ID da filial deve ser maior que zero.' }) |
| dias_vencimento? | number | IsOptional; Type(() => Number); IsInt({ message: 'Os dias de vencimento devem ser um número inteiro.' }); Min(1, {     message:       'O parâmetro de dias para vencimento deve ser de pelo menos 1 dia.',   }); Max(365, {     message: 'O parâmetro de dias para vencimento não pode exceder 365 dias.',   }) |

### ConsultaAuditoriaDto

Fonte: [src/auditoria/dto/consulta-auditoria.dto.ts](../../src/auditoria/dto/consulta-auditoria.dto.ts).

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

### ConfirmPasswordDto

Fonte: [src/auth/dto/account.dto.ts](../../src/auth/dto/account.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| senha_atual | string | IsString; MinLength(1); MaxLength(72) |

### ChangePasswordDto

Fonte: [src/auth/dto/account.dto.ts](../../src/auth/dto/account.dto.ts). extends ConfirmPasswordDto

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| nova_senha | string | IsString; MinLength(8); MaxLength(72) |

### EmailSetupDto

Fonte: [src/auth/dto/account.dto.ts](../../src/auth/dto/account.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| challenge_id | string | IsUUID |
| codigo | string | IsString; Matches(/^\d{6}$/) |

### DisableTwoFactorDto

Fonte: [src/auth/dto/account.dto.ts](../../src/auth/dto/account.dto.ts). extends ConfirmPasswordDto

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| challenge_id? | string | IsOptional; IsUUID |
| codigo | string | IsString; Matches(/^\d{6}$/) |

### LoginDto

Fonte: [src/auth/dto/login.dto.ts](../../src/auth/dto/login.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| email | string | IsEmail({}, { message: 'Informe um e-mail válido' }) |
| senha | string | IsString; IsNotEmpty({ message: 'A senha é obrigatória' }) |

### ForgotPasswordDto

Fonte: [src/auth/dto/recovery.dto.ts](../../src/auth/dto/recovery.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| email | string | IsEmail; MaxLength(100) |

### ResetPasswordDto

Fonte: [src/auth/dto/recovery.dto.ts](../../src/auth/dto/recovery.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| token | string | IsString; Matches(/^[a-f0-9]{64}$/) |
| senha | string | IsString; MinLength(8); MaxLength(72) |

### TwoFactorCodeDto

Fonte: [src/auth/dto/recovery.dto.ts](../../src/auth/dto/recovery.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| codigo | string | IsString; Matches(/^\d{6}$/, {     message: 'Informe os 6 dígitos do aplicativo autenticador.',   }) |

### BuscaGlobalDto

Fonte: [src/busca-global/dto/busca-global.dto.ts](../../src/busca-global/dto/busca-global.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| termo | string | IsString({ message: 'O termo de busca deve ser um texto.' }); MinLength(2, { message: 'O termo de busca deve ter pelo menos 2 caracteres.' }) |
| filial_id? | number | IsOptional; Type(() => Number); IsInt({ message: 'O ID da filial deve ser um número inteiro.' }); Min(1, { message: 'O ID da filial deve ser maior que zero.' }) |
| limite? | number | IsOptional; Type(() => Number); IsInt({ message: 'O limite deve ser um número inteiro.' }); Min(1); Max(50, {message: 'O limite não deve ser superior a 50.'}) |

### CreateCategoriaDto

Fonte: [src/categorias/dto/create-categoria.dto.ts](../../src/categorias/dto/create-categoria.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| nome | string | IsString; IsNotEmpty; MaxLength(100) |
| descricao? | string | IsString; IsOptional |

### UpdateCategoriaDto

Fonte: [src/categorias/dto/update-categoria.dto.ts](../../src/categorias/dto/update-categoria.dto.ts). extends PartialType(CreateCategoriaDto, {
  skipNullProperties: false,
})

| Campo | Tipo | Validação/decoradores |
|---|---|---|

### CriarChamadoDto

Fonte: [src/chamados/dto/criar-chamado.dto.ts](../../src/chamados/dto/criar-chamado.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| request_id? | string | IsOptional; IsUUID |
| titulo | string | IsString; IsNotEmpty; MaxLength(150) |
| descricao | string | IsString; IsNotEmpty; MaxLength(10000) |
| prioridade | chamados_suporte_prioridade | IsOptional; IsEnum(chamados_suporte_prioridade) |
| categoria? | string | IsOptional; IsString; MaxLength(100) |
| pagina? | string | IsOptional; IsString; MaxLength(100) |

### FiltroChamadosDto

Fonte: [src/chamados/dto/criar-chamado.dto.ts](../../src/chamados/dto/criar-chamado.dto.ts). extends PaginacaoFiltroDto

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| status? | chamados_suporte_status | IsOptional; IsEnum(chamados_suporte_status) |

### StatusChamadoDto

Fonte: [src/chamados/dto/criar-chamado.dto.ts](../../src/chamados/dto/criar-chamado.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| status | chamados_suporte_status | IsEnum(chamados_suporte_status) |

### MensagemChamadoDto

Fonte: [src/chamados/dto/criar-chamado.dto.ts](../../src/chamados/dto/criar-chamado.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| mensagem | string | IsString; IsNotEmpty; MaxLength(5000) |

### FaqDto

Fonte: [src/chamados/dto/criar-chamado.dto.ts](../../src/chamados/dto/criar-chamado.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| pergunta | string | IsString; IsNotEmpty; MaxLength(255) |
| resposta | string | IsString; IsNotEmpty; MaxLength(20000) |
| ordem? | number | IsOptional; IsInt; Min(0) |
| ativo? | boolean | IsOptional; Transform(({ obj, key }) => parseBoolean(obj[key])); IsBoolean |

### FiltroFaqDto

Fonte: [src/chamados/dto/criar-chamado.dto.ts](../../src/chamados/dto/criar-chamado.dto.ts). extends PaginacaoFiltroDto

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| todos? | boolean | IsOptional; Transform(({ obj, key }) => parseBoolean(obj[key])); IsBoolean |

### ClienteFilterDto

Fonte: [src/clientes/dto/cliente-filter.dto.ts](../../src/clientes/dto/cliente-filter.dto.ts). extends PaginacaoFiltroDto

| Campo | Tipo | Validação/decoradores |
|---|---|---|

### CreateClienteDto

Fonte: [src/clientes/dto/create-cliente.dto.ts](../../src/clientes/dto/create-cliente.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| nome | string | ApiProperty({ description: 'Nome completo ou razão social do cliente', example: 'João da Silva' }); IsString({ message: 'O nome deve ser um texto.' }); IsNotEmpty({ message: 'O nome do cliente é obrigatório.' }); MaxLength(150, { message: 'O nome pode ter no máximo 150 caracteres.' }) |
| cpf_cnpj? | string | ApiPropertyOptional({ description: 'CPF ou CNPJ do cliente', example: '123.456.789-00' }); IsString({ message: 'O CPF/CNPJ deve ser um texto.' }); IsOptional; MaxLength(20, { message: 'O CPF/CNPJ pode ter no máximo 20 caracteres.' }) |
| telefone? | string | ApiPropertyOptional({ description: 'Telefone de contato', example: '(11) 98765-4321' }); IsString({ message: 'O telefone deve ser um texto.' }); IsOptional; MaxLength(20, { message: 'O telefone pode ter no máximo 20 caracteres.' }) |
| email? | string | ApiPropertyOptional({ description: 'Endereço de e-mail do cliente', example: 'joao.silva@email.com' }); IsEmail({}, { message: 'Formato de e-mail inválido.' }); IsOptional; MaxLength(100, { message: 'O e-mail pode ter no máximo 100 caracteres.' }) |

### UpdateClienteDto

Fonte: [src/clientes/dto/update-cliente.dto.ts](../../src/clientes/dto/update-cliente.dto.ts). extends PartialType(CreateClienteDto)

| Campo | Tipo | Validação/decoradores |
|---|---|---|

### FilialQueryDto

Fonte: [src/common/dto/filial-query.dto.ts](../../src/common/dto/filial-query.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| filial_id? | number | IsOptional; Type(() => Number); IsInt; Min(1) |

### PaginacaoFiltroDto

Fonte: [src/common/dto/paginacao-filtro.dto.ts](../../src/common/dto/paginacao-filtro.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| pagina? | number | IsOptional; Type(() => Number); IsInt({ message: 'A página deve ser um número inteiro.' }); Min(1, { message: 'A página mínima é 1.' }) |
| limite? | number | IsOptional; Type(() => Number); IsInt({ message: 'O limite deve ser um número inteiro.' }); Min(1, { message: 'O limite mínimo por página é 1.' }); Max(100, { message: 'O limite máximo por página é 100.' }) |
| busca? | string | IsOptional; IsString |
| ordenar_por? | string | IsOptional; IsString |
| ordem? | 'asc' \| 'desc' | IsOptional; IsIn(['asc', 'desc'], { message: 'A ordem deve ser "asc" ou "desc".' }) |

### CompanySettingsDto

Fonte: [src/configuracoes/dto/settings.dto.ts](../../src/configuracoes/dto/settings.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| nome? | string | IsOptional; IsString; MaxLength(150) |
| cnpj? | string | IsOptional; IsString; MaxLength(20) |
| email? | string | IsOptional; IsEmail; MaxLength(100) |
| telefone? | string | IsOptional; IsString; MaxLength(20) |
| endereco? | string | IsOptional; IsString; MaxLength(255) |
| cidade? | string | IsOptional; IsString; MaxLength(100) |
| estado? | string | IsOptional; IsString; Matches(/^[A-Z]{2}$/) |

### StockSettingsDto

Fonte: [src/configuracoes/dto/settings.dto.ts](../../src/configuracoes/dto/settings.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| estoque_minimo_padrao? | number | IsOptional; IsNumber({ maxDecimalPlaces: 3 }); Min(0); Max(9999999.999) |
| dias_validade? | number | IsOptional; IsInt; Min(1); Max(7) |
| bloquear_negativo? | boolean | IsOptional; IsIn([true]) |

### PreferencesDto

Fonte: [src/configuracoes/dto/settings.dto.ts](../../src/configuracoes/dto/settings.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| notificar_estoque? | boolean | IsOptional; Transform(({ obj, key }) => parseBoolean(obj[key])); IsBoolean |
| notificar_validade? | boolean | IsOptional; Transform(({ obj, key }) => parseBoolean(obj[key])); IsBoolean |
| logout_inativo? | boolean | IsOptional; Transform(({ obj, key }) => parseBoolean(obj[key])); IsBoolean |
| itens_por_pagina? | number | IsOptional; IsInt; IsIn([10, 20, 50, 100]) |

### CreateFilialDto

Fonte: [src/filiais/dto/create-filial.dto.ts](../../src/filiais/dto/create-filial.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| nome | string | IsString; Length(2, 100) |
| endereco? | string | IsOptional; IsString |

### UpdateFilialDto

Fonte: [src/filiais/dto/update-filial.dto.ts](../../src/filiais/dto/update-filial.dto.ts). extends PartialType(CreateFilialDto, {
  skipNullProperties: false,
})

| Campo | Tipo | Validação/decoradores |
|---|---|---|

### CreateFornecedorDto

Fonte: [src/fornecedores/dto/create-fornecedor.dto.ts](../../src/fornecedores/dto/create-fornecedor.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| nome_juridico | string | IsString; IsNotEmpty; MaxLength(150) |
| cnpj | string | Transform(({ value }) =>     typeof value === 'string' ? value.replace(/\D/g, '') : value); IsString; Matches(/^\d{14}$/) |
| nome_fantasia? | string | IsOptional; IsString; MaxLength(150) |
| inscricao_estadual? | string | IsOptional; IsString; MaxLength(30) |
| contato? | string | IsOptional; IsString; MaxLength(100) |
| telefone? | string | IsOptional; IsString; MaxLength(20) |
| email? | string | IsOptional; IsEmail; MaxLength(100) |
| cep? | string | IsOptional; IsString; Matches(/^\d{5}-?\d{3}$/) |
| cidade? | string | IsOptional; IsString; MaxLength(100) |
| estado? | string | IsOptional; IsString; Matches(/^[A-Z]{2}$/) |
| endereco? | string | IsOptional; IsString; MaxLength(255) |
| latitude? | number | IsOptional; IsNumber; IsLatitude |
| longitude? | number | IsOptional; IsNumber; IsLongitude |
| categoria? | string | IsOptional; IsString; MaxLength(100) |
| prazo_entrega? | number | IsOptional; IsInt; Min(0) |
| condicao_pagamento? | string | IsOptional; IsString; MaxLength(100) |
| ativo? | boolean | IsOptional; Transform(({ obj, key }) => parseBoolean(obj[key])); IsBoolean |
| observacoes? | string | IsOptional; IsString; MaxLength(5000) |

### FiltroFornecedoresDto

Fonte: [src/fornecedores/dto/filtro-fornecedores.dto.ts](../../src/fornecedores/dto/filtro-fornecedores.dto.ts). extends PaginacaoFiltroDto

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| categoria? | string | IsOptional; IsString; MaxLength(100) |
| cidade? | string | IsOptional; IsString; MaxLength(100) |
| ativo? | boolean | IsOptional; Transform(({ obj, key }) => parseBoolean(obj[key])); IsBoolean |

### ProximosFornecedoresDto

Fonte: [src/fornecedores/dto/proximos-fornecedores.dto.ts](../../src/fornecedores/dto/proximos-fornecedores.dto.ts). extends PaginacaoFiltroDto

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| latitude? | number | IsOptional; Type(() => Number); IsNumber; IsLatitude |
| longitude? | number | IsOptional; Type(() => Number); IsNumber; IsLongitude |
| raio_km |  | IsOptional; Type(() => Number); IsNumber; Min(0.1); Max(500) |
| cidade? | string | IsOptional; IsString; MaxLength(100) |
| cep? | string | IsOptional; IsString; Matches(/^\d{5}-?\d{3}$/) |

### UpdateFornecedorDto

Fonte: [src/fornecedores/dto/update-fornecedor.dto.ts](../../src/fornecedores/dto/update-fornecedor.dto.ts). extends PartialType(CreateFornecedorDto, {
  skipNullProperties: false,
})

| Campo | Tipo | Validação/decoradores |
|---|---|---|

### ConsultaCepDto

Fonte: [src/integracoes/dto/consulta-cep.dto.ts](../../src/integracoes/dto/consulta-cep.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| cep | string | ApiProperty({     description: 'CEP para busca (8 dígitos com ou sem hífen)',     example: '01001000',   }); IsString; IsNotEmpty; Matches(/^[0-9]{5}-?[0-9]{3}$/, {     message: 'O CEP deve conter 8 dígitos no formato 00000000 ou 00000-000.',   }) |

### ConsultaCoordenadasDto

Fonte: [src/integracoes/dto/consulta-coordenadas.dto.ts](../../src/integracoes/dto/consulta-coordenadas.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| logradouro | string | ApiProperty({ description: 'Logradouro / Nome da rua', example: 'Avenida Paulista' }); IsString; IsNotEmpty |
| cidade | string | ApiProperty({ description: 'Nome do município', example: 'São Paulo' }); IsString; IsNotEmpty |
| uf | string | ApiProperty({ description: 'Sigla do estado (2 caracteres)', example: 'SP' }); IsString; Length(2, 2, { message: 'A UF deve ter exatamente 2 caracteres.' }) |

### ConsultaDistanciaCepsDto

Fonte: [src/integracoes/dto/consulta-distancia-ceps.dto.ts](../../src/integracoes/dto/consulta-distancia-ceps.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| cep_origem | string | ApiProperty({ description: 'CEP de origem', example: '01001000' }); IsString; IsNotEmpty; Matches(/^[0-9]{5}-?[0-9]{3}$/, {     message: 'O CEP de origem deve conter 8 dígitos no formato 00000000 ou 00000-000.',   }) |
| cep_destino | string | ApiProperty({ description: 'CEP de destino', example: '04538132' }); IsString; IsNotEmpty; Matches(/^[0-9]{5}-?[0-9]{3}$/, {     message: 'O CEP de destino deve conter 8 dígitos no formato 00000000 ou 00000-000.',   }) |
| raio_maximo_km? | number | ApiPropertyOptional({ description: 'Raio máximo em KM para validação', example: 15 }); IsOptional; Type(() => Number); IsNumber; Min(0.1) |

### CreateMovimentacaoDto

Fonte: [src/movimentacoes/dto/create-movimentacao.dto.ts](../../src/movimentacoes/dto/create-movimentacao.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| produto_id | number | IsInt; Min(1) |
| filial_id | number | IsInt; Min(1) |
| lote_id? | number | IsOptional; IsInt; Min(1) |
| tipo | TipoMovimentacao | IsEnum({ ENTRADA: 'ENTRADA', SAIDA: 'SAIDA', AJUSTE: 'AJUSTE' }) |
| quantidade | number | IsNumber({ maxDecimalPlaces: 3 }); Min(0) |
| observacao? | string | IsOptional; IsString; MaxLength(1000) |
| referencia? | string | IsOptional; IsString; MaxLength(50) |
| fornecedor_id? | number | IsOptional; IsInt; Min(1) |
| custo_unitario? | number | IsOptional; IsNumber({ maxDecimalPlaces: 2 }); Min(0) |
| lote? | CreateLoteDto | IsOptional; ValidateNested; Type(() => CreateLoteDto) |

### CreateTransferenciaDto

Fonte: [src/movimentacoes/dto/create-transferencia.dto.ts](../../src/movimentacoes/dto/create-transferencia.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| produto_id | number | ApiProperty({ description: 'ID do produto' }); IsInt; Min(1) |
| filial_origem_id | number | ApiProperty({ description: 'ID da filial de origem' }); IsInt; Min(1) |
| filial_destino_id | number | ApiProperty({ description: 'ID da filial de destino' }); IsInt; Min(1) |
| lote_id? | number | ApiPropertyOptional({ description: 'ID do lote (opcional)' }); IsOptional; IsInt; Min(1) |
| quantidade | number | ApiProperty({ description: 'Quantidade transferida' }); IsNumber({ maxDecimalPlaces: 3 }); IsPositive |
| observacao? | string | ApiPropertyOptional({ description: 'Observação ou justificativa' }); IsOptional; IsString; MaxLength(1000) |

### HistoricoMovimentacoesDto

Fonte: [src/movimentacoes/dto/historico-movimentacoes.dto.ts](../../src/movimentacoes/dto/historico-movimentacoes.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| filial_id? | number | IsOptional; Type(() => Number); IsInt; Min(1) |
| produto_id? | number | IsOptional; Type(() => Number); IsInt; Min(1) |
| limit |  | IsOptional; Type(() => Number); IsInt; Min(1); Max(100) |
| pagina |  | IsOptional; Type(() => Number); IsInt; Min(1) |
| tipo? | TipoMovimentacao | IsOptional; IsEnum(TipoMovimentacao) |
| data_inicio? | string | IsOptional; IsDateString |
| data_fim? | string | IsOptional; IsDateString |

### AjusteLoteDto

Fonte: [src/notas-fiscais-entrada/dto/ajuste-lote.dto.ts](../../src/notas-fiscais-entrada/dto/ajuste-lote.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| numero_lote? | string | IsOptional; IsString; IsNotEmpty; MaxLength(50) |
| data_fabricacao? | string | IsOptional; IsDateString |
| data_validade? | string | IsOptional; IsDateString |
| item_entrada_id? | number | IsOptional; IsInt; Min(1) |
| quantidade? | number | IsOptional; IsNumber({ maxDecimalPlaces: 3 }); IsPositive |
| custo_unitario? | number | IsOptional; IsNumber({ maxDecimalPlaces: 2 }); Min(0) |
| motivo | string | IsString; IsNotEmpty; MaxLength(1000) |

### CreateLoteDto

Fonte: [src/notas-fiscais-entrada/dto/create-item-entrada.dto.ts](../../src/notas-fiscais-entrada/dto/create-item-entrada.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| numero_lote | string | IsString; IsNotEmpty; MaxLength(50) |
| data_fabricacao? | string | IsOptional; IsDateString |
| data_validade | string | IsDateString |

### CreateItemEntradaDto

Fonte: [src/notas-fiscais-entrada/dto/create-item-entrada.dto.ts](../../src/notas-fiscais-entrada/dto/create-item-entrada.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| produto_id | number | IsInt; Min(1) |
| quantidade | number | IsNumber({ maxDecimalPlaces: 3 }); IsPositive |
| custo_unitario | number | IsNumber({ maxDecimalPlaces: 2 }); Min(0) |
| lote_id? | number | IsOptional; IsInt; Min(1) |
| lote? | CreateLoteDto | IsOptional; ValidateNested; Type(() => CreateLoteDto) |

### CreateNotaFiscalEntradaDto

Fonte: [src/notas-fiscais-entrada/dto/create-nota-fiscal-entrada.dto.ts](../../src/notas-fiscais-entrada/dto/create-nota-fiscal-entrada.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| fornecedor_id | number | IsInt; Min(1) |
| filial_id | number | IsInt; Min(1) |
| numero_nf | string | IsString; IsNotEmpty; MaxLength(50) |
| observacao? | string | IsOptional; IsString; MaxLength(1000) |
| data_emissao | string | IsDateString |
| data_recebimento? | string | IsOptional; IsDateString |
| total? | number | IsOptional; IsNumber({ maxDecimalPlaces: 2 }); Min(0) |
| status? | 'PENDENTE' \| 'RECEBIDA' | IsOptional; IsIn(['PENDENTE', 'RECEBIDA']) |
| itens | CreateItemEntradaDto[] | IsArray; ArrayMinSize(1); ValidateNested({ each: true }); Type(() => CreateItemEntradaDto) |

### EstornoNotaFiscalDto

Fonte: [src/notas-fiscais-entrada/dto/estorno-nota-fiscal.dto.ts](../../src/notas-fiscais-entrada/dto/estorno-nota-fiscal.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| motivo | string | IsString; IsNotEmpty |

### FiltroNotasDto

Fonte: [src/notas-fiscais-entrada/dto/filtro-notas.dto.ts](../../src/notas-fiscais-entrada/dto/filtro-notas.dto.ts). extends PaginacaoFiltroDto

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| filial_id? | number | IsOptional; Type(() => Number); IsInt; Min(1) |
| produto_id? | number | IsOptional; Type(() => Number); IsInt; Min(1) |
| status? | 'PENDENTE' \| 'RECEBIDA' \| 'CANCELADA' | IsOptional; IsIn(['PENDENTE', 'RECEBIDA', 'CANCELADA']) |

### FiltroNotificacoesDto

Fonte: [src/notificacoes/dto/filtro-notificacoes.dto.ts](../../src/notificacoes/dto/filtro-notificacoes.dto.ts). extends PaginacaoFiltroDto

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| lida? | boolean | IsOptional; Transform(({ obj, key }) => parseBoolean(obj[key])); IsBoolean |

### ItemCheckoutDto

Fonte: [src/pedidos/dto/create-checkout.dto.ts](../../src/pedidos/dto/create-checkout.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| produto_id | number | IsInt; Min(1) |
| lote_id? | number | IsOptional; IsInt; Min(1) |
| quantidade | number | IsNumber({ maxDecimalPlaces: 3 }); IsPositive |
| preco_unitario? | number | IsOptional; IsNumber({ maxDecimalPlaces: 2 }); Min(0) |

### CreateCheckoutDto

Fonte: [src/pedidos/dto/create-checkout.dto.ts](../../src/pedidos/dto/create-checkout.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| cliente_id? | number | IsOptional; IsInt; Min(1) |
| filial_id | number | IsInt; Min(1) |
| itens | ItemCheckoutDto[] | IsArray; ArrayMinSize(1); ValidateNested({ each: true }); Type(() => ItemCheckoutDto) |
| pagamento? | string | IsOptional; IsIn(['DINHEIRO', 'PIX', 'CREDITO', 'DEBITO', 'BOLETO', 'OUTRO']) |
| desconto? | number | IsOptional; IsNumber({ maxDecimalPlaces: 2 }); Min(0) |
| observacao? | string | IsOptional; IsString; MaxLength(1000) |

### CreateReservaDto

Fonte: [src/pedidos/dto/create-reserva.dto.ts](../../src/pedidos/dto/create-reserva.dto.ts). extends CreateCheckoutDto

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| minutos_expiracao |  | IsOptional; IsInt; Min(1); Max(1440) |

### FiltroPedidosDto

Fonte: [src/pedidos/dto/filtro-pedidos.dto.ts](../../src/pedidos/dto/filtro-pedidos.dto.ts). extends PaginacaoFiltroDto

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| filial_id? | number | IsOptional; Type(() => Number); IsInt; Min(1) |
| status? | 'ORCAMENTO' \| 'CONCLUIDO' \| 'CANCELADO' | IsOptional; IsIn(['ORCAMENTO', 'CONCLUIDO', 'CANCELADO']) |
| data_inicio? | string | IsOptional; IsDateString |
| data_fim? | string | IsOptional; IsDateString |
| pagamento? | string | IsOptional; IsIn(['PIX', 'DINHEIRO', 'CREDITO', 'DEBITO', 'CARTAO', 'BOLETO', 'OUTRO']) |
| atendimento? | string | IsOptional; IsIn(['PENDENTE', 'EM_SEPARACAO', 'ENVIADO', 'ENTREGUE']) |

### UpdateAtendimentoDto

Fonte: [src/pedidos/dto/update-atendimento.dto.ts](../../src/pedidos/dto/update-atendimento.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| atendimento | string | IsIn(['PENDENTE', 'EM_SEPARACAO', 'ENVIADO', 'ENTREGUE']) |

### CreatePerfilDto

Fonte: [src/perfis/dto/create-perfil.dto.ts](../../src/perfis/dto/create-perfil.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| nome | string | IsString; IsNotEmpty({ message: 'O nome do perfil é obrigatório' }) |
| permissoes | Record<string, any> | IsObject({ message: 'As permissões devem ser um objeto JSON válido' }); IsNotEmpty({ message: 'As permissões são obrigatórias' }) |

### BuscaCodigoBarrasDto

Fonte: [src/produtos/dto/busca-codigo-barras.dto.ts](../../src/produtos/dto/busca-codigo-barras.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| filial_id? | number | ApiPropertyOptional({ description: 'ID da filial para filtrar o saldo disponível' }); IsOptional; Type(() => Number); IsInt; Min(1) |

### CreateProdutoDto

Fonte: [src/produtos/dto/create-produto.dto.ts](../../src/produtos/dto/create-produto.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| categoria_id | number | IsInt; Min(1) |
| nome | string | IsString; IsNotEmpty; MaxLength(150) |
| marca? | string | IsOptional; IsString; MaxLength(100) |
| codigo_barras? | string | IsOptional; IsString; MaxLength(100) |
| estoque_minimo? | number | IsOptional; IsNumber({ maxDecimalPlaces: 3 }); Min(0) |
| preco_venda | number | IsNumber({ maxDecimalPlaces: 2 }); Min(0) |
| descricao? | string | IsOptional; IsString; MaxLength(5000) |
| sku? | string | IsOptional; IsString; MaxLength(100) |
| unidade? | string | IsOptional; IsString; IsNotEmpty; MaxLength(20) |
| ativo? | boolean | IsOptional; Transform(({ obj, key }) => parseBoolean(obj[key])); IsBoolean |
| observacao? | string | IsOptional; IsString; MaxLength(5000) |
| fornecedor_id? | number | IsOptional; IsInt; Min(1) |

### FiltroProdutosDto

Fonte: [src/produtos/dto/filtro-produtos.dto.ts](../../src/produtos/dto/filtro-produtos.dto.ts). extends PaginacaoFiltroDto

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| categoria_id? | number | IsOptional; Type(() => Number); IsInt; Min(1) |
| apenas_estoque_baixo? | boolean | IsOptional; Transform(({ obj, key }) => parseBoolean(obj[key])); IsBoolean |
| estoque? | string | IsOptional; IsIn(['normal', 'baixo', 'sem-estoque']) |
| sem_movimento_dias? | number | IsOptional; Type(() => Number); IsInt; Min(1); Max(3650) |
| filial_id? | number | IsOptional; Type(() => Number); IsInt; Min(1) |
| fornecedor_id? | number | IsOptional; Type(() => Number); IsInt; Min(1) |
| ativo? | boolean | IsOptional; Transform(({ obj, key }) => parseBoolean(obj[key])); IsBoolean |
| data_inicio? | string | IsOptional; IsDateString |
| data_fim? | string | IsOptional; IsDateString |

### UpdateProdutoDto

Fonte: [src/produtos/dto/update-produto.dto.ts](../../src/produtos/dto/update-produto.dto.ts). extends PartialType(CreateProdutoDto, {
  skipNullProperties: false,
})

| Campo | Tipo | Validação/decoradores |
|---|---|---|

### ConsultaRelatorioDto

Fonte: [src/relatorios/dto/consulta-relatorio.dto.ts](../../src/relatorios/dto/consulta-relatorio.dto.ts). extends PaginacaoFiltroDto

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| tipo | ReportType | IsOptional; IsIn(REPORT_TYPES) |
| formato | 'pdf' \| 'xlsx' \| 'csv' | IsOptional; IsIn(['pdf', 'xlsx', 'csv']) |
| data_inicio? | string | IsOptional; IsDateString |
| data_fim? | string | IsOptional; IsDateString |
| filial_id? | number | IsOptional; Type(() => Number); IsInt; Min(1) |
| categoria_id? | number | IsOptional; Type(() => Number); IsInt; Min(1) |
| produto_id? | number | IsOptional; Type(() => Number); IsInt; Min(1) |
| sem_movimento_dias |  | IsOptional; Type(() => Number); IsInt; Min(1); Max(3650) |

### RelatorioMovimentacoesDto

Fonte: [src/relatorios/dto/relatorio-movimentacoes.dto.ts](../../src/relatorios/dto/relatorio-movimentacoes.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| data_inicio? | Date | ApiPropertyOptional({ description: 'Data de início (YYYY-MM-DD)' }); IsOptional; Type(() => Date); IsDate |
| data_fim? | Date | ApiPropertyOptional({ description: 'Data de fim (YYYY-MM-DD)' }); IsOptional; Type(() => Date); IsDate |
| filial_id? | number | ApiPropertyOptional({ description: 'Filtrar por filial' }); IsOptional; Type(() => Number); IsInt |
| produto_id? | number | ApiPropertyOptional({ description: 'Filtrar por produto' }); IsOptional; Type(() => Number); IsInt |

### SaldosEstoqueFilterDto

Fonte: [src/saldos-estoque/dto/saldos-estoque-filter.dto.ts](../../src/saldos-estoque/dto/saldos-estoque-filter.dto.ts). extends PaginacaoFiltroDto

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| filial_id? | number | ApiPropertyOptional({ description: 'ID da filial para filtragem' }); IsOptional; Type(() => Number); IsInt; Min(1) |
| produto_id? | number | ApiPropertyOptional({ description: 'ID do produto para filtragem' }); IsOptional; Type(() => Number); IsInt; Min(1) |

### CreateUserDto

Fonte: [src/usuario/dto/create-user.dto.ts](../../src/usuario/dto/create-user.dto.ts).

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| nome | string | IsString; IsNotEmpty; MaxLength(100) |
| email | string | IsEmail; MaxLength(100) |
| senha | string | IsString; MinLength(8); MaxLength(72) |
| perfil_id | number | IsInt; Min(1) |
| telefone? | string | IsOptional; IsString; MaxLength(20) |

### UpdateUserDto

Fonte: [src/usuario/dto/update-user.dto.ts](../../src/usuario/dto/update-user.dto.ts). extends PartialType(CreateUserDto, {
  skipNullProperties: false,
})

| Campo | Tipo | Validação/decoradores |
|---|---|---|
| ativo? | boolean | ValidateIf((_, value) => value !== undefined); Transform(({ obj, key }) => parseBoolean(obj[key])); IsBoolean |


## Serviços e métodos internos

Estes métodos não são todos rotas públicas. A tabela de operações acima é a fonte para o que está exposto por HTTP.

| Serviço | Métodos e linhas |
|---|---|
| [src/alertas/alertas.service.ts](../../src/alertas/alertas.service.ts) | `verificarEstoqueMinimo` (linha 15); `verificarLotesVencimento` (linha 21); `obterDashboardAlertas` (linha 62) |
| [src/auditoria/auditoria.service.ts](../../src/auditoria/auditoria.service.ts) | `registrarLog` (linha 20); `listarHistorico` (linha 39) |
| [src/auth/auth.service.ts](../../src/auth/auth.service.ts) | `token` (linha 29); `login` (linha 55); `emailLogin` (linha 83); `resendEmail` (linha 107); `authenticateTwoFactor` (linha 115); `password` (linha 132); `startEmailSetup` (linha 138); `enableEmail` (linha 146); `startDisableEmail` (linha 162); `disableTwoFactor` (linha 170); `changePassword` (linha 197); `logout` (linha 228); `getProfile` (linha 232) |
| [src/auth/email-challenge.service.ts](../../src/auth/email-challenge.service.ts) | `hash` (linha 26); `issue` (linha 31); `consume` (linha 87) |
| [src/auth/password-recovery.service.ts](../../src/auth/password-recovery.service.ts) | `request` (linha 20); `reset` (linha 68) |
| [src/auth/two-factor.service.ts](../../src/auth/two-factor.service.ts) | `generateTwoFactorSecret` (linha 10); `verifyTwoFactorCode` (linha 36); `enableTwoFactor` (linha 45) |
| [src/busca-global/busca-global.service.ts](../../src/busca-global/busca-global.service.ts) | `buscar` (linha 9) |
| [src/categorias/categorias.service.ts](../../src/categorias/categorias.service.ts) | `criar` (linha 11); `listar` (linha 24); `buscarPorId` (linha 30); `atualizar` (linha 42); `remover` (linha 58) |
| [src/chamados/chamados.service.ts](../../src/chamados/chamados.service.ts) | `criar` (linha 34); `listarTodos` (linha 71); `buscarPorId` (linha 104); `atualizarStatus` (linha 122); `mensagem` (linha 170); `upload` (linha 179); `attachment` (linha 211); `faq` (linha 217); `saveFaq` (linha 233); `deleteFaq` (linha 238) |
| [src/clientes/clientes.service.ts](../../src/clientes/clientes.service.ts) | `create` (linha 18); `findAll` (linha 38); `findOne` (linha 87); `update` (linha 111); `remove` (linha 129) |
| [src/common/services/excel.service.ts](../../src/common/services/excel.service.ts) | `gerarExcel` (linha 13) |
| [src/common/services/pdf.service.ts](../../src/common/services/pdf.service.ts) | `gerarBuffer` (linha 42); `gerarRelatorioTabela` (linha 53) |
| [src/common/services/stock-events.service.ts](../../src/common/services/stock-events.service.ts) | `emit` (linha 7); `stream` (linha 10) |
| [src/common/services/stock.service.ts](../../src/common/services/stock.service.ts) | `lowStock` (linha 23); `write` (linha 47); `balance` (linha 86); `change` (linha 97); `log` (linha 130); `recalculateCost` (linha 156) |
| [src/configuracoes/configuracoes.service.ts](../../src/configuracoes/configuracoes.service.ts) | `stock` (linha 18); `company` (linha 29); `publicSettings` (linha 35); `save` (linha 45); `preferences` (linha 70); `savePreferences` (linha 77) |
| [src/dashboards/dashboard.service.ts](../../src/dashboards/dashboard.service.ts) | `notificarMovimentacao` (linha 26); `obterStreamRealTime` (linha 29); `streamForUser` (linha 32); `resumo` (linha 51); `obterStockPorCategoria` (linha 74); `obterMovimentacoesSeteDias` (linha 91); `obterProdutosCriticos` (linha 123) |
| [src/filiais/filiais.service.ts](../../src/filiais/filiais.service.ts) | `create` (linha 15); `findAll` (linha 23); `findOne` (linha 35); `update` (linha 54); `remove` (linha 71) |
| [src/fornecedores/fornecedores.service.ts](../../src/fornecedores/fornecedores.service.ts) | `criar` (linha 12); `listar` (linha 15); `resumo` (linha 49); `proximos` (linha 62); `buscarPorId` (linha 118); `atualizar` (linha 123); `remover` (linha 127) |
| [src/integracoes/integracoes.service.ts](../../src/integracoes/integracoes.service.ts) | `buscarPorCep` (linha 35); `obterCoordenadas` (linha 76); `fetchCoordinates` (linha 112); `calcularDistanciaEmKm` (linha 145); `calcularDistanciaEntreCeps` (linha 164) |
| [src/mail/mail.service.ts](../../src/mail/mail.service.ts) | `enviarEmail` (linha 31) |
| [src/movimentacoes/movimentacoes.service.ts](../../src/movimentacoes/movimentacoes.service.ts) | `registrarMovimentacao` (linha 22); `transferirSaldo` (linha 87); `listarHistorico` (linha 128) |
| [src/notas-fiscais-entrada/notas-fiscais-entrada.service.ts](../../src/notas-fiscais-entrada/notas-fiscais-entrada.service.ts) | `criar` (linha 28); `applyItem` (linha 147); `listar` (linha 171); `buscarPorId` (linha 205); `lockedNote` (linha 214); `receber` (linha 230); `estornar` (linha 271); `ajustarLote` (linha 315) |
| [src/notificacoes/notificacoes.service.ts](../../src/notificacoes/notificacoes.service.ts) | `dispararNotificacoesDiarias` (linha 14); `listarNotificacoes` (linha 65); `marcarComoLida` (linha 117) |
| [src/pedidos/pedidos.service.ts](../../src/pedidos/pedidos.service.ts) | `processarCheckout` (linha 46); `criarReserva` (linha 49); `create` (linha 53); `audit` (linha 176); `lockedOrder` (linha 192); `confirmarReserva` (linha 204); `cancelarPedido` (linha 269); `cancel` (linha 273); `limparReservasExpiradas` (linha 332); `listarTodos` (linha 342); `filter` (linha 368); `resumo` (linha 422); `atualizarAtendimento` (linha 488); `buscarPorId` (linha 512) |
| [src/perfis/perfis.service.ts](../../src/perfis/perfis.service.ts) | `create` (linha 16); `findAll` (linha 37); `update` (linha 46); `findOne` (linha 65) |
| [src/prisma/prisma.service.ts](../../src/prisma/prisma.service.ts) | `onModuleInit` (linha 30); `onModuleDestroy` (linha 34) |
| [src/produtos/produtos.service.ts](../../src/produtos/produtos.service.ts) | `normalized` (linha 22); `criar` (linha 29); `listar` (linha 39); `buscarPorId` (linha 144); `resumo` (linha 156); `atualizar` (linha 180); `remover` (linha 195); `buscarPorCodigoBarras` (linha 199) |
| [src/relatorios/relatorios.service.ts](../../src/relatorios/relatorios.service.ts) | `period` (linha 21); `products` (linha 42); `branch` (linha 47); `definition` (linha 52); `normalize` (linha 190); `consultar` (linha 207); `formatted` (linha 232); `exportar` (linha 252) |
| [src/saldos-estoque/saldos-estoque.service.ts](../../src/saldos-estoque/saldos-estoque.service.ts) | `resumo` (linha 14); `findAll` (linha 49); `findOne` (linha 124) |
| [src/usuario/users.service.ts](../../src/usuario/users.service.ts) | `create` (linha 18); `update` (linha 56); `toggleStatus` (linha 138); `findByEmail` (linha 143); `revokeSessions` (linha 175); `findById` (linha 182); `findOne` (linha 212); `findAll` (linha 216); `setTwoFactorSecret` (linha 236); `enableTwoFactor` (linha 245); `findByIdWithSecrets` (linha 256) |
