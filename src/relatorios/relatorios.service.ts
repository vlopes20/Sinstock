import { Injectable } from '@nestjs/common';
import PdfDocument from 'pdfkit-table';
import { PrismaService } from '../prisma/prisma.service';
import { RelatorioMovimentacoesDto } from './dto/relatorio-movimentacoes.dto';

@Injectable()
export class RelatoriosService {
  constructor(private readonly prisma: PrismaService) {}

  async gerarPdfMovimentacoes(filtros: RelatorioMovimentacoesDto): Promise<Buffer> {

    const where: any = {};
    if (filtros.filial_id) where.filial_id = filtros.filial_id;
    if (filtros.produto_id) where.produto_id = filtros.produto_id;
    if (filtros.data_inicio || filtros.data_fim) {
      where.data_hora = {};
      if (filtros.data_inicio) where.data_hora.gte = filtros.data_inicio;
      if (filtros.data_fim) where.data_hora.lte = filtros.data_fim;
    }


    const movimentacoes = await this.prisma.logs_movimentacoes.findMany({
      where,
      include: {
        produtos: { select: { nome: true } },
        filiais: { select: { nome: true } },
        usuarios: { select: { nome: true } },
      },
      orderBy: { data_hora: 'desc' },
    });


    return new Promise((resolve, reject) => {
      try {
        const doc = new PdfDocument({ margin: 30, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));


        doc.fontSize(20).text('SINSTOCK - Relatório de Auditoria de Estoque', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'right' });
        doc.moveDown(2);


        const table = {
          title: 'Extrato de Movimentações',
          headers: ['Data', 'Produto', 'Filial', 'Tipo', 'Qtd', 'Usuário'],
          rows: movimentacoes.map(mov => [
            mov.data_hora ? mov.data_hora.toLocaleDateString('pt-BR') : '-',
            mov.produtos?.nome || 'N/A',
            mov.filiais?.nome || 'N/A',
            mov.tipo_movimentacao,
            Number(mov.quantidade).toString(),
            mov.usuarios?.nome || 'N/A',
          ]),
        };


        doc.table(table, { prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10) });
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}