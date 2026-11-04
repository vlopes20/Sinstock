import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface OpcoesEmail {
  para: string;
  assunto: string;
  conteudoHtml: string;
}

@Injectable()
export class MailService {
  private logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configuração do servidor SMTP (pode ser carregado via ConfigService / process.env)
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: Number(process.env.SMTP_PORT) || 2525,
      auth: {
        user: process.env.SMTP_USER || 'usuario_smtp',
        pass: process.env.SMTP_PASS || 'senha_smtp',
      },
    });
  }

  async enviarEmail(opcoes: OpcoesEmail): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"Sinstock ERP" <suporte@sinstock.com>',
        to: opcoes.para,
        subject: opcoes.assunto,
        html: opcoes.conteudoHtml,
      });
      this.logger.log(`E-mail enviado com sucesso para: ${opcoes.para}`);
      return true;
    } catch (error) {
      this.logger.error(`Erro ao enviar e-mail para ${opcoes.para}:`, error);
      return false;
    }
  }
}
