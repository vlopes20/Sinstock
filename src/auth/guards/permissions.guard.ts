import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const PermissionResource = (resource: string) =>
  SetMetadata('permission-resource', resource);

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const resource = this.reflector.getAllAndOverride<string>(
      'permission-resource',
      [context.getHandler(), context.getClass()],
    );
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new ForbiddenException('Usuário não identificado.');
    let permissions = user.permissoes;
    if (typeof permissions === 'string') {
      try {
        permissions = JSON.parse(permissions);
      } catch {
        permissions = {};
      }
    }
    const admin =
      user.perfil_id === 1 ||
      permissions?.admin === true ||
      permissions?.todas === true;
    if (admin) return true;
    const action = ['GET', 'HEAD'].includes(request.method)
      ? 'ler'
      : request.method === 'POST'
        ? 'criar'
        : request.method === 'DELETE'
          ? 'excluir'
          : 'editar';
    // Branch administration is restricted, while operators may consult branches.
    if (resource === 'filiais' && action !== 'ler')
      throw new ForbiddenException(
        'Somente administradores podem gerenciar filiais.',
      );
    const configured = permissions?.[resource ?? ''];
    if (
      configured === true ||
      configured?.[action] === true ||
      (configured === undefined && permissions?.operacoes === true)
    )
      return true;
    throw new ForbiddenException('Seu perfil não permite esta operação.');
  }
}
