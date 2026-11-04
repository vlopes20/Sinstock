import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  TwoFactorCodeDto,
} from './dto/recovery.dto';
import { PasswordRecoveryService } from './password-recovery.service';
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
    private readonly recovery: PasswordRecoveryService,
  ) {}

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Request() req: RequestWithUser) {
    return this.authService.getProfile(req.user.userId);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Request() req: RequestWithUser) {
    return this.authService.logout(req.user.userId);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.recovery.request(dto.email);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.recovery.reset(dto.token, dto.senha);
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
    @Body() dto: TwoFactorCodeDto,
  ) {
    const usuarioId = req.user.userId;
    return this.twoFactorService.enableTwoFactor(usuarioId, dto.codigo);
  }

  @UseGuards(PreAuthGuard)
  @Post('2fa/authenticate')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async authenticate2FA(
    @Request() req: RequestWithUser,
    @Body() dto: TwoFactorCodeDto,
  ) {
    const usuarioId = req.user.userId;
    return this.authService.authenticateTwoFactor(usuarioId, dto.codigo);
  }
}
