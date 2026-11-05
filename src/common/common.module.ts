import { Module, Global } from '@nestjs/common';
import { ExcelService } from './services/excel.service';
import { PdfService } from './services/pdf.service';
import { StockService } from './services/stock.service';
import { StockEventsService } from './services/stock-events.service';

@Global()
@Module({
  providers: [ExcelService, PdfService, StockService, StockEventsService],
  exports: [ExcelService, PdfService, StockService, StockEventsService],
})
export class CommonModule {}
