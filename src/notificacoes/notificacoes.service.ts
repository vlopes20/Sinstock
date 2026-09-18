import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AlertasService } from '../alertas/alertas.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificacoesService {
  private readonly logger = new Logger(NotificacoesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly alertasService: AlertasService,
  ) {}

  // Executa automaticamente todo dia às 08:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async dispararNotificacoesDiarias() {
    this.logger.log('Iniciando varredura de alertas para disparo de notificações...');

    const estoqueBaixo = await this.alertasService.verificarEstoqueMinimo();
    const lotesVencendo = await this.alertasService.verificarLotesVencimento(30);

    // Grava as notificações pendentes na tabela de notificações
    for (const item of estoqueBaixo) {
      await this.prisma.notificacoes.create({
        data: {
          titulo: 'Alerta de Estoque Baixo',
          mensagem: `O produto ${item.produto_nome} está com apenas ${item.quantidade_atual} unidades no estoque da filial ${item.filial_id}.`,
          tipo: 'ESTOQUE_BAIXO',
          lida: false,
        } as any,
      });
    }

    for (const lote of lotesVencendo) {
      await this.prisma.notificacoes.create({
        data: {
          titulo: 'Alerta de Validade de Lote',
          mensagem: `O lote ${lote.numero_lote} do produto ${lote.produto_nome} vence em ${lote.dias_para_vencer} dias.`,
          tipo: 'VENCIMENTO',
          lida: false,
        } as any,
      });
    }

    this.logger.log(`Notificações geradas com sucesso: ${estoqueBaixo.length + lotesVencendo.length} novos avisos.`);
  }

  async listarNotificacoes(lida?: boolean) {
    return this.prisma.notificacoes.findMany({
      where: lida !== undefined ? { lida } : {},
      orderBy: { id: 'desc' },
    });
  }

  async marcarComoLida(id: number) {
    return this.prisma.notificacoes.update({
      where: { id },
      data: { lida: true },
    });
  }
}