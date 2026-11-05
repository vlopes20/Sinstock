-- CreateTable
CREATE TABLE `logs_auditoria_estoque` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NULL,
    `acao` VARCHAR(191) NOT NULL,
    `recurso` VARCHAR(191) NOT NULL,
    `recursoId` VARCHAR(191) NULL,
    `dadosAnteriores` JSON NULL,
    `dadosNovos` JSON NULL,
    `ip` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `logs_auditoria_estoque_usuarioId_idx`(`usuarioId`),
    INDEX `logs_auditoria_estoque_recurso_recursoId_idx`(`recurso`, `recursoId`),
    INDEX `logs_auditoria_estoque_criadoEm_idx`(`criadoEm`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `mensagem` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `lida` BOOLEAN NOT NULL DEFAULT false,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
