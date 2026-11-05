import { Global, Module } from '@nestjs/common';
import { SinstockSettingsService } from './configuracoes.service';
import { ConfiguracoesController } from './configuracoes.controller';
@Global()
@Module({
  providers: [SinstockSettingsService],
  controllers: [ConfiguracoesController],
  exports: [SinstockSettingsService],
})
export class ConfiguracoesModule {}
