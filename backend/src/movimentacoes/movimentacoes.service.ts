import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { StockService } from '../common/services/stock.service';
import { NotasFiscaisEntradaService } from '../notas-fiscais-entrada/notas-fiscais-entrada.service';
import {
  CreateMovimentacaoDto,
  TipoMovimentacao,
} from './dto/create-movimentacao.dto';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';
import { HistoricoMovimentacoesDto } from './dto/historico-movimentacoes.dto';

@Injectable()
export class MovimentacoesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockService,
    private readonly receipts: NotasFiscaisEntradaService,
  ) {}

  async registrarMovimentacao(dto: CreateMovimentacaoDto, usuarioId: number) {
    if (dto.tipo !== TipoMovimentacao.AJUSTE && dto.quantidade <= 0)
      throw new BadRequestException('Informe uma quantidade positiva.');
    if (dto.tipo === TipoMovimentacao.ENTRADA) {
      if (
        !dto.fornecedor_id ||
        !dto.referencia ||
        dto.custo_unitario === undefined
      )
        throw new BadRequestException(
          'A entrada exige fornecedor, número da nota/pedido de compra e custo unitário.',
        );
      const nota = await this.receipts.criar(
        {
          filial_id: dto.filial_id,
          fornecedor_id: dto.fornecedor_id,
          numero_nf: dto.referencia,
          data_emissao: new Date().toISOString(),
          status: 'RECEBIDA',
          observacao: dto.observacao,
          itens: [
            {
              produto_id: dto.produto_id,
              lote_id: dto.lote_id,
              lote: dto.lote,
              quantidade: dto.quantidade,
              custo_unitario: dto.custo_unitario,
            },
          ],
        },
        usuarioId,
      );
      return {
        message: 'Entrada registrada com documento de origem.',
        nota_fiscal: nota,
      };
    }
    if (!dto.observacao?.trim())
      throw new BadRequestException('Informe o motivo da saída ou ajuste.');
    return this.stock.write([dto.produto_id], async (tx) => {
      const key = {
        produto_id: dto.produto_id,
        filial_id: dto.filial_id,
        lote_id: dto.lote_id ?? null,
      };
      const existing = await this.stock.balance(tx, key);
      const delta =
        dto.tipo === TipoMovimentacao.AJUSTE
          ? new Prisma.Decimal(dto.quantidade).minus(existing?.quantidade ?? 0)
          : new Prisma.Decimal(dto.quantidade).negated();
      const change = await this.stock.change(tx, key, delta);
      const log = await this.stock.log(tx, {
        ...key,
        usuario_id: usuarioId,
        tipo_movimentacao: dto.tipo,
        quantidade: delta.abs(),
        saldo_anterior: change.before,
        saldo_atual: change.after,
        observacao: dto.observacao,
        referencia: dto.referencia,
      });
      return { message: 'Movimentação registrada.', log };
    });
  }

  async transferirSaldo(dto: CreateTransferenciaDto, usuarioId: number) {
    if (dto.filial_origem_id === dto.filial_destino_id)
      throw new BadRequestException('Escolha filiais diferentes.');
    return this.stock.write([dto.produto_id], async (tx) => {
      const reference = 'TRANSFERENCIA:' + randomUUID();
      const origin = {
        produto_id: dto.produto_id,
        filial_id: dto.filial_origem_id,
        lote_id: dto.lote_id ?? null,
      };
      const destination = { ...origin, filial_id: dto.filial_destino_id };
      const from = await this.stock.change(
        tx,
        origin,
        new Prisma.Decimal(dto.quantidade).negated(),
      );
      const to = await this.stock.change(tx, destination, dto.quantidade);
      for (const [key, change] of [
        [origin, from],
        [destination, to],
      ] as const) {
        await this.stock.log(tx, {
          ...key,
          usuario_id: usuarioId,
          tipo_movimentacao: 'TRANSFERENCIA',
          quantidade: dto.quantidade,
          saldo_anterior: change.before,
          saldo_atual: change.after,
          referencia: reference,
          observacao: dto.observacao,
        });
      }
      return {
        message: 'Transferência concluída.',
        referencia: reference,
        origem: from.row,
        destino: to.row,
      };
    });
  }

  async listarHistorico(dto: HistoricoMovimentacoesDto) {
    if (
      dto.data_inicio &&
      dto.data_fim &&
      new Date(dto.data_inicio) > new Date(dto.data_fim)
    )
      throw new BadRequestException('Período inválido.');
    const where: Prisma.logs_movimentacoesWhereInput = {
      filial_id: dto.filial_id,
      produto_id: dto.produto_id,
      tipo_movimentacao: dto.tipo,
      ...(dto.data_inicio || dto.data_fim
        ? {
            data_hora: {
              gte: dto.data_inicio ? new Date(dto.data_inicio) : undefined,
              lte: dto.data_fim ? new Date(dto.data_fim) : undefined,
            },
          }
        : {}),
    };
    const [total, rows] = await Promise.all([
      this.prisma.logs_movimentacoes.count({ where }),
      this.prisma.logs_movimentacoes.findMany({
        where,
        orderBy: { id: 'desc' },
        take: dto.limit,
        skip: (dto.pagina - 1) * dto.limit,
        include: {
          produtos: { select: { id: true, nome: true, codigo_barras: true } },
          filiais: true,
          usuarios: { select: { id: true, nome: true } },
          lotes: { select: { id: true, numero_lote: true } },
        },
      }),
    ]);
    return {
      dados: rows.map((row) => ({ ...row, id: String(row.id) })),
      meta: {
        total,
        pagina: dto.pagina,
        limite: dto.limit,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
  }
}
