import { BadRequestException, Injectable } from '@nestjs/common';
import * as qrcode from 'qrcode';
import * as speakeasy from 'speakeasy';
import { UsersService } from '../usuario/users.service';

@Injectable()
export class TwoFactorService {
  constructor(private readonly usersService: UsersService) {}

  async generateTwoFactorSecret(userId: number, email: string) {
    const user = await this.usersService.findByIdWithSecrets(userId);
    if (user.isTwoFactorEnable)
      throw new BadRequestException(
        'Desative o segundo fator atual antes de gerar outro segredo.',
      );
    const secret = speakeasy.generateSecret({
      name: `Sinstock (${email})`,
    });

    if (!secret.otpauth_url) {
      throw new BadRequestException(
        'Não foi possível gerar a URL para o QR Code.',
      );
    }

    const saved = await this.usersService.setTwoFactorSecret(
      userId,
      user.auth_version,
      secret.base32,
    );
    if (!saved)
      throw new BadRequestException('A configuração mudou. Tente novamente.');

    const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCodeDataUrl,
    };
  }

  async consumeCode(
    user: { id: number; auth_version: number; twoFactorSecret: string | null },
    code: string,
    action: 'login' | 'enable' | 'disable',
  ) {
    const secret = user.twoFactorSecret;
    if (!secret) return false;
    const step = Math.floor(Date.now() / 30_000);
    // Prefer the newest matching step if adjacent codes happen to be equal.
    const matched = [step + 1, step, step - 1].find((counter) =>
      speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: code,
        counter,
      }),
    );
    return (
      matched !== undefined &&
      this.usersService.consumeTotp(user, matched, action)
    );
  }

  async enableTwoFactor(userId: number, code: string) {
    const user = await this.usersService.findByIdWithSecrets(userId);

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException(
        'Segredo 2FA não gerado para este usuário.',
      );
    }

    const isValid = await this.consumeCode(user, code, 'enable');

    if (!isValid) {
      throw new BadRequestException(
        'Código 2FA inválido, expirado ou já utilizado.',
      );
    }

    return {
      message: 'Segundo fator ativado. Entre novamente com um novo código.',
      reautenticar: true,
    };
  }
}
