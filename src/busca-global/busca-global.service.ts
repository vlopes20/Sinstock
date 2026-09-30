import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BuscaGlobalDto } from './dto/busca-global.dto';

@Injectable()
export class BuscaGlobalService {
  constructor(private readonly prisma: PrismaService) {}

  async buscar(dto: BuscaGlobalDto) {
    const { termo, filial_id, limite = 10 } = dto;

    const [produtos, fornecedores, lotes, notasFiscais] = await Promise.all([
      // 1. Busca em Produtos (por nome ou código de barras)
      this.prisma.produtos.findMany({
        where: {
          OR: [
            { nome: { contains: termo } },
            { codigo_barras: { contains: termo } },
          ],
        },
        take: limite,
      }),

      // 2. Busca em Fornecedores (por nome_juridico ou cnpj)
      this.prisma.fornecedores.findMany({
        where: {
          OR: [
            { nome_juridico: { contains: termo } },
            { cnpj: { contains: termo } },
          ],
        },
        take: limite,
      }),

      // 3. Busca em Lotes (por numero_lote e relacionamento com saldos_estoque)
      this.prisma.lotes.findMany({
        where: {
          numero_lote: { contains: termo },
          ...(filial_id ? { saldos_estoque: { some: { filial_id } } } : {}),
        },
        include: {
          produtos: { select: { nome: true } },
          saldos_estoque: true,
        },
        take: limite,
      }),

      // 4. Busca em Notas Fiscais de Entrada (por numero_nf)
      this.prisma.notas_fiscais_entrada.findMany({
        where: {
          numero_nf: { contains: termo },
        },
        include: {
          fornecedores: { select: { nome_juridico: true } },
        },
        take: limite,
      }),
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