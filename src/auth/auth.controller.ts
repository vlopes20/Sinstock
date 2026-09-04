import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TwoFactorService } from './two-factor.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  // Route de Login Padrão (Já existente)
  @Post('login')
  async login(@Body() loginDto: any) {
    return this.authService.login(loginDto);
  }

  // 1. Gerar o QR Code (Exige que o usuário esteja logado com JWT)
  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  async generate2FA(@Request() req) {
    return this.twoFactorService.generateTwoFactorSecret(
      req.user.id,
      req.user.email,
    );
  }

  // 2. Confirmar o 1º código do app e ATIVAR o 2FA na conta (Exige JWT)
  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  async enable2FA(@Request() req, @Body('code') code: string) {
    return this.twoFactorService.enableTwoFactor(req.user.id, code);
  }

  // 3. Validar o código de 6 dígitos durante o Login (Segunda Etapa)
  @Post('2fa/authenticate')
  async authenticate2FA(
    @Body('userId') userId: number,
    @Body('code') code: string,
  ) {
    return this.authService.authenticateTwoFactor(userId, code);
  }
}