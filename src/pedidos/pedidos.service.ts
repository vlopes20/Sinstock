import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { TipoMovimentacao } from '../movimentacoes/dto/create-movimentacao.dto';

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

        const saldoAnterior = saldoRegistro ? Number(saldoRegistro.quantidade) : 0;

        if (!saldoRegistro || saldoAnterior < item.quantidade) {
          throw new BadRequestException(
            `Estoque insuficiente para o produto ID ${item.produto_id}. Saldo atual: ${saldoAnterior}, Tentativa de venda: ${item.quantidade}.`
          );
        }

        const saldoAtualNovo = saldoAnterior - item.quantidade;

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
            saldo_anterior: saldoAnterior,
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
}