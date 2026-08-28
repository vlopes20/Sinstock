import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../usuario/users.service';

export interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, 
      secretOrKey: process.env.JWT_SECRET || 'chave_secreta_super_segura', 
    });
  }

  
  async validate(payload: JwtPayload) {
    const usuario = await this.usersService.findByEmail(payload.email);

    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado ou não autorizado');
    }

    
    const { senha: _, ...resultado } = usuario;
    return resultado;
  }
}