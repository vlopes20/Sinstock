import { BadRequestException, Injectable } from '@nestjs/common';
import * as qrcode from 'qrcode';
import * as speakeasy from 'speakeasy';
import { UsersService } from '../usuario/users.service';

@Injectable()
export class TwoFactorService {
  constructor(private readonly usersService: UsersService) {}

  async generateTwoFactorSecret(userId: number, email: string) {
    const secret = speakeasy.generateSecret({
      name: `Sinstock (${email})`,
    });

    if (!secret.otpauth_url) {
      throw new BadRequestException('Não foi possível gerar a URL para o QR Code.');
    }

    await this.usersService.setTwoFactorSecret(userId, secret.base32);

    const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCodeDataUrl,
    };
  }

  verifyTwoFactorCode(code: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
  }

  async enableTwoFactor(userId: number, code: string) {
  const user = await this.usersService.findByIdWithSecrets(userId);

  if (!user || !user.twoFactorSecret) {
    throw new BadRequestException('Segredo 2FA não gerado para este usuário.');
  }

  const isValid = this.verifyTwoFactorCode(code, user.twoFactorSecret);

  if (!isValid) {
    throw new BadRequestException('Código 2FA inválido ou expirado.');
  }

  await this.usersService.enableTwoFactor(userId);

  return { message: 'Autenticação de Dois Fatores ativada com sucesso!' };
}
}