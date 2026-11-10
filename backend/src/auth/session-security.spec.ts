import type { ConfigService } from '@nestjs/config';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PreAuthStrategy } from './strategies/pre-auth.strategy';
import type { UsersService } from '../usuario/users.service';
import { canAccess } from './permission-policy';
import { JwtService } from '@nestjs/jwt';
jest.mock('@nestjs/config', () => ({ ConfigService: class {} }));
jest.mock('../usuario/users.service', () => ({ UsersService: class {} }));
const fixture = () => ({
  ativo: true,
  isTwoFactorEnable: true,
  auth_version: 3,
  email: 'qa@example.test',
  perfil_id: 2,
  perfis: { permissoes: { produtos: { ler: true } } },
});
function setup() {
  const find = jest
    .fn<Promise<ReturnType<typeof fixture> | null>, [number]>()
    .mockResolvedValue(fixture());
  const users = { findByIdWithSecrets: find } as unknown as UsersService;
  const config = {
    getOrThrow: () => 'fictional-unit-test-signing-key',
  } as unknown as ConfigService;
  return {
    find,
    jwt: new JwtStrategy(config, users),
    pre: new PreAuthStrategy(config, users),
  };
}
describe('Session authorization with fictional users', () => {
  it('rejects pre-auth token on complete authentication before lookup', async () => {
    const { jwt, find } = setup();
    await expect(
      jwt.validate({ sub: 42, version: 3, isPreAuth: true }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(find).not.toHaveBeenCalled();
  });
  it('rejects complete token on pre-auth before lookup', async () => {
    const { pre, find } = setup();
    await expect(pre.validate({ sub: 42, version: 3 })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(find).not.toHaveBeenCalled();
  });
  it.each(['42', null, 1.5])(
    'rejects invalid subject %s in both strategies',
    async (sub) => {
      const { jwt, pre, find } = setup();
      await expect(jwt.validate({ sub, version: 3 })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      await expect(
        pre.validate({ sub, version: 3, isPreAuth: true }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(find).not.toHaveBeenCalled();
    },
  );
  it.each([{ ativo: false }, { auth_version: 4 }])(
    'rejects revoked identity %j in both strategies',
    async (change) => {
      const { jwt, pre, find } = setup();
      find.mockResolvedValue({ ...fixture(), ...change });
      await expect(
        jwt.validate({ sub: 42, version: 3 }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(
        pre.validate({ sub: 42, version: 3, isPreAuth: true }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    },
  );
  it('rejects pre-auth after disabling MFA', async () => {
    const { pre, find } = setup();
    find.mockResolvedValue({ ...fixture(), isTwoFactorEnable: false });
    await expect(
      pre.validate({ sub: 42, version: 3, isPreAuth: true }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('rejects missing user in both strategies', async () => {
    const { jwt, pre, find } = setup();
    find.mockRejectedValue(new NotFoundException());
    await expect(jwt.validate({ sub: 42, version: 3 })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(
      pre.validate({ sub: 42, version: 3, isPreAuth: true }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('propagates infrastructure errors instead of treating them as credentials', async () => {
    const { jwt, find } = setup();
    const error = new Error('fictional storage unavailable');
    find.mockRejectedValue(error);
    await expect(jwt.validate({ sub: 42, version: 3 })).rejects.toBe(error);
  });
  it('uses current permissions instead of permissions embedded in an old token', async () => {
    const { jwt, find } = setup();
    const payload = {
      sub: 42,
      version: 3,
      perfil_id: 1,
      permissoes: { admin: true },
    };
    expect(canAccess(await jwt.validate(payload), 'produtos', 'ler')).toBe(
      true,
    );
    find.mockResolvedValue({
      ...fixture(),
      perfis: { permissoes: { produtos: { ler: false } } },
    });
    const current = await jwt.validate(payload);
    expect(current.perfil_id).toBe(2);
    expect(canAccess(current, 'produtos', 'ler')).toBe(false);
  });
  it('preserves challenge binding in pre-auth result', async () => {
    const { pre } = setup();
    await expect(
      pre.validate({
        sub: 42,
        version: 3,
        isPreAuth: true,
        method: 'EMAIL',
        challengeId: 'fictional-id',
      }),
    ).resolves.toMatchObject({
      userId: 42,
      isPreAuth: true,
      challengeId: 'fictional-id',
      method: 'EMAIL',
    });
  });
});
describe('JWT expiration with frozen time (no real account)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2030-01-01T00:00:00Z'));
  });
  afterEach(() => jest.useRealTimers());
  it('rejects a signed token at its expiration boundary', () => {
    const jwt = new JwtService({
      secret: 'fictional-unit-test-key',
      signOptions: { expiresIn: '5m' },
    });
    const token = jwt.sign({ sub: 42, isPreAuth: true });
    expect(() => jwt.verify<Record<string, unknown>>(token)).not.toThrow();
    jest.advanceTimersByTime(300000);
    expect(() => jwt.verify<Record<string, unknown>>(token)).toThrow();
  });
});
