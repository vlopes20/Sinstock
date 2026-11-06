import type { Prisma, produtos, fornecedores } from '@prisma/client';
import { canAccess, PermissionUser } from '../auth/permission-policy';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BuscaGlobalDto } from './dto/busca-global.dto';

@Injectable()
export class BuscaGlobalService {
  constructor(private readonly prisma: PrismaService) {}

  async buscar(dto: BuscaGlobalDto, user: PermissionUser) {
    const allowed = (resource: string) => canAccess(user, resource, 'ler');
    const termo = dto.termo.trim();
    const { filial_id, limite = 10 } = dto;

    const [produtos, fornecedores, lotes, notasFiscais] = await Promise.all<
      [
        Promise<produtos[]>,
        Promise<fornecedores[]>,
        Promise<
          Prisma.lotesGetPayload<{
            include: {
              produtos: { select: { nome: true } };
              saldos_estoque: true;
            };
          }>[]
        >,
        Promise<
          Prisma.notas_fiscais_entradaGetPayload<{
            include: { fornecedores: { select: { nome_juridico: true } } };
          }>[]
        >,
      ]
    >([
      // 1. Busca em Produtos (por nome ou código de barras)
      allowed('produtos')
        ? this.prisma.produtos.findMany({
            where: {
              OR: [
                { nome: { contains: termo } },
                { codigo_barras: { contains: termo } },
                { marca: { contains: termo } },
                { sku: { contains: termo } },
                { categorias: { nome: { contains: termo } } },
                ...(allowed('fornecedores')
                  ? [
                      { fornecedores: { nome_juridico: { contains: termo } } },
                      { fornecedores: { nome_fantasia: { contains: termo } } },
                    ]
                  : []),
              ],
            },
            take: limite,
          })
        : Promise.resolve<never[]>([]),

      // 2. Busca em Fornecedores (por nome_juridico ou cnpj)
      allowed('fornecedores')
        ? this.prisma.fornecedores.findMany({
            where: {
              OR: [
                { nome_juridico: { contains: termo } },
                { nome_fantasia: { contains: termo } },
                { cnpj: { contains: termo } },
              ],
            },
            take: limite,
          })
        : Promise.resolve<never[]>([]),

      // 3. Busca em Lotes (por numero_lote e relacionamento com saldos_estoque)
      allowed('saldos-estoque')
        ? this.prisma.lotes.findMany({
            where: {
              numero_lote: { contains: termo },
              ...(filial_id ? { saldos_estoque: { some: { filial_id } } } : {}),
            },
            include: {
              produtos: { select: { nome: true } },
              saldos_estoque: { where: { filial_id } },
            },
            take: limite,
          })
        : Promise.resolve<never[]>([]),

      // 4. Busca em Notas Fiscais de Entrada (por numero_nf)
      allowed('notas-fiscais-entrada')
        ? this.prisma.notas_fiscais_entrada.findMany({
            where: {
              numero_nf: { contains: termo },
              filial_id,
            },
            include: {
              fornecedores: { select: { nome_juridico: true } },
            },
            take: limite,
          })
        : Promise.resolve<never[]>([]),
    ]);

    const totalResultados =
      produtos.length +
      fornecedores.length +
      lotes.length +
      notasFiscais.length;

    return {
      termo_pesquisado: termo,
      filtros: {
        filial_id: filial_id ?? 'todas',
        limite_por_categoria: limite,
      },
      total_resultados: totalResultados,
      resultados: {
        produtos: produtos.map((p) => ({
          id: p.id,
          nome: p.nome,
          codigo_barras: p.codigo_barras,
          estoque_minimo: p.estoque_minimo,
        })),
        fornecedores: fornecedores.map((f) => ({
          id: f.id,
          nome_juridico: f.nome_juridico,
          cnpj: f.cnpj,
          email: f.email,
          telefone: f.telefone,
        })),
        lotes: lotes.map((l) => {
          const quantidadeTotal = l.saldos_estoque.reduce(
            (acc, saldo) => acc + Number(saldo.quantidade ?? 0),
            0,
          );

          return {
            id: l.id,
            numero_lote: l.numero_lote,
            produto_nome: l.produtos?.nome,
            quantidade_total: quantidadeTotal,
            data_validade: l.data_validade,
          };
        }),
        notas_fiscais: notasFiscais.map((nf) => ({
          id: nf.id,
          filial_id: nf.filial_id,
          numero_nf: nf.numero_nf,
          fornecedor_nome: nf.fornecedores?.nome_juridico,
          total: nf.total,
          status: nf.status,
          data_emissao: nf.data_emissao,
        })),
      },
    };
  }
}
