import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConsultaAuditoriaDto } from './dto/consulta-auditoria.dto';

export interface CriarLogDto {
  usuarioId?: string;
  acao: string;
  recurso: string;
  recursoId?: string;
  dadosAnteriores?: any;
  dadosNovos?: any;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  async registrarLog(dados: CriarLogDto) {
    return this.prisma.logAuditoriaEstoque.create({
      data: {
        usuarioId: dados.usuarioId ?? null,
        acao: dados.acao,
        recurso: dados.recurso,
        recursoId: dados.recursoId ?? null,
        dadosAnteriores: dados.dadosAnteriores
          ? JSON.parse(JSON.stringify(dados.dadosAnteriores))
          : undefined,
        dadosNovos: dados.dadosNovos
          ? JSON.parse(JSON.stringify(dados.dadosNovos))
          : undefined,
        ip: dados.ip ?? null,
        userAgent: dados.userAgent ?? null,
      },
    });
  }

  async listarHistorico(filtros: ConsultaAuditoriaDto) {
    const {
      usuarioId,
      acao,
      recurso,
      recursoId,
      dataInicio,
      dataFim,
      page = 1,
      limit = 20,
    } = filtros;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (usuarioId) where.usuarioId = usuarioId;
    if (acao) where.acao = acao;
    if (recurso) where.recurso = recurso;
    if (recursoId) where.recursoId = recursoId;

    if (dataInicio || dataFim) {
      where.criadoEm = {
        ...(dataInicio && { gte: dataInicio }),
        ...(dataFim && { lte: dataFim }),
      };
    }

    const [total, items] = await Promise.all([
      this.prisma.logAuditoriaEstoque.count({ where }),
      this.prisma.logAuditoriaEstoque.findMany({
        where,
        orderBy: { criadoEm: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}