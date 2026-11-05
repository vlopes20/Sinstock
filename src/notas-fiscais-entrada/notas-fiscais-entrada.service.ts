import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StockService } from '../common/services/stock.service';
import { AjusteLoteDto } from './dto/ajuste-lote.dto';
import { CreateNotaFiscalEntradaDto } from './dto/create-nota-fiscal-entrada.dto';
import { EstornoNotaFiscalDto } from './dto/estorno-nota-fiscal.dto';
import { FiltroNotasDto } from './dto/filtro-notas.dto';

const details = {
  fornecedores: true,
  filiais: true,
  usuarios: { select: { id: true, nome: true, email: true } },
  itens_entrada: { include: { produtos: true, lotes: true } },
} satisfies Prisma.notas_fiscais_entradaInclude;

@Injectable()
export class NotasFiscaisEntradaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockService,
  ) {}

  async criar(dto: CreateNotaFiscalEntradaDto, usuarioId: number) {
    return this.stock.write(
      dto.itens.map((i) => i.produto_id),
      async (tx) => {
        if (
          !(await tx.fornecedores.findUnique({
            where: { id: dto.fornecedor_id },
          }))
        )
          throw new NotFoundException('Fornecedor não encontrado.');
        if (!(await tx.filiais.findUnique({ where: { id: dto.filial_id } })))
          throw new NotFoundException('Filial não encontrada.');
        const total = dto.itens
          .reduce(
            (sum, i) =>
              sum.plus(
                new Prisma.Decimal(i.quantidade).times(i.custo_unitario),
              ),
            new Prisma.Decimal(0),
          )
          .toDecimalPlaces(2);
        const nf = await tx.notas_fiscais_entrada.create({
          data: {
            fornecedor_id: dto.fornecedor_id,
            filial_id: dto.filial_id,
            usuario_id: usuarioId,
            numero_nf: dto.numero_nf,
            data_emissao: new Date(dto.data_emissao),
            observacao: dto.observacao,
            data_recebimento:
              (dto.status ?? 'RECEBIDA') === 'RECEBIDA'
                ? new Date(dto.data_recebimento ?? Date.now())
                : null,
            status: dto.status ?? 'RECEBIDA',
            total,
          },
        });
        for (const item of dto.itens) {
          if (item.lote_id && item.lote)
            throw new BadRequestException(
              'Informe lote_id ou um novo lote, sem combinar os dois.',
            );
          let loteId = item.lote_id;
          if (item.lote) {
            const data = item.lote;
            if (
              data.data_fabricacao &&
              new Date(data.data_fabricacao) > new Date(data.data_validade)
            )
              throw new BadRequestException(
                'A fabricação deve ser anterior à validade.',
              );
            const existing = await tx.lotes.findUnique({
              where: {
                produto_id_numero_lote: {
                  produto_id: item.produto_id,
                  numero_lote: data.numero_lote,
                },
              },
            });
            if (
              existing &&
              existing.data_validade.toISOString().slice(0, 10) !==
                data.data_validade.slice(0, 10)
            )
              throw new BadRequestException(
                'O lote cadastrado tem outra validade.',
              );
            const lot =
              existing ??
              (await tx.lotes.create({
                data: {
                  produto_id: item.produto_id,
                  numero_lote: data.numero_lote,
                  data_fabricacao: data.data_fabricacao
                    ? new Date(data.data_fabricacao)
                    : null,
                  data_validade: new Date(data.data_validade),
                },
              }));
            loteId = lot.id;
          }
          const key = {
            produto_id: item.produto_id,
            filial_id: dto.filial_id,
            lote_id: loteId ?? null,
          };
          await this.stock.balance(tx, key); // Also validates ownership for pending receipts.
          await tx.itens_entrada.create({
            data: {
              nota_fiscal_id: nf.id,
              produto_id: item.produto_id,
              lote_id: loteId ?? null,
              quantidade: item.quantidade,
              custo_unitario: item.custo_unitario,
            },
          });
          if (nf.status === 'RECEBIDA')
            await this.applyItem(
              tx,
              key,
              item.quantidade,
              usuarioId,
              nf.id,
              nf.numero_nf,
              'ENTRADA',
              dto.observacao || 'Recebimento de nota fiscal',
            );
        }
        for (const id of new Set(dto.itens.map((i) => i.produto_id)))
          await this.stock.recalculateCost(tx, id);
        return tx.notas_fiscais_entrada.findUnique({
          where: { id: nf.id },
          include: details,
        });
      },
    );
  }

  private async applyItem(
    tx: Prisma.TransactionClient,
    key: { produto_id: number; filial_id: number; lote_id: number | null },
    quantity: Prisma.Decimal.Value,
    user: number,
    nfId: number,
    number: string,
    type: 'ENTRADA' | 'SAIDA' | 'AJUSTE',
    note: string,
  ) {
    const change = await this.stock.change(tx, key, quantity);
    await this.stock.log(tx, {
      ...key,
      usuario_id: user,
      tipo_movimentacao: type,
      quantidade: new Prisma.Decimal(quantity).abs(),
      saldo_anterior: change.before,
      saldo_atual: change.after,
      origem_id: nfId,
      referencia: 'NF:' + number,
      observacao: note,
    });
  }

  async listar(dto = new FiltroNotasDto()) {
    const pagina = dto.pagina ?? 1,
      limite = dto.limite ?? 10;
    const where: Prisma.notas_fiscais_entradaWhereInput = {
      filial_id: dto.filial_id,
      status: dto.status,
      ...(dto.produto_id
        ? { itens_entrada: { some: { produto_id: dto.produto_id } } }
        : {}),
      ...(dto.busca
        ? {
            OR: [
              { numero_nf: { contains: dto.busca } },
              { fornecedores: { nome_juridico: { contains: dto.busca } } },
            ],
          }
        : {}),
    };
    const [total, dados] = await Promise.all([
      this.prisma.notas_fiscais_entrada.count({ where }),
      this.prisma.notas_fiscais_entrada.findMany({
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

  async buscarPorId(id: number) {
    const nf = await this.prisma.notas_fiscais_entrada.findUnique({
      where: { id },
      include: details,
    });
    if (!nf) throw new NotFoundException('Nota fiscal não encontrada.');
    return nf;
  }

  private async lockedNote(tx: Prisma.TransactionClient, id: number) {
    await tx.$queryRaw(
      Prisma.sql`SELECT id FROM notas_fiscais_entrada WHERE id = ${id} FOR UPDATE`,
    );
    const nf = await tx.notas_fiscais_entrada.findUnique({
      where: { id },
      include: { itens_entrada: true },
    });
    if (!nf) throw new NotFoundException('Nota fiscal não encontrada.');
    if (!nf.filial_id)
      throw new BadRequestException(
        'Esta nota antiga não tem filial registrada. Concilie sua origem antes de alterar o estoque.',
      );
    return nf;
  }

  async receber(id: number, usuarioId: number) {
    const initial = await this.buscarPorId(id);
    return this.stock.write(
      initial.itens_entrada.map((i) => i.produto_id),
      async (tx) => {
        const nf = await this.lockedNote(tx, id);
        if (nf.status !== 'PENDENTE')
          throw new BadRequestException(
            'Somente notas pendentes podem ser recebidas.',
          );
        for (const item of nf.itens_entrada)
          await this.applyItem(
            tx,
            {
              produto_id: item.produto_id,
              filial_id: nf.filial_id!,
              lote_id: item.lote_id,
            },
            item.quantidade,
            usuarioId,
            nf.id,
            nf.numero_nf,
            'ENTRADA',
            nf.observacao || 'Recebimento de nota fiscal pendente',
          );
        await tx.notas_fiscais_entrada.update({
          where: { id },
          data: { status: 'RECEBIDA', data_recebimento: new Date() },
        });
        for (const productId of new Set(
          nf.itens_entrada.map((i) => i.produto_id),
        ))
          await this.stock.recalculateCost(tx, productId);
        return tx.notas_fiscais_entrada.findUnique({
          where: { id },
          include: details,
        });
      },
    );
  }

  async estornar(id: number, dto: EstornoNotaFiscalDto, usuarioId: number) {
    const initial = await this.buscarPorId(id);
    return this.stock.write(
      initial.itens_entrada.map((i) => i.produto_id),
      async (tx) => {
        const nf = await this.lockedNote(tx, id);
        if (nf.status === 'CANCELADA')
          throw new BadRequestException('A nota fiscal já está cancelada.');
        if (nf.status === 'RECEBIDA')
          for (const item of nf.itens_entrada)
            await this.applyItem(
              tx,
              {
                produto_id: item.produto_id,
                filial_id: nf.filial_id!,
                lote_id: item.lote_id,
              },
              item.quantidade.negated(),
              usuarioId,
              nf.id,
              nf.numero_nf,
              'SAIDA',
              'Estorno: ' + dto.motivo,
            );
        await tx.notas_fiscais_entrada.update({
          where: { id },
          data: { status: 'CANCELADA' },
        });
        for (const productId of new Set(
          nf.itens_entrada.map((i) => i.produto_id),
        ))
          await this.stock.recalculateCost(tx, productId);
        return {
          mensagem: 'Nota fiscal estornada.',
          motivo: dto.motivo,
          nota_fiscal: await tx.notas_fiscais_entrada.findUnique({
            where: { id },
            include: details,
          }),
        };
      },
    );
  }

  async ajustarLote(loteId: number, dto: AjusteLoteDto, usuarioId: number) {
    const initial = await this.prisma.lotes.findUnique({
      where: { id: loteId },
    });
    if (!initial) throw new NotFoundException('Lote não encontrado.');
    return this.stock.write([initial.produto_id], async (tx) => {
      const lote = await tx.lotes.findUniqueOrThrow({ where: { id: loteId } });
      const manufacture = dto.data_fabricacao
        ? new Date(dto.data_fabricacao)
        : lote.data_fabricacao;
      const expiry = dto.data_validade
        ? new Date(dto.data_validade)
        : lote.data_validade;
      if (manufacture && manufacture > expiry)
        throw new BadRequestException(
          'A fabricação deve ser anterior à validade.',
        );
      if (dto.quantidade !== undefined || dto.custo_unitario !== undefined) {
        if (!dto.item_entrada_id)
          throw new BadRequestException(
            'Informe item_entrada_id para identificar a nota que será ajustada.',
          );
        const item = await tx.itens_entrada.findUnique({
          where: { id: dto.item_entrada_id },
        });
        if (!item || item.lote_id !== loteId)
          throw new BadRequestException(
            'O item não pertence ao lote informado.',
          );
        const nf = await this.lockedNote(tx, item.nota_fiscal_id);
        if (nf.status === 'CANCELADA')
          throw new BadRequestException(
            'Não é possível ajustar uma nota cancelada.',
          );
        if (nf.status === 'RECEBIDA' && dto.quantidade !== undefined) {
          await this.applyItem(
            tx,
            {
              produto_id: item.produto_id,
              filial_id: nf.filial_id!,
              lote_id: loteId,
            },
            new Prisma.Decimal(dto.quantidade).minus(item.quantidade),
            usuarioId,
            nf.id,
            nf.numero_nf,
            'AJUSTE',
            dto.motivo,
          );
        }
        await tx.itens_entrada.update({
          where: { id: item.id },
          data: {
            quantidade: dto.quantidade,
            custo_unitario: dto.custo_unitario,
          },
        });
        const all = await tx.itens_entrada.findMany({
          where: { nota_fiscal_id: nf.id },
        });
        const total = all
          .reduce(
            (sum, i) => sum.plus(i.quantidade.times(i.custo_unitario)),
            new Prisma.Decimal(0),
          )
          .toDecimalPlaces(2);
        await tx.notas_fiscais_entrada.update({
          where: { id: nf.id },
          data: { total },
        });
        await this.stock.recalculateCost(tx, lote.produto_id);
      }
      const updated = await tx.lotes.update({
        where: { id: loteId },
        data: {
          numero_lote: dto.numero_lote,
          data_fabricacao: manufacture,
          data_validade: expiry,
        },
      });
      await tx.logAuditoriaEstoque.create({
        data: {
          usuarioId: String(usuarioId),
          acao: 'AJUSTE_LOTE',
          recurso: 'LOTE',
          recursoId: String(loteId),
          dadosAnteriores: {
            numero_lote: lote.numero_lote,
            data_validade: lote.data_validade.toISOString(),
          },
          dadosNovos: {
            ...JSON.parse(JSON.stringify(dto)),
            data_validade: expiry.toISOString(),
          },
        },
      });
      return {
        mensagem: 'Lote ajustado; estoque e custo recalculados.',
        lote: updated,
      };
    });
  }
}
