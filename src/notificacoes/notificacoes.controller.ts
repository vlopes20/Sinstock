import { Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { NotificacoesService } from './notificacoes.service';

@Controller('notificacoes')
export class NotificacoesController {
  constructor(private readonly service: NotificacoesService) {}

  @Get()
  listar(@Query('lida') lida?: string) {
    const statusLida = lida !== undefined ? lida === 'true' : undefined;
    return this.service.listarNotificacoes(statusLida);
  }

  @Patch(':id/ler')
  marcarComoLida(@Param('id', ParseIntPipe) id: number) {
    return this.service.marcarComoLida(id);
  }

  // Endpoint para disparar a varredura manualmente via Postman sem esperar o Cron
  @Post('executar-varredura')
  executarVarredura() {
    return this.service.dispararNotificacoesDiarias();
  }
}