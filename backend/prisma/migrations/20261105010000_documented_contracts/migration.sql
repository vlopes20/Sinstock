ALTER TABLE `produtos`
  ADD COLUMN `descricao` TEXT NULL,
  ADD COLUMN `sku` VARCHAR(100) NULL,
  ADD COLUMN `unidade` VARCHAR(20) NOT NULL DEFAULT 'UN',
  ADD COLUMN `ativo` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `observacao` TEXT NULL,
  ADD COLUMN `fornecedor_id` INTEGER NULL,
  ADD UNIQUE INDEX `produtos_sku_key` (`sku`),
  ADD CONSTRAINT `produtos_fornecedor_id_fkey` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedores` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `fornecedores`
  ADD COLUMN `nome_fantasia` VARCHAR(150) NULL,
  ADD COLUMN `inscricao_estadual` VARCHAR(30) NULL,
  ADD COLUMN `contato` VARCHAR(100) NULL,
  ADD COLUMN `categoria` VARCHAR(100) NULL,
  ADD COLUMN `prazo_entrega` INTEGER NULL DEFAULT 0,
  ADD COLUMN `condicao_pagamento` VARCHAR(100) NULL,
  ADD COLUMN `ativo` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `observacoes` TEXT NULL;

ALTER TABLE `notas_fiscais_entrada` ADD COLUMN `filial_id` INTEGER NULL,
  ADD CONSTRAINT `notas_fiscais_entrada_filial_id_fkey` FOREIGN KEY (`filial_id`) REFERENCES `filiais` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `logs_movimentacoes` ADD COLUMN `observacao` TEXT NULL, ADD COLUMN `referencia` VARCHAR(100) NULL;
ALTER TABLE `pedidos_venda` ADD COLUMN `pagamento` VARCHAR(50) NULL,
  ADD COLUMN `desconto` DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN `observacao` TEXT NULL,
  ADD COLUMN `atendimento` VARCHAR(30) NOT NULL DEFAULT 'PENDENTE';
ALTER TABLE `usuarios` ADD COLUMN `two_factor_method` VARCHAR(10) NOT NULL DEFAULT 'TOTP',
  ADD COLUMN `ultimo_acesso` TIMESTAMP(0) NULL,
  ADD COLUMN `preferencias` JSON NULL;
ALTER TABLE `chamados_suporte` ADD COLUMN `categoria` VARCHAR(100) NULL, ADD COLUMN `pagina` VARCHAR(100) NULL;

CREATE TABLE `email_login_challenges` (
  `id` VARCHAR(36) NOT NULL, `userId` INTEGER NOT NULL,
  `codeHash` VARCHAR(64) NOT NULL, `expiresAt` DATETIME(3) NOT NULL,
  `usedAt` DATETIME(3) NULL, `attempts` INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`), INDEX `email_login_challenges_userId_expiresAt_idx` (`userId`, `expiresAt`),
  CONSTRAINT `email_login_challenges_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE `configuracoes` (`chave` VARCHAR(50) NOT NULL, `valor` JSON NOT NULL, `atualizado` DATETIME(3) NOT NULL, PRIMARY KEY (`chave`)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE `mensagens_chamado` (
  `id` INTEGER NOT NULL AUTO_INCREMENT, `chamado_id` INTEGER NOT NULL, `usuario_id` INTEGER NOT NULL,
  `mensagem` TEXT NOT NULL, `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`), INDEX `mensagens_chamado_chamado_id_criado_em_idx` (`chamado_id`, `criado_em`),
  CONSTRAINT `mensagens_chamado_chamado_id_fkey` FOREIGN KEY (`chamado_id`) REFERENCES `chamados_suporte` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `saldos_estoque` ADD CONSTRAINT `saldos_nao_negativos` CHECK (`quantidade` >= 0 AND `quantidade_reservada` >= 0 AND `quantidade_reservada` <= `quantidade`);
CREATE TRIGGER `logs_movimentacoes_sem_exclusao` BEFORE DELETE ON `logs_movimentacoes` FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Historico de movimentacoes e imutavel';
CREATE TRIGGER `logs_movimentacoes_sem_edicao` BEFORE UPDATE ON `logs_movimentacoes` FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Historico de movimentacoes e imutavel';
CREATE TRIGGER `auditoria_sem_exclusao` BEFORE DELETE ON `logs_auditoria_estoque` FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Historico de auditoria e imutavel';
CREATE TRIGGER `auditoria_sem_edicao` BEFORE UPDATE ON `logs_auditoria_estoque` FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Historico de auditoria e imutavel';
