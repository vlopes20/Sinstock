# 📦 SINSTOCK — Back-end

Sistema de **Controle e Gerenciamento de Estoque (SINSTOCK)** desenvolvido como projeto de conclusão do curso de Desenvolvimento de Sistemas no SENAI.

O back-end é responsável por disponibilizar a API da aplicação, realizar o processamento das regras de negócio e gerenciar a comunicação com o banco de dados **MySQL**.

---

## 🚀 Tecnologias utilizadas

- **Node.js** — ambiente de execução do back-end
- **JavaScript/TypeScript** — linguagem de desenvolvimento *(ajuste conforme a implementação final)*
- **MySQL** — banco de dados relacional
- **REST API** — comunicação entre front-end e back-end
- **Git/GitHub** — versionamento e colaboração da equipe

> **Observação:** caso o projeto utilize um framework específico, como NestJS ou Express, adicione-o à lista acima.

---

## 📋 Pré-requisitos

Antes de executar o projeto, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/)
- npm (instalado junto com o Node.js)
- MySQL
- Git

Para verificar as versões instaladas:

```bash
node --version
npm --version
mysql --version
git --version
```

---

## ⚙️ Configuração do ambiente

### 1. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd <NOME_DA_PASTA>
```

---

### 2. Instale as dependências

```bash
npm install
```

---

### 3. Configure o arquivo `.env`

O projeto utiliza variáveis de ambiente para armazenar configurações da aplicação e credenciais do banco de dados.

Primeiro, crie uma cópia do arquivo `.env.example` com o nome `.env`.

#### 🪟 Windows — CMD

```cmd
copy .env.example .env
```

#### 🪟 Windows — PowerShell

```powershell
Copy-Item .env.example .env
```

#### 🐧 Linux / 🍎 macOS

```bash
cp .env.example .env
```

Depois, abra o arquivo `.env` e configure os valores necessários.

Exemplo:

```env
DATABASE_URL="mysql://root:root@localhost:3306/sinstock"
```

### 🔐 Importante

- **Não compartilhe o arquivo `.env`** com outras pessoas.
- Não envie credenciais reais para o GitHub.
- O arquivo `.env` deve estar incluído no `.gitignore`.
- Utilize o `.env.example` apenas como modelo das variáveis necessárias.

---

## 🗄️ Configuração do banco de dados

Crie o banco de dados no MySQL:

```sql
CREATE DATABASE sinstock;
```

Depois, configure a variável `DATABASE_URL` no `.env`:

```env
DATABASE_URL="mysql://root:root@localhost:3306/sinstock"
```

A estrutura da URL de conexão é:

```text
mysql://USUARIO:SENHA@HOST:PORTA/BANCO
```

Exemplo:

```text
mysql://root:root@localhost:3306/sinstock
```

Onde:

- `root` → usuário do MySQL
- `root` → senha do MySQL
- `localhost` → servidor do banco
- `3306` → porta padrão do MySQL
- `sinstock` → nome do banco de dados

> ⚠️ Em ambiente de produção, utilize credenciais seguras e não compartilhe o arquivo `.env`.

---

## ▶️ Executando a aplicação

Após instalar as dependências e configurar o `.env`, execute:

### Ambiente de desenvolvimento

```bash
npm run start
```

Caso o projeto utilize outro script definido no `package.json`, consulte os scripts disponíveis:

```bash
npm run
```

### Ambiente de produção

```bash
npm run build
npm run start
```

> Os comandos acima dependem dos scripts configurados no `package.json`.

---

## 🧪 Testes

Para executar os testes automatizados:

```bash
npm run test
```

Para executar os testes em modo de observação:

```bash
npm run test:watch
```

Para gerar cobertura de testes:

```bash
npm run test:cov
```

> Caso algum desses scripts não exista no `package.json`, utilize somente os comandos disponíveis no projeto.

---

## 🔌 API

Com a aplicação em execução, a API estará disponível na porta configurada no `.env`.

Exemplo:

```text
http://localhost:3000
```

Se o projeto possuir documentação Swagger, ela poderá ser acessada em:

```text
http://localhost:3000/docs
```

> A rota da documentação pode variar de acordo com a implementação do projeto.

---

## 🌳 Estrutura do projeto

Uma organização sugerida para o back-end:

```text
sinstock-backend/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── routes/
│   └── ...
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

A estrutura real pode variar conforme a arquitetura adotada pela equipe.

---

## 👥 Equipe

Projeto desenvolvido pela equipe:

| Integrante | Responsabilidade |
|---|---|
| **Gabriel** | Líder / Front-end |
| **Vinicius** | Back-end / API |
| **Juan** | Banco de Dados |
| **Gustavo** | Back-end |
| **Guilherme** | Banco de Dados / QA |

---

## 🔄 Fluxo básico para desenvolvimento

Antes de começar uma nova tarefa:

```bash
git pull
```

Crie uma branch para sua alteração:

```bash
git checkout -b feature/nome-da-feature
```

Após finalizar:

```bash
git add .
git commit -m "feat: descrição da alteração"
git push origin feature/nome-da-feature
```

---

## ⚠️ Boas práticas

- Mantenha o código organizado e padronizado.
- Não faça commit do `.env`.
- Utilize o `.env.example` para documentar novas variáveis.
- Crie branches específicas para novas funcionalidades e correções.
- Faça commits objetivos e descritivos.
- Teste a aplicação antes de enviar alterações.
- Evite subir arquivos desnecessários para o repositório.

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos como parte do **Curso Técnico em Desenvolvimento de Sistemas — SENAI**.

---

<p align="center">
  Desenvolvido pela equipe <strong>SINSTOCK</strong> 🚀
</p>
