import { StockService } from './stock.service';
import type { PrismaService } from '../../prisma/prisma.service';
import type { StockEventsService } from './stock-events.service';
import { Prisma } from '@prisma/client';

jest.mock('../../prisma/prisma.service', () => ({ PrismaService: class {} }));

function setup() {
  const query = jest
    .fn<Promise<{ id: number }[]>, [Prisma.Sql]>()
    .mockResolvedValue([{ id: 1 }]);
  const tx = { $queryRaw: query } as unknown as Prisma.TransactionClient;
  let committed = false;
  const transaction = jest
    .fn<
      Promise<unknown>,
      [(client: Prisma.TransactionClient) => Promise<unknown>, unknown]
    >()
    .mockImplementation(async (work) => {
      const result = await work(tx);
      committed = true;
      return result;
    });
  const emit = jest.fn<void, [unknown]>();
  const service = new StockService(
    { $transaction: transaction } as unknown as PrismaService,
    { emit } as unknown as StockEventsService,
  );
  return { service, query, transaction, tx, emit, committed: () => committed };
}

describe('Stock transaction boundaries with mocks (not MySQL rollback proof)', () => {
  it.each([[], [0], [-1], [1.5], [NaN]].map((ids) => ({ ids })))(
    'rejects invalid product set %j without transaction',
    async ({ ids }) => {
      const { service, transaction } = setup();
      await expect(
        service.write(ids, () => Promise.resolve(null)),
      ).rejects.toThrow();
      expect(transaction).not.toHaveBeenCalled();
    },
  );
  it('locks unique product ids in order and emits after successful commit', async () => {
    const { service, query, transaction, tx, emit, committed } = setup();
    query.mockResolvedValue([{ id: 1 }, { id: 3 }]);
    const work = jest
      .fn<Promise<string>, [Prisma.TransactionClient]>()
      .mockResolvedValue('done');
    emit.mockImplementation(() => {
      expect(committed()).toBe(true);
    });
    await expect(service.write([3, 1, 3], work)).resolves.toBe('done');
    expect(query.mock.calls[0][0].values).toEqual([1, 3]);
    expect(query.mock.calls[0][0].sql).toContain('ORDER BY id FOR UPDATE');
    expect(work).toHaveBeenCalledWith(tx);
    expect(transaction.mock.calls[0][1]).toEqual({
      isolationLevel: 'ReadCommitted',
      maxWait: 10000,
      timeout: 20000,
    });
    expect(emit).toHaveBeenCalledTimes(1);
  });
  it('does not call work for missing products or publish an event', async () => {
    const { service, query, emit } = setup();
    query.mockResolvedValue([]);
    const work = jest.fn<Promise<void>, [Prisma.TransactionClient]>();
    await expect(service.write([1], work)).rejects.toThrow();
    expect(work).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });
  it('propagates callback failure to the transaction and publishes nothing', async () => {
    const { service, emit, committed, transaction } = setup();
    const failure = new Error('simulated destination or audit failure');
    await expect(
      service.write([1], () => Promise.reject(failure)),
    ).rejects.toBe(failure);
    expect(committed()).toBe(false);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(emit).not.toHaveBeenCalled();
  });
  it('retries a transaction conflict once and publishes only committed result', async () => {
    const { service, transaction, emit } = setup();
    transaction.mockRejectedValueOnce({ code: 'P2034' });
    await expect(service.write([1], () => Promise.resolve(7))).resolves.toBe(7);
    expect(transaction).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenCalledTimes(1);
  });
  it('limits persistent transaction conflicts to three attempts', async () => {
    const { service, transaction, emit } = setup();
    const failure = Object.assign(new Error('simulated conflict'), {
      code: 'P2034',
    });
    transaction.mockRejectedValue(failure);
    await expect(service.write([1], () => Promise.resolve(null))).rejects.toBe(
      failure,
    );
    expect(transaction).toHaveBeenCalledTimes(3);
    expect(emit).not.toHaveBeenCalled();
  });
  it('never retries committed work when event publication fails with a conflict-shaped error', async () => {
    const { service, transaction, emit } = setup();
    const failure = Object.assign(new Error('simulated conflict'), {
      code: 'P2034',
    });
    emit.mockImplementation(() => {
      throw failure;
    });
    await expect(service.write([1], () => Promise.resolve(null))).rejects.toBe(
      failure,
    );
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledTimes(1);
  });
});

describe('Stock numeric integrity without database', () => {
  it.each(['NaN', 'Infinity', '-Infinity'])(
    'rejects non-finite quantity %s before writing',
    async (delta) => {
      const create = jest.fn();
      const update = jest.fn();
      const tx = {
        saldos_estoque: {
          findMany: jest.fn().mockResolvedValue([]),
          create,
          update,
        },
      } as unknown as Prisma.TransactionClient;
      const { service } = setup();
      await expect(
        service.change(tx, { produto_id: 1, filial_id: 1 }, delta),
      ).rejects.toThrow();
      expect(create).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    },
  );
  it('rejects non-finite reserve before writing', async () => {
    const create = jest.fn();
    const tx = {
      saldos_estoque: { findMany: jest.fn().mockResolvedValue([]), create },
    } as unknown as Prisma.TransactionClient;
    const { service } = setup();
    await expect(
      service.change(tx, { produto_id: 1, filial_id: 1 }, 1, 'NaN'),
    ).rejects.toThrow();
    expect(create).not.toHaveBeenCalled();
  });
  it('rejects missing lot before consulting balances', async () => {
    const findMany = jest.fn();
    const tx = {
      lotes: { findUnique: jest.fn().mockResolvedValue(null) },
      saldos_estoque: { findMany },
    } as unknown as Prisma.TransactionClient;
    const { service } = setup();
    await expect(
      service.balance(tx, { produto_id: 1, filial_id: 1, lote_id: 5 }),
    ).rejects.toThrow();
    expect(findMany).not.toHaveBeenCalled();
  });
  it.each([undefined, null])(
    'normalizes absent lot %s and limits duplicate detection',
    async (lote_id) => {
      const findMany = jest.fn().mockResolvedValue([]);
      const tx = {
        saldos_estoque: { findMany },
      } as unknown as Prisma.TransactionClient;
      const { service } = setup();
      await expect(
        service.balance(tx, { produto_id: 1, filial_id: 2, lote_id }),
      ).resolves.toBeNull();
      expect(findMany).toHaveBeenCalledWith({
        where: { produto_id: 1, filial_id: 2, lote_id: null },
        take: 2,
      });
    },
  );
});
