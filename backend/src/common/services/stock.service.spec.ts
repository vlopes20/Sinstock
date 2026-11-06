import { StockService } from './stock.service';
import type { PrismaService } from '../../prisma/prisma.service';
import type { StockEventsService } from './stock-events.service';
import { Prisma } from '@prisma/client';
jest.mock('../../prisma/prisma.service', () => ({ PrismaService: class {} }));
function setup(
  rows: {
    id: number;
    quantidade: number | Prisma.Decimal;
    quantidade_reservada: number;
  }[] = [],
  lotProduct = 1,
) {
  const tx = {
    lotes: {
      findUnique: jest.fn().mockResolvedValue({ produto_id: lotProduct }),
    },
    saldos_estoque: {
      findFirst: jest.fn().mockResolvedValue(rows[0] ?? null),
      findMany: jest.fn().mockResolvedValue(rows),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
    },
  };
  const service = new StockService(
    {} as PrismaService,
    { emit: jest.fn() } as unknown as StockEventsService,
  );
  return { service, tx: tx as unknown as Prisma.TransactionClient, mocks: tx };
}
describe('Stock invariants without database', () => {
  it('rejects a lot belonging to another product before writing', async () => {
    const { service, tx, mocks } = setup([], 99);
    await expect(
      service.change(tx, { produto_id: 1, filial_id: 1, lote_id: 3 }, 1),
    ).rejects.toThrow();
    expect(mocks.saldos_estoque.create).not.toHaveBeenCalled();
    expect(mocks.saldos_estoque.update).not.toHaveBeenCalled();
  });
  it.each([
    [-1, 0],
    [0, -1],
    [1, 2],
  ])('rejects invalid quantity/reserve %s/%s', async (quantity, reserve) => {
    const { service, tx, mocks } = setup();
    await expect(
      service.change(tx, { produto_id: 1, filial_id: 1 }, quantity, reserve),
    ).rejects.toThrow();
    expect(mocks.saldos_estoque.create).not.toHaveBeenCalled();
  });
  it('preserves decimal arithmetic for a permitted withdrawal', async () => {
    const { service, tx, mocks } = setup([
      { id: 1, quantidade: new Prisma.Decimal('1.5'), quantidade_reservada: 0 },
    ]);
    const result = await service.change(
      tx,
      { produto_id: 1, filial_id: 1 },
      '-0.1',
    );
    expect(result.after.toString()).toBe('1.4');
    expect(mocks.saldos_estoque.update).toHaveBeenCalledTimes(1);
  });
  it('rejects duplicate balances without a lot before changing one arbitrarily', async () => {
    const { service, tx, mocks } = setup([
      { id: 1, quantidade: 2, quantidade_reservada: 0 },
      { id: 2, quantidade: 3, quantidade_reservada: 0 },
    ]);
    await expect(
      service.change(tx, { produto_id: 1, filial_id: 1 }, 1),
    ).rejects.toThrow();
    expect(mocks.saldos_estoque.update).not.toHaveBeenCalled();
  });
});
