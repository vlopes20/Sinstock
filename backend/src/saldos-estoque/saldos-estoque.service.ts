import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginacaoFiltroDto } from '../common/dto/paginacao-filtro.dto';
import { PrismaService } from '../prisma/prisma.service';
import { StockService } from '../common/services/stock.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SaldosEstoqueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockService,
  ) {}

  async resumo(filialId?: number) {
    const [totals, groups, low] = await Promise.all([
      this.prisma.$queryRaw<
        {
          fisico: Prisma.Decimal;
          reservado: Prisma.Decimal;
          valor: Prisma.Decimal;
        }[]
      >(Prisma.sql`
        SELECT COALESCE(SUM(s.quantidade), 0) AS fisico,
          COALESCE(SUM(s.quantidade_reservada), 0) AS reservado,
          COALESCE(SUM(s.quantidade * COALESCE(p.custo_medio, 0)), 0) AS valor
        FROM saldos_estoque s JOIN produtos p ON p.id = s.produto_id
        ${filialId ? Prisma.sql`WHERE s.filial_id = ${filialId}` : Prisma.empty}
      `),
      this.prisma.$queryRaw<{ id: number }[]>(Prisma.sql`
        SELECT p.id FROM produtos p LEFT JOIN saldos_estoque s ON s.produto_id = p.id
          ${filialId ? Prisma.sql`AND s.filial_id = ${filialId}` : Prisma.empty}
        WHERE p.ativo = true GROUP BY p.id
        HAVING COALESCE(SUM(s.quantidade - s.quantidade_reservada), 0) = 0
      `),
      this.stock.lowStock(filialId),
    ]);
    return {
      fisico: Number(totals[0].fisico),
      reservado: Number(totals[0].reservado),
      disponivel: new Prisma.Decimal(totals[0].fisico)
        .minus(totals[0].reservado)
        .toNumber(),
      valor: Number(totals[0].valor),
      sem_estoque: groups.length,
      estoque_baixo: new Set(low.map((row) => row.produto_id)).size,
    };
  }

  async findAll(
    paginationDto: PaginacaoFiltroDto,
    filialId?: number,
    produtoId?: number,
  ) {
    const { pagina = 1, limite = 10 } = paginationDto;
    const skip = (pagina - 1) * limite;

    const where: any = {};
    if (filialId) where.filial_id = filialId;
    if (produtoId) where.produto_id = produtoId;
    if (paginationDto.busca)
      where.produtos = {
        OR: [
          { nome: { contains: paginationDto.busca } },
          { codigo_barras: { contains: paginationDto.busca } },
          { marca: { contains: paginationDto.busca } },
        ],
      };

    const [total, rawData] = await Promise.all([
      this.prisma.saldos_estoque.count({ where }),
      this.prisma.saldos_estoque.findMany({
        where,
        skip,
        take: limite,
        include: {
          filiais: { select: { id: true, nome: true } },
          produtos: {
            select: {
              id: true,
              nome: true,
              codigo_barras: true,
              estoque_minimo: true,
            },
          },
          lotes: true,
        },
        orderBy: { atualizado_em: 'desc' },
      }),
    ]);

    const formattedData = rawData.map((item) => {
      const saldoTotal = Number(item.quantidade);
      const saldoReservado = Number(item.quantidade_reservada);
      const saldoDisponivel = item.quantidade
        .minus(item.quantidade_reservada)
        .toNumber();
      const estoqueMinimo = item.produtos.estoque_minimo
        ? Number(item.produtos.estoque_minimo)
        : 0;

      return {
        ...item,
        saldo_total: saldoTotal,
        saldo_reservado: saldoReservado,
        saldo_disponivel: saldoDisponivel,
        alerta_estoque_baixo: saldoDisponivel <= estoqueMinimo,
      };
    });

    const totalPages = Math.ceil(total / limite);

    return {
      data: formattedData,
      meta: {
        totalItems: total,
        itemCount: formattedData.length,
        itemsPerPage: limite,
        totalPages,
        currentPage: pagina,
      },
    };
  }

  async findOne(id: number) {
    const item = await this.prisma.saldos_estoque.findUnique({
      where: { id },
      include: {
        filiais: { select: { id: true, nome: true } },
        produtos: {
          select: {
            id: true,
            nome: true,
            codigo_barras: true,
            estoque_minimo: true,
          },
        },
        lotes: true,
      },
    });

    if (!item) {
      throw new NotFoundException(
        `Registro de saldo com ID ${id} não encontrado.`,
      );
    }

    const saldoTotal = Number(item.quantidade);
    const saldoReservado = Number(item.quantidade_reservada);
    const saldoDisponivel = item.quantidade
      .minus(item.quantidade_reservada)
      .toNumber();
    const estoqueMinimo = item.produtos.estoque_minimo
      ? Number(item.produtos.estoque_minimo)
      : 0;

    return {
      ...item,
      saldo_total: saldoTotal,
      saldo_reservado: saldoReservado,
      saldo_disponivel: saldoDisponivel,
      alerta_estoque_baixo: saldoDisponivel <= estoqueMinimo,
    };
  }
}
