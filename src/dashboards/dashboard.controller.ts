import { Controller, Get, Sse, MessageEvent } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable, map } from 'rxjs';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard & Métricas')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('graficos/stock-categoria')
  @ApiOperation({ summary: 'Métricas de stock agrupadas por categoria (Gráfico de Pizza)' })
  async getStockPorCategoria() {
    return this.dashboardService.obterStockPorCategoria();
  }

  @Get('graficos/movimentacoes-semanal')
  @ApiOperation({ summary: 'Histórico de entradas/saídas dos últimos 7 dias (Gráfico de Linhas)' })
  async getMovimentacoesSemanal() {
    return this.dashboardService.obterMovimentacoesSeteDias();
  }

  @Get('graficos/produtos-criticos')
  @ApiOperation({ summary: 'Produtos abaixo do stock mínimo (Gráfico de Barras)' })
  async getProdutosCriticos() {
    return this.dashboardService.obterProdutosCriticos();
  }

  @Sse('realtime-stream')
  @ApiOperation({ summary: 'Stream SSE de atualizações do stock em tempo real' })
  streamStockEvents(): Observable<MessageEvent> {
    return this.dashboardService.obterStreamRealTime().pipe(
      map((evento) => ({
        data: evento,
      })),
    );
  }
}