import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

export interface ColunaExcel {
  header: string;
  key: string;
  width?: number;
  format?: string;
}

@Injectable()
export class ExcelService {
  async gerarExcel<T>(
    nomeAba: string,
    colunas: ColunaExcel[],
    dados: T[],
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sinstock ERP';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(nomeAba);

    // Mapeia e define as colunas da tabela
    worksheet.columns = colunas.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 20,
    }));

    // Estilização do Cabeçalho (Linha 1)
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E293B' }, // Cor Slate-800
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Inserção dos dados
    dados.forEach((item) => {
      worksheet.addRow(item);
    });

    // Formatação de linhas de dados e bordas
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.height = 20;
        row.alignment = { vertical: 'middle', horizontal: 'left' };
        
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'E2E8F0' } },
            left: { style: 'thin', color: { argb: 'E2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
            right: { style: 'thin', color: { argb: 'E2E8F0' } },
          };
        });
      }
    });

    // Gera o ficheiro em memória (Buffer)
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}