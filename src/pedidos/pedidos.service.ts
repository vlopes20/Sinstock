import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { TipoMovimentacao } from '../movimentacoes/dto/create-movimentacao.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  async processarCheckout(dto: CreateCheckoutDto, usuarioId: number) {
    if (!dto.itens || dto.itens.length === 0) {
      throw new BadRequestException('O carrinho de compras não pode estar vazio.');
    }

    const totalPedido = dto.itens.reduce(
      (acc, item) => acc + item.quantidade * item.preco_unitario,
      0,
    );

    return await this.prisma.$transaction(async (tx) => {
      const pedido = await tx.pedidos_venda.create({
        data: {
          usuario_id: usuarioId,
          cliente_id: dto.cliente_id || null,
          filial_id: dto.filial_id,
          total: totalPedido,
          status: 'CONCLUIDO',
        },
      });

      for (const item of dto.itens) {
        const saldoRegistro = await tx.saldos_estoque.findFirst({
          where: {
            produto_id: item.produto_id,
            filial_id: dto.filial_id,
            lote_id: item.lote_id || null,
          },
        });

        const saldoTotal = saldoRegistro ? Number(saldoRegistro.quantidade) : 0;
        const saldoReservado = saldoRegistro ? Number(saldoRegistro.quantidade_reservada) : 0;
        const saldoDisponivel = saldoTotal - saldoReservado;

        if (!saldoRegistro || saldoDisponivel < item.quantidade) {
          throw new BadRequestException(
            `Estoque disponível insuficiente para o produto ID ${item.produto_id}. Saldo livre: ${saldoDisponivel}, Tentativa: ${item.quantidade}.`,
          );
        }

        const saldoAtualNovo = saldoTotal - item.quantidade;

        await tx.saldos_estoque.update({
          where: { id: saldoRegistro.id },
          data: {
            quantidade: saldoAtualNovo,
            atualizado_em: new Date(),
          },
        });

        await tx.itens_venda.create({
          data: {
            pedido_id: pedido.id,
            produto_id: item.produto_id,
            lote_id: item.lote_id || null,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario,
          },
        });

        await tx.logs_movimentacoes.create({
          data: {
            produto_id: item.produto_id,
            filial_id: dto.filial_id,
            lote_id: item.lote_id || null,
            usuario_id: usuarioId,
            tipo_movimentacao: TipoMovimentacao.SAIDA as any,
            quantidade: item.quantidade,
            saldo_anterior: saldoTotal,
            saldo_atual: saldoAtualNovo,
            origem_id: pedido.id,
          },
        });
      }

      return {
        message: 'Checkout processado com sucesso!',
        pedido_id: pedido.id,
        total: totalPedido,
      };
    });
  }

  async criarReserva(dto: CreateReservaDto, usuarioId: number) {
    if (!dto.itens || dto.itens.length === 0) {
      throw new BadRequestException('O carrinho não pode estar vazio.');
    }

    const minutosExpira = dto.minutos_expiracao || 15;
    const reservadoAte = new Date(Date.now() + minutosExpira * 60 * 1000);

    const totalPedido = dto.itens.reduce(
      (acc, item) => acc + item.quantidade * item.preco_unitario,
      0,
    );

    return await this.prisma.$transaction(async (tx) => {
      const pedido = await tx.pedidos_venda.create({
        data: {
          usuario_id: usuarioId,
          cliente_id: dto.cliente_id || null,
          filial_id: dto.filial_id,
          total: totalPedido,
          status: 'ORCAMENTO',
          reservado_ate: reservadoAte,
        },
      });

      for (const item of dto.itens) {
        const saldoRegistro = await tx.saldos_estoque.findFirst({
          where: {
            produto_id: item.produto_id,
            filial_id: dto.filial_id,
            lote_id: item.lote_id || null,
          },
        });

        const saldoTotal = saldoRegistro ? Number(saldoRegistro.quantidade) : 0;
        const saldoReservado = saldoRegistro ? Number(saldoRegistro.quantidade_reservada) : 0;
        const saldoDisponivel = saldoTotal - saldoReservado;

        if (!saldoRegistro || saldoDisponivel < item.quantidade) {
          throw new BadRequestException(
            `Estoque indisponível para reserva do produto ID ${item.produto_id}. Livre: ${saldoDisponivel}, Solicitado: ${item.quantidade}.`,
          );
        }

        await tx.saldos_estoque.update({
          where: { id: saldoRegistro.id },
          data: {
            quantidade_reservada: saldoReservado + item.quantidade,
            atualizado_em: new Date(),
          },
        });

        await tx.itens_venda.create({
          data: {
            pedido_id: pedido.id,
            produto_id: item.produto_id,
            lote_id: item.lote_id || null,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario,
          },
        });
      }

      return {
        message: `Reserva realizada com sucesso! Válida até ${reservadoAte.toISOString()}`,
        pedido_id: pedido.id,
        reservado_ate: reservadoAte,
        total: totalPedido,
      };
    });
  }

  // 3. Confirmar Reserva (Converter ORCAMENTO -> CONCLUIDO)
  async confirmarReserva(id: number, usuarioId: number) {
    const pedido = await this.prisma.pedidos_venda.findUnique({
      where: { id },
      include: { itens_venda: true },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado.`);
    }

    if (pedido.status !== 'ORCAMENTO') {
      throw new BadRequestException(`Apenas pedidos com status 'ORCAMENTO' podem ser confirmados.`);
    }

    if (pedido.reservado_ate && new Date() > pedido.reservado_ate) {
      throw new BadRequestException(`A reserva para este pedido expirou em ${pedido.reservado_ate}.`);
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.pedidos_venda.update({
        where: { id },
        data: {
          status: 'CONCLUIDO',
          reservado_ate: null,
        },
      });

      for (const item of pedido.itens_venda) {
        const saldoRegistro = await tx.saldos_estoque.findFirst({
          where: {
            produto_id: item.produto_id,
            filial_id: pedido.filial_id,
            lote_id: item.lote_id || null,
          },
        });

        if (!saldoRegistro) {
          throw new BadRequestException(
            `Registro de estoque não encontrado para o produto ID ${item.produto_id}.`,
          );
        }

        const saldoTotal = Number(saldoRegistro.quantidade);
        const saldoReservado = Number(saldoRegistro.quantidade_reservada);
        const qtdItem = Number(item.quantidade);

        const novoTotal = saldoTotal - qtdItem;
        const novoReservado = Math.max(0, saldoReservado - qtdItem);

        await tx.saldos_estoque.update({
          where: { id: saldoRegistro.id },
          data: {
            quantidade: novoTotal,
            quantidade_reservada: novoReservado,
            atualizado_em: new Date(),
          },
        });

        await tx.logs_movimentacoes.create({
          data: {
            produto_id: item.produto_id,
            filial_id: pedido.filial_id,
            lote_id: item.lote_id || null,
            usuario_id: usuarioId,
            tipo_movimentacao: TipoMovimentacao.SAIDA as any,
            quantidade: qtdItem,
            saldo_anterior: saldoTotal,
            saldo_atual: novoTotal,
            origem_id: pedido.id,
          },
        });
      }

      return {
        message: `Reserva do pedido #${id} convertida em venda concluída!`,
        pedido_id: id,
        status: 'CONCLUIDO',
      };
    });
  }

  async cancelarPedido(id: number, usuarioId: number) {
    const pedido = await this.prisma.pedidos_venda.findUnique({
      where: { id },
      include: { itens_venda: true },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado.`);
    }

    if (pedido.status === 'CANCELADO') {
      throw new BadRequestException('Este pedido já está cancelado.');
    }

    const eraOrcamento = pedido.status === 'ORCAMENTO';

    return await this.prisma.$transaction(async (tx) => {
      await tx.pedidos_venda.update({
        where: { id },
        data: {
          status: 'CANCELADO',
          reservado_ate: null,
        },
      });

      for (const item of pedido.itens_venda) {
        const qtd = Number(item.quantidade);

        const saldoRegistro = await tx.saldos_estoque.findFirst({
          where: {
            produto_id: item.produto_id,
            filial_id: pedido.filial_id,
            lote_id: item.lote_id || null,
          },
        });

        if (saldoRegistro) {
          if (eraOrcamento) {
            // Se era reserva, apenas reduz a quantidade reservada
            const saldoReservado = Number(saldoRegistro.quantidade_reservada);
            await tx.saldos_estoque.update({
              where: { id: saldoRegistro.id },
              data: {
                quantidade_reservada: Math.max(0, saldoReservado - qtd),
                atualizado_em: new Date(),
              },
            });
          } else {
            // Se era CONCLUIDO, estorna a quantidade ao saldo total
            const saldoAnterior = Number(saldoRegistro.quantidade);
            const saldoAtualNovo = saldoAnterior + qtd;

            await tx.saldos_estoque.update({
              where: { id: saldoRegistro.id },
              data: {
                quantidade: saldoAtualNovo,
                atualizado_em: new Date(),
              },
            });

            await tx.logs_movimentacoes.create({
              data: {
                produto_id: item.produto_id,
                filial_id: pedido.filial_id,
                lote_id: item.lote_id || null,
                usuario_id: usuarioId,
                tipo_movimentacao: TipoMovimentacao.ENTRADA as any,
                quantidade: qtd,
                saldo_anterior: saldoAnterior,
                saldo_atual: saldoAtualNovo,
                origem_id: pedido.id,
              },
            });
          }
        }
      }

      return {
        message: `Pedido #${id} cancelado com sucesso!`,
        pedido_id: id,
        status: 'CANCELADO',
      };
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async limparReservasExpiradas() {
    const agora = new Date();

    const reservasExpiradas = await this.prisma.pedidos_venda.findMany({
      where: {
        status: 'ORCAMENTO',
        reservado_ate: {
          lt: agora,
        },
      },
      include: {
        itens_venda: true,
      },
    });

    if (reservasExpiradas.length === 0) return;

    for (const pedido of reservasExpiradas) {
      await this.prisma.$transaction(async (tx) => {
        await tx.pedidos_venda.update({
          where: { id: pedido.id },
          data: { status: 'CANCELADO' },
        });

        for (const item of pedido.itens_venda) {
          const qtd = Number(item.quantidade);

          const saldoRegistro = await tx.saldos_estoque.findFirst({
            where: {
              produto_id: item.produto_id,
              filial_id: pedido.filial_id,
              lote_id: item.lote_id || null,
            },
          });

          if (saldoRegistro) {
            const saldoReservado = Number(saldoRegistro.quantidade_reservada);
            await tx.saldos_estoque.update({
              where: { id: saldoRegistro.id },
              data: {
                quantidade_reservada: Math.max(0, saldoReservado - qtd),
                atualizado_em: new Date(),
              },
            });
          }
        }
      });
      console.log(`[Cron] Reserva do pedido #${pedido.id} expirou e o estoque reservado foi liberado.`);
    }
  }

  async listarTodos() {
    return this.prisma.pedidos_venda.findMany({
      include: {
        clientes: { select: { id: true, nome: true, email: true } },
        filiais: { select: { id: true, nome: true } },
        usuarios: { select: { id: true, nome: true } },
        itens_venda: {
          include: {
            produtos: { select: { id: true, nome: true, preco_venda: true } },
          },
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  async buscarPorId(id: number) {
    const pedido = await this.prisma.pedidos_venda.findUnique({
      where: { id },
      include: {
        clientes: { select: { id: true, nome: true, email: true, cpf_cnpj: true, telefone: true } },
        filiais: { select: { id: true, nome: true } },
        usuarios: { select: { id: true, nome: true, email: true } },
        itens_venda: {
          include: {
            produtos: { select: { id: true, nome: true, codigo_barras: true } },
            lotes: { select: { id: true, numero_lote: true } },
          },
        },
      },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado.`);
    }

    return pedido;
  }
}