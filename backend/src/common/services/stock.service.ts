import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { StockEventsService } from './stock-events.service';

export type StockKey = {
  produto_id: number;
  filial_id: number;
  lote_id?: number | null;
};

@Injectable()
export class StockService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: StockEventsService,
  ) {}

  async lowStock(filialId?: number) {
    return this.prisma.$queryRaw<
      {
        produto_id: number;
        produto_nome: string;
        filial_id: number;
        filial_nome: string;
        quantidade_atual: Prisma.Decimal;
        estoque_minimo: Prisma.Decimal;
      }[]
    >(Prisma.sql`
      SELECT p.id AS produto_id, p.nome AS produto_nome, f.id AS filial_id, f.nome AS filial_nome,
        COALESCE(SUM(s.quantidade - s.quantidade_reservada), 0) AS quantidade_atual,
        COALESCE(p.estoque_minimo, 0) AS estoque_minimo
      FROM produtos p CROSS JOIN filiais f
      LEFT JOIN saldos_estoque s ON s.produto_id = p.id AND s.filial_id = f.id
      WHERE p.ativo = true ${filialId ? Prisma.sql`AND f.id = ${filialId}` : Prisma.empty}
      GROUP BY p.id, p.nome, f.id, f.nome, p.estoque_minimo
      HAVING quantidade_atual <= estoque_minimo
      ORDER BY p.nome, f.id
    `);
  }

  // Every stock writer locks product rows in a stable order, including when a balance does not exist yet.
  async write<T>(
    ids: number[],
    work: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    const products = [...new Set(ids)].sort((a, b) => a - b);
    if (
      !products.length ||
      products.some((id) => !Number.isInteger(id) || id < 1)
    )
      throw new BadRequestException('Informe produtos válidos.');
    for (let attempt = 0; ; attempt++) {
      try {
        const result = await this.prisma.$transaction(
          async (tx) => {
            const rows = await tx.$queryRaw<{ id: number }[]>(
              Prisma.sql`SELECT id FROM produtos WHERE id IN (${Prisma.join(products)}) ORDER BY id FOR UPDATE`,
            );
            if (rows.length !== products.length)
              throw new NotFoundException('Um dos produtos não existe.');
            return work(tx);
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
            maxWait: 10000,
            timeout: 20000,
          },
        );
        this.events.emit({
          tipo: 'ESTOQUE_ATUALIZADO',
          produtoIds: products,
          timestamp: new Date().toISOString(),
        });
        return result;
      } catch (error) {
        if (error?.code !== 'P2034' || attempt >= 2) throw error;
      }
    }
  }

  async balance(tx: Prisma.TransactionClient, key: StockKey) {
    if (key.lote_id) {
      const lote = await tx.lotes.findUnique({ where: { id: key.lote_id } });
      if (!lote || lote.produto_id !== key.produto_id)
        throw new BadRequestException('O lote não pertence ao produto.');
    }
    return tx.saldos_estoque.findFirst({
      where: { ...key, lote_id: key.lote_id ?? null },
    });
  }

  async change(
    tx: Prisma.TransactionClient,
    key: StockKey,
    delta: Prisma.Decimal.Value,
    reservedDelta: Prisma.Decimal.Value = 0,
  ) {
    const current = await this.balance(tx, key);
    const before = new Prisma.Decimal(current?.quantidade ?? 0);
    const reservedBefore = new Prisma.Decimal(
      current?.quantidade_reservada ?? 0,
    );
    const after = before.plus(delta).toDecimalPlaces(3);
    const reserved = reservedBefore.plus(reservedDelta).toDecimalPlaces(3);
    if (after.isNegative() || reserved.isNegative() || after.lessThan(reserved))
      throw new BadRequestException(
        `Saldo disponível insuficiente para o produto ${key.produto_id}. Disponível: ${before.minus(reservedBefore).toString()}.`,
      );
    const values = {
      quantidade: after,
      quantidade_reservada: reserved,
      atualizado_em: new Date(),
    };
    const row = current
      ? await tx.saldos_estoque.update({
          where: { id: current.id },
          data: values,
        })
      : await tx.saldos_estoque.create({
          data: { ...key, lote_id: key.lote_id ?? null, ...values },
        });
    return { row, before, after };
  }

  async log(
    tx: Prisma.TransactionClient,
    data: Prisma.logs_movimentacoesUncheckedCreateInput,
  ) {
    const row = await tx.logs_movimentacoes.create({ data });
    await tx.logAuditoriaEstoque.create({
      data: {
        usuarioId: String(data.usuario_id),
        acao: String(data.tipo_movimentacao),
        recurso: 'ESTOQUE',
        recursoId: String(row.id),
        dadosNovos: {
          produto_id: data.produto_id,
          filial_id: data.filial_id,
          lote_id: data.lote_id ?? null,
          quantidade: String(data.quantidade),
          saldo_anterior: String(data.saldo_anterior),
          saldo_atual: String(data.saldo_atual),
          referencia: data.referencia ?? null,
        },
      },
    });
    return { ...row, id: row.id.toString() };
  }

  // Weighted purchase cost of active receipts. Sales do not rewrite purchase history.
  async recalculateCost(tx: Prisma.TransactionClient, productId: number) {
    const items = await tx.itens_entrada.findMany({
      where: {
        produto_id: productId,
        notas_fiscais_entrada: { status: 'RECEBIDA' },
      },
    });
    const quantity = items.reduce(
      (sum, item) => sum.plus(item.quantidade),
      new Prisma.Decimal(0),
    );
    const value = items.reduce(
      (sum, item) => sum.plus(item.quantidade.times(item.custo_unitario)),
      new Prisma.Decimal(0),
    );
    const cost = quantity.isZero()
      ? new Prisma.Decimal(0)
      : value.dividedBy(quantity).toDecimalPlaces(2);
    await tx.produtos.update({
      where: { id: productId },
      data: { custo_medio: cost, atualizado_em: new Date() },
    });
    return cost;
  }
}
