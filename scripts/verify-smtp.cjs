require('dotenv').config({ quiet: true });
require('ts-node/register/transpile-only');
const nodemailer = require('nodemailer');
const { getSmtpConfig } = require('../src/mail/smtp.config');

async function main() {
  const config = getSmtpConfig();
  if (!config) throw new Error('Defina SMTP_ENABLED=true no .env para testar.');
  const transporter = nodemailer.createTransport(config.transport);
  try {
    await transporter.verify();
    console.log('SMTP conectado e autenticado. Nenhum e-mail foi enviado.');
    console.log(
      'Para validar a entrega, use Esqueci minha senha com uma conta cadastrada.',
    );
  } finally {
    transporter.close();
  }
}

main().catch((error) => {
  const messages = {
    EAUTH:
      'Autenticação recusada. Confira SMTP_USER e a senha de app do Google em SMTP_PASS.',
    EDNS: 'Servidor não encontrado. Confira SMTP_HOST e sua conexão.',
    ECONNECTION: 'Conexão recusada. Confira host, porta e firewall.',
    ETIMEDOUT: 'Tempo de conexão esgotado. Confira sua rede, porta e firewall.',
    ESOCKET: 'Falha de conexão/TLS. Confira porta, SMTP_SECURE e certificados.',
  };
  // Do not print provider responses, credentials or full error objects.
  console.error(
    error.code
      ? messages[error.code] ||
          'Falha na verificação SMTP. Confira a configuração e a rede.'
      : error.message,
  );
  process.exitCode = 1;
});
