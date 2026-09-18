import { Module } from '@nestjs/common';
import { NotasFiscaisEntradaController } from './notas-fiscais-entrada.controller';
import { NotasFiscaisEntradaService } from './notas-fiscais-entrada.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotasFiscaisEntradaController],
  providers: [NotasFiscaisEntradaService],
})
export class NotasFiscaisEntradaModule {}