import { Injectable } from '@nestjs/common';

export type ColunaDef =
  | string
  | { header: string; key?: string; width?: number | string };

function getPdfPrinterClass(): any {
  // Caminhos possíveis para o construtor do Printer no pdfmake (Node.js)
  const pathsToTry = [
    'pdfmake/js/printer',
    'pdfmake/src/printer',
    'pdfmake',
  ];

  for (const path of pathsToTry) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require(path);

      if (typeof mod === 'function') return mod;
      if (typeof mod?.default === 'function') return mod.default;
      if (typeof mod?.PdfPrinter === 'function') return mod.PdfPrinter;
      if (typeof mod?.Printer === 'function') return mod.Printer;
      if (typeof mod?.default?.default === 'function') return mod.default.default;
    } catch {
      // Continua para a próxima tentativa se o caminho não existir
    }
  }

  throw new Error(
    'Não foi possível resolver o construtor da biblioteca pdfmake. Certifica-te de que o pacote "pdfmake" está instalado no projeto.',
  );
}

@Injectable()
export class PdfService {
  private printer: any;

  constructor() {
    const PdfPrinter = getPdfPrinterClass();

    const fonts = {
      Roboto: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
      },
    };

    this.printer = new PdfPrinter(fonts);
  }

  /**
   * Gera um Buffer a partir de qualquer definição de documento personalizada do pdfmake
   */
  async gerarBuffer(docDefinition: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];

      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', (err: Error) => reject(err));

      pdfDoc.end();
    });
  }

  /**
   * Gera um PDF formatado em tabela aceitando matrizes ou arrays de objetos
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
      if (typeof col === 'object' && col.width && typeof col.width === 'number') {
        return col.width;
      }
      return '*';
    });

    const linhasFormatadas: string[][] = dados.map((item) => {
      if (Array.isArray(item)) {
        return item.map((celula) =>
          celula !== null && celula !== undefined ? String(celula) : '',
        );
      }

      return colunas.map((col) => {
        const key = typeof col === 'object' && col.key ? col.key : null;
        const valor = key && item ? item[key] : '';
        return valor !== null && valor !== undefined ? String(valor) : '';
      });
    });

    const docDefinition = {
      pageOrientation: orientacao,
      content: [
        { text: titulo, style: 'header' },
        {
          text: `Emissão: ${new Date().toLocaleString('pt-PT')}`,
          style: 'subheader',
        },
        { text: '\n' },
        {
          table: {
            headerRows: 1,
            widths,
            body: [
              headers.map((h) => ({ text: h, style: 'tableHeader' })),
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