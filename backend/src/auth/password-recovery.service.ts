import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PasswordRecoveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async request(email: string) {
    const base = this.config.get<string>('FRONTEND_URL');
    if (
      this.config.get<string>('SMTP_ENABLED') !== 'true' ||
      !base ||
      !this.config.get('SMTP_HOST') ||
      !this.config.get('SMTP_USER') ||
      !this.config.get('SMTP_PASS')
    ) {
      throw new ServiceUnavailableException(
        'Recuperação de senha indisponível. Contate o administrador.',
      );
    }
    // The URL is server configuration, never supplied by the requester.
    const url = new URL('pages/redefinirsenha.html', base.replace(/\/?$/, '/'));
    if (!['http:', 'https:'].includes(url.protocol))
      throw new ServiceUnavailableException();
    const message =
      'Se houver uma conta ativa com esse e-mail, você receberá um link para redefinir a senha.';
    const user = await this.prisma.usuarios.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!user?.ativo) return { message };
    const token = randomBytes(32).toString('hex');
    const record = await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: createHash('sha256').update(token).digest('hex'),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
    url.hash = `token=${token}`;
    const href = url.href
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
    const sent = await this.mail.enviarEmail({
      para: user.email,
      assunto: 'SINSTOCK — redefinição de senha',
      conteudoHtml: `<p>Para redefinir sua senha, <a href="${href}">acesse este link</a>.</p><p>O link expira em 15 minutos e só pode ser usado uma vez. Se não foi você, ignore esta mensagem.</p>`,
    });
    if (!sent)
      await this.prisma.passwordResetToken.deleteMany({
        where: { id: record.id },
      });
    return { message };
  }

  async reset(token: string, senha: string) {
    if (Buffer.byteLength(senha, 'utf8') > 72)
      throw new BadRequestException('A senha deve ter no máximo 72 bytes.');
    const hash = createHash('sha256').update(token).digest('hex');
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hash },
      include: { user: true },
    });
    if (
      !record ||
      record.usedAt ||
      record.expiresAt <= new Date() ||
      !record.user.ativo
    ) {
      throw new BadRequestException(
        'Link inválido ou expirado. Solicite outro link.',
      );
    }
    const senha_hash = await bcrypt.hash(senha, 10);
    await this.prisma.$transaction(async (tx) => {
      const claim = await tx.passwordResetToken.updateMany({
        where: { id: record.id, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() },
      });
      if (claim.count !== 1)
        throw new BadRequestException('Este link já foi utilizado ou expirou.');
      const updated = await tx.usuarios.updateMany({
        where: { id: record.userId, ativo: true },
        data: { senha_hash, auth_version: { increment: 1 } },
      });
      if (updated.count !== 1)
        throw new BadRequestException('Conta indisponível.');
      await tx.passwordResetToken.updateMany({
        where: { userId: record.userId, usedAt: null },
        data: { usedAt: new Date() },
      });
    });
    return { message: 'Senha alterada. Entre novamente com a nova senha.' };
  }
}
