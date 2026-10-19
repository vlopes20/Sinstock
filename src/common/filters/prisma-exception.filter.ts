import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro de banco de dados não tratado.';

    switch (exception.code) {
      case 'P2002': {
        status = HttpStatus.CONFLICT;
        const campos = Array.isArray(exception.meta?.target)
          ? (exception.meta?.target as string[]).join(', ')
          : 'campo único';
        message = `Conflito: Já existe um registro com o mesmo valor para: ${campos}.`;
        break;
      }

      case 'P2025': {
        status = HttpStatus.NOT_FOUND;
        message = 'O registro solicitado não foi encontrado no banco de dados.';
        break;
      }

      case 'P2003': {
        status = HttpStatus.BAD_REQUEST;
        message =
          'Operação inválida: violação de chave estrangeira ou vinculo com outros registros.';
        break;
      }

      default:
        message = `Erro de banco de dados (${exception.code}).`;
        break;
    }

    response.status(status).json({
      statusCode: status,
      message,
      codigo_erro: exception.code,
      timestamp: new Date().toISOString(),
    });
  }
}