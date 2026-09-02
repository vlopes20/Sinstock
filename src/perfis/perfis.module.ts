import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PerfisController } from './perfis.controller';
import { PerfisService } from './perfis.service';

@Module({
  imports: [PrismaModule],
  controllers: [PerfisController],
  providers: [PerfisService],
  exports: [PerfisService],
})
export class PerfisModule {}