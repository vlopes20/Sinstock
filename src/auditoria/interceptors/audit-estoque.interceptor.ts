import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditoriaService } from '../auditoria.service';

@Injectable()
export class AuditEstoqueInterceptor implements NestInterceptor {
  constructor(
    private readonly auditoriaService: AuditoriaService,
    private readonly recurso: string,
    private readonly acao: string,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, body, params, ip, headers, user } = req;

    const recursoId = params.id || body.id || body.produtoId || null;

    return next.handle().pipe(
      tap((respostaServidor) => {
        this.auditoriaService
          .registrarLog({
            usuarioId: user?.id || user?.sub || 'SISTEMA',
            acao: this.acao || method,
            recurso: this.recurso,
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