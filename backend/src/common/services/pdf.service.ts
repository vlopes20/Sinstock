
import { Injectable } from '@nestjs/common';

export type ColunaDef =
  | string
  | { header: string; key?: string; width?: number | string };

@Injectable()
export class PdfService {
  private pdfmake: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    this.pdfmake = require('pdfmake');

    this.pdfmake.addFonts({
      Roboto: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
      },
    });

    // Bloqueia recursos externos por URL.
    this.pdfmake.setUrlAccessPolicy(() => false);

    // Permite somente as fontes Helvetica utilizadas no PDF.
    this.pdfmake.setLocalAccessPolicy((path: string) =>
      [
        'Helvetica',
        'Helvetica-Bold',
        'Helvetica-Oblique',
        'Helvetica-BoldOblique',
      ].includes(path),
    );
  }

  /**
   * Gera um Buffer a partir da definição de um documento PDF.
   */
  async gerarBuffer(docDefinition: any): Promise<Buffer> {
    const pdf = this.pdfmake.createPdf(docDefinition);
    const buffer = await pdf.getBuffer();

    return Buffer.from(buffer);
  }

  /**
   * Gera um PDF formatado em tabela,
   * aceitando matrizes ou arrays de objetos.
   */
  async gerarRelatorioTabela(
    titulo: string,
    colunas: ColunaDef[],
    dados: (any[] | Record<string, any>)[],
    orientacao: 'portrait' | 'landscape' = 'portrait',
  ): Promise<Buffer> {
    const headers = colunas.map((col) =>
      typeof col === 'string' ? col : col.header,
    );

    const widths = colunas.map((col) => {
      if (
        typeof col === 'object' &&
        col.width &&
        typeof col.width === 'number'
      ) {
        return col.width;
      }

      return '*';
    });

    const linhasFormatadas: string[][] = dados.map((item) => {
      if (Array.isArray(item)) {
        return item.map((celula) =>
          celula !== null && celula !== undefined
            ? String(celula)
            : '',
        );
      }

      return colunas.map((col) => {
        const key =
          typeof col === 'object' && col.key ? col.key : null;

        const valor = key && item ? item[key] : '';

        return valor !== null && valor !== undefined
          ? String(valor)
          : '';
      });
    });

    const docDefinition = {
      pageOrientation: orientacao,
      content: [
        {
          text: titulo,
          style: 'header',
        },
        {
          text: `Emissão: ${new Date().toLocaleString('pt-PT')}`,
          style: 'subheader',
        },
        {
          text: '\n',
        },
        {
          table: {
            headerRows: 1,
            widths,
            body: [
              headers.map((h) => ({
                text: h,
                style: 'tableHeader',
              })),
              ...linhasFormatadas,
            ],
          },
          layout: 'lightHorizontalLines',
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 6],
        },
        subheader: {
          fontSize: 9,
          italics: true,
          color: '#555555',
          margin: [0, 0, 0, 10],
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          fillColor: '#EEEEEE',
        },
      },
      defaultStyle: {
        font: 'Roboto',
        fontSize: 9,
      },
    };

    return this.gerarBuffer(docDefinition);
  }
}
