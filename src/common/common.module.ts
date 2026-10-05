import { Module, Global } from '@nestjs/common';
import { ExcelService } from './services/excel.service';
import { PdfService } from './services/pdf.service';

@Global()
@Module({
  providers: [ExcelService, PdfService],
  exports: [ExcelService, PdfService],
})
export class CommonModule {}