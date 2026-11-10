# SMTP do Gmail no Sinstock

O SMTP envia o link de recuperação de senha. Login e autenticação em duas etapas
por aplicativo não dependem do envio de e-mails.

1. Ative a verificação em duas etapas da conta Google que enviará os e-mails.
2. Acesse https://myaccount.google.com/apppasswords e crie uma senha de app com
   o nome Sinstock. Se a opção estiver indisponível em uma conta Workspace,
   confira a política da organização com seu administrador.
3. No `.env` da raiz, preencha o bloco abaixo usando sua conta e sua senha de
   app de 16 caracteres, sem os espaços usados pelo Google na exibição.
   Preserve as configurações existentes de banco de dados e JWT.

```dotenv
SMTP_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=seuemail@gmail.com
SMTP_PASS=cole_a_senha_de_app_aqui
SMTP_FROM="Sinstock ERP <seuemail@gmail.com>"
FRONTEND_URL=http://localhost:3000/frontend/
```

Use o mesmo endereço em SMTP_USER e SMTP_FROM. A senha normal da conta Google
não serve para este fluxo. Não compartilhe a senha de app nem versione o `.env`.
Se o projeto ainda não tiver `.env`, copie `.env.example` e configure também
DATABASE_URL e uma JWT_SECRET aleatória antes de iniciar o backend.

Na raiz do projeto, teste a conexão e a autenticação, sem enviar mensagens:

```powershell
npm.cmd run smtp:verify
```

O teste usa exatamente as mesmas opções SMTP do backend. Sucesso confirma
conexão e autenticação; a entrega ainda depende do remetente e do destinatário.
Na porta 465 a conexão usa TLS desde o início. Se usar 587, configure
SMTP_SECURE=false; o projeto exige STARTTLS nessa modalidade.

Reinicie o backend após editar `.env`:

```powershell
npm.cmd run start:dev
```

Acesse http://localhost:3000/frontend/ e use **Esqueci minha senha** com o e-mail
de uma conta ativa cadastrada no Sinstock. Confira a caixa de entrada e o spam,
abra o link e escolha a nova senha. O link expira em 15 minutos e só pode ser
usado uma vez. Depois teste o login com a nova senha.

O e-mail destinatário é o da conta cadastrada; SMTP_USER é a conta remetente.
Contas inexistentes recebem a mesma resposta para não expor o cadastro.
Falhas no envio são registradas no backend e o token criado é removido.

Se houver erro de autenticação, confira a senha de app e a conta em SMTP_USER.
Se a senha da conta Google for alterada, gere outra senha de app. Em caso de
timeout, confira o acesso à porta 465 na sua rede.

Referências: [senhas de app do Google](https://support.google.com/accounts/answer/185833?hl=pt-BR),
[SMTP do Gmail](https://developers.google.com/workspace/gmail/imap/imap-smtp) e
[configuração SMTP do Nodemailer](https://nodemailer.com/smtp).
