import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StockService } from '../common/services/stock.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { FiltroProdutosDto } from './dto/filtro-produtos.dto';
import { businessDay } from '../common/dates';
import { SinstockSettingsService } from '../configuracoes/configuracoes.service';

@Injectable()
export class ProdutosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockService,
    private readonly settings: SinstockSettingsService,
  ) {}
  private normalized(dto: UpdateProdutoDto) {
    return {
      ...dto,
      codigo_barras: dto.codigo_barras?.trim() || null,
      sku: dto.sku?.trim() || null,
    };
  }
  async criar(dto: CreateProdutoDto) {
    const settings = await this.settings.stock();
    return this.prisma.produtos.create({
      data: {
        ...dto,
        ...this.normalized(dto),
        estoque_minimo: dto.estoque_minimo ?? settings.estoque_minimo_padrao,
      },
    });
  }
  async listar(dto: FiltroProdutosDto) {
    const pagina = dto.pagina ?? 1,
      limite = dto.limite ?? 10;
    if (
      dto.data_inicio &&
      dto.data_fim &&
      new Date(dto.data_inicio) > new Date(dto.data_fim)
    )
      throw new BadRequestException('Período inválido.');
    const where: Prisma.produtosWhereInput = {
      categoria_id: dto.categoria_id,
      fornecedor_id: dto.fornecedor_id,
      ativo: dto.ativo,
      ...(dto.sem_movimento_dias
        ? {
            logs_movimentacoes: {
              none: {
                ...(dto.filial_id ? { filial_id: dto.filial_id } : {}),
                data_hora: {
                  gte: new Date(Date.now() - dto.sem_movimento_dias * 86400000),
                },
              },
            },
          }
        : {}),
      ...(dto.busca
        ? {
            OR: [
              { nome: { contains: dto.busca } },
              { marca: { contains: dto.busca } },
              { codigo_barras: { contains: dto.busca } },
              { sku: { contains: dto.busca } },
              { categorias: { nome: { contains: dto.busca } } },
              { fornecedores: { nome_juridico: { contains: dto.busca } } },
              { fornecedores: { nome_fantasia: { contains: dto.busca } } },
            ],
          }
        : {}),
      ...(dto.data_inicio || dto.data_fim
        ? {
            criado_em: {
              gte: dto.data_inicio ? new Date(dto.data_inicio) : undefined,
              lte: dto.data_fim ? new Date(dto.data_fim) : undefined,
            },
          }
        : {}),
    };
    if (dto.apenas_estoque_baixo || dto.estoque === 'baixo')
      where.id = {
        in: [
          ...new Set(
            (await this.stock.lowStock(dto.filial_id)).map(
              (row) => row.produto_id,
            ),
          ),
        ],
      };
    if (dto.estoque === 'normal' || dto.estoque === 'sem-estoque') {
      const ids = await this.prisma.$queryRaw<{ id: number }[]>(Prisma.sql`
        SELECT p.id FROM produtos p LEFT JOIN saldos_estoque s ON s.produto_id = p.id
          ${dto.filial_id ? Prisma.sql`AND s.filial_id = ${dto.filial_id}` : Prisma.empty}
        GROUP BY p.id, p.estoque_minimo
        HAVING COALESCE(SUM(s.quantidade - s.quantidade_reservada), 0)
          ${dto.estoque === 'normal' ? Prisma.sql`> COALESCE(p.estoque_minimo, 0)` : Prisma.sql`= 0`}
      `);
      where.id = { in: ids.map((row) => row.id) };
    }
    const order = [
      'id',
      'nome',
      'codigo_barras',
      'criado_em',
      'preco_venda',
    ].includes(dto.ordenar_por ?? '')
      ? dto.ordenar_por!
      : 'id';
    const [total, dados] = await Promise.all([
      this.prisma.produtos.count({ where }),
      this.prisma.produtos.findMany({
        where,
        skip: (pagina - 1) * limite,
        take: limite,
        orderBy: { [order]: dto.ordem ?? 'desc' },
        include: {
          categorias: true,
          fornecedores: true,
          saldos_estoque: {
            where: { filial_id: dto.filial_id },
            include: { lotes: true },
          },
        },
      }),
    ]);
    return {
      dados,
      meta: {
        total,
        pagina,
        limite,
        totalPages: Math.ceil(total / limite),
        hasNextPage: pagina * limite < total,
        hasPreviousPage: pagina > 1,
      },
    };
  }
  async buscarPorId(id: number) {
    const product = await this.prisma.produtos.findUnique({
      where: { id },
      include: {
        categorias: true,
        fornecedores: true,
        saldos_estoque: { include: { lotes: true } },
      },
    });
    if (!product) throw new NotFoundException('Produto não encontrado.');
    return product;
  }
  async resumo() {
    const limit = new Date(businessDay());
    limit.setUTCDate(
      limit.getUTCDate() + (await this.settings.stock()).dias_validade,
    );
    const [total, ativos, low, expiring] = await Promise.all([
      this.prisma.produtos.count(),
      this.prisma.produtos.count({ where: { ativo: true } }),
      this.stock.lowStock(),
      this.prisma.lotes.findMany({
        where: {
          data_validade: { lte: limit },
          saldos_estoque: { some: { quantidade: { gt: 0 } } },
        },
        select: { produto_id: true },
      }),
    ]);
    return {
      total,
      ativos,
      estoque_baixo: new Set(low.map((row) => row.produto_id)).size,
      proximos_validade: new Set(expiring.map((row) => row.produto_id)).size,
    };
  }
  atualizar(id: number, dto: UpdateProdutoDto) {
    return this.stock.write([id], (tx) =>
      tx.produtos.update({
        where: { id },
        data: {
          ...dto,
          ...(dto.codigo_barras !== undefined
            ? { codigo_barras: dto.codigo_barras.trim() || null }
            : {}),
          ...(dto.sku !== undefined ? { sku: dto.sku.trim() || null } : {}),
          atualizado_em: new Date(),
        },
      }),
    );
  }
  async remover(id: number) {
    await this.buscarPorId(id);
    return this.prisma.produtos.delete({ where: { id } });
  }
  async buscarPorCodigoBarras(codigo: string, filialId?: number) {
    const product = await this.prisma.produtos.findUnique({
      where: { codigo_barras: codigo },
      include: {
        categorias: true,
        fornecedores: true,
        saldos_estoque: {
          where: { filial_id: filialId },
          include: { lotes: true },
        },
      },
    });
    if (!product)
      throw new NotFoundException('Código de barras não cadastrado.');
    const total = product.saldos_estoque.reduce(
      (sum, row) => sum.plus(row.quantidade),
      new Prisma.Decimal(0),
    );
    const reserved = product.saldos_estoque.reduce(
      (sum, row) => sum.plus(row.quantidade_reservada),
      new Prisma.Decimal(0),
    );
    return {
      ...product,
      categoria: product.categorias.nome,
      saldo_total: Number(total),
      saldo_reservado: Number(reserved),
      saldo_disponivel: Number(total.minus(reserved)),
      alerta_estoque_baixo: total
        .minus(reserved)
        .lessThanOrEqualTo(product.estoque_minimo ?? 0),
      lotes: product.saldos_estoque.map((s) => ({
        saldo_id: s.id,
        filial_id: s.filial_id,
        lote_id: s.lote_id,
        numero_lote: s.lotes?.numero_lote,
        data_validade: s.lotes?.data_validade,
        quantidade: Number(s.quantidade),
        reservada: Number(s.quantidade_reservada),
        disponivel: Number(s.quantidade.minus(s.quantidade_reservada)),
      })),
    };
  }
}
