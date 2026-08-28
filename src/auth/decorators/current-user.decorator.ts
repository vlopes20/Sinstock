import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {

    const request = ctx.switchToHttp().getRequest();
    const usuario = request.usuario;

    if (data) {
      return usuario?.[data];
    }

    return usuario;
  },
);