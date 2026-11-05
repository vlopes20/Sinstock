# SINSTOCK

Sistema de estoque com frontend HTML/JavaScript, NestJS, Prisma e MySQL. O frontend é servido pela API em http://localhost:3000/frontend/; a documentação HTTP fica em http://localhost:3000/api.

## Execução local

Ambiente validado: Node.js 24 e MySQL 8.4. Instale as dependências na raiz e no frontend:

    npm.cmd ci
    npm.cmd ci --prefix frontend

Se ainda não existir .env, copie .env.example e configure DATABASE_URL, JWT_SECRET e SMTP. Preserve o .env já configurado nesta máquina.

    npm.cmd exec -- prisma generate
    npm.cmd exec -- prisma migrate deploy
    npm.cmd run auth:bootstrap
    npm.cmd run build:frontend
    npm.cmd run build
    npm.cmd run start:prod

O bootstrap cria somente o primeiro administrador local. Não altera usuários nem senhas existentes. As credenciais iniciais ficam no arquivo local ignorado .tmp/admin-local.json.

Durante o desenvolvimento:

    npm.cmd run start:dev
    npm.cmd run watch:frontend

As migrações incluem constraints de saldo e triggers de histórico imutável; utilize migrate deploy para instalar a estrutura completa.

## Funcionalidades conectadas

- Login, recuperação de senha, encerramento de sessões, segundo fator por e-mail ou aplicativo autenticador.
- Cadastro administrativo de usuários, perfis e permissões; empresa e preferências pessoais.
- Produtos, categorias, fornecedores, filiais e clientes.
- Entradas com documento e fornecedor, lotes, custo médio, ajustes, transferências, reservas e histórico.
- Checkout, confirmação/cancelamento de pedidos e acompanhamento de atendimento.
- Dashboard, alertas, busca global e notificações com leitura individual.
- Relatórios de vendas, ranking, estoque, validade e movimentações; exportação PDF, XLSX e CSV.
- Leitura de códigos pela câmera; fornecedores por GPS, cidade ou CEP.
- Chamados com mensagens, anexos protegidos e FAQ administrável.

O sistema exige comunicação com o servidor para gravar operações. O cadastro de usuários permanece restrito a administradores.

## Verificação

    npm.cmd run build
    npm.cmd test -- --runInBand
    npm.cmd run test:auth
    npm.cmd run test:stock
    npm.cmd run check:frontend
    npm.cmd --prefix frontend run check:responsive

test:stock usa um banco temporário sinstock_test_* com MySQL real, migrações e navegador. O banco é removido ao terminar. SMTP é substituído nos testes, sem envio real de mensagens. O usuário do banco precisa poder criar/remover esse banco temporário.

## Documentação

- [Requisitos do PDF e decisões confirmadas](docs/requisitos-documentacao.md)
- [Estado da implementação](docs/implementacao-status.md)
- [Contratos e regras implementadas](docs/contratos-integracao.md)
- [Matriz atual de telas e APIs](docs/matriz-integracao-atual.md)
- [Validação e limites da homologação](docs/homologacao-integracao.md)
- [SMTP com Gmail](docs/smtp.md)
- [MySQL local no Windows](docs/mysql-local.md)
- [Frontend e compilação de estilos](frontend/README.md)

Os inventários e a análise de 04/11/2026 documentam o diagnóstico anterior à integração. A documentação atual acima identifica as entregas posteriores.
