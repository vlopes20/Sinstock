import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginacaoFiltroDto } from '../common/dto/paginacao-filtro.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SaldosEstoqueService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(paginationDto: PaginacaoFiltroDto, filialId?: number, produtoId?: number) {
    const { pagina = 1, limite = 10 } = paginationDto;
    const skip = (pagina - 1) * limite;

    const where: any = {};
    if (filialId) where.filial_id = filialId;
    if (produtoId) where.produto_id = produtoId;

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
      const saldoDisponivel = saldoTotal - saldoReservado;
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
      throw new NotFoundException(`Registro de saldo com ID ${id} não encontrado.`);
    }

    const saldoTotal = Number(item.quantidade);
    const saldoReservado = Number(item.quantidade_reservada);
    const saldoDisponivel = saldoTotal - saldoReservado;
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