import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { StockService } from '../common/services/stock.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { FiltroPedidosDto } from './dto/filtro-pedidos.dto';
import { NotFoundException } from '@nestjs/common';
import { businessDay } from '../common/dates';

const details = {
  clientes: {
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      cpf_cnpj: true,
    },
  },
  filiais: true,
  usuarios: { select: { id: true, nome: true } },
  itens_venda: {
    include: {
      produtos: {
        select: {
          id: true,
          nome: true,
          codigo_barras: true,
          preco_venda: true,
        },
      },
      lotes: true,
    },
  },
} satisfies Prisma.pedidos_vendaInclude;

@Injectable()
export class PedidosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockService,
  ) {}

  processarCheckout(dto: CreateCheckoutDto, usuarioId: number) {
    return this.create(dto, usuarioId, false);
  }
  criarReserva(dto: CreateReservaDto, usuarioId: number) {
    return this.create(dto, usuarioId, true);
  }

  private async create(
    dto: CreateReservaDto | CreateCheckoutDto,
    usuarioId: number,
    reserve: boolean,
  ) {
    return this.stock.write(
      dto.itens.map((i) => i.produto_id),
      async (tx) => {
        if (!(await tx.filiais.findUnique({ where: { id: dto.filial_id } })))
          throw new NotFoundException('Filial não encontrada.');
        if (
          dto.cliente_id &&
          !(await tx.clientes.findUnique({ where: { id: dto.cliente_id } }))
        )
          throw new NotFoundException('Cliente não encontrado.');
        const priced = await Promise.all(
          dto.itens.map(async (item) => {
            const product = await tx.produtos.findUniqueOrThrow({
              where: { id: item.produto_id },
            });
            if (!product.ativo)
              throw new BadRequestException(
                'O produto ' + product.nome + ' está inativo.',
              );
            if (
              item.preco_unitario !== undefined &&
              !product.preco_venda.equals(item.preco_unitario)
            )
              throw new BadRequestException(
                'O preço de ' + product.nome + ' mudou. Atualize o carrinho.',
              );
            if (item.lote_id) {
              const lot = await tx.lotes.findUnique({
                where: { id: item.lote_id },
              });
              const today = businessDay();
              if (lot && lot.data_validade.toISOString().slice(0, 10) < today)
                throw new BadRequestException(
                  'Não é possível vender um lote vencido.',
                );
            }
            return { ...item, preco_unitario: product.preco_venda };
          }),
        );
        const subtotal = priced
          .reduce(
            (sum, i) => sum.plus(i.preco_unitario.times(i.quantidade)),
            new Prisma.Decimal(0),
          )
          .toDecimalPlaces(2);
        const discount = new Prisma.Decimal(dto.desconto ?? 0);
        if (discount.greaterThan(subtotal))
          throw new BadRequestException(
            'O desconto não pode exceder o subtotal.',
          );
        const total = subtotal.minus(discount);
        const expiration = reserve
          ? new Date(
              Date.now() +
                ('minutos_expiracao' in dto ? dto.minutos_expiracao : 15) *
                  60000,
            )
          : null;
        const order = await tx.pedidos_venda.create({
          data: {
            usuario_id: usuarioId,
            cliente_id: dto.cliente_id ?? null,
            filial_id: dto.filial_id,
            total,
            pagamento: dto.pagamento,
            desconto: discount,
            observacao: dto.observacao,
            status: reserve ? 'ORCAMENTO' : 'CONCLUIDO',
            reservado_ate: expiration,
          },
        });
        for (const item of priced) {
          const key = {
            produto_id: item.produto_id,
            filial_id: dto.filial_id,
            lote_id: item.lote_id ?? null,
          };
          const quantity = new Prisma.Decimal(item.quantidade);
          const change = await this.stock.change(
            tx,
            key,
            reserve ? 0 : quantity.negated(),
            reserve ? quantity : 0,
          );
          await tx.itens_venda.create({
            data: {
              pedido_id: order.id,
              produto_id: item.produto_id,
              lote_id: item.lote_id ?? null,
              quantidade: quantity,
              preco_unitario: item.preco_unitario,
            },
          });
          if (!reserve)
            await this.stock.log(tx, {
              ...key,
              usuario_id: usuarioId,
              tipo_movimentacao: 'SAIDA',
              quantidade: quantity,
              saldo_anterior: change.before,
              saldo_atual: change.after,
              origem_id: order.id,
              referencia: 'VENDA:' + order.id,
              observacao: dto.observacao,
            });
        }
        if (reserve)
          await this.audit(tx, order.id, usuarioId, 'RESERVA_CRIADA');
        return {
          message: reserve ? 'Reserva criada.' : 'Venda concluída.',
          pedido_id: order.id,
          total: Number(total),
          reservado_ate: expiration,
        };
      },
    );
  }

  private audit(
    tx: Prisma.TransactionClient,
    id: number,
    user: number,
    action: string,
  ) {
    return tx.logAuditoriaEstoque.create({
      data: {
        usuarioId: String(user),
        acao: action,
        recurso: 'PEDIDO',
        recursoId: String(id),
      },
    });
  }

  private async lockedOrder(tx: Prisma.TransactionClient, id: number) {
    await tx.$queryRaw(
      Prisma.sql`SELECT id FROM pedidos_venda WHERE id = ${id} FOR UPDATE`,
    );
    const order = await tx.pedidos_venda.findUnique({
      where: { id },
      include: { itens_venda: true },
    });
    if (!order) throw new NotFoundException('Pedido não encontrado.');
    return order;
  }

  async confirmarReserva(id: number, usuarioId: number) {
    const initial = await this.buscarPorId(id);
    return this.stock.write(
      initial.itens_venda.map((i) => i.produto_id),
      async (tx) => {
        const order = await this.lockedOrder(tx, id);
        if (order.status !== 'ORCAMENTO')
          throw new BadRequestException(
            'Somente reservas abertas podem ser confirmadas.',
          );
        if (!order.reservado_ate || order.reservado_ate <= new Date())
          throw new BadRequestException('A reserva expirou.');
        for (const item of order.itens_venda) {
          if (item.lote_id) {
            const lot = await tx.lotes.findUnique({
              where: { id: item.lote_id },
            });
            if (
              lot &&
              lot.data_validade.toISOString().slice(0, 10) < businessDay()
            )
              throw new BadRequestException(
                'A reserva contém um lote vencido.',
              );
          }
          const key = {
            produto_id: item.produto_id,
            filial_id: order.filial_id,
            lote_id: item.lote_id,
          };
          const change = await this.stock.change(
            tx,
            key,
            item.quantidade.negated(),
            item.quantidade.negated(),
          );
          await this.stock.log(tx, {
            ...key,
            usuario_id: usuarioId,
            tipo_movimentacao: 'SAIDA',
            quantidade: item.quantidade,
            saldo_anterior: change.before,
            saldo_atual: change.after,
            origem_id: id,
            referencia: 'VENDA:' + id,
          });
        }
        await tx.pedidos_venda.update({
          where: { id },
          data: {
            status: 'CONCLUIDO',
            reservado_ate: null,
            data_venda: new Date(),
          },
        });
        await this.audit(tx, id, usuarioId, 'RESERVA_CONFIRMADA');
        return {
          message: 'Reserva convertida em venda.',
          pedido_id: id,
          status: 'CONCLUIDO',
        };
      },
    );
  }

  cancelarPedido(id: number, usuarioId: number) {
    return this.cancel(id, usuarioId, false);
  }

  private async cancel(id: number, usuarioId: number, expiredOnly: boolean) {
    const initial = await this.buscarPorId(id);
    return this.stock.write(
      initial.itens_venda.map((i) => i.produto_id),
      async (tx) => {
        const order = await this.lockedOrder(tx, id);
        if (
          expiredOnly &&
          (order.status !== 'ORCAMENTO' ||
            !order.reservado_ate ||
            order.reservado_ate > new Date())
        )
          return null;
        if (order.status === 'CANCELADO')
          throw new BadRequestException('O pedido já está cancelado.');
        const wasReserve = order.status === 'ORCAMENTO';
        for (const item of order.itens_venda) {
          const key = {
            produto_id: item.produto_id,
            filial_id: order.filial_id,
            lote_id: item.lote_id,
          };
          const change = await this.stock.change(
            tx,
            key,
            wasReserve ? 0 : item.quantidade,
            wasReserve ? item.quantidade.negated() : 0,
          );
          if (!wasReserve)
            await this.stock.log(tx, {
              ...key,
              usuario_id: usuarioId,
              tipo_movimentacao: 'ENTRADA',
              quantidade: item.quantidade,
              saldo_anterior: change.before,
              saldo_atual: change.after,
              origem_id: id,
              referencia: 'ESTORNO_VENDA:' + id,
            });
        }
        await tx.pedidos_venda.update({
          where: { id },
          data: { status: 'CANCELADO', reservado_ate: null },
        });
        await this.audit(
          tx,
          id,
          usuarioId,
          expiredOnly ? 'RESERVA_EXPIRADA' : 'PEDIDO_CANCELADO',
        );
        return {
          message: 'Pedido cancelado.',
          pedido_id: id,
          status: 'CANCELADO',
        };
      },
    );
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async limparReservasExpiradas() {
    const orders = await this.prisma.pedidos_venda.findMany({
      where: { status: 'ORCAMENTO', reservado_ate: { lte: new Date() } },
      select: { id: true, usuario_id: true },
    });
    for (const order of orders)
      await this.cancel(order.id, order.usuario_id, true);
  }

  async listarTodos(dto = new FiltroPedidosDto()) {
    const pagina = dto.pagina ?? 1,
      limite = dto.limite ?? 10;
    if (
      dto.data_inicio &&
      dto.data_fim &&
      new Date(dto.data_inicio) > new Date(dto.data_fim)
    )
      throw new BadRequestException('Período inválido.');
    const where = this.filter(dto);
    const [total, dados] = await Promise.all([
      this.prisma.pedidos_venda.count({ where }),
      this.prisma.pedidos_venda.findMany({
        where,
        include: details,
        orderBy: { id: 'desc' },
        take: limite,
        skip: (pagina - 1) * limite,
      }),
    ]);
    return {
      dados,
      meta: { total, pagina, limite, totalPages: Math.ceil(total / limite) },
    };
  }

  private filter(dto: FiltroPedidosDto): Prisma.pedidos_vendaWhereInput {
    if (
      dto.data_inicio &&
      dto.data_fim &&
      new Date(dto.data_inicio) > new Date(dto.data_fim)
    )
      throw new BadRequestException('Período inválido.');
    return {
      filial_id: dto.filial_id,
      status: dto.status,
      atendimento: dto.atendimento,
      ...(dto.pagamento
        ? {
            pagamento:
              dto.pagamento === 'CARTAO'
                ? { in: ['CREDITO', 'DEBITO'] }
                : dto.pagamento,
          }
        : {}),
      ...(dto.busca
        ? {
            OR: [
              { clientes: { nome: { contains: dto.busca } } },
              { observacao: { contains: dto.busca } },
              ...(/^#?\d+$/.test(dto.busca) &&
              Number.isSafeInteger(Number(dto.busca.replace('#', '')))
                ? [{ id: Number(dto.busca.replace('#', '')) }]
                : []),
              {
                itens_venda: {
                  some: {
                    produtos: {
                      OR: [
                        { nome: { contains: dto.busca } },
                        { codigo_barras: { contains: dto.busca } },
                      ],
                    },
                  },
                },
              },
            ],
          }
        : {}),
      ...(dto.data_inicio || dto.data_fim
        ? {
            data_venda: {
              gte: dto.data_inicio ? new Date(dto.data_inicio) : undefined,
              lte: dto.data_fim ? new Date(dto.data_fim) : undefined,
            },
          }
        : {}),
    };
  }

  async resumo(dto: FiltroPedidosDto) {
    const where = this.filter(dto),
      salesWhere = { ...where, status: 'CONCLUIDO' as const };
    const [states, sales, preparing, payments, days] = await Promise.all([
      this.prisma.pedidos_venda.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
      this.prisma.pedidos_venda.aggregate({
        where: salesWhere,
        _sum: { total: true },
        _count: { id: true },
      }),
      this.prisma.pedidos_venda.count({
        where: { ...where, status: 'CONCLUIDO', atendimento: 'EM_SEPARACAO' },
      }),
      this.prisma.pedidos_venda.groupBy({
        by: ['pagamento'],
        where: salesWhere,
        _sum: { total: true },
        _count: { id: true },
      }),
      this.prisma.pedidos_venda.findMany({
        where: {
          ...salesWhere,
          data_venda: {
            gte: dto.data_inicio
              ? new Date(dto.data_inicio)
              : new Date(Date.now() - 30 * 86400000),
            ...(dto.data_fim ? { lte: new Date(dto.data_fim) } : {}),
          },
        },
        select: { data_venda: true, total: true },
      }),
    ]);
    const daily = new Map<string, number>();
    for (const row of days) {
      const day = row.data_venda!.toLocaleDateString('en-CA', {
        timeZone: 'America/Sao_Paulo',
      });
      daily.set(day, (daily.get(day) || 0) + Number(row.total));
    }
    const count = (status: string) =>
      states.find((row) => row.status === status)?._count.id ?? 0;
    return {
      total: states.reduce((sum, row) => sum + row._count.id, 0),
      reservas: count('ORCAMENTO'),
      confirmados: count('CONCLUIDO'),
      cancelados: count('CANCELADO'),
      em_separacao: preparing,
      faturamento: Number(sales._sum.total ?? 0),
      ticket_medio: sales._count.id
        ? Number(sales._sum.total ?? 0) / sales._count.id
        : 0,
      pagamentos: payments.map((row) => ({
        pagamento: row.pagamento ?? 'Não informado',
        total: Number(row._sum.total ?? 0),
        quantidade: row._count.id,
      })),
      diario: [...daily]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([data, total]) => ({ data, total })),
    };
  }

  async atualizarAtendimento(
    id: number,
    atendimento: string,
    usuarioId: number,
  ) {
    const initial = await this.buscarPorId(id);
    return this.stock.write(
      initial.itens_venda.map((i) => i.produto_id),
      async (tx) => {
        const order = await this.lockedOrder(tx, id);
        if (order.status !== 'CONCLUIDO')
          throw new BadRequestException(
            'Confirme a venda antes de alterar a entrega.',
          );
        const updated = await tx.pedidos_venda.update({
          where: { id },
          data: { atendimento },
        });
        await this.audit(tx, id, usuarioId, 'ATENDIMENTO_' + atendimento);
        return updated;
      },
    );
  }

  async buscarPorId(id: number) {
    const order = await this.prisma.pedidos_venda.findUnique({
      where: { id },
      include: details,
    });
    if (!order) throw new NotFoundException('Pedido não encontrado.');
    return order;
  }
}
