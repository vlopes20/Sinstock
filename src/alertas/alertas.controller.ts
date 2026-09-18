import { Controller, Get, Query } from '@nestjs/common';
import { AlertasService } from './alertas.service';

@Controller('alertas')
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  @Get()
  obterDashboard(
    @Query('filial_id') filialId?: string,
    @Query('dias_vencimento') diasVencimento?: string,
  ) {
    const filial = filialId ? parseInt(filialId, 10) : undefined;
    const dias = diasVencimento ? parseInt(diasVencimento, 10) : 30;

    return this.alertasService.obterDashboardAlertas(filial, dias);
  }

  @Get('estoque-baixo')
  obterEstoqueBaixo(@Query('filial_id') filialId?: string) {
    const filial = filialId ? parseInt(filialId, 10) : undefined;
    return this.alertasService.verificarEstoqueMinimo(filial);
  }

  @Get('vencimentos')
  obterVencimentos(@Query('dias') dias?: string) {
    const diasAviso = dias ? parseInt(dias, 10) : 30;
    return this.alertasService.verificarLotesVencimento(diasAviso);
  }
}