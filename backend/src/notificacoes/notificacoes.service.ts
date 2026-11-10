import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { AlertasService } from '../alertas/alertas.service';
import { PrismaService } from '../prisma/prisma.service';
import { FiltroNotificacoesDto } from './dto/filtro-notificacoes.dto';

@Injectable()
export class NotificacoesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alerts: AlertasService,
  ) {}
  @Cron(CronExpression.EVERY_DAY_AT_8AM, { timeZone: 'America/Sao_Paulo' })
  async dispararNotificacoesDiarias() {
    const [low, lots] = await Promise.all([
      this.alerts.verificarEstoqueMinimo(),
      this.alerts.verificarLotesVencimento(),
    ]);
    const day = new Date().toLocaleDateString('en-CA', {
      timeZone: 'America/Sao_Paulo',
    });
    const entries = [
      ...low.map((item) => ({
        chave: 'ESTOQUE:' + item.produto_id + ':' + item.filial_id + ':' + day,
        titulo: 'Estoque baixo',
        tipo: 'ESTOQUE_BAIXO',
        mensagem:
          item.produto_nome +
          ': ' +
          item.quantidade_atual +
          ' disponíveis na filial ' +
          item.filial_nome +
          '.',
      })),
      ...lots.map((lot) => ({
        chave: 'VALIDADE:' + lot.lote_id + ':' + day,
        titulo: lot.dias_para_vencer < 0 ? 'Lote vencido' : 'Validade próxima',
        tipo: 'VENCIMENTO',
        mensagem:
          lot.produto_nome +
          ' · lote ' +
          lot.numero_lote +
          ': ' +
          (lot.dias_para_vencer < 0
            ? 'vencido'
            : 'vence em ' + lot.dias_para_vencer + ' dias') +
          '.',
      })),
    ];
    // Unique keys make repeat and concurrent scans idempotent for the same day.
    for (const data of entries) {
      try {
        await this.prisma.notificacoes.upsert({
          where: { chave: data.chave },
          create: data,
          update: {},
        });
      } catch (error) {
        if (error?.code !== 'P2002') throw error;
      }
    }
    return { alertas_encontrados: entries.length };
  }
  async listarNotificacoes(dto: FiltroNotificacoesDto, usuarioId: number) {
    const user = await this.prisma.usuarios.findUniqueOrThrow({
      where: { id: usuarioId },
      select: { preferencias: true },
    });
    const preferences = user.preferencias as Record<string, unknown> | null;
    const disabled: string[] = [];
    if (preferences?.notificar_estoque === false)
      disabled.push('ESTOQUE_BAIXO');
    if (preferences?.notificar_validade === false) disabled.push('VENCIMENTO');
    const pagina = dto.pagina ?? 1,
      limite = dto.limite ?? 10;
    const where: Prisma.notificacoesWhereInput = {
      tipo: { notIn: disabled },
      ...(dto.lida !== undefined
        ? {
            leituras: dto.lida
              ? { some: { usuario_id: usuarioId } }
              : { none: { usuario_id: usuarioId } },
          }
        : {}),
    };
    const [total, unread, rows] = await Promise.all([
      this.prisma.notificacoes.count({ where }),
      this.prisma.notificacoes.count({
        where: {
          tipo: { notIn: disabled },
          leituras: { none: { usuario_id: usuarioId } },
        },
      }),
      this.prisma.notificacoes.findMany({
        where,
        take: limite,
        skip: (pagina - 1) * limite,
        orderBy: { id: 'desc' },
        include: {
          leituras: {
            where: { usuario_id: usuarioId },
            select: { usuario_id: true },
          },
        },
      }),
    ]);
    return {
      dados: rows.map(({ leituras, ...row }) => ({
        ...row,
        lida: leituras.length > 0,
      })),
      nao_lidas: unread,
      meta: { total, pagina, limite, totalPages: Math.ceil(total / limite) },
    };
  }
  async marcarComoLida(id: number, usuarioId: number) {
    if (!(await this.prisma.notificacoes.findUnique({ where: { id } })))
      throw new NotFoundException('Notificação não encontrada.');
    await this.prisma.leituraNotificacao.upsert({
      where: {
        notificacao_id_usuario_id: {
          notificacao_id: id,
          usuario_id: usuarioId,
        },
      },
      create: { notificacao_id: id, usuario_id: usuarioId },
      update: {},
    });
    return { id, lida: true };
  }
}
