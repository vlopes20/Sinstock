import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../usuario/users.service';
import { LoginDto } from './dto/login.dto';
import { TwoFactorService } from './two-factor.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user || !user.ativo) {
      throw new UnauthorizedException('Credenciais inválidas ou usuário inativo.');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.senha,
      user.senha_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    // 1. Verificação se o 2FA está ativado na conta do usuário
    if (user.isTwoFactorEnable) {
      return {
        mfaRequired: true,
        userId: user.id,
        message: 'Insira o código de 6 dígitos do seu aplicativo autenticador.',
        // Token temporário de 5 minutos exclusivo para a rota de validação 2FA
        preAuthToken: this.jwtService.sign(
          { sub: user.id, isPreAuth: true },
          { expiresIn: '5m' },
        ),
      };
    }

    // 2. Fluxo Normal (Se o 2FA estive desligado)
    const payload = {
      sub: user.id,
      email: user.email,
      perfil_id: user.perfil_id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil_id: user.perfil_id,
      },
    };
  }

  // 3. Novo método: Autenticação do código de 6 dígitos
  async authenticateTwoFactor(userId: number, code: string) {
    const user = await this.usersService.findById(userId);

    if (!user || !user.twoFactorSecret || !user.isTwoFactorEnable) {
      throw new BadRequestException('O 2FA não está ativado para esta conta.');
    }

    const isValid = this.twoFactorService.verifyTwoFactorCode(
      code,
      user.twoFactorSecret,
    );

    if (!isValid) {
      throw new UnauthorizedException('Código 2FA inválido ou expirado.');
    }

    // Retorna o token definitivo e os dados do usuário
    const payload = {
      sub: user.id,
      email: user.email,
      perfil_id: user.perfil_id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil_id: user.perfil_id,
      },
    };
  }
}