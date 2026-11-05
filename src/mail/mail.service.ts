import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { getSmtpConfig } from './smtp.config';

export interface OpcoesEmail {
  para: string;
  assunto: string;
  conteudoHtml: string;
}

@Injectable()
export class MailService {
  private logger = new Logger(MailService.name);
  private transporter?: nodemailer.Transporter;
  private from?: string;

  constructor() {
    try {
      const config = getSmtpConfig();
      if (config) {
        this.transporter = nodemailer.createTransport(config.transport);
        this.from = config.from;
      }
    } catch {
      this.logger.warn(
        'SMTP inválido. Confira o .env com npm run smtp:verify.',
      );
    }
  }

  async enviarEmail(opcoes: OpcoesEmail): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(
        'Envio de e-mail indisponível: configure o SMTP no .env.',
      );
      return false;
    }
    try {
      const result = await this.transporter.sendMail({
        from: this.from,
        to: opcoes.para,
        subject: opcoes.assunto,
        html: opcoes.conteudoHtml,
      });
      if (!result.accepted?.length) return false;
      this.logger.log('E-mail aceito pelo servidor SMTP.');
      return true;
    } catch {
      this.logger.error(
        'Falha no envio de e-mail. Confira o SMTP com npm run smtp:verify.',
      );
      return false;
    }
  }
}
