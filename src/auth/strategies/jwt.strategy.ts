import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET || 'sinstock_chave_super_secreta_jwt_2026',
    });
  }

  async validate(payload: any) {
    if (payload.isPreAuth === true) {
      throw new UnauthorizedException(
        'Token de pré-autenticação não autorizado para esta rota.',
      );
    }

    return {
      userId: payload.sub,
      email: payload.email,
      perfil_id: payload.perfil_id,
    };
  }
}