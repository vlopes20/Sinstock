# Autenticacao, autorizacao e sessoes - rodada defensiva

Branch qa/testes-busca-global, base 4c3eddc. Sem contas reais, MySQL, rede de aplicacao, SMTP, schema ou migrations. Todos os usuarios, chaves e sementes usados nos testes sao fixtures publicas sem uso real.

## Resultado real

Preservados os 67 testes anteriores. Adicionados 25 testes em quatro arquivos: session-security.spec.ts (13), totp-replay.spec.ts (5), dashboard-session.spec.ts (5), frontend-session.spec.ts (2).

Execucao final: 92 aprovados em 11 suites, zero falhas/bloqueados (6,263 s). TypeScript e git diff --check aprovados. ESLint sem cache nos 15 arquivos TypeScript locais: tres erros preexistentes em stock.service.ts:171/172/173, zero avisos, nenhum erro novo.

IMPORTANTE: testes de caracterizacao TOTP aprovados confirmam uma vulnerabilidade pendente, nao sua correcao. Nao foram enfraquecidas as expectativas dos testes defensivos. Os dois testes de reutilizacao estao nomeados como known defect e devem ser convertidos em expectativas de rejeicao apos a implementacao persistente.

## 1. Reutilizacao TOTP - confirmada, nao corrigida

Evidencia: two-factor.service.ts, verifyTwoFactorCode usa speakeasy.totp.verify com window=1, sem consumo de passo. AuthService.authenticateTwoFactor valida e emite acesso sem persistir o passo aceito.

Com relogio congelado: mesmo codigo e aceito duas vezes; aceita passo anterior dentro da tolerancia; rejeita depois de 90 segundos. Teste adicional instancia AuthService com Prisma/JWT/usuario simulados: mesmo codigo provoca duas chamadas de emissao e duas atualizacoes simuladas de ultimo acesso. Nao e teste HTTP nem prova de tokens distintos em producao.

Gravidade: media, requer codigo e pre-autenticacao valida. Nao foi realizado ataque, brute force ou consulta de conta real.

### Proposta persistente (nao implementada)

- Registrar por usuario e versao do autenticador o ultimo contador temporal aceito, ou criar tabela de consumo com chave unica (usuario, versao_do_segredo, passo).
- Usar verifyDelta para identificar o passo efetivamente validado dentro da janela, nao apenas Date.now()/30.
- Transacao deve bloquear/reler usuario ativo, auth_version, metodo e segredo antes de consumir o passo. Rejeitar passo ja consumido/menor ou igual ao ultimo, conforme politica aprovada.
- Consumo atomico deve anteceder a emissao. Falha de assinatura/entrega apos consumo exige politica explicita; nao desfazer consumo depois de token possivelmente entregue.
- Rotation/reset do segredo precisa de identificador de versao e politica de limpeza. Nenhum segredo ou codigo deve ser armazenado em texto.
- Definir se consumo e global entre login/ativacao/desativacao ou separado por finalidade. Definir tambem consumo unico do desafio de pre-autenticacao; nao equivale a consumir o TOTP.
- Nao usar Set/cache local: nao protege multiplas instancias/reinicio.

Testes necessarios para futura solucao: primeira utilizacao aceita; segunda rejeitada no mesmo passo e no passo tolerado anterior; duas instancias concorrentes apenas uma emite; reinicio nao perde consumo; codigo de outro usuario nao compartilha estado; rotacao do segredo invalida desafios antigos; conta desativada/auth_version alterada durante consumo rejeita; expiracao e rollback/commit testados em banco isolado autorizado. Mocks de repositorio podem provar contratos, mas nao atomicidade MySQL.

## 2. Stream SSE mantinha permissao revogada - corrigido

Evidencia: DashboardService.streamForUser revalidava ativo/auth_version/expiracao a cada evento, mas nao permissoes. Teste em of(event,event), usuario permite primeiro evento e nega segundo sem mudar auth_version: antes entregava dois em vez de um.

Correcao: ler perfil_id e perfis.permissoes e aplicar canAccess(user, dashboard, ler) antes de entregar cada evento. Mantida politica administrativa/fallback existente. Cinco testes aprovados: acesso permitido, usuario desativado, versao revogada, expiracao e permissao removida.

Limite: encerramento ocorre quando chega evento e revalidacao e feita; nao ha timer de desconexao imediata de stream ocioso. Uma mudanca apos a leitura e antes do envio ainda e uma janela inerente a verificacao por evento. Nao foi criado escopo por filial ou revisada a politica de dados agregados.

## 3. JWT e pre-autenticacao

Testes de estrategias reais com repositorio ficticio confirmam: pre-auth rejeitada na estrategia completa; token completo rejeitado na pre-auth; sujeitos nao inteiros rejeitados; inativo/versao divergente rejeitados em ambas; MFA desativado invalida pre-auth; usuario ausente e rejeitado; falha de infraestrutura e propagada; permissoes e perfil atuais substituem dados antigos do payload; challengeId/metodo preservados.

Teste com JwtService real e relogio congelado confirma rejeicao de assinatura de fixture na fronteira de expiracao. As estrategias configuram ignoreExpiration=false. Chamadas diretas a validate nao testam a integracao Passport HTTP nem validam assinatura/expiracao por si. Nao foi feito teste de endpoint real.

UsersService altera auth_version ao modificar perfil/status/senha e ao revogar sessoes; estrategias consultam dados atuais. Testes desta rodada simulam o estado resultante, nao a escrita real de UsersService.

## 4. Frontend

Preservados seis testes HTTP 401 JSON/HTML/texto/vazio e excecoes de auth false/token explicito. Dois novos testes executam session.js em VM com armazenamento e eventos simulados: unauthorized limpa acesso/pre-auth/metodo e dados legados e redireciona com reason=expired; logout offline limpa estado local mesmo com falha da API.

Limite: logout offline nao garante revogacao no servidor. Timeout de inatividade de 15 minutos permanece politica local e nao foi alterado nem certificado em navegador real. Nao foram modificados arquivos frontend nesta rodada.

## Isolamento e compilacao

Novos testes usam clocks falsos com restauracao, usuarios ficticios, clientes simulados e RxJS local. ConfigService e dependencias de servicos sao mockados: importacao ESM de pacotes atuais @nestjs/config/@nestjs/schedule era incompativel com Jest CommonJS ao carregar essas dependencias. Isolamento foi ajustado sem mudar Jest/dependencias/regras; isso nao certifica compatibilidade desses pacotes em producao. Prisma nao e instanciado nem AppModule carregado.

## Arquivos desta rodada

Modificado: backend/src/dashboards/dashboard.service.ts.
Criados: backend/src/auth/session-security.spec.ts, backend/src/auth/totp-replay.spec.ts, backend/src/auth/frontend-session.spec.ts, backend/src/dashboards/dashboard-session.spec.ts e este relatorio.
Atualizado: docs/qa/relatorio-busca-global.md.

## Proximos passos

Aprovar armazenamento atomico TOTP e suas regras de consumo; implementar somente apos autorizacao estrutural. Revisar diff SSE e rodar validacao HTTP/navegador em ambiente isolado quando autorizado. Nenhum commit/push/merge feito; develop preservada.
