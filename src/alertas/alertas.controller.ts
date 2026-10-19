import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AlertasService } from './alertas.service';
import { ConsultaAlertasDto } from './dto/consulta-alertas.dto';

@ApiTags('Alertas')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('alertas')
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  @Get()
  @ApiOperation({ summary: 'Obtém o painel geral de alertas (estoque baixo + vencimentos)' })
  obterDashboard(@Query() query: ConsultaAlertasDto) {
    return this.alertasService.obterDashboardAlertas(query);
  }

  @Get('estoque-baixo')
  @ApiOperation({ summary: 'Lista produtos com estoque abaixo do mínimo' })
  obterEstoqueBaixo(@Query() query: ConsultaAlertasDto) {
    return this.alertasService.verificarEstoqueMinimo(query.filial_id);
  }

  @Get('vencimentos')
  @ApiOperation({ summary: 'Lista lotes próximos do vencimento ou vencidos' })
  obterVencimentos(@Query() query: ConsultaAlertasDto) {
    return this.alertasService.verificarLotesVencimento(
      query.dias_vencimento,
      query.filial_id,
    );
  }
}