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

    const [total, data] = await Promise.all([
      this.prisma.saldos_estoque.count({ where }),
      this.prisma.saldos_estoque.findMany({
        where,
        skip,
        take: limite,
        include: {
          filiais: { select: { id: true, nome: true } },
          produtos: { select: { id: true, nome: true } },
          lotes: true,
        },
        orderBy: { atualizado_em: 'desc' },
      }),
    ]);

    const totalPages = Math.ceil(total / limite);

    return {
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage: limite,
        totalPages,
        currentPage: pagina,
      },
    };
  }

  async findOne(id: number) {
    const saldo = await this.prisma.saldos_estoque.findUnique({
      where: { id },
      include: {
        filiais: { select: { id: true, nome: true } },
        produtos: { select: { id: true, nome: true } },
        lotes: true,
      },
    });

    if (!saldo) {
      throw new NotFoundException(`Registro de saldo com ID ${id} não encontrado.`);
    }

    return saldo;
  }
}