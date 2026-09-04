# Backend Sinstock

API do sistema Sinstock, desenvolvida utilizando [NestJS](https://nestjs.com/) e [Prisma ORM](https://www.prisma.io/), com banco de dados MariaDB/MySQL.

## 📋 Pré-requisitos

Certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
- Banco de dados MariaDB ou MySQL rodando localmente ou em nuvem.

## 🚀 Instalação e Configuração

**1. Instale as dependências do projeto:**
\`\`\`bash
npm install
\`\`\`

**2. Configure as variáveis de ambiente:**
Crie o arquivo `.env` a partir do arquivo de exemplo. 

No Windows (PowerShell/CMD):
\`\`\`bash
copy .env.example .env
\`\`\`
No Linux/Mac:
\`\`\`bash
cp .env.example .env
\`\`\`
> **Nota:** Abra o arquivo `.env` recém-criado e preencha as credenciais corretas de acesso ao seu banco de dados e a sua `JWT_SECRET`.

**3. Configure o Banco de Dados (Prisma):**
Gere os artefatos do Prisma Client, crie as tabelas no banco e popule com os dados iniciais (Seed):
\`\`\`bash
# Gera o Client do Prisma
npx prisma generate

# Sincroniza o banco de dados com o schema
npx prisma db push

# Popula o banco com os usuários e perfis iniciais
npx prisma db seed
\`\`\`

## 💻 Executando a Aplicação

\`\`\`bash
# Modo de desenvolvimento (recomendado)
npm run start:dev

# Modo de produção
npm run start:prod
\`\`\`
A aplicação estará disponível em `http://localhost:3000`.

## 🧪 Testes

\`\`\`bash
# Testes unitários
npm run test

# Cobertura de testes
npm run test:cov
\`\`\`

## 🛠️ Tecnologias Utilizadas

- **NestJS:** Framework Node.js para construção de APIs eficientes e escaláveis.
- **Prisma:** ORM moderno para Node.js e TypeScript.
- **JWT & Passport:** Autenticação e segurança de rotas.
- **Bcrypt:** Criptografia de senhas.
- **MariaDB / MySQL:** Banco de dados relacional.