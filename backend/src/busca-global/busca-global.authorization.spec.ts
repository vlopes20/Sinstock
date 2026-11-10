import 'reflect-metadata';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { BuscaGlobalController } from './busca-global.controller';
import { BuscaGlobalService } from './busca-global.service';
import type { PrismaService } from '../prisma/prisma.service';

// Never load the real Prisma client, adapter, environment or lifecycle hooks.
jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class {
    constructor() {
      throw new Error(
        'Real Prisma construction is forbidden in this unit suite',
      );
    }
  },
}));

const groups = [
  ['produtos', 'produtos', 'produtos'],
  ['fornecedores', 'fornecedores', 'fornecedores'],
  ['saldos-estoque', 'lotes', 'lotes'],
  ['notas-fiscais-entrada', 'notas_fiscais', 'notas_fiscais_entrada'],
] as const;

type User = {
  userId: number;
  perfil_id: number;
  permissoes: Record<string, unknown>;
};
const operator = (permissions: Record<string, unknown>): User => ({
  userId: 42,
  perfil_id: 2,
  permissoes: { 'busca-global': { ler: true }, ...permissions },
});

function mockRows<T>(rows: T[]) {
  return jest.fn<Promise<T[]>, [unknown]>().mockResolvedValue(rows);
}
function setup() {
  const prisma = {
    produtos: {
      findMany: mockRows([
        {
          id: 1,
          nome: 'Produto QA',
          codigo_barras: 'QA-001',
          estoque_minimo: 2,
        },
      ]),
    },
    fornecedores: {
      findMany: mockRows([
        {
          id: 2,
          nome_juridico: 'Fornecedor QA',
          cnpj: 'DOCUMENTO-FICTICIO',
          email: 'qa@example.test',
          telefone: 'FICTICIO',
        },
      ]),
    },
    lotes: {
      findMany: mockRows([
        {
          id: 3,
          numero_lote: 'QA-LOTE',
          produtos: { nome: 'Produto QA' },
          saldos_estoque: [{ quantidade: 3 }],
          data_validade: new Date('2030-01-01'),
        },
      ]),
    },
    notas_fiscais_entrada: {
      findMany: mockRows([
        {
          id: 4,
          filial_id: 1,
          numero_nf: 'QA-NF',
          fornecedores: { nome_juridico: 'Fornecedor QA' },
          total: 12,
          status: 'RECEBIDA',
          data_emissao: new Date('2026-01-01'),
        },
      ]),
    },
  };
  const controller = new BuscaGlobalController(
    new BuscaGlobalService(prisma as unknown as PrismaService),
  );
  const guard = new PermissionsGuard(new Reflector());
  const context = (user: User) =>
    ({
      getHandler: () =>
        Object.getOwnPropertyDescriptor(
          BuscaGlobalController.prototype,
          'buscar',
        )?.value as unknown as () => unknown,
      getClass: () => BuscaGlobalController,
      switchToHttp: () => ({ getRequest: () => ({ method: 'GET', user }) }),
    }) as unknown as ExecutionContext;
  // Explicitly compose the real permission guard and controller in memory.
  // This is NOT an HTTP/JWT integration test; Nest/DB/SMTP are never started.
  const search = async (user: User) => {
    guard.canActivate(context(user));
    return controller.buscar({ termo: 'QA', filial_id: 1, limite: 5 }, user);
  };
  return { prisma, search };
}

describe('Busca global: resource authorization regression (no database)', () => {
  it('keeps all four result groups available for an administrator', async () => {
    const { prisma, search } = setup();
    const result = await search({ userId: 1, perfil_id: 1, permissoes: {} });
    expect(result).toMatchObject({
      termo_pesquisado: 'QA',
      filtros: { filial_id: 1, limite_por_categoria: 5 },
      total_resultados: 4,
    });
    expect(Object.keys(result.resultados).sort()).toEqual(
      ['produtos', 'fornecedores', 'lotes', 'notas_fiscais'].sort(),
    );
    for (const [, group, delegate] of groups) {
      expect(result.resultados[group]).toHaveLength(1);
      expect(prisma[delegate].findMany).toHaveBeenCalledTimes(1);
      expect(prisma[delegate].findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 }),
      );
    }
  });

  it('rejects a denied global search before executing any query', async () => {
    const { prisma, search } = setup();
    await expect(
      search(operator({ 'busca-global': { ler: false } })),
    ).rejects.toBeInstanceOf(ForbiddenException);
    for (const [, , delegate] of groups) {
      expect(prisma[delegate].findMany).not.toHaveBeenCalled();
    }
  });

  describe.each(groups)(
    '%s denied while global search is allowed',
    (resource, group, delegate) => {
      const permissions = () => ({
        ...Object.fromEntries(groups.map(([key]) => [key, { ler: true }])),
        [resource]: { ler: false },
      });

      it('does not execute the denied resource query', async () => {
        const { prisma, search } = setup();
        await search(operator(permissions()));
        expect(prisma[delegate].findMany).not.toHaveBeenCalled();
      });

      it('returns an empty denied group and counts only authorized results', async () => {
        const { search } = setup();
        const result = await search(operator(permissions()));
        expect(result.resultados[group]).toEqual([]);
        expect(result.total_resultados).toBe(3);
        for (const [key, allowedGroup] of groups) {
          if (key !== resource)
            expect(result.resultados[allowedGroup]).toHaveLength(1);
        }
      });
    },
  );
  it('does not infer suppliers through product search when suppliers are denied', async () => {
    const { prisma, search } = setup();
    await search(
      operator({ produtos: { ler: true }, fornecedores: { ler: false } }),
    );
    const query = prisma.produtos.findMany.mock.calls[0][0] as {
      where: { OR: object[] };
    };
    expect(
      query.where.OR.some((filter: object) => 'fornecedores' in filter),
    ).toBe(false);
  });
  it('keeps supplier product search criteria when supplier reading is allowed', async () => {
    const { prisma, search } = setup();
    await search(
      operator({ produtos: { ler: true }, fornecedores: { ler: true } }),
    );
    const query = prisma.produtos.findMany.mock.calls[0][0] as {
      where: { OR: object[] };
    };
    expect(
      query.where.OR.filter((filter: object) => 'fornecedores' in filter),
    ).toHaveLength(2);
  });
});
