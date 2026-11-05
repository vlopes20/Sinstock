# Homologação funcional local

Data: 05/11/2026. Ambiente: Windows, Node.js 24, MySQL 8.4 e Edge.

## Evidências

- 30 casos de integração aprovados com banco MySQL temporário, migrações reais, HTTP, JWT e navegador.
- CRUD e recarregamento: produtos, fornecedores, categorias, filiais, clientes, usuários, configurações e FAQ.
- Concorrência: checkout, confirmação/cancelamento de reserva, recebimento/estorno de NF e liberação de reservas expiradas.
- Integridade: reservas protegidas, filial/lote corretos, custo médio, estornos, histórico imutável e ausência de estoque negativo.
- Relatórios comparados com saldos/vendas; arquivos PDF/XLSX/CSV conferidos, incluindo conteúdo numérico de XLSX e proteção de fórmulas em CSV.
- Autenticação: senha atual, revogação, desafio por e-mail, consumo único e rejeição de pré-autenticação nas rotas privadas. SMTP substituído durante estes testes.
- Dashboard atualizado por evento autenticado depois de uma movimentação realizada por outra requisição.
- Notificações idempotentes e leitura individual. Chamados/anexos restritos a autor ou administração.
- Câmera: vídeo EAN-13 simulado decodificado no Edge, produto conhecido preenchido e captura encerrada.
- GPS simulado, distância, exclusão de fornecedores sem coordenadas e busca alternativa por cidade/CEP.
- Quantidades fracionadas: mínimo de 0,3, somas de 0,1/0,2 e venda de 0,1 com arredondamento monetário igual no carrinho e no servidor.
- Nove migrações aplicadas ao banco local; Prisma não detectou diferença entre banco e schema.
- Seis casos de autenticação e 14 testes unitários de SMTP aprovados, somando 50 casos automatizados com os 30 de integração.
- Responsividade: 239 estados nas larguras 320, 390, 600, 768, 850, 1024, 1280 e 1440; nenhum erro JavaScript ou falha de layout.
- Verificação final do servidor local: 23 consultas autenticadas retornaram 200, com navegador sem erros. Evidências resumidas em [verificacao-local-final.json](verificacao-local-final.json), sem credenciais.
- Estrutura atual: 21 controllers, 109 operações HTTP, 24 modelos, 16 páginas HTML e 22 scripts próprios.

Comandos reproduzíveis:

    npm.cmd run build
    npm.cmd test -- --runInBand
    npm.cmd run test:auth
    npm.cmd run test:stock
    npm.cmd run check:frontend
    npm.cmd --prefix frontend run check:responsive
    npm.cmd run stock:check
    npm.cmd exec -- prisma migrate diff --from-config-datasource --to-schema backend/prisma/schema.prisma --exit-code

O teste de estoque cria/remove apenas um banco sinstock_test_* aleatório. Nenhuma movimentação de teste foi lançada no banco principal.

## Limites desta validação

O recebimento real de recuperação de senha via Gmail já havia sido confirmado pelo usuário antes desta integração. Os novos testes de segundo fator e suporte usam SMTP substituído, sem envio para contas reais.

Câmera e GPS foram testados por simulação de dispositivos no navegador. A qualidade da câmera física, iluminação, autorização de localização e geocodificação online dependem do dispositivo/provedor e precisam de conferência no uso real.

Os testes locais não certificam 99,5% de disponibilidade, resposta inferior a dois segundos sob carga nem 1.000 usuários simultâneos. Esses requisitos precisam de ambiente de implantação, monitoramento e ensaio de carga representativo.

O limite do Nominatim é controlado por processo; uma implantação com múltiplas instâncias deve utilizar um provedor apropriado ou coordenação compartilhada. As exportações síncronas têm limite explícito de 50.000 linhas.

## Estrutura atual

O inventário atual está em [estado-atual/inventario-api.md](estado-atual/inventario-api.md) e [estado-atual/inventario-frontend.md](estado-atual/inventario-frontend.md). A [matriz de telas](matriz-integracao-atual.md) conecta as ações visíveis aos contratos HTTP.
