ALTER TABLE notificacoes ADD COLUMN chave VARCHAR(100) NULL, ADD UNIQUE INDEX notificacoes_chave_key (chave);
CREATE TABLE leituras_notificacoes (
  notificacao_id INTEGER NOT NULL, usuario_id INTEGER NOT NULL,
  lida_em DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (notificacao_id, usuario_id), INDEX leituras_notificacoes_usuario_id_idx (usuario_id),
  CONSTRAINT leituras_notificacoes_notificacao_id_fkey FOREIGN KEY (notificacao_id) REFERENCES notificacoes(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT leituras_notificacoes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
