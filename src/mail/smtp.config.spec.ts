import { getSmtpConfig } from './smtp.config';

const configured = {
  SMTP_ENABLED: 'true',
  SMTP_HOST: 'smtp.example.test',
  SMTP_USER: 'sender@example.test',
  SMTP_PASS: 'app-password',
  SMTP_FROM: 'Sinstock <sender@example.test>',
};

describe('SMTP configuration', () => {
  it('disables SMTP without requiring credentials', () => {
    expect(getSmtpConfig({ SMTP_ENABLED: 'false' })).toBeNull();
  });

  it('uses implicit TLS on port 465', () => {
    expect(getSmtpConfig(configured)?.transport).toMatchObject({
      port: 465,
      secure: true,
      auth: { user: configured.SMTP_USER, pass: configured.SMTP_PASS },
    });
  });

  it('requires STARTTLS on port 587', () => {
    expect(
      getSmtpConfig({ ...configured, SMTP_PORT: '587' })?.transport,
    ).toMatchObject({
      port: 587,
      secure: false,
      requireTLS: true,
    });
  });

  it('rejects missing credentials without including secrets in errors', () => {
    expect(() => getSmtpConfig({ ...configured, SMTP_FROM: '' })).toThrow(
      'SMTP_FROM',
    );
  });

  it.each(['0', '65536', 'abc', '465.5'])('rejects invalid port %s', (port) => {
    expect(() => getSmtpConfig({ ...configured, SMTP_PORT: port })).toThrow(
      'SMTP_PORT',
    );
  });

  it.each([
    ['465', 'false'],
    ['587', 'true'],
  ])('rejects port %s with secure=%s', (port, secure) => {
    expect(() =>
      getSmtpConfig({ ...configured, SMTP_PORT: port, SMTP_SECURE: secure }),
    ).toThrow('SMTP_SECURE');
  });
});
