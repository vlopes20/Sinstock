jest.mock('../pedidos/pedidos.service', () => ({ PedidosService: class {} }));
jest.mock('../movimentacoes/movimentacoes.service', () => ({
  MovimentacoesService: class {},
}));
jest.mock('../saldos-estoque/saldos-estoque.service', () => ({
  SaldosEstoqueService: class {},
}));
jest.mock('../alertas/alertas.service', () => ({ AlertasService: class {} }));
import { DashboardService } from './dashboard.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { StockEventsService } from '../common/services/stock-events.service';
import type { StockService } from '../common/services/stock.service';
import type { SaldosEstoqueService } from '../saldos-estoque/saldos-estoque.service';
import type { AlertasService } from '../alertas/alertas.service';
import type { PedidosService } from '../pedidos/pedidos.service';
import type { MovimentacoesService } from '../movimentacoes/movimentacoes.service';
import { firstValueFrom, of, toArray } from 'rxjs';
jest.mock('../prisma/prisma.service', () => ({ PrismaService: class {} }));
const event = {
  tipo: 'ESTOQUE_ATUALIZADO',
  produtoIds: [1],
  timestamp: '2030-01-01',
};
const user = () => ({
  ativo: true,
  auth_version: 3,
  perfil_id: 2,
  perfis: { permissoes: { dashboard: { ler: true } } },
});
function setup() {
  const find = jest
    .fn<Promise<ReturnType<typeof user>>, [unknown]>()
    .mockResolvedValue(user());
  const service = new DashboardService(
    { usuarios: { findUnique: find } } as unknown as PrismaService,
    { stream: () => of(event, event) } as unknown as StockEventsService,
    {} as StockService,
    {} as SaldosEstoqueService,
    {} as AlertasService,
    {} as PedidosService,
    {} as MovimentacoesService,
  );
  return { find, service };
}
describe('Open dashboard stream revocation without network', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2030-01-01T00:00:00Z'));
  });
  afterEach(() => jest.useRealTimers());
  const future = () => Date.now() / 1000 + 300;
  it('keeps events for an authorized current session', async () => {
    const { service } = setup();
    await expect(
      firstValueFrom(service.streamForUser(42, 3, future()).pipe(toArray())),
    ).resolves.toHaveLength(2);
  });
  it.each([{ ativo: false }, { auth_version: 4 }])(
    'ends stream after identity revocation %j',
    async (change) => {
      const { service, find } = setup();
      find.mockResolvedValue({ ...user(), ...change });
      await expect(
        firstValueFrom(service.streamForUser(42, 3, future()).pipe(toArray())),
      ).resolves.toEqual([]);
    },
  );
  it('does not deliver events after token expiration', async () => {
    const { service } = setup();
    await expect(
      firstValueFrom(
        service.streamForUser(42, 3, Date.now() / 1000).pipe(toArray()),
      ),
    ).resolves.toEqual([]);
  });
  it('stops delivering after dashboard permission is removed without changing auth_version', async () => {
    const { service, find } = setup();
    find.mockResolvedValueOnce(user()).mockResolvedValue({
      ...user(),
      perfis: { permissoes: { dashboard: { ler: false } } },
    });
    await expect(
      firstValueFrom(service.streamForUser(42, 3, future()).pipe(toArray())),
    ).resolves.toHaveLength(1);
  });
});
