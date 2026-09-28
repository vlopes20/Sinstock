import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import * as mysql from 'mysql2/promise';

async function main() {
  console.log('Iniciando a execução do seed no banco de dados...');

  const connection = await mysql.createConnection(process.env.DATABASE_URL!);

  try {
    const permissoesAdmin = JSON.stringify({ admin: true, todas: true });
    const permissoesOperador = JSON.stringify({ operacoes: true });

    await connection.execute(
      `INSERT INTO perfis (id, nome, permissoes) 
       VALUES (1, 'Administrador', ?) 
       ON DUPLICATE KEY UPDATE nome = 'Administrador', permissoes = ?`,
      [permissoesAdmin, permissoesAdmin],
    );

    await connection.execute(
      `INSERT INTO perfis (id, nome, permissoes) 
       VALUES (2, 'Operador', ?) 
       ON DUPLICATE KEY UPDATE nome = 'Operador', permissoes = ?`,
      [permissoesOperador, permissoesOperador],
    );

    const senhaHash = await bcrypt.hash('123456', 10);

    await connection.execute(
      `INSERT INTO usuarios (nome, email, senha_hash, perfil_id, ativo) 
       VALUES ('Administrador Sinstock', 'admin@sinstock.com', ?, 1, true) 
       ON DUPLICATE KEY UPDATE senha_hash = ?, perfil_id = 1, ativo = true`,
      [senhaHash, senhaHash],
    );

    console.log('✅ Seed concluído com sucesso! Perfis e Usuário Admin cadastrados.');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('Erro durante a execução do seed:', error);
  process.exit(1);
});