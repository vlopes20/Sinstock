import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AjusteLoteDto } from './dto/ajuste-lote.dto';
import { CreateNotaFiscalEntradaDto } from './dto/create-nota-fiscal-entrada.dto';
import { EstornoNotaFiscalDto } from './dto/estorno-nota-fiscal.dto';

@Injectable()
export class NotasFiscaisEntradaService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(dto: CreateNotaFiscalEntradaDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Validar Fornecedor
      const fornecedor = await tx.fornecedores.findUnique({
        where: { id: dto.fornecedor_id },
      });
      if (!fornecedor) {
        throw new NotFoundException(
          `Fornecedor ID ${dto.fornecedor_id} não encontrado.`,
        );
      }

      // 2. Validar Usuário
      const usuario = await tx.usuarios.findUnique({
        where: { id: dto.usuario_id },
      });
      if (!usuario) {
        throw new NotFoundException(
          `Usuário ID ${dto.usuario_id} não encontrado.`,
        );
      }

      // 3. Criar Nota Fiscal de Entrada
      const notaFiscal = await tx.notas_fiscais_entrada.create({
        data: {
          fornecedor_id: dto.fornecedor_id,
          usuario_id: dto.usuario_id,
          numero_nf: dto.numero_nf,
          data_emissao: new Date(dto.data_emissao),
          data_recebimento: dto.data_recebimento
            ? new Date(dto.data_recebimento)
            : new Date(),
          total: dto.total,
          status: (dto.status ?? 'RECEBIDA') as any,
        },
      });

      // 4. Processar os itens, lotes, estoque e logs
      for (const item of dto.itens) {
        const produto = await tx.produtos.findUnique({
          where: { id: item.produto_id },
        });
        if (!produto) {
          throw new NotFoundException(
            `Produto ID ${item.produto_id} não encontrado.`,
          );
        }

        let loteId = item.lote_id;

        if (!loteId && item.lote) {
          let loteExistente = await tx.lotes.findFirst({
            where: {
              produto_id: item.produto_id,
              numero_lote: item.lote.numero_lote,
            },
          });

          if (!loteExistente) {
            loteExistente = await tx.lotes.create({
              data: {
                produto_id: item.produto_id,
                numero_lote: item.lote.numero_lote,
                data_fabricacao: item.lote.data_fabricacao
                  ? new Date(item.lote.data_fabricacao)
                  : null,
                data_validade: new Date(item.lote.data_validade),
              },
            });
          }

          loteId = loteExistente.id;
        }

        // Criar o item da nota fiscal
        await tx.itens_entrada.create({
          data: {
            nota_fiscal_id: notaFiscal.id,
            produto_id: item.produto_id,
            lote_id: loteId ?? null,
            quantidade: item.quantidade,
            custo_unitario: item.custo_unitario,
          },
        });

        // Atualizar saldo de estoque se a NF for RECEBIDA
        if (notaFiscal.status === 'RECEBIDA') {
          const filialId = dto.filial_id ?? 1;

          const saldoExistente = await tx.saldos_estoque.findFirst({
            where: {
              produto_id: item.produto_id,
              filial_id: filialId,
            },
          });

          if (saldoExistente) {
            await tx.saldos_estoque.update({
              where: { id: saldoExistente.id },
              data: { quantidade: { increment: item.quantidade } },
            });
          } else {
            await tx.saldos_estoque.create({
              data: {
                produto_id: item.produto_id,
                filial_id: filialId,
                quantidade: item.quantidade,
              } as any,
            });
          }

          // Registrar histórico de movimentação
          await tx.logs_movimentacoes.create({
            data: {
              produto_id: item.produto_id,
              lote_id: loteId ?? null,
              usuario_id: dto.usuario_id,
              tipo: 'ENTRADA' as any,
              quantidade: item.quantidade,
              descricao: `Entrada via NF ${dto.numero_nf}`,
            } as any,
          });
        }
      }

      return tx.notas_fiscais_entrada.findUnique({
        where: { id: notaFiscal.id },
        include: {
          fornecedores: true,
          usuarios: { select: { id: true, nome: true, email: true } },
          itens_entrada: {
            include: {
              produtos: true,
              lotes: true,
            },
          },
        },
      });
    });
  }

  async listar() {
    return this.prisma.notas_fiscais_entrada.findMany({
      include: {
        fornecedores: true,
        usuarios: { select: { id: true, nome: true, email: true } },
        itens_entrada: {
          include: {
            produtos: true,
            lotes: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  async buscarPorId(id: number) {
    const nf = await this.prisma.notas_fiscais_entrada.findUnique({
      where: { id },
      include: {
        fornecedores: true,
        usuarios: { select: { id: true, nome: true, email: true } },
        itens_entrada: {
          include: {
            produtos: true,
            lotes: true,
          },
        },
      },
    });

    if (!nf) {
      throw new NotFoundException(`Nota Fiscal com ID ${id} não encontrada.`);
    }

    return nf;
  }

  async estornar(id: number, dto: EstornoNotaFiscalDto) {
    return this.prisma.$transaction(async (tx) => {
      const nf = await tx.notas_fiscais_entrada.findUnique({
        where: { id },
        include: { itens_entrada: true },
      });

      if (!nf) {
        throw new NotFoundException(`Nota Fiscal com ID ${id} não encontrada.`);
      }

      if (nf.status === 'CANCELADA') {
        throw new BadRequestException(
          `A Nota Fiscal ID ${id} já está cancelada.`,
        );
      }

      // Reverter o saldo de estoque e registrar log para cada item
      if (nf.status === 'RECEBIDA') {
        for (const item of nf.itens_entrada) {
          const saldoExistente = await tx.saldos_estoque.findFirst({
            where: { produto_id: item.produto_id },
          });

          if (saldoExistente) {
            await tx.saldos_estoque.update({
              where: { id: saldoExistente.id },
              data: { quantidade: { decrement: item.quantidade } },
            });
          }

          await tx.logs_movimentacoes.create({
            data: {
              produto_id: item.produto_id,
              lote_id: item.lote_id,
              usuario_id: nf.usuario_id,
              tipo: 'SAIDA' as any,
              quantidade: item.quantidade,
              descricao: `Estorno de NF ${nf.numero_nf}. Motivo: ${dto.motivo}`,
            } as any,
          });
        }
      }

      const nfAtualizada = await tx.notas_fiscais_entrada.update({
        where: { id },
        data: { status: 'CANCELADA' as any },
        include: {
          fornecedores: true,
          usuarios: { select: { id: true, nome: true, email: true } },
          itens_entrada: {
            include: { produtos: true, lotes: true },
          },
        },
      });

      return {
        mensagem: 'Nota Fiscal estornada e estoque revertido com sucesso.',
        motivo: dto.motivo,
        nota_fiscal: nfAtualizada,
      };
    });
  }

  async ajustarLote(loteId: number, dto: AjusteLoteDto) {
    return this.prisma.$transaction(async (tx) => {
      const lote = await tx.lotes.findUnique({
        where: { id: loteId },
      });

      if (!lote) {
        throw new NotFoundException(`Lote ID ${loteId} não encontrado.`);
      }

      const loteAtualizado = await tx.lotes.update({
        where: { id: loteId },
        data: {
          ...(dto.numero_lote && { numero_lote: dto.numero_lote }),
          ...(dto.data_fabricacao && {
            data_fabricacao: new Date(dto.data_fabricacao),
          }),
          ...(dto.data_validade && {
            data_validade: new Date(dto.data_validade),
          }),
        },
      });

      if (dto.quantidade !== undefined || dto.custo_unitario !== undefined) {
        const itemEntrada = await tx.itens_entrada.findFirst({
          where: { lote_id: loteId },
        });

        if (itemEntrada) {
          await tx.itens_entrada.update({
            where: { id: itemEntrada.id },
            data: {
              ...(dto.quantidade !== undefined && {
                quantidade: dto.quantidade,
              }),
              ...(dto.custo_unitario !== undefined && {
                custo_unitario: dto.custo_unitario,
              }),
            },
          });
        }
      }

      return {
        mensagem: 'Lote e item de entrada ajustados com sucesso.',
        lote: loteAtualizado,
      };
    });
  }
}