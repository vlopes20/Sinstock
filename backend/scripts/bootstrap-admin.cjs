require('dotenv').config({ quiet: true });
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function main() {
  const url = new URL(process.env.DATABASE_URL);
  if (
    !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
    process.env.NODE_ENV === 'production'
  ) {
    throw new Error(
      'Este comando cria apenas o primeiro administrador de desenvolvimento local.',
    );
  }
  const connection = await mysql.createConnection(url.href);
  try {
    await connection.beginTransaction();
    const [existing] = await connection.query(
      'SELECT id FROM usuarios WHERE perfil_id = 1 LIMIT 1',
    );
    if (existing.length) {
      await connection.rollback();
      console.log(
        'Já existe um administrador. Nenhuma conta ou senha foi alterada.',
      );
      return;
    }
    const email = process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@sinstock.local';
    const senha =
      process.env.BOOTSTRAP_ADMIN_PASSWORD ||
      randomBytes(18).toString('base64url');
    if (senha.length < 8 || Buffer.byteLength(senha, 'utf8') > 72)
      throw new Error(
        'Senha deve ter ao menos 8 caracteres e no máximo 72 bytes.',
      );
    await connection.execute(
      'INSERT IGNORE INTO perfis (id, nome, permissoes) VALUES (1, ?, ?), (2, ?, ?)',
      [
        'Administrador',
        JSON.stringify({ admin: true, todas: true }),
        'Operador',
        JSON.stringify({ operacoes: true }),
      ],
    );
    await connection.execute(
      'INSERT INTO usuarios (nome, email, senha_hash, perfil_id, ativo) VALUES (?, ?, ?, 1, true)',
      ['Administrador local', email, await bcrypt.hash(senha, 10)],
    );
    // Never print credentials into CI or tool logs. This ignored file is for the local developer.
    const destination = path.resolve('.tmp/admin-local.json');
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(
      destination,
      JSON.stringify(
        { email, senha, acesso: 'http://localhost:3000/frontend/' },
        null,
        2,
      ) + '\n',
      { mode: 0o600, flag: 'wx' },
    );
    await connection.commit();
    console.log(
      'Administrador local criado. Credenciais em .tmp/admin-local.json (não versionado).',
    );
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}
main().catch((error) => {
  console.error(error.code || error.message);
  process.exitCode = 1;
});
