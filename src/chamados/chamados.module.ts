import { Module } from '@nestjs/common';
import { ChamadosController } from './chamados.controller';
import { ChamadosService } from './chamados.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [ChamadosController],
  providers: [ChamadosService],
})
export class ChamadosModule {}