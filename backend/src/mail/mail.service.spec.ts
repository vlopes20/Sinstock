import { Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailService } from './mail.service';

jest.mock('nodemailer', () => ({ createTransport: jest.fn() }));

describe('MailService', () => {
  const originalEnv = process.env;
  const sendMail = jest.fn();
  const mail = {
    para: 'user@example.test',
    assunto: 'Reset',
    conteudoHtml: '<p>Link</p>',
  };

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      SMTP_ENABLED: 'true',
      SMTP_HOST: 'smtp.example.test',
      SMTP_PORT: '465',
      SMTP_SECURE: 'true',
      SMTP_USER: 'sender@example.test',
      SMTP_PASS: 'secret-app-password',
      SMTP_FROM: 'Sinstock <sender@example.test>',
    };
    jest
      .mocked(nodemailer.createTransport)
      .mockReturnValue({ sendMail } as unknown as nodemailer.Transporter);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('does not connect or send when disabled', async () => {
    process.env.SMTP_ENABLED = 'false';
    expect(await new MailService().enviarEmail(mail)).toBe(false);
    expect(nodemailer.createTransport).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('keeps the application available with incomplete SMTP', async () => {
    delete process.env.SMTP_PASS;
    expect(await new MailService().enviarEmail(mail)).toBe(false);
    expect(nodemailer.createTransport).not.toHaveBeenCalled();
  });

  it('reports success only after SMTP accepts a recipient', async () => {
    sendMail.mockResolvedValueOnce({ accepted: [mail.para] });
    expect(await new MailService().enviarEmail(mail)).toBe(true);
    expect(sendMail).toHaveBeenCalledWith({
      from: process.env.SMTP_FROM,
      to: mail.para,
      subject: mail.assunto,
      html: mail.conteudoHtml,
    });
    sendMail.mockResolvedValueOnce({ accepted: [], rejected: [mail.para] });
    expect(await new MailService().enviarEmail(mail)).toBe(false);
  });

  it('handles SMTP errors without logging credentials or reset links', async () => {
    sendMail.mockRejectedValueOnce(
      new Error('secret-app-password and private reset link'),
    );
    expect(await new MailService().enviarEmail(mail)).toBe(false);
    expect(
      JSON.stringify(jest.mocked(Logger.prototype.error).mock.calls),
    ).not.toContain('secret-app-password');
  });
});
