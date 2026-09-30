import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { FiltroProdutosDto } from './dto/filtro-produtos.dto';
import { Prisma } from '../../generated/prisma';

@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(dto: CreateProdutoDto) {
    try {
      return await this.prisma.produtos.create({
        data: dto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException('A categoria informada não existe.');
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Já existe um produto cadastrado com este código de barras.');
        }
      }
      throw error;
    }
  }

  async listar(dto: FiltroProdutosDto) {
    const {
      pagina = 1,
      limite = 10,
      busca,
      categoria_id,
      apenas_estoque_baixo,
      ordenar_por = 'id',
      ordem = 'desc',
    } = dto;

    const skip = (pagina - 1) * limite;

    // Cláusula WHERE dinâmica
    const where: Prisma.produtosWhereInput = {};

    if (busca) {
      where.OR = [
        { nome: { contains: busca } },
        { codigo_barras: { contains: busca } },
      ];
    }

    if (categoria_id) {
      where.categoria_id = categoria_id;
    }

    if (apenas_estoque_baixo) {
      where.saldos_estoque = {
        some: {
          quantidade: { lte: 10 },
        },
      };
    }

    // Ordenação segura
    const camposPermitidos = ['id', 'nome', 'codigo_barras', 'criado_em'];
    const campoOrdenacao = camposPermitidos.includes(ordenar_por)
      ? ordenar_por
      : 'id';

    const orderBy = { [campoOrdenacao]: ordem };

    // Consulta paralela de total e dados paginados
    const [total, dados] = await Promise.all([
      this.prisma.produtos.count({ where }),
      this.prisma.produtos.findMany({
        where,
        skip,
        take: limite,
        orderBy,
        include: {
          categorias: true,
          saldos_estoque: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limite);

    return {
      dados,
      meta: {
        total,
        pagina,
        limite,
        totalPages,
        hasNextPage: pagina < totalPages,
        hasPreviousPage: pagina > 1,
      },
    };
  }

  async buscarPorId(id: number) {
    const produto = await this.prisma.produtos.findUnique({
      where: { id },
      include: {
        categorias: true,
        saldos_estoque: true,
      },
    });

    if (!produto) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
    }

    return produto;
  }

  async atualizar(id: number, dto: UpdateProdutoDto) {
    await this.buscarPorId(id);

    try {
      return await this.prisma.produtos.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException('A categoria informada não existe.');
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Já existe um produto cadastrado com este código de barras.');
        }
      }
      throw error;
    }
  }

  async remover(id: number) {
    await this.buscarPorId(id);

    try {
      return await this.prisma.produtos.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new BadRequestException(
          'Não é possível excluir este produto pois existem registros ou movimentações vinculadas a ele.',
        );
      }
      throw error;
    }
  }

  async buscarPorCodigoBarras(codigo: string, filialId?: number) {
    const produto = await this.prisma.produtos.findUnique({
      where: { codigo_barras: codigo },
      include: {
        categorias: {
          select: { id: true, nome: true },
        },
        saldos_estoque: {
          where: filialId ? { filial_id: filialId } : {},
          include: {
            lotes: {
              select: {
                id: true,
                numero_lote: true,
                data_validade: true,
              },
            },
          },
        },
      },
    });

    if (!produto) {
      throw new NotFoundException(
        `Produto com código de barras '${codigo}' não encontrado.`,
      );
    }

    // 1. Soma do saldo total de estoque
    const saldoTotal = produto.saldos_estoque.reduce(
      (acc, saldo) => acc + Number(saldo.quantidade ?? 0),
      0,
    );

    // 2. Trata estoque_minimo convertendo Decimal/null para number
    const estoqueMinimo = Number(produto.estoque_minimo ?? 0);

    // 3. Retorno formatado
    return {
      id: produto.id,
      nome: produto.nome,
      codigo_barras: produto.codigo_barras,
      categoria: produto.categorias?.nome ?? null,
      estoque_minimo: estoqueMinimo,
      saldo_total: saldoTotal,
      alerta_estoque_baixo: saldoTotal <= estoqueMinimo,
      lotes: produto.saldos_estoque.map((saldo) => ({
        saldo_id: saldo.id,
        filial_id: saldo.filial_id,
        lote_id: saldo.lote_id,
        numero_lote: saldo.lotes?.numero_lote,
        data_validade: saldo.lotes?.data_validade,
        quantidade: Number(saldo.quantidade ?? 0),
      })),
    };
  }
}