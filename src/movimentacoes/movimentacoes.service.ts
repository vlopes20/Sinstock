import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';
import { TipoMovimentacao } from './dto/create-movimentacao.dto';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';

@Injectable()
export class MovimentacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async registrarMovimentacao(dto: CreateMovimentacaoDto, usuarioId: number) {
    return await this.prisma.$transaction(async (tx) => {
      
      const saldoRegistro = await tx.saldos_estoque.findFirst({
        where: {
          produto_id: dto.produto_id,
          filial_id: dto.filial_id,
          lote_id: dto.lote_id || null, 
        },
      });

      const saldoAnterior = saldoRegistro ? Number(saldoRegistro.quantidade) : 0;
      let saldoAtualNovo = 0;

      if (dto.tipo === TipoMovimentacao.ENTRADA) {
        saldoAtualNovo = saldoAnterior + dto.quantidade;

        if (saldoRegistro) {
          await tx.saldos_estoque.update({
            where: { id: saldoRegistro.id },
            data: { 
              quantidade: saldoAtualNovo,
              atualizado_em: new Date(), 
             },
          });
        } else {
          await tx.saldos_estoque.create({
            data: {
              produto_id: dto.produto_id,
              filial_id: dto.filial_id,
              lote_id: dto.lote_id,
              quantidade: saldoAtualNovo,
            },
          });
        }
      }

      if (dto.tipo === TipoMovimentacao.SAIDA) {
        if (!saldoRegistro || saldoAnterior < dto.quantidade) {
          throw new BadRequestException(
            `Estoque insuficiente. Saldo atual: ${saldoAnterior}, Tentativa de saída: ${dto.quantidade}.`
          );
        }

        saldoAtualNovo = saldoAnterior - dto.quantidade;

        await tx.saldos_estoque.update({
          where: { id: saldoRegistro.id },
          data: { 
            quantidade: saldoAtualNovo,
            atualizado_em: new Date(),
           },
        });
      }

      const log = await tx.logs_movimentacoes.create({
        data: {
          produto_id: dto.produto_id,
          filial_id: dto.filial_id,
          lote_id: dto.lote_id,
          usuario_id: usuarioId,
          tipo_movimentacao: dto.tipo as any, 
          quantidade: dto.quantidade,
          saldo_anterior: saldoAnterior,
          saldo_atual: saldoAtualNovo,
        },
      });

      return {
        message: `Movimentação de ${dto.tipo} registrada com sucesso!`,
        log: {
          ...log,
          id: log.id.toString(),
          quantidade: Number(log.quantidade),
          saldo_anterior: Number(log.saldo_anterior),
          saldo_atual: Number(log.saldo_atual),
        },
      };
    });
  }

  async transferirSaldo(dto: CreateTransferenciaDto, usuarioId: number) {
    if (dto.filial_origem_id === dto.filial_destino_id) {
      throw new BadRequestException('A filial de origem e de destino não podem ser iguais.');
    }

    return await this.prisma.$transaction(async (tx) => {
      const saldoOrigem = await tx.saldos_estoque.findFirst({
        where: {
          produto_id: dto.produto_id,
          filial_id: dto.filial_origem_id,
          lote_id: dto.lote_id || null,
        },
      });

      const qtdOrigemAtual = saldoOrigem ? Number(saldoOrigem.quantidade) : 0;

      if (!saldoOrigem || qtdOrigemAtual < dto.quantidade) {
        throw new BadRequestException(
          `Estoque insuficiente na filial de origem (ID: ${dto.filial_origem_id}). Saldo atual: ${qtdOrigemAtual}, Tentativa: ${dto.quantidade}.`
        );
      }

      const novoSaldoOrigem = qtdOrigemAtual - dto.quantidade;
      await tx.saldos_estoque.update({
        where: { id: saldoOrigem.id },
        data: {
          quantidade: novoSaldoOrigem,
          atualizado_em: new Date(),
        },
      });

      const saldoDestino = await tx.saldos_estoque.findFirst({
        where: {
          produto_id: dto.produto_id,
          filial_id: dto.filial_destino_id,
          lote_id: dto.lote_id || null,
        },
      });

      const qtdDestinoAtual = saldoDestino ? Number(saldoDestino.quantidade) : 0;
      const novoSaldoDestino = qtdDestinoAtual + dto.quantidade;

      if (saldoDestino) {
        await tx.saldos_estoque.update({
          where: { id: saldoDestino.id },
          data: {
            quantidade: novoSaldoDestino,
            atualizado_em: new Date(),
          },
        });
      } else {
        await tx.saldos_estoque.create({
          data: {
            produto_id: dto.produto_id,
            filial_id: dto.filial_destino_id,
            lote_id: dto.lote_id || null,
            quantidade: novoSaldoDestino,
          },
        });
      }

      const logSaida = await tx.logs_movimentacoes.create({
        data: {
          produto_id: dto.produto_id,
          filial_id: dto.filial_origem_id,
          lote_id: dto.lote_id || null,
          usuario_id: usuarioId,
          tipo_movimentacao: TipoMovimentacao.SAIDA as any,
          quantidade: dto.quantidade,
          saldo_anterior: qtdOrigemAtual,
          saldo_atual: novoSaldoOrigem,
          origem_id: dto.filial_destino_id,
        },
      });

      const logEntrada = await tx.logs_movimentacoes.create({
        data: {
          produto_id: dto.produto_id,
          filial_id: dto.filial_destino_id,
          lote_id: dto.lote_id || null,
          usuario_id: usuarioId,
          tipo_movimentacao: TipoMovimentacao.ENTRADA as any,
          quantidade: dto.quantidade,
          saldo_anterior: qtdDestinoAtual,
          saldo_atual: novoSaldoDestino,
          origem_id: dto.filial_origem_id,
        },
      });

      return {
        message: 'Transferência entre unidades realizada com sucesso!',
        detalhes: {
          produto_id: dto.produto_id,
          quantidade_transferida: dto.quantidade,
          origem: {
            filial_id: dto.filial_origem_id,
            saldo_anterior: qtdOrigemAtual,
            saldo_atual: novoSaldoOrigem,
            log_id: logSaida.id.toString(),
          },
          destino: {
            filial_id: dto.filial_destino_id,
            saldo_anterior: qtdDestinoAtual,
            saldo_atual: novoSaldoDestino,
            log_id: logEntrada.id.toString(),
          },
        },
      };
    });
  }
}