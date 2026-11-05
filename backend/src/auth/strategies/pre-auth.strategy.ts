import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../usuario/users.service';

@Injectable()
export class PreAuthStrategy extends PassportStrategy(
  Strategy,
  'jwt-pre-auth',
) {
  constructor(
    config: ConfigService,
    private readonly users: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    if (payload.isPreAuth !== true) {
      throw new UnauthorizedException('Token de pré-autenticação inválido.');
    }

    if (!Number.isInteger(payload.sub)) throw new UnauthorizedException();
    const user = await this.users
      .findByIdWithSecrets(payload.sub)
      .catch((error) => {
        if (error instanceof NotFoundException) return null;
        throw error;
      });
    if (
      !user?.ativo ||
      !user.isTwoFactorEnable ||
      payload.version !== user.auth_version
    ) {
      throw new UnauthorizedException(
        'Autenticação expirada. Entre novamente.',
      );
    }

    return {
      userId: payload.sub,
      isPreAuth: true,
      challengeId: payload.challengeId,
      method: payload.method,
    };
  }
}
