import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MovimentacoesController } from './movimentacoes.controller';
import { MovimentacoesService } from './movimentacoes.service';
import { NotasFiscaisEntradaModule } from '../notas-fiscais-entrada/notas-fiscais-entrada.module';

@Module({
  imports: [PrismaModule, NotasFiscaisEntradaModule],
  controllers: [MovimentacoesController],
  providers: [MovimentacoesService],
  exports: [MovimentacoesService],
})
export class MovimentacoesModule {}
