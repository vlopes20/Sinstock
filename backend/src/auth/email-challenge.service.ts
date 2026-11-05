import {
  BadRequestException,
  HttpException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import {
  createHmac,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class EmailChallengeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}
  private hash(id: string, code: string, purpose: string) {
    return createHmac('sha256', this.config.getOrThrow<string>('JWT_SECRET'))
      .update(purpose + ':' + id + ':' + code)
      .digest('hex');
  }
  async issue(
    user: { id: number; email: string },
    purpose: 'LOGIN' | 'ENABLE' | 'DISABLE',
  ) {
    const id = randomUUID(),
      code = String(randomInt(0, 1000000)).padStart(6, '0'),
      expiresAt = new Date(Date.now() + 5 * 60000);
    await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw(
        Prisma.sql`SELECT id FROM usuarios WHERE id = ${user.id} FOR UPDATE`,
      );
      if (
        await tx.emailLoginChallenge.findFirst({
          where: {
            userId: user.id,
            usedAt: null,
            expiresAt: { gt: new Date(Date.now() + 4 * 60000) },
          },
        })
      )
        throw new HttpException(
          'Aguarde um minuto antes de solicitar outro código.',
          429,
        );
      await tx.emailLoginChallenge.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      await tx.emailLoginChallenge.create({
        data: {
          id,
          userId: user.id,
          codeHash: this.hash(id, code, purpose),
          expiresAt,
        },
      });
    });
    const sent = await this.mail.enviarEmail({
      para: user.email,
      assunto: 'SINSTOCK — código de verificação',
      conteudoHtml:
        '<p>Seu código de verificação do SINSTOCK é:</p><p><strong>' +
        code +
        '</strong></p><p>Válido por cinco minutos, para uma única utilização.</p>',
    });
    if (!sent) {
      await this.prisma.emailLoginChallenge.update({
        where: { id },
        data: { usedAt: new Date() },
      });
      throw new ServiceUnavailableException(
        'Não foi possível enviar o código. Verifique o SMTP e tente novamente.',
      );
    }
    return { challengeId: id, expiresAt };
  }
  async consume(
    userId: number,
    id: string | undefined,
    code: string,
    purpose: 'LOGIN' | 'ENABLE' | 'DISABLE',
  ) {
    if (!id) throw new BadRequestException('Solicite um novo código.');
    const valid = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw(
        Prisma.sql`SELECT id FROM email_login_challenges WHERE id = ${id} FOR UPDATE`,
      );
      const row = await tx.emailLoginChallenge.findUnique({ where: { id } });
      if (
        !row ||
        row.userId !== userId ||
        row.usedAt ||
        row.expiresAt <= new Date() ||
        row.attempts >= 5
      )
        return false;
      await tx.emailLoginChallenge.update({
        where: { id },
        data: { attempts: { increment: 1 } },
      });
      const matches = timingSafeEqual(
        Buffer.from(row.codeHash, 'hex'),
        Buffer.from(this.hash(id, code, purpose), 'hex'),
      );
      if (matches)
        await tx.emailLoginChallenge.update({
          where: { id },
          data: { usedAt: new Date() },
        });
      return matches;
    });
    if (!valid) {
      const message =
        'Código inválido, expirado ou já utilizado. Após cinco tentativas, solicite outro código.';
      if (purpose === 'LOGIN') throw new UnauthorizedException(message);
      throw new BadRequestException(message);
    }
  }
}
