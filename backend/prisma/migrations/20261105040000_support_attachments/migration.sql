CREATE TABLE anexos_chamado (
  id VARCHAR(36) NOT NULL, chamado_id INTEGER NOT NULL, usuario_id INTEGER NOT NULL,
  nome VARCHAR(255) NOT NULL, mime VARCHAR(100) NOT NULL, tamanho INTEGER NOT NULL,
  conteudo LONGBLOB NOT NULL, criado_em DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id), INDEX anexos_chamado_chamado_id_idx (chamado_id),
  CONSTRAINT anexos_chamado_chamado_id_fkey FOREIGN KEY (chamado_id) REFERENCES chamados_suporte(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT anexos_chamado_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE mensagens_chamado ADD CONSTRAINT mensagens_chamado_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE;
INSERT INTO faq (pergunta, resposta, ordem, ativo)
SELECT 'Como registrar uma entrada de estoque?', 'Na tela Estoque, selecione a filial e abra Nova movimentação. Informe o produto, fornecedor, documento de origem, quantidade e custo. Para controlar validade, informe um lote e sua data de validade.', 1, true
WHERE NOT EXISTS (SELECT 1 FROM faq WHERE pergunta = 'Como registrar uma entrada de estoque?');
INSERT INTO faq (pergunta, resposta, ordem, ativo)
SELECT 'Por que não consigo retirar uma quantidade reservada?', 'O saldo disponível é a quantidade física menos as reservas. Confirme ou cancele o pedido que mantém a reserva antes de utilizar essa quantidade em outra operação.', 2, true
WHERE NOT EXISTS (SELECT 1 FROM faq WHERE pergunta = 'Por que não consigo retirar uma quantidade reservada?');
INSERT INTO faq (pergunta, resposta, ordem, ativo)
SELECT 'Como recuperar minha senha?', 'Na tela de login, use Esqueci minha senha. Abra o link enviado por e-mail e escolha uma nova senha. O link expira e só pode ser usado uma vez.', 3, true
WHERE NOT EXISTS (SELECT 1 FROM faq WHERE pergunta = 'Como recuperar minha senha?');
