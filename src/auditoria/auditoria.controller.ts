import {
  Controller,
  Get,
  Query,
  StreamableFile,
  Header,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Readable } from 'stream';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditoriaService } from './auditoria.service';
import { ConsultaAuditoriaDto } from './dto/consulta-auditoria.dto';
import { ExcelService } from '../common/services/excel.service';
import { PdfService } from '../common/services/pdf.service';

@ApiTags('Histórico de Auditoria')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('auditoria')
export class AuditoriaController {
  constructor(
    private readonly auditoriaService: AuditoriaService,
    private readonly excelService: ExcelService,
    private readonly pdfService: PdfService,
  ) {}

  @Get('estoque/exportar-excel')
  @ApiOperation({ summary: 'Exporta logs de auditoria para Excel via Stream' })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename="auditoria_estoque.xlsx"')
  async exportarExcelStream(
    @Query() query: ConsultaAuditoriaDto,
  ): Promise<StreamableFile> {
    const { data: logs } = await this.auditoriaService.listarHistorico({
      ...query,
      page: 1,
      limit: 10000,
    });

    const dadosFormatados = logs.map((log) => ({
      id: log.id,
      usuarioId: log.usuarioId || 'SISTEMA',
      acao: log.acao,
      recurso: log.recurso,
      recursoId: log.recursoId || 'N/A',
      ip: log.ip || 'N/A',
      criadoEm: new Date(log.criadoEm).toLocaleString('pt-PT'),
    }));

    const colunas = [
      { header: 'ID do Log', key: 'id', width: 36 },
      { header: 'Utilizador', key: 'usuarioId', width: 25 },
      { header: 'Ação', key: 'acao', width: 20 },
      { header: 'Recurso', key: 'recurso', width: 20 },
      { header: 'ID Recurso', key: 'recursoId', width: 20 },
      { header: 'Endereço IP', key: 'ip', width: 18 },
      { header: 'Data / Hora', key: 'criadoEm', width: 22 },
    ];

    const buffer = await this.excelService.gerarExcel(
      'Auditoria de Stock',
      colunas,
      dadosFormatados,
    );

    const stream = Readable.from(buffer);
    return new StreamableFile(stream);
  }

  @Get('estoque/exportar-pdf')
  @ApiOperation({ summary: 'Exporta logs de auditoria para PDF via Stream' })
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename="auditoria_estoque.pdf"')
  async exportarPdfStream(
    @Query() query: ConsultaAuditoriaDto,
  ): Promise<StreamableFile> {
    const { data: logs } = await this.auditoriaService.listarHistorico({
      ...query,
      page: 1,
      limit: 1000,
    });

    const dadosFormatados = logs.map((log) => ({
      usuarioId: log.usuarioId || 'SISTEMA',
      acao: log.acao,
      recurso: log.recurso,
      recursoId: log.recursoId || 'N/A',
      ip: log.ip || 'N/A',
      criadoEm: new Date(log.criadoEm).toLocaleString('pt-PT'),
    }));

    const colunas = [
      { header: 'Utilizador', key: 'usuarioId', width: 110 },
      { header: 'Ação', key: 'acao', width: 100 },
      { header: 'Recurso', key: 'recurso', width: 100 },
      { header: 'ID Recurso', key: 'recursoId', width: 100 },
      { header: 'Endereço IP', key: 'ip', width: 90 },
      { header: 'Data / Hora', key: 'criadoEm', width: '*' },
    ];

    const buffer = await this.pdfService.gerarRelatorioTabela(
      'Relatório de Auditoria de Stock',
      colunas,
      dadosFormatados,
      'landscape',
    );

    const stream = Readable.from(buffer);
    return new StreamableFile(stream);
  }
}