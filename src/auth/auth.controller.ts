import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PreAuthGuard } from './guards/pre-auth.guard';
import { TwoFactorService } from './two-factor.service';

interface RequestWithUser extends ExpressRequest {
  user: {
    userId: number;
    email: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  async generate2FA(@Request() req: RequestWithUser) {
    return this.twoFactorService.generateTwoFactorSecret(
      req.user.userId,
      req.user.email,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  async enable2FA(
    @Request() req: RequestWithUser,
    @Body('codigo') codigo: string,
  ) {
    const usuarioId = req.user.userId;
    return this.twoFactorService.enableTwoFactor(usuarioId, codigo);
  }

  @UseGuards(PreAuthGuard)
  @Post('2fa/authenticate')
  async authenticate2FA(
    @Request() req: RequestWithUser,
    @Body('codigo') codigo: string,
  ) {
    const usuarioId = req.user.userId;
    return this.authService.authenticateTwoFactor(usuarioId, codigo);
  }
}