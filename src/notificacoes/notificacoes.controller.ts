import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificacoesService } from './notificacoes.service';

@ApiTags('Notificações')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('notificacoes')
export class NotificacoesController {
  constructor(private readonly service: NotificacoesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista as notificações do sistema' })
  listar(@Query('lida') lida?: string) {
    const statusLida = lida !== undefined ? lida === 'true' : undefined;
    return this.service.listarNotificacoes(statusLida);
  }

  @Patch(':id/ler')
  @ApiOperation({ summary: 'Marca uma notificação como lida' })
  marcarComoLida(@Param('id', ParseIntPipe) id: number) {
    return this.service.marcarComoLida(id);
  }

  @Post('executar-varredura')
  @ApiOperation({ summary: 'Executa a varredura manual de alertas de estoque e validade' })
  executarVarredura() {
    return this.service.dispararNotificacoesDiarias();
  }
}