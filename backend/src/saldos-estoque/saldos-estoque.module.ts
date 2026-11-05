import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SaldosEstoqueController } from './saldos-estoque.controller';
import { SaldosEstoqueService } from './saldos-estoque.service';

@Module({
  imports: [PrismaModule],
  controllers: [SaldosEstoqueController],
  providers: [SaldosEstoqueService],
  exports: [SaldosEstoqueService],
})
export class SaldosEstoqueModule {}