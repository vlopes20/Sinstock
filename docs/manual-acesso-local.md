# Manual de acesso local ao SINSTOCK — Windows

Este manual considera a estrutura atual deste repositório, com o código do servidor em `backend/` e os arquivos do site em `frontend/`. O chat compartilhado não pôde ser consultado. Após a correção dos caminhos de compilação, o build e a inicialização do servidor foram validados nesta máquina, e a página `/frontend/` respondeu com HTTP 200. O login não foi testado nesta revisão.

## 1. Preparar o computador

Tenha Node.js 24 (com npm) e MySQL Server instalados. O README registra validação anterior com MySQL 8.4; nesta máquina foi encontrado o serviço `MySQL80` em execução. A compatibilidade da instalação atual ainda precisa ser verificada ao aplicar as migrações.

Abra o PowerShell e entre na pasta do projeto:

```powershell
Set-Location 'C:\Users\Aluno\Documents\GitHub\Sinstock'
node --version
npm.cmd --version
Get-Service -Name '*mysql*'
```

Se o serviço `MySQL80` estiver parado, abra outro PowerShell como administrador e execute:

```powershell
Start-Service MySQL80
```

Se o serviço tiver outro nome, use o nome mostrado pela consulta.

## 2. Instalar as dependências

Na raiz do projeto:

```powershell
npm.cmd ci
npm.cmd ci --prefix frontend
```

A instalação exige conexão com a internet. Não é necessário repetir este passo a cada acesso.

## 3. Configurar a conexão com o banco

Crie o arquivo `.env` somente se ele ainda não existir:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad.exe .env
```

No arquivo, ajuste os valores abaixo, preservando as demais configurações:

```dotenv
PORT=3000
NODE_ENV=development
DATABASE_URL="mysql://root:SUA_SENHA_MYSQL@localhost:3306/sinstock"
JWT_SECRET=COLOQUE_AQUI_UM_SEGREDO_ALEATORIO_LONGO
FRONTEND_URL=http://localhost:3000/frontend/
SMTP_ENABLED=false
```

Use o usuário e a senha reais do seu MySQL. Se a senha contiver caracteres especiais, como `@`, `#` ou `%`, codifique esses caracteres para uso em URL. A senha do MySQL é diferente da senha de login no SINSTOCK.

Para gerar um valor para `JWT_SECRET`, execute o comando abaixo e copie o resultado para o arquivo:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Com SMTP desativado, os fluxos que enviam e-mail ficam indisponíveis, incluindo recuperação de senha e segundo fator por e-mail. Para configurá-los, consulte [SMTP](smtp.md).

## 4. Ajustar os caminhos do Prisma

Na versão inspecionada, `prisma.config.ts` ainda aponta para pastas na raiz que foram movidas para `backend/`. Antes de executar as migrações, abra esse arquivo e ajuste estas três propriedades:

```typescript
schema: 'backend/prisma/schema.prisma',
```

Dentro de `migrations`:

```typescript
path: 'backend/prisma/migrations',
seed: 'node backend/scripts/bootstrap-admin.cjs',
```

Mantenha as outras linhas do arquivo. Esse ajuste é feito uma única vez e só é necessário enquanto os caminhos antigos estiverem presentes.

## 5. Criar a estrutura do banco e o primeiro administrador

Na raiz do projeto, execute um comando por vez. Se algum falhar, resolva o erro antes de continuar:

```powershell
npm.cmd exec -- prisma generate
npm.cmd exec -- prisma migrate deploy
node backend/scripts/bootstrap-admin.cjs
npm.cmd run build:frontend
```

As migrações precisam de um usuário MySQL com permissão para criar o banco `sinstock`, caso ele ainda não exista, e aplicar tabelas, constraints e triggers. Se o usuário não puder criar bancos, peça ao administrador do MySQL para criar `sinstock` e conceder as permissões necessárias antes de repetir a migração.

O bootstrap cria o primeiro administrador local e salva o e-mail e a senha em `.tmp/admin-local.json`. Se já houver um administrador, ele preserva a conta e a senha existentes; nesse caso, pode não criar esse arquivo. Use as credenciais existentes ou a recuperação de senha com SMTP configurado.

## 6. Iniciar o sistema

Permaneça na raiz do projeto e execute:

```powershell
npm.cmd run build
npm.cmd run start:prod
```

Esses comandos compilam o servidor com os metadados de injeção exigidos pelo NestJS e iniciam o resultado. Não use `tsx` para iniciar esta aplicação: ele não emite esses metadados. Os caminhos do NestJS foram corrigidos para `backend/src/`. Para desenvolver com recompilação automática, você também pode usar `npm.cmd run start:dev`.

Mantenha o terminal aberto enquanto usa o sistema. Aguarde a mensagem de aplicação rodando na porta 3000.

## 7. Abrir e fazer login

Abra no navegador:

**http://localhost:3000/frontend/**

Para consultar as credenciais criadas no passo 5, abra outro PowerShell e execute:

```powershell
Set-Location 'C:\Users\Aluno\Documents\GitHub\Sinstock'
notepad.exe .tmp/admin-local.json
```

Digite no login os valores de `email` e `senha`. Guarde esse arquivo com cuidado, pois contém a senha em texto legível.

A documentação da API fica em **http://localhost:3000/api**. Para usar o sistema, abra o endereço `/frontend/`; não abra o HTML diretamente pelo Explorador de Arquivos.

## 8. Acessar novamente nos próximos dias

Depois de concluir a preparação inicial:

1. Confira se o serviço MySQL está em execução.
2. Abra o PowerShell e execute:

```powershell
Set-Location 'C:\Users\Aluno\Documents\GitHub\Sinstock'
npm.cmd run start:prod
```

3. Acesse **http://localhost:3000/frontend/** e faça login.

Para encerrar o servidor, pressione **Ctrl+C** no terminal. Para iniciá-lo novamente, repita o comando acima. Se alterar o código do servidor, execute `npm.cmd run build` antes de iniciar. O servidor não inicia automaticamente quando o Windows é ligado.

## 9. Problemas comuns

| Problema | O que conferir |
| --- | --- |
| Navegador informa conexão recusada | Veja se o terminal do servidor está aberto e se houve erro na inicialização. |
| Erro de conexão com MySQL | Confira o serviço, a porta 3306 e o valor de `DATABASE_URL`. |
| `Access denied` no banco | Confira usuário, senha e permissões do MySQL. |
| Prisma não encontra o schema ou migrações | Confira os caminhos do passo 4 e execute os comandos na raiz. |
| Tabelas inexistentes | Aplique `npm.cmd exec -- prisma migrate deploy` após conferir o banco configurado. |
| `.tmp/admin-local.json` não existe | O bootstrap pode não ter sido executado, ter falhado ou encontrado um administrador já existente. Leia a mensagem do comando. |
| Porta 3000 em uso (`EADDRINUSE`) | Encerre a outra instância do SINSTOCK com Ctrl+C no terminal correspondente. |
| Tela sem estilos ou recursos | Execute `npm.cmd run build:frontend` e atualize a página com Ctrl+F5. |
| PowerShell bloqueia `npm.ps1` | Use `npm.cmd`, como nos exemplos deste manual. |

Este procedimento acessa o sistema no próprio computador. A configuração de acesso por outro computador ou celular exige ajustes adicionais de rede.
