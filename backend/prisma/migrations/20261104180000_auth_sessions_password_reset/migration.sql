ALTER TABLE `usuarios` ADD COLUMN `auth_version` INTEGER NOT NULL DEFAULT 0;

CREATE TABLE `password_reset_tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `tokenHash` VARCHAR(64) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    UNIQUE INDEX `password_reset_tokens_tokenHash_key` (`tokenHash`),
    INDEX `password_reset_tokens_userId_idx` (`userId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `password_reset_tokens_userId_fkey` FOREIGN KEY (`userId`)
      REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
