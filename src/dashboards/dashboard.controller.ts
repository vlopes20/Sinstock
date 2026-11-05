import {
  Controller,
  Get,
  MessageEvent,
  Query,
  Req,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { FilialQueryDto } from '../common/dto/filial-query.dto';
import { FiltroPedidosDto } from '../pedidos/dto/filtro-pedidos.dto';
import {
  PermissionResource,
  PermissionsGuard,
} from '../auth/guards/permissions.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { map, Observable } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard & Métricas')
@ApiBearerAuth()
@PermissionResource('dashboard')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('resumo')
  resumo(@Query() dto: FiltroPedidosDto) {
    return this.dashboardService.resumo(dto);
  }

  @Get('graficos/stock-categoria')
  @ApiOperation({
    summary: 'Métricas de estoque agrupadas por categoria (Gráfico de Pizza)',
  })
  async getStockPorCategoria(@Query() dto: FilialQueryDto) {
    return this.dashboardService.obterStockPorCategoria(dto.filial_id);
  }

  @Get('graficos/movimentacoes-semanal')
  @ApiOperation({
    summary:
      'Histórico de entradas/saídas dos últimos 7 dias (Gráfico de Linhas)',
  })
  async getMovimentacoesSemanal(@Query() dto: FilialQueryDto) {
    return this.dashboardService.obterMovimentacoesSeteDias(dto.filial_id);
  }

  @Get('graficos/produtos-criticos')
  @ApiOperation({
    summary: 'Produtos abaixo do estoque mínimo (Gráfico de Barras)',
  })
  async getProdutosCriticos(@Query() dto: FilialQueryDto) {
    return this.dashboardService.obterProdutosCriticos(dto.filial_id);
  }

  @Sse('realtime-stream')
  @ApiOperation({
    summary: 'Stream SSE de atualizações do estoque em tempo real',
  })
  streamStockEvents(
    @Req()
    req: {
      user: { userId: number; version: number; expiresAt: number };
    },
  ): Observable<MessageEvent> {
    return this.dashboardService
      .streamForUser(req.user.userId, req.user.version, req.user.expiresAt)
      .pipe(
        map((evento) => ({
          data: evento,
        })),
      );
  }
}
