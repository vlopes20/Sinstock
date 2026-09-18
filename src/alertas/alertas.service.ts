import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertasService {
  constructor(private readonly prisma: PrismaService) {}

  async verificarEstoqueMinimo(filialId?: number) {
    const saldos = await this.prisma.saldos_estoque.findMany({
      where: filialId ? { filial_id: filialId } : {},
      include: {
        produtos: true,
      },
    });

    return saldos
      .filter((saldo) => {
        const estoqueMinimo = (saldo.produtos as any)?.estoque_minimo ?? 10;
        return saldo.quantidade <= estoqueMinimo;
      })
      .map((saldo) => ({
        tipo: 'ESTOQUE_BAIXO',
        produto_id: saldo.produto_id,
        produto_nome: (saldo.produtos as any)?.nome,
        filial_id: saldo.filial_id,
        quantidade_atual: saldo.quantidade,
        estoque_minimo: (saldo.produtos as any)?.estoque_minimo ?? 10,
      }));
  }

  async verificarLotesVencimento(diasAviso = 30) {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + diasAviso);

    const lotes = await this.prisma.lotes.findMany({
      where: {
        data_validade: {
          lte: dataLimite,
        },
      },
      include: {
        produtos: true,
      },
      orderBy: { data_validade: 'asc' },
    });

    return lotes.map((lote) => {
      const hoje = new Date();
      const validade = new Date(lote.data_validade);
      const diffDias = Math.ceil(
        (validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        tipo: diffDias < 0 ? 'LOTE_VENCIDO' : 'LOTE_PROXIMO_VENCIMENTO',
        lote_id: lote.id,
        numero_lote: lote.numero_lote,
        produto_id: lote.produto_id,
        produto_nome: (lote.produtos as any)?.nome,
        data_validade: lote.data_validade,
        dias_para_vencer: diffDias,
      };
    });
  }

  async obterDashboardAlertas(filialId?: number, diasVencimento = 30) {
    const estoqueBaixo = await this.verificarEstoqueMinimo(filialId);
    const lotesVencendo = await this.verificarLotesVencimento(diasVencimento);

    return {
      resumo: {
        total_alertas: estoqueBaixo.length + lotesVencendo.length,
        total_estoque_baixo: estoqueBaixo.length,
        total_lotes_vencendo: lotesVencendo.length,
      },
      alertas: {
        estoque_baixo: estoqueBaixo,
        lotes_vencendo: lotesVencendo,
      },
    };
  }
}