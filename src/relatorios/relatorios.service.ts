import { Injectable, InternalServerErrorException } from '@nestjs/common';
import PdfDocument from 'pdfkit-table';
import { PrismaService } from '../prisma/prisma.service';
import { RelatorioMovimentacoesDto } from './dto/relatorio-movimentacoes.dto';

@Injectable()
export class RelatoriosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Geração de relatório PDF de auditoria de movimentações com suporte a tabelas
   */
  async gerarPdfMovimentacoes(filtros: RelatorioMovimentacoesDto): Promise<Buffer> {
    try {
      const where: any = {};

      if (filtros.filial_id) where.filial_id = Number(filtros.filial_id);
      if (filtros.produto_id) where.produto_id = Number(filtros.produto_id);

      if (filtros.data_inicio || filtros.data_fim) {
        where.data_hora = {};

        if (filtros.data_inicio) {
          where.data_hora.gte = new Date(filtros.data_inicio);
        }

        if (filtros.data_fim) {
          const dataFim = new Date(filtros.data_fim);
          dataFim.setUTCHours(23, 59, 59, 999);
          where.data_hora.lte = dataFim;
        }
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

      return new Promise(async (resolve, reject) => {
        try {
          const doc = new PdfDocument({ margin: 30, size: 'A4' });
          const buffers: Buffer[] = [];

          doc.on('data', (chunk) => buffers.push(chunk));
          doc.on('end', () => resolve(Buffer.concat(buffers)));
          doc.on('error', (err) => reject(err));

          // Cabeçalho do Documento
          doc
            .fontSize(18)
            .fillColor('#1A202C')
            .text('SINSTOCK - Relatório de Auditoria de Estoque', { align: 'center' });
          
          doc.moveDown(0.5);
          
          doc
            .fontSize(9)
            .fillColor('#718096')
            .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'right' });
          
          doc.moveDown(1.5);

          // Estrutura de dados para o pdfkit-table
          const table = {
            title: 'Extrato de Movimentações',
            headers: ['Data', 'Produto', 'Filial', 'Tipo', 'Qtd', 'Usuário'],
            rows: movimentacoes.map((mov) => [
              mov.data_hora
                ? new Date(mov.data_hora).toLocaleDateString('pt-BR')
                : '-',
              mov.produtos?.nome || 'N/A',
              mov.filiais?.nome || 'N/A',
              String(mov.tipo_movimentacao),
              Number(mov.quantidade).toString(),
              mov.usuarios?.nome || 'N/A',
            ]),
          };

          // Renderização assíncrona da tabela
          await doc.table(table, {
            prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10).fillColor('#2D3748'),
            prepareRow: () => doc.font('Helvetica').fontSize(9).fillColor('#4A5568'),
            padding: 5,
          });

          doc.end();
        } catch (pdfError) {
          reject(pdfError);
        }
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao processar dados para emissão do relatório em PDF.',
      );
    }
  }
}