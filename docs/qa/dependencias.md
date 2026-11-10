# Dependencias - analise inicial

Origem: npm audit --json --ignore-scripts. Nenhuma atualizacao aplicada.

A contagem agrega pacotes afetados; nao equivale a 39 falhas exploraveis no SINSTOCK.

| Pacote | Gravidade | Caminho de producao | Proposta npm |
|---|---|---|---|
| @jest/core | moderate | nao (desenvolvimento) | 29.7.0; mudanca major/downgrade: revisar |
| @jest/reporters | moderate | nao (desenvolvimento) | 29.7.0; mudanca major/downgrade: revisar |
| @nestjs/cli | moderate | nao (desenvolvimento) | 12.0.12; mudanca major/downgrade: revisar |
| @nestjs/platform-express | high | sim | disponivel; validar lockfile e regressao |
| @nestjs/swagger | moderate | sim | disponivel; validar lockfile e regressao |
| @prisma/adapter-mariadb | moderate | sim | disponivel; validar lockfile e regressao |
| @prisma/config | high | sim | disponivel; validar lockfile e regressao |
| @typescript-eslint/eslint-plugin | moderate | nao (desenvolvimento) | disponivel; validar lockfile e regressao |
| @typescript-eslint/parser | moderate | nao (desenvolvimento) | disponivel; validar lockfile e regressao |
| @typescript-eslint/type-utils | moderate | nao (desenvolvimento) | disponivel; validar lockfile e regressao |
| @typescript-eslint/typescript-estree | moderate | nao (desenvolvimento) | disponivel; validar lockfile e regressao |
| @typescript-eslint/utils | moderate | nao (desenvolvimento) | disponivel; validar lockfile e regressao |
| body-parser | high | sim | disponivel; validar lockfile e regressao |
| brace-expansion | high | sim | disponivel; validar lockfile e regressao |
| deepmerge | low | nao (desenvolvimento) | 12.0.12; mudanca major/downgrade: revisar |
| deepmerge-ts | high | sim | disponivel; validar lockfile e regressao |
| exceljs | moderate | sim | 3.4.0; mudanca major/downgrade: revisar |
| fast-uri | high | sim | disponivel; validar lockfile e regressao |
| follow-redirects | high | sim | disponivel; validar lockfile e regressao |
| fork-ts-checker-webpack-plugin | low | nao (desenvolvimento) | 12.0.12; mudanca major/downgrade: revisar |
| glob | moderate | nao (desenvolvimento) | 12.0.12; mudanca major/downgrade: revisar |
| handlebars | critical | nao (desenvolvimento) | disponivel; validar lockfile e regressao |
| jest | moderate | nao (desenvolvimento) | 29.7.0; mudanca major/downgrade: revisar |
| jest-circus | moderate | nao (desenvolvimento) | disponivel; validar lockfile e regressao |
| jest-cli | moderate | nao (desenvolvimento) | disponivel; validar lockfile e regressao |
| jest-config | moderate | nao (desenvolvimento) | disponivel; validar lockfile e regressao |
| jest-runner | moderate | nao (desenvolvimento) | disponivel; validar lockfile e regressao |
| jest-runtime | moderate | nao (desenvolvimento) | disponivel; validar lockfile e regressao |
| js-yaml | high | sim | disponivel; validar lockfile e regressao |
| mariadb | high | sim | disponivel; validar lockfile e regressao |
| minimatch | moderate | nao (desenvolvimento) | 12.0.12; mudanca major/downgrade: revisar |
| multer | high | sim | disponivel; validar lockfile e regressao |
| mysql2 | high | sim | disponivel; validar lockfile e regressao |
| nodemailer | moderate | sim | disponivel; validar lockfile e regressao |
| prisma | high | sim | disponivel; validar lockfile e regressao |
| proxy-addr | critical | sim | disponivel; validar lockfile e regressao |
| qs | moderate | sim | disponivel; validar lockfile e regressao |
| typescript-eslint | moderate | nao (desenvolvimento) | disponivel; validar lockfile e regressao |
| uuid | moderate | sim | 3.4.0; mudanca major/downgrade: revisar |

## Aplicabilidade e prioridades

- Priorizar parser HTTP/multipart (body-parser, multer) nas rotas de upload e dependencias Express. Avaliar limites existentes; nao foi executado payload de exploracao.
- proxy-addr depende de configuracao de proxy confiavel para o cenario de spoofing; nao assumir explorabilidade apenas pela gravidade.
- Conectores MariaDB/MySQL exigem revisao de TLS, charset, modo SQL e tipos de parametros antes de concluir aplicabilidade de cada advisory.
- nodemailer: revisar origem de destinatarios e uso do parser. Nenhum e-mail foi enviado.
- Jest, ESLint e CLI: separar risco da ferramenta de desenvolvimento do caminho HTTP de producao. Alguns pacotes de ferramentas estao declarados em dependencies e podem ser instalados em producao.
- Propostas npm marcadas como major podem incluir downgrade (Jest/ExcelJS). Nao aplicar automaticamente.
- fixAvailable=true nao prova compatibilidade funcional. Preparar atualizacoes pequenas em branch separada, com autorizacao e regressao.

Detalhes e URLs dos advisories: dependencias-audit.json. Nao executado npm audit fix ou instalacao adicional.
