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
describe('TOTP frozen-clock characterization: replay protection remains pending', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2030-01-01T00:00:00Z'));
  });
  afterEach(() => jest.useRealTimers());
  const service = () => new TwoFactorService({} as UsersService);
  const code = () => speakeasy.totp({ secret, encoding: 'base32' });
  it('accepts a valid fictional TOTP', () =>
    expect(service().verifyTwoFactorCode(code(), secret)).toBe(true));
  it('documents that the same TOTP is accepted twice in its current window (known defect)', () => {
    const instance = service();
    const value = code();
    expect(instance.verifyTwoFactorCode(value, secret)).toBe(true);
    expect(instance.verifyTwoFactorCode(value, secret)).toBe(true);
  });
  it('accepts previous time step within configured tolerance', () => {
    const value = code();
    jest.advanceTimersByTime(30000);
    expect(service().verifyTwoFactorCode(value, secret)).toBe(true);
  });
  it('rejects the same code outside the configured time window', () => {
    const value = code();
    jest.advanceTimersByTime(90000);
    expect(service().verifyTwoFactorCode(value, secret)).toBe(false);
  });
  it('documents repeated access issuance for the same TOTP in AuthService (known defect)', async () => {
    const findByIdWithSecrets = jest.fn().mockResolvedValue({
      id: 42,
      nome: 'QA',
      email: 'qa@example.test',
      perfil_id: 2,
      auth_version: 3,
      ativo: true,
      isTwoFactorEnable: true,
      two_factor_method: 'TOTP',
      twoFactorSecret: secret,
    });
    const sign = jest.fn().mockReturnValue('fictional-access');
    const update = jest.fn().mockResolvedValue({});
    const auth = new AuthService(
      { findByIdWithSecrets } as unknown as UsersService,
      { sign } as unknown as JwtService,
      service(),
      {} as EmailChallengeService,
      { usuarios: { update } } as unknown as PrismaService,
    );
    const value = code();
    await expect(auth.authenticateTwoFactor(42, value)).resolves.toMatchObject({
      access_token: 'fictional-access',
    });
    await expect(auth.authenticateTwoFactor(42, value)).resolves.toMatchObject({
      access_token: 'fictional-access',
    });
    expect(sign).toHaveBeenCalledTimes(2);
    expect(update).toHaveBeenCalledTimes(2);
  });
});
