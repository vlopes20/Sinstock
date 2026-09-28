import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class PreAuthStrategy extends PassportStrategy(
  Strategy,
  'jwt-pre-auth',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET || 'sinstock_chave_super_secreta_jwt_2026',
    });
  }

  async validate(payload: any) {
    if (payload.isPreAuth !== true) {
      throw new UnauthorizedException('Token de pré-autenticação inválido.',
);
    }

    return {
      userId: payload.sub,
      isPreAuth: true,
    };
  }
}
