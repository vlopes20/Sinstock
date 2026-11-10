import { SetMetadata } from '@nestjs/common';

export const AUDIT_METADATA_KEY = 'audit_metadata';

export interface AuditMetadata {
  recurso: string;
  acao: string;
}

export const Audit = (recurso: string, acao: string) =>
  SetMetadata(AUDIT_METADATA_KEY, { recurso, acao });