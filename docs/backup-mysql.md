# Backup e teste de restauração do MySQL

Na raiz do repositório, com o MySQL ativo e o `DATABASE_URL` configurado no
`.env`, execute:

```powershell
npm.cmd run db:backup
npm.cmd run db:backup:verify -- ".tmp/mysql-backups/<diretório mostrado pelo backup>"
```

O primeiro comando cria um dump consistente das tabelas InnoDB, incluindo
schema, dados, gatilhos e rotinas. Os jobs agendados do Sinstock rodam na
aplicação. O segundo comando confere o SHA-256 do arquivo, importa a cópia em
um banco temporário, compara o conteúdo restaurado com o original e remove
o banco temporário. Use somente cópias geradas pelo próprio Sinstock e uma
conta MySQL com acesso para criar e remover o banco de teste.

Cada cópia tem seu próprio diretório com `sinstock.sql` e `manifest.json`.
O padrão é `.tmp/mysql-backups`, ignorado pelo Git. Configure
`SINSTOCK_BACKUP_DIR` no `.env` para apontar para armazenamento privado
separado, com permissão de escrita para a conta da tarefa. Guarde os dois
arquivos juntos. Eles contêm dados do sistema e devem ficar em local com
acesso restrito. A rotina mantém as cópias existentes.

Use os clientes MySQL da mesma versão do servidor. No Windows, defina
`MYSQL_CLIENT_DIR` se `mysql.exe` e `mysqldump.exe` estiverem fora do PATH
e dos diretórios padrão. Faça backups fora da janela de migrações de schema.

## Agendamento no Windows

O script registra a tarefa **Sinstock MySQL Backup** para rodar diariamente às
02:00, no horário local do Windows. O modo padrão usa a conta Windows atual
sem gravar sua senha. Execute no PowerShell da conta que terá acesso à pasta
do projeto, ao `.env` e ao destino privado dos backups.

```powershell
.\backend\scripts\register-mysql-backup.ps1
Start-ScheduledTask -TaskName "Sinstock MySQL Backup"
Get-ScheduledTaskInfo -TaskName "Sinstock MySQL Backup"
```

Use `-Time 03:30` para escolher outro horário. A opção `-OnlyWhenLoggedOn`
registra a tarefa para executar enquanto a conta estiver conectada. Confira
o novo diretório de backup e o campo `LastTaskResult` após a execução.
Resultado 0 indica sucesso.

## Lançamentos e autenticação após restaurar

Use uma cópia recente para recuperar, além dos dados do estoque, as
identificações de solicitações já processadas e os códigos do autenticador
já consumidos até o momento daquela cópia. Antes de retornar ao uso, confira
os lançamentos ocorridos entre o backup e a interrupção.
