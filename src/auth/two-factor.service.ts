import { BadRequestException, Injectable } from '@nestjs/common';
import * as qrcode from 'qrcode';
import { UsersService } from '../usuario/users.service';

// Importação segura do authenticator via require
const { authenticator } = require('otplib');

@Injectable()
export class TwoFactorService {
  constructor(private readonly usersService: UsersService) {
    // Configura a janela de tolerância para sincronização de horário (30 segundos)
    if (authenticator) {
      authenticator.options = { window: 1 };
    }
  }

  // 1. Gerar Secret e QR Code
  async generateTwoFactorSecret(userId: number, email: string) {
    const secret = authenticator.generateSecret();
    const appName = 'Sinstock';
    const otpauthUrl = authenticator.keyuri(email, appName, secret);

    // Salva o segredo no banco via UsersService
    await this.usersService.setTwoFactorSecret(userId, secret);

    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

    return {
      secret,
      qrCodeDataUrl,
    };
  }

  // 2. Verificar código TOTP de 6 dígitos
  verifyTwoFactorCode(code: string, secret: string): boolean {
    return authenticator.verify({
      token: code,
      secret: secret,
    });
  }

  // 3. Ativar 2FA na conta
  async enableTwoFactor(userId: number, code: string) {
    const user = await this.usersService.findById(userId);

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