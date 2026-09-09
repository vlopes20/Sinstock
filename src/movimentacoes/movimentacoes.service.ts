import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovimentacaoDto, TipoMovimentacao } from './dto/create-movimentacao.dto';
// Caso o TypeScript reclame do enum no prisma, importe-o:
// import { logs_movimentacoes_tipo_movimentacao } from '../../generated/prisma'; 

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
            data: { quantidade: saldoAtualNovo },
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
          data: { quantidade: saldoAtualNovo },
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
}