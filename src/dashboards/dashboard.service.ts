import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import {
  GraficoPizzaCategoria,
  GraficoLinhaMovimentacao,
  GraficoBarraAlertaStock,
  EventoRealTimeStock,
} from './interfaces/dashboard-graficos.interface';

@Injectable()
export class DashboardService {
  // Canal de eventos reativo para atualizações em tempo real
  private stockEvents$ = new Subject<EventoRealTimeStock>();

  /**
   * Método chamado pelos serviços de Stock sempre que houver uma movimentação
   */
  notificarMovimentacao(evento: EventoRealTimeStock) {
    this.stockEvents$.next(evento);
  }

  /**
   * Retorna o Stream de eventos em tempo real para o endpoint SSE
   */
  obterStreamRealTime(): Observable<EventoRealTimeStock> {
    return this.stockEvents$.asObservable();
  }

  /**
   * Agregação 1: Distribuição de Stock por Categoria (Gráfico de Pizza/Doughnut)
   */
  async obterStockPorCategoria(): Promise<GraficoPizzaCategoria[]> {
    // Exemplo de retorno simulado (substituir pela query TypeORM/Prisma GROUP BY)
    return [
      { categoria: 'Eletrónicos', quantidadeTotal: 450, valorTotal: 125000.00 },
      { categoria: 'Ferramentas', quantidadeTotal: 230, valorTotal: 34500.50 },
      { categoria: 'Acessórios', quantidadeTotal: 890, valorTotal: 18200.00 },
      { categoria: 'Matéria-Prima', quantidadeTotal: 1200, valorTotal: 89000.00 },
    ];
  }

  /**
   * Agregação 2: Histórico de Entradas e Saídas dos últimos 7 dias (Gráfico de Linha)
   */
  async obterMovimentacoesSeteDias(): Promise<GraficoLinhaMovimentacao[]> {
    const dias = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return dias.map((data) => ({
      data,
      entradas: Math.floor(Math.random() * 50) + 10,
      saidas: Math.floor(Math.random() * 40) + 5,
    }));
  }

  /**
   * Agregação 3: Produtos críticos com stock abaixo do mínimo (Gráfico de Barras)
   */
  async obterProdutosCriticos(): Promise<GraficoBarraAlertaStock[]> {
    return [
      { produto: 'Parafuso M8', stockAtual: 12, stockMinimo: 50 },
      { produto: 'Cabo HDMI 2m', stockAtual: 5, stockMinimo: 20 },
      { produto: 'Fita Isoladora', stockAtual: 8, stockMinimo: 30 },
      { produto: 'Óleo Lubrificante 1L', stockAtual: 2, stockMinimo: 10 },
    ];
  }
}