import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuditoriaService } from './auditoria.service';
import { ConsultaAuditoriaDto } from './dto/consulta-auditoria.dto';

@ApiTags('Histórico de Auditoria')
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get('estoque')
  @ApiOperation({ summary: 'Consulta o histórico completo de logs de auditoria de estoque' })
  listarHistorico(@Query() query: ConsultaAuditoriaDto) {
    return this.auditoriaService.listarHistorico(query);
  }
}