ALTER TABLE `usuarios` ADD COLUMN `ultimo_passo_totp` INTEGER NULL;

CREATE TABLE `requisicoes_estoque` (
    `usuario_id` INTEGER NOT NULL,
    `operacao` VARCHAR(64) NOT NULL,
    `request_id` CHAR(36) NOT NULL,
    `hash` CHAR(64) NOT NULL,
    `resposta` JSON NULL,
    PRIMARY KEY (`usuario_id`, `operacao`, `request_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
