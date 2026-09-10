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

    if (user.isTwoFactorEnable) {
      return {
        mfaRequired: true,
        userId: user.id,
        message: 'Insira o código de 6 dígitos do seu aplicativo autenticador.',
        preAuthToken: this.jwtService.sign(
          { sub: user.id, isPreAuth: true },
          { expiresIn: '5m' },
        ),
      };
    }

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


  async authenticateTwoFactor(userId: number, code: string) {

    const user = await this.usersService.findByIdWithSecrets(userId);

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