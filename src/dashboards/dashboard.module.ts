import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService], // Exportado para que o EstoqueModule possa injetar e notificar eventos
})
export class DashboardModule {}