import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import { PrismaClient } from '../generated/prisma';

async function main() {
  const urlString = process.env.DATABASE_URL;
  if (!urlString) {
    throw new Error('A variável DATABASE_URL não foi encontrada no .env');
  }

  const dbUrl = new URL(urlString);

  const adapter = new PrismaMariaDb({
    host: dbUrl.hostname,
    port: Number(dbUrl.port) || 3306,
    user: dbUrl.username,
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.replace('/', ''),
  });

  const prisma = new PrismaClient({ adapter });

  console.log('Iniciando o seed no banco local...');

  // 1. Criar Perfis com o campo obrigatório "permissoes"
  await prisma.perfis.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nome: 'Administrador',
      permissoes: { admin: true, todas: true },
    },
  });

  await prisma.perfis.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      nome: 'Operador',
      permissoes: { operacoes: true },
    },
  });

  // 2. Criar Usuário Admin usando "senha_hash"
  const senhaHash = await bcrypt.hash('123456', 10);

  await prisma.usuarios.upsert({
    where: { email: 'admin@sinstock.com' },
    update: {
      senha_hash: senhaHash,
      perfil_id: 1,
      ativo: true,
    },
    create: {
      nome: 'Administrador Sinstock',
      email: 'admin@sinstock.com',
      senha_hash: senhaHash,
      perfil_id: 1,
      ativo: true,
    },
  });

  console.log('Seed executado com sucesso! Usuário admin@sinstock.com pronto.');

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Erro ao executar o seed:', e);
  process.exit(1);
});