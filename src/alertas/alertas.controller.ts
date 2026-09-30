import { Controller, Get, Query } from '@nestjs/common';
import { AlertasService } from './alertas.service';
import { ConsultaAlertasDto } from './dto/consulta-alertas.dto';

@Controller('alertas')
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  @Get()
  obterDashboard(@Query() query: ConsultaAlertasDto) {
    return this.alertasService.obterDashboardAlertas(query);
  }

  @Get('estoque-baixo')
  obterEstoqueBaixo(@Query() query: ConsultaAlertasDto) {
    return this.alertasService.verificarEstoqueMinimo(query.filial_id);
  }

  @Get('vencimentos')
  obterVencimentos(@Query() query: ConsultaAlertasDto) {
    return this.alertasService.verificarLotesVencimento(
      query.dias_vencimento,
      query.filial_id,
    );
  }
}