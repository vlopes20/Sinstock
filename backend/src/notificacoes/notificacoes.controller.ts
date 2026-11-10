import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificacoesService } from './notificacoes.service';
import { FiltroNotificacoesDto } from './dto/filtro-notificacoes.dto';
import {
  PermissionResource,
  PermissionsGuard,
} from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Notificações')
@ApiBearerAuth('JWT-auth')
@PermissionResource('notificacoes')
@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@Controller('notificacoes')
export class NotificacoesController {
  constructor(private readonly service: NotificacoesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista as notificações do sistema' })
  listar(
    @Query() dto: FiltroNotificacoesDto,
    @Req() req: { user: { userId: number } },
  ) {
    return this.service.listarNotificacoes(dto, req.user.userId);
  }

  @Patch(':id/ler')
  @ApiOperation({ summary: 'Marca uma notificação como lida' })
  marcarComoLida(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { userId: number } },
  ) {
    return this.service.marcarComoLida(id, req.user.userId);
  }

  @Post('executar-varredura')
  @Roles(1)
  @ApiOperation({
    summary: 'Executa a varredura manual de alertas de estoque e validade',
  })
  executarVarredura() {
    return this.service.dispararNotificacoesDiarias();
  }
}
