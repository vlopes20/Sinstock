import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { SaldosEstoqueModule } from '../saldos-estoque/saldos-estoque.module';
import { AlertasModule } from '../alertas/alertas.module';
import { PedidosModule } from '../pedidos/pedidos.module';
import { MovimentacoesModule } from '../movimentacoes/movimentacoes.module';

@Module({
  imports: [
    PrismaModule,
    SaldosEstoqueModule,
    AlertasModule,
    PedidosModule,
    MovimentacoesModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService], // Exportado para permitir a injeção do stream SSE em outros módulos
})
export class DashboardModule {}
