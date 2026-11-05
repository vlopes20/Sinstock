import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export function getSmtpConfig(env: NodeJS.ProcessEnv = process.env): {
  from: string;
  transport: SMTPTransport.Options;
} | null {
  if (env.SMTP_ENABLED !== 'true') return null;
  const missing = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'].filter(
    (key) => !env[key]?.trim(),
  );
  if (missing.length)
    throw new Error(`Preencha no .env: ${missing.join(', ')}.`);
  const port = Number(env.SMTP_PORT || 465);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('SMTP_PORT deve ser uma porta entre 1 e 65535.');
  if (env.SMTP_SECURE && !['true', 'false'].includes(env.SMTP_SECURE))
    throw new Error('SMTP_SECURE deve ser true ou false.');
  const secure = env.SMTP_SECURE ? env.SMTP_SECURE === 'true' : port === 465;
  if ((port === 465 && !secure) || (port === 587 && secure))
    throw new Error('Use SMTP_SECURE=true na porta 465 ou false na porta 587.');
  return {
    from: env.SMTP_FROM!.trim(),
    transport: {
      host: env.SMTP_HOST!.trim(),
      port,
      secure,
      requireTLS: !secure,
      auth: { user: env.SMTP_USER!.trim(), pass: env.SMTP_PASS! },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    },
  };
}
