import { AuthService } from './auth.service';
import type { JwtService } from '@nestjs/jwt';
import type { PrismaService } from '../prisma/prisma.service';
import type { EmailChallengeService } from './email-challenge.service';
jest.mock('../prisma/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('./email-challenge.service', () => ({
  EmailChallengeService: class {},
}));
import * as speakeasy from 'speakeasy';
import { TwoFactorService } from './two-factor.service';
import type { UsersService } from '../usuario/users.service';
jest.mock('../usuario/users.service', () => ({ UsersService: class {} }));
// Public fixture only; never use this seed for any real account.
const secret = 'JBSWY3DPEHPK3PXP';
const user = {
  id: 42,
  nome: 'QA',
  email: 'qa@example.test',
  perfil_id: 2,
  auth_version: 3,
  ativo: true,
  isTwoFactorEnable: true,
  two_factor_method: 'TOTP',
  twoFactorSecret: secret,
};

describe('Single-use TOTP', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2030-01-01T00:00:00Z'));
  });
  afterEach(() => jest.useRealTimers());
  const code = () => speakeasy.totp({ secret, encoding: 'base32' });
  function setup() {
    const consumeTotp = jest.fn().mockResolvedValue(true);
    const service = new TwoFactorService({
      consumeTotp,
    } as unknown as UsersService);
    return { service, consumeTotp };
  }

  it('stores the matched previous step within the allowed clock tolerance', async () => {
    const { service, consumeTotp } = setup();
    const step = Math.floor(Date.now() / 30_000);
    const value = code();
    jest.advanceTimersByTime(30000);
    await expect(service.consumeCode(user, value, 'login')).resolves.toBe(true);
    expect(consumeTotp).toHaveBeenCalledWith(user, step, 'login');
  });
  it('rejects an expired code before attempting to consume it', async () => {
    const { service, consumeTotp } = setup();
    const value = code();
    jest.advanceTimersByTime(90000);
    await expect(service.consumeCode(user, value, 'login')).resolves.toBe(
      false,
    );
    expect(consumeTotp).not.toHaveBeenCalled();
  });
  it('issues access only for a successfully consumed code', async () => {
    const findByIdWithSecrets = jest.fn().mockResolvedValue(user);
    const { service, consumeTotp } = setup();
    consumeTotp.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const sign = jest.fn().mockReturnValue('fictional-access');
    const update = jest.fn().mockResolvedValue({});
    const auth = new AuthService(
      { findByIdWithSecrets } as unknown as UsersService,
      { sign } as unknown as JwtService,
      service,
      {} as EmailChallengeService,
      { usuarios: { update } } as unknown as PrismaService,
    );
    const value = code();
    await expect(auth.authenticateTwoFactor(42, value)).resolves.toMatchObject({
      access_token: 'fictional-access',
    });
    await expect(auth.authenticateTwoFactor(42, value)).rejects.toThrow(
      'já utilizado',
    );
    expect(sign).toHaveBeenCalledTimes(1);
    expect(update).not.toHaveBeenCalled();
  });
});
