import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockService } from '../common/services/stock.service';
import { ConsultaAlertasDto } from './dto/consulta-alertas.dto';
import { businessDay } from '../common/dates';
import { SinstockSettingsService } from '../configuracoes/configuracoes.service';

@Injectable()
export class AlertasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockService,
    private readonly settings: SinstockSettingsService,
  ) {}
  async verificarEstoqueMinimo(filialId?: number) {
    return (await this.stock.lowStock(filialId)).map((row) => ({
      tipo: 'ESTOQUE_BAIXO',
      ...row,
    }));
  }
  async verificarLotesVencimento(diasAviso?: number, filialId?: number) {
    diasAviso ??= (await this.settings.stock()).dias_validade;
    const today = new Date(businessDay());
    const limit = new Date(today.getTime() + diasAviso * 86400000);
    const lots = await this.prisma.lotes.findMany({
      where: {
        data_validade: { lte: limit },
        saldos_estoque: {
          some: { filial_id: filialId, quantidade: { gt: 0 } },
        },
      },
      include: {
        produtos: { select: { nome: true } },
        saldos_estoque: {
          where: { filial_id: filialId, quantidade: { gt: 0 } },
          include: { filiais: { select: { nome: true } } },
        },
      },
      orderBy: { data_validade: 'asc' },
    });
    return lots.map((lot) => {
      const days = Math.round(
        (lot.data_validade.getTime() - today.getTime()) / 86400000,
      );
      return {
        tipo: days < 0 ? 'LOTE_VENCIDO' : 'LOTE_PROXIMO_VENCIMENTO',
        lote_id: lot.id,
        numero_lote: lot.numero_lote,
        produto_id: lot.produto_id,
        produto_nome: lot.produtos.nome,
        data_validade: lot.data_validade,
        dias_para_vencer: days,
        saldos: lot.saldos_estoque.map((s) => ({
          filial_id: s.filial_id,
          filial_nome: s.filiais.nome,
          quantidade: s.quantidade,
          reservada: s.quantidade_reservada,
        })),
      };
    });
  }
  async obterDashboardAlertas(dto?: ConsultaAlertasDto) {
    const filial = dto?.filial_id,
      days =
        dto?.dias_vencimento ?? (await this.settings.stock()).dias_validade;
    const [low, expiry] = await Promise.all([
      this.verificarEstoqueMinimo(filial),
      this.verificarLotesVencimento(days, filial),
    ]);
    return {
      resumo: {
        total_alertas: low.length + expiry.length,
        total_estoque_baixo: low.length,
        total_lotes_vencendo: expiry.length,
        parametros_aplicados: {
          filial_id: filial ?? 'todas',
          dias_vencimento: days,
        },
      },
      alertas: { estoque_baixo: low, lotes_vencendo: expiry },
    };
  }
}
