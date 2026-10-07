import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RelatorioMovimentacoesDto } from './dto/relatorio-movimentacoes.dto';
import { RelatoriosService } from './relatorios.service';

@ApiTags('Relatórios')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Get('movimentacoes/pdf')
  @ApiOperation({
    summary: 'Gera e faz o download do PDF de extrato de movimentações',
    description:
      'Gera um arquivo PDF contendo o histórico detalhado de movimentações com base nos filtros informados (data, filial, produto).',
  })
  @ApiResponse({
    status: 200,
    description: 'Relatório em PDF gerado com sucesso.',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async baixarRelatorioMovimentacoes(
    @Query() filtros: RelatorioMovimentacoesDto,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.relatoriosService.gerarPdfMovimentacoes(filtros);

    const filename = `relatorio-auditoria-sinstock-${
      new Date().toISOString().split('T')[0]
    }.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });

    res.end(pdfBuffer);
  }
}