import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  PermissionResource,
  PermissionsGuard,
} from '../auth/guards/permissions.guard';
import { ConsultaRelatorioDto } from './dto/consulta-relatorio.dto';
import { RelatorioMovimentacoesDto } from './dto/relatorio-movimentacoes.dto';
import { RelatoriosService } from './relatorios.service';

@ApiTags('Relatórios')
@ApiBearerAuth('JWT-auth')
@PermissionResource('relatorios')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly service: RelatoriosService) {}
  @Get()
  consultar(@Query() dto: ConsultaRelatorioDto) {
    return this.service.consultar(dto);
  }
  @Get('exportar')
  async exportar(@Query() dto: ConsultaRelatorioDto, @Res() res: Response) {
    const result = await this.service.exportar(dto);
    this.send(res, result, 'sinstock-' + dto.tipo + '.' + dto.formato);
  }
  @Get('movimentacoes/pdf')
  async legacyPdf(
    @Query() old: RelatorioMovimentacoesDto,
    @Res() res: Response,
  ) {
    const dto = Object.assign(new ConsultaRelatorioDto(), {
      tipo: 'movimentacoes',
      formato: 'pdf',
      filial_id: old.filial_id,
      produto_id: old.produto_id,
      data_inicio: old.data_inicio?.toISOString().slice(0, 10),
      data_fim: old.data_fim?.toISOString().slice(0, 10),
    });
    const result = await this.service.exportar(dto);
    this.send(res, result, 'sinstock-movimentacoes.pdf');
  }
  private send(
    res: Response,
    result: { buffer: Buffer; contentType: string },
    filename: string,
  ) {
    res.set({
      'Content-Type': result.contentType,
      'Content-Disposition': 'attachment; filename="' + filename + '"',
      'Cache-Control': 'no-store',
      'Content-Length': String(result.buffer.length),
    });
    res.end(result.buffer);
  }
}
