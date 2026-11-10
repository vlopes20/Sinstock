import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CompanySettingsDto,
  PreferencesDto,
  StockSettingsDto,
} from './dto/settings.dto';
export const DEFAULT_PREFERENCES = {
  notificar_estoque: true,
  notificar_validade: true,
  logout_inativo: true,
  itens_por_pagina: 10,
};
@Injectable()
export class SinstockSettingsService {
  constructor(private readonly prisma: PrismaService) {}
  async stock() {
    const row = await this.prisma.configuracoes.findUnique({
      where: { chave: 'estoque' },
    });
    return {
      estoque_minimo_padrao: 0,
      dias_validade: 7,
      ...((row?.valor as object) || {}),
      bloquear_negativo: true,
    };
  }
  async company() {
    const row = await this.prisma.configuracoes.findUnique({
      where: { chave: 'empresa' },
    });
    return { nome: 'Sinstock', ...((row?.valor as object) || {}) };
  }
  async publicSettings() {
    return {
      empresa: await this.company(),
      estoque: await this.stock(),
      email_suporte: process.env.SUPPORT_EMAIL || null,
      idioma: 'pt-BR',
      moeda: 'BRL',
      formato_data: 'DD/MM/AAAA',
    };
  }
  async save(
    key: 'empresa' | 'estoque',
    dto: CompanySettingsDto | StockSettingsDto,
    userId: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const old = await tx.configuracoes.findUnique({ where: { chave: key } });
      const value = { ...((old?.valor as object) || {}), ...dto };
      const row = await tx.configuracoes.upsert({
        where: { chave: key },
        create: { chave: key, valor: value },
        update: { valor: value },
      });
      await tx.logAuditoriaEstoque.create({
        data: {
          usuarioId: String(userId),
          acao: 'ALTERAR_CONFIGURACAO',
          recurso: 'CONFIGURACAO',
          recursoId: key,
          dadosNovos: value,
        },
      });
      return row.valor;
    });
  }
  async preferences(userId: number) {
    const user = await this.prisma.usuarios.findUniqueOrThrow({
      where: { id: userId },
      select: { preferencias: true },
    });
    return { ...DEFAULT_PREFERENCES, ...((user.preferencias as object) || {}) };
  }
  async savePreferences(userId: number, dto: PreferencesDto) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw(
        Prisma.sql`SELECT id FROM usuarios WHERE id = ${userId} FOR UPDATE`,
      );
      const user = await tx.usuarios.findUniqueOrThrow({
        where: { id: userId },
      });
      const value = {
        ...DEFAULT_PREFERENCES,
        ...((user.preferencias as object) || {}),
        ...dto,
      };
      await tx.usuarios.update({
        where: { id: userId },
        data: { preferencias: value },
      });
      return value;
    });
  }
}
