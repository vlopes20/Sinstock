import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Gera PDF do extrato de movimentações' })
  async baixarRelatorioMovimentacoes(
    @Query() filtros: RelatorioMovimentacoesDto,
    @Res() res: Response,
  ) {

    const pdfBuffer = await this.relatoriosService.gerarPdfMovimentacoes(filtros);


    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="relatorio-auditoria-sinstock.pdf"',
      'Content-Length': pdfBuffer.length,
    });


    res.end(pdfBuffer);
  }
}