/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `chamados_suporte` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `chamados_suporte` DROP FOREIGN KEY `fk_chamados_usuario`;

-- AlterTable
ALTER TABLE `chamados_suporte` ADD COLUMN `codigo` VARCHAR(50) NULL,
    ADD COLUMN `email_solicitante` VARCHAR(100) NULL,
    ADD COLUMN `prioridade` ENUM('BAIXA', 'MEDIA', 'ALTA', 'CRITICA') NULL DEFAULT 'MEDIA',
    MODIFY `usuario_id` INTEGER NULL,
    MODIFY `status` ENUM('ABERTO', 'EM_ANDAMENTO', 'RESOLVIDO', 'CANCELADO', 'FECHADO') NULL DEFAULT 'ABERTO';

-- AlterTable
ALTER TABLE `pedidos_venda` ADD COLUMN `reservado_ate` TIMESTAMP(0) NULL;

-- AlterTable
ALTER TABLE `saldos_estoque` ADD COLUMN `quantidade_reservada` DECIMAL(10, 3) NOT NULL DEFAULT 0.000;

-- CreateIndex
CREATE UNIQUE INDEX `uk_chamados_codigo` ON `chamados_suporte`(`codigo`);

-- AddForeignKey
ALTER TABLE `chamados_suporte` ADD CONSTRAINT `fk_chamados_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
