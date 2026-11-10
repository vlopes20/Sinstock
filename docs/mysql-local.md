# MySQL local no Windows

Esta máquina usa MySQL Server 8.4, instalado em
`C:\Program Files\MySQL\MySQL Server 8.4`.

- Serviço: `SinstockMySQL84`, com inicialização automática no Windows.
- Conexão: `localhost:3306`, acessível apenas nesta máquina.
- Banco: `sinstock`, com as migrações do Prisma aplicadas.
- Configuração: `C:\ProgramData\Sinstock\MySQL84\my.ini`.
- Dados: `C:\ProgramData\Sinstock\MySQL84\Data`.
- Log: `C:\ProgramData\Sinstock\MySQL84\mysql-error.log`.

As credenciais do banco estão no `.env`. O primeiro administrador da aplicação
tem credenciais separadas em `.tmp/admin-local.json`, ignorado pelo Git.
Não execute o seed antigo para iniciar o login: ele pode sobrescrever senhas.

Para consultar o serviço no PowerShell:

```powershell
Get-Service SinstockMySQL84
```

Se estiver parado, execute em um PowerShell como administrador:

```powershell
Start-Service SinstockMySQL84
```

O backend é iniciado separadamente, na raiz do repositório:

```powershell
npm.cmd run start:dev
```

Abra http://localhost:3000/frontend/ e use as credenciais do administrador local.
Para recuperação de senha por e-mail, a conta cadastrada no Sinstock deve ter um
endereço de e-mail válido. A conta remetente configurada em SMTP_USER não é
automaticamente cadastrada como usuário do sistema.

Em alterações futuras de schema, aplique as migrações com
`npm.cmd exec -- prisma migrate deploy`. Não reinicialize o diretório de dados.
