import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditoriaService } from '../auditoria.service';
import { AUDIT_METADATA_KEY, AuditMetadata } from '../decorators/audit.decorator';

@Injectable()
export class AuditEstoqueInterceptor implements NestInterceptor {
  constructor(
    private readonly auditoriaService: AuditoriaService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Captura os metadados do decorator @Audit()
    const metadata = this.reflector.get<AuditMetadata>(
      AUDIT_METADATA_KEY,
      context.getHandler(),
    );

    const req = context.switchToHttp().getRequest();
    const { method, body, params, ip, headers, user } = req;

    const recursoId = params?.id || body?.id || body?.produtoId || null;

    return next.handle().pipe(
      tap((respostaServidor) => {
        this.auditoriaService
          .registrarLog({
            usuarioId: user?.id || user?.sub || 'SISTEMA',
            acao: metadata?.acao || method,
            recurso: metadata?.recurso || 'ESTOQUE',
            recursoId: recursoId ? String(recursoId) : undefined,
            dadosAnteriores: req.dadosAnteriores || null,
            dadosNovos: respostaServidor || body,
            ip: ip || headers['x-forwarded-for'],
            userAgent: headers['user-agent'],
          })
          .catch((err) => {
            console.error('Erro ao salvar log de auditoria:', err);
          });
      }),
    );
  }
}