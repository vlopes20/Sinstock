import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MovimentacoesController } from './movimentacoes.controller';
import { MovimentacoesService } from './movimentacoes.service';

@Module({
  imports: [PrismaModule],
  controllers: [MovimentacoesController],
  providers: [MovimentacoesService],
})
export class MovimentacoesModule {}