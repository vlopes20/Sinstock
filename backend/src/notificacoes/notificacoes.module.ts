import { Module } from '@nestjs/common';
import { AlertasModule } from '../alertas/alertas.module';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificacoesController } from './notificacoes.controller';
import { NotificacoesService } from './notificacoes.service';

@Module({
  imports: [PrismaModule, AlertasModule],
  controllers: [NotificacoesController],
  providers: [NotificacoesService],
  exports: [NotificacoesService],
})
export class NotificacoesModule {}