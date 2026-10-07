import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import {
  EventoRealTimeStock,
  GraficoBarraAlertaStock,
  GraficoLinhaMovimentacao,
  GraficoPizzaCategoria,
} from './interfaces/dashboard-graficos.interface';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // Canal de eventos reativo para atualizações em tempo real (SSE)
  private stockEvents$ = new Subject<EventoRealTimeStock>();

  /**
   * Método chamado pelos serviços de estoque sempre que houver uma movimentação
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
   * Agregação 1: Distribuição de Estoque por Categoria (Gráfico de Pizza/Doughnut)
   */
  async obterStockPorCategoria(): Promise<GraficoPizzaCategoria[]> {
    try {
      const categorias = await this.prisma.categorias.findMany({
        include: {
          produtos: {
            include: {
              saldos_estoque: true,
            },
          },
        },
      });

      return categorias.map((cat) => {
        let quantidadeTotal = 0;
        let valorTotal = 0;

        for (const prod of cat.produtos) {
          const saldoProd = prod.saldos_estoque.reduce(
            (acc, s) => acc + Number(s.quantidade),
            0,
          );
          quantidadeTotal += saldoProd;
          valorTotal += saldoProd * Number(prod.custo_medio ?? 0);
        }

        return {
          categoria: cat.nome,
          quantidadeTotal,
          valorTotal: Number(valorTotal.toFixed(2)),
        };
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao consultar distribuição de estoque por categoria.',
      );
    }
  }

  /**
   * Agregação 2: Histórico de Entradas e Saídas dos últimos 7 dias (Gráfico de Linha)
   */
  async obterMovimentacoesSeteDias(): Promise<GraficoLinhaMovimentacao[]> {
    try {
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 6);
      seteDiasAtras.setHours(0, 0, 0, 0);

      const logs = await this.prisma.logs_movimentacoes.findMany({
        where: {
          data_hora: { gte: seteDiasAtras },
        },
        select: {
          tipo_movimentacao: true,
          quantidade: true,
          data_hora: true,
        },
      });

      // Inicializa o mapa com os últimos 7 dias zerados
      const resultadoMap = new Map<string, { entradas: number; saidas: number }>();
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dataIso = d.toISOString().split('T')[0];
        resultadoMap.set(dataIso, { entradas: 0, saidas: 0 });
      }

      // Agrupa os logs por data
      for (const log of logs) {
        if (!log.data_hora) continue;
        const dataKey = new Date(log.data_hora).toISOString().split('T')[0];

        if (resultadoMap.has(dataKey)) {
          const diaAtual = resultadoMap.get(dataKey)!;
          const qtd = Number(log.quantidade);
          const tipo = String(log.tipo_movimentacao).toUpperCase();

          if (tipo === 'ENTRADA') diaAtual.entradas += qtd;
          if (tipo === 'SAIDA') diaAtual.saidas += qtd;
        }
      }

      return Array.from(resultadoMap.entries()).map(([data, metricas]) => ({
        data,
        entradas: metricas.entradas,
        saidas: metricas.saidas,
      }));
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao consultar movimentações dos últimos 7 dias.',
      );
    }
  }

  /**
   * Agregação 3: Produtos críticos com estoque abaixo do mínimo (Gráfico de Barras)
   */
  async obterProdutosCriticos(): Promise<GraficoBarraAlertaStock[]> {
    try {
      const saldos = await this.prisma.saldos_estoque.findMany({
        include: {
          produtos: true,
        },
      });

      const produtoSaldosMap = new Map<number, { produto: any; stockAtual: number }>();

      for (const s of saldos) {
        if (!s.produtos) continue;
        const prodId = s.produto_id;
        const atual = produtoSaldosMap.get(prodId) || {
          produto: s.produtos,
          stockAtual: 0,
        };
        atual.stockAtual += Number(s.quantidade);
        produtoSaldosMap.set(prodId, atual);
      }

      const criticos: GraficoBarraAlertaStock[] = [];

      produtoSaldosMap.forEach(({ produto, stockAtual }) => {
        const stockMinimo = Number(produto.estoque_minimo ?? 0);
        if (stockMinimo > 0 && stockAtual <= stockMinimo) {
          criticos.push({
            produto: produto.nome,
            stockAtual,
            stockMinimo,
          });
        }
      });

      return criticos;
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao consultar produtos críticos em estoque.',
      );
    }
  }
}