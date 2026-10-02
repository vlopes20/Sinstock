import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IntegracoesService } from './integracoes.service';
import { IntegracoesController } from './integracoes.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [IntegracoesController],
  providers: [IntegracoesService],
  exports: [IntegracoesService],
})
export class IntegracoesModule {}