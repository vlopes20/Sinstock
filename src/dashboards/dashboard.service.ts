import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StockEventsService } from '../common/services/stock-events.service';
import { StockService } from '../common/services/stock.service';
import { SaldosEstoqueService } from '../saldos-estoque/saldos-estoque.service';
import { AlertasService } from '../alertas/alertas.service';
import { PedidosService } from '../pedidos/pedidos.service';
import { MovimentacoesService } from '../movimentacoes/movimentacoes.service';
import { FiltroPedidosDto } from '../pedidos/dto/filtro-pedidos.dto';
import { HistoricoMovimentacoesDto } from '../movimentacoes/dto/historico-movimentacoes.dto';
import { EventoRealTimeStock } from './interfaces/dashboard-graficos.interface';
import { concatMap, map, takeWhile } from 'rxjs';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: StockEventsService,
    private readonly stock: StockService,
    private readonly balances: SaldosEstoqueService,
    private readonly alerts: AlertasService,
    private readonly orders: PedidosService,
    private readonly movements: MovimentacoesService,
  ) {}
  notificarMovimentacao(event: EventoRealTimeStock) {
    this.events.emit(event);
  }
  obterStreamRealTime() {
    return this.events.stream();
  }
  streamForUser(userId: number, version: number, expiresAt: number) {
    return this.events.stream().pipe(
      concatMap(async (event) => {
        const user = await this.prisma.usuarios.findUnique({
          where: { id: userId },
          select: { ativo: true, auth_version: true },
        });
        return {
          event,
          allowed:
            !!user?.ativo &&
            user.auth_version === version &&
            Date.now() < expiresAt * 1000,
        };
      }),
      takeWhile((value) => value.allowed),
      map((value) => value.event),
    );
  }
  async resumo(dto: FiltroPedidosDto) {
    const history = Object.assign(new HistoricoMovimentacoesDto(), {
      filial_id: dto.filial_id,
      limit: 8,
    });
    const [estoque, alertas, comercial, recentes, categorias, semanal] =
      await Promise.all([
        this.balances.resumo(dto.filial_id),
        this.alerts.obterDashboardAlertas({ filial_id: dto.filial_id }),
        this.orders.resumo(dto),
        this.movements.listarHistorico(history),
        this.obterStockPorCategoria(dto.filial_id),
        this.obterMovimentacoesSeteDias(dto.filial_id),
      ]);
    return {
      estoque,
      alertas,
      comercial,
      recentes: recentes.dados,
      categorias,
      semanal,
    };
  }
  async obterStockPorCategoria(filialId?: number) {
    const rows = await this.prisma.$queryRaw<
      { categoria: string; quantidade: Prisma.Decimal; valor: Prisma.Decimal }[]
    >(Prisma.sql`
      SELECT c.nome AS categoria, COALESCE(SUM(s.quantidade - s.quantidade_reservada), 0) AS quantidade,
        COALESCE(SUM(s.quantidade * COALESCE(p.custo_medio, 0)), 0) AS valor
      FROM categorias c LEFT JOIN produtos p ON p.categoria_id = c.id
      LEFT JOIN saldos_estoque s ON s.produto_id = p.id
        ${filialId ? Prisma.sql`AND s.filial_id = ${filialId}` : Prisma.empty}
      GROUP BY c.id, c.nome ORDER BY c.nome
    `);
    return rows.map((row) => ({
      categoria: row.categoria,
      quantidadeTotal: Number(row.quantidade),
      valorTotal: Number(row.valor),
    }));
  }
  async obterMovimentacoesSeteDias(filialId?: number) {
    const start = new Date(Date.now() - 6 * 86400000).toLocaleDateString(
      'en-CA',
      { timeZone: 'America/Sao_Paulo' },
    );
    const logs = await this.prisma.logs_movimentacoes.findMany({
      where: {
        filial_id: filialId,
        data_hora: { gte: new Date(start + 'T00:00:00-03:00') },
      },
      select: { tipo_movimentacao: true, quantidade: true, data_hora: true },
    });
    const days = new Map<string, { entradas: number; saidas: number }>();
    for (let day = 6; day >= 0; day--)
      days.set(
        new Date(Date.now() - day * 86400000).toLocaleDateString('en-CA', {
          timeZone: 'America/Sao_Paulo',
        }),
        { entradas: 0, saidas: 0 },
      );
    for (const log of logs) {
      const day = log.data_hora?.toLocaleDateString('en-CA', {
        timeZone: 'America/Sao_Paulo',
      });
      const entry = day ? days.get(day) : undefined;
      if (entry && log.tipo_movimentacao === 'ENTRADA')
        entry.entradas += Number(log.quantidade);
      if (entry && log.tipo_movimentacao === 'SAIDA')
        entry.saidas += Number(log.quantidade);
    }
    return [...days].map(([data, value]) => ({ data, ...value }));
  }
  async obterProdutosCriticos(filialId?: number) {
    return (await this.stock.lowStock(filialId)).map((row) => ({
      produto: row.produto_nome,
      stockAtual: Number(row.quantidade_atual),
      stockMinimo: Number(row.estoque_minimo),
      filial_id: row.filial_id,
      filial: row.filial_nome,
    }));
  }
}
