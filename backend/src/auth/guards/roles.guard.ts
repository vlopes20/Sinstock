import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<number[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se a rota não definir NENHUMA role específica, permite o acesso
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.perfil_id) {
      throw new ForbiddenException('Perfil do usuário não identificado.');
    }

    const temPermissao = requiredRoles.includes(user.perfil_id);

    if (!temPermissao) {
      throw new ForbiddenException('Acesso negado: seu perfil não possui permissão para este recurso.');
    }

    return true;
  }
}