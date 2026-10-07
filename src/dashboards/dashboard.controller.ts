import { Controller, Get, MessageEvent, Sse, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { map, Observable } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard & Métricas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('graficos/stock-categoria')
  @ApiOperation({
    summary: 'Métricas de estoque agrupadas por categoria (Gráfico de Pizza)',
  })
  async getStockPorCategoria() {
    return this.dashboardService.obterStockPorCategoria();
  }

  @Get('graficos/movimentacoes-semanal')
  @ApiOperation({
    summary:
      'Histórico de entradas/saídas dos últimos 7 dias (Gráfico de Linhas)',
  })
  async getMovimentacoesSemanal() {
    return this.dashboardService.obterMovimentacoesSeteDias();
  }

  @Get('graficos/produtos-criticos')
  @ApiOperation({
    summary: 'Produtos abaixo do estoque mínimo (Gráfico de Barras)',
  })
  async getProdutosCriticos() {
    return this.dashboardService.obterProdutosCriticos();
  }

  @Sse('realtime-stream')
  @ApiOperation({
    summary: 'Stream SSE de atualizações do estoque em tempo real',
  })
  streamStockEvents(): Observable<MessageEvent> {
    return this.dashboardService.obterStreamRealTime().pipe(
      map((evento) => ({
        data: evento,
      })),
    );
  }
}