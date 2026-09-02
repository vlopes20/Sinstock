import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Criar perfil Administrador
  const perfilAdmin = await prisma.perfis.upsert({
    where: { nome: 'Administrador' },
    update: {},
    create: {
      nome: 'Administrador',
      permissoes: { admin: true, acessototal: true },
    },
  });

  // 2. Criar perfil Operador
  await prisma.perfis.upsert({
    where: { nome: 'Operador' },
    update: {},
    create: {
      nome: 'Operador',
      permissoes: { vendas: true, estoque: true },
    },
  });

  // 3. Criar usuário administrador padrão
  const senhaHash = await bcrypt.hash('123456', 10);

  await prisma.usuarios.upsert({
    where: { email: 'admin@sinstock.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@sinstock.com',
      senha_hash: senhaHash,
      perfil_id: perfilAdmin.id,
    },
  });

  console.log('✅ Banco de dados populado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });