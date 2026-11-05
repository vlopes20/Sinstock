-- CreateTable
CREATE TABLE `categorias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` TEXT NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `nome`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fornecedores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_juridico` VARCHAR(150) NOT NULL,
    `cnpj` VARCHAR(20) NOT NULL,
    `telefone` VARCHAR(20) NULL,
    `email` VARCHAR(100) NULL,
    `cep` VARCHAR(10) NULL,
    `cidade` VARCHAR(100) NULL,
    `estado` CHAR(2) NULL,
    `endereco` VARCHAR(255) NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `cnpj`(`cnpj`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produtos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoria_id` INTEGER NOT NULL,
    `nome` VARCHAR(150) NOT NULL,
    `marca` VARCHAR(100) NULL,
    `codigo_barras` VARCHAR(100) NULL,
    `estoque_minimo` DECIMAL(10, 3) NULL DEFAULT 0.000,
    `preco_venda` DECIMAL(10, 2) NOT NULL,
    `custo_medio` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `codigo_barras`(`codigo_barras`),
    INDEX `fk_produtos_categoria`(`categoria_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chamados_suporte` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `assunto` VARCHAR(150) NOT NULL,
    `descricao` TEXT NOT NULL,
    `status` ENUM('ABERTO', 'EM_ANDAMENTO', 'RESOLVIDO', 'FECHADO') NULL DEFAULT 'ABERTO',
    `data_abertura` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `data_fechamento` TIMESTAMP(0) NULL,

    INDEX `fk_chamados_usuario`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clientes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(150) NOT NULL,
    `cpf_cnpj` VARCHAR(20) NULL,
    `telefone` VARCHAR(20) NULL,
    `email` VARCHAR(100) NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faq` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pergunta` VARCHAR(255) NOT NULL,
    `resposta` TEXT NOT NULL,
    `ordem` INTEGER NULL DEFAULT 0,
    `ativo` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `filiais` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `endereco` VARCHAR(255) NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_entrada` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nota_fiscal_id` INTEGER NOT NULL,
    `produto_id` INTEGER NOT NULL,
    `lote_id` INTEGER NULL,
    `quantidade` DECIMAL(10, 3) NOT NULL,
    `custo_unitario` DECIMAL(10, 2) NOT NULL,

    INDEX `fk_itens_entrada_lote`(`lote_id`),
    INDEX `fk_itens_entrada_nf`(`nota_fiscal_id`),
    INDEX `fk_itens_entrada_produto`(`produto_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_venda` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pedido_id` INTEGER NOT NULL,
    `produto_id` INTEGER NOT NULL,
    `lote_id` INTEGER NULL,
    `quantidade` DECIMAL(10, 3) NOT NULL,
    `preco_unitario` DECIMAL(10, 2) NOT NULL,

    INDEX `fk_itens_venda_lote`(`lote_id`),
    INDEX `fk_itens_venda_pedido`(`pedido_id`),
    INDEX `fk_itens_venda_produto`(`produto_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logs_movimentacoes` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `produto_id` INTEGER NOT NULL,
    `filial_id` INTEGER NOT NULL,
    `lote_id` INTEGER NULL,
    `usuario_id` INTEGER NOT NULL,
    `tipo_movimentacao` ENUM('ENTRADA', 'SAIDA', 'TRANSFERENCIA', 'AJUSTE') NOT NULL,
    `quantidade` DECIMAL(10, 3) NOT NULL,
    `saldo_anterior` DECIMAL(10, 3) NOT NULL,
    `saldo_atual` DECIMAL(10, 3) NOT NULL,
    `origem_id` INTEGER NULL,
    `data_hora` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_logs_filial`(`filial_id`),
    INDEX `fk_logs_lote`(`lote_id`),
    INDEX `fk_logs_produto`(`produto_id`),
    INDEX `fk_logs_usuario`(`usuario_id`),
    INDEX `idx_logs_data`(`data_hora`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lotes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `produto_id` INTEGER NOT NULL,
    `numero_lote` VARCHAR(50) NOT NULL,
    `data_fabricacao` DATE NULL,
    `data_validade` DATE NOT NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uk_lotes_produto_numero`(`produto_id`, `numero_lote`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notas_fiscais_entrada` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fornecedor_id` INTEGER NOT NULL,
    `usuario_id` INTEGER NOT NULL,
    `numero_nf` VARCHAR(50) NOT NULL,
    `data_emissao` DATE NOT NULL,
    `data_recebimento` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `total` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PENDENTE', 'RECEBIDA', 'CANCELADA') NULL DEFAULT 'RECEBIDA',

    INDEX `fk_nf_fornecedor`(`fornecedor_id`),
    INDEX `fk_nf_usuario`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedidos_venda` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `cliente_id` INTEGER NULL,
    `filial_id` INTEGER NOT NULL,
    `data_venda` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `total` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('ORCAMENTO', 'CONCLUIDO', 'CANCELADO') NULL DEFAULT 'CONCLUIDO',

    INDEX `fk_pedidos_cliente`(`cliente_id`),
    INDEX `fk_pedidos_filial`(`filial_id`),
    INDEX `fk_pedidos_usuario`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `perfis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(50) NOT NULL,
    `permissoes` JSON NOT NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `nome`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `saldos_estoque` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `filial_id` INTEGER NOT NULL,
    `produto_id` INTEGER NOT NULL,
    `lote_id` INTEGER NULL,
    `quantidade` DECIMAL(10, 3) NOT NULL DEFAULT 0.000,
    `atualizado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_saldos_lote`(`lote_id`),
    INDEX `fk_saldos_produto`(`produto_id`),
    UNIQUE INDEX `uk_saldos_filial_produto_lote`(`filial_id`, `produto_id`, `lote_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `perfil_id` INTEGER NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `telefone` VARCHAR(20) NULL,
    `senha_hash` VARCHAR(255) NOT NULL,
    `token_2fa` VARCHAR(100) NULL,
    `token_expiracao` DATETIME(0) NULL,
    `ativo` BOOLEAN NULL DEFAULT true,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email`(`email`),
    INDEX `fk_usuarios_perfil`(`perfil_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `produtos` ADD CONSTRAINT `fk_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chamados_suporte` ADD CONSTRAINT `fk_chamados_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `itens_entrada` ADD CONSTRAINT `fk_itens_entrada_lote` FOREIGN KEY (`lote_id`) REFERENCES `lotes`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `itens_entrada` ADD CONSTRAINT `fk_itens_entrada_nf` FOREIGN KEY (`nota_fiscal_id`) REFERENCES `notas_fiscais_entrada`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `itens_entrada` ADD CONSTRAINT `fk_itens_entrada_produto` FOREIGN KEY (`produto_id`) REFERENCES `produtos`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `itens_venda` ADD CONSTRAINT `fk_itens_venda_lote` FOREIGN KEY (`lote_id`) REFERENCES `lotes`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `itens_venda` ADD CONSTRAINT `fk_itens_venda_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos_venda`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `itens_venda` ADD CONSTRAINT `fk_itens_venda_produto` FOREIGN KEY (`produto_id`) REFERENCES `produtos`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `logs_movimentacoes` ADD CONSTRAINT `fk_logs_filial` FOREIGN KEY (`filial_id`) REFERENCES `filiais`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `logs_movimentacoes` ADD CONSTRAINT `fk_logs_lote` FOREIGN KEY (`lote_id`) REFERENCES `lotes`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `logs_movimentacoes` ADD CONSTRAINT `fk_logs_produto` FOREIGN KEY (`produto_id`) REFERENCES `produtos`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `logs_movimentacoes` ADD CONSTRAINT `fk_logs_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `lotes` ADD CONSTRAINT `fk_lotes_produto` FOREIGN KEY (`produto_id`) REFERENCES `produtos`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `notas_fiscais_entrada` ADD CONSTRAINT `fk_nf_fornecedor` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedores`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `notas_fiscais_entrada` ADD CONSTRAINT `fk_nf_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pedidos_venda` ADD CONSTRAINT `fk_pedidos_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pedidos_venda` ADD CONSTRAINT `fk_pedidos_filial` FOREIGN KEY (`filial_id`) REFERENCES `filiais`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pedidos_venda` ADD CONSTRAINT `fk_pedidos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `saldos_estoque` ADD CONSTRAINT `fk_saldos_filial` FOREIGN KEY (`filial_id`) REFERENCES `filiais`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `saldos_estoque` ADD CONSTRAINT `fk_saldos_lote` FOREIGN KEY (`lote_id`) REFERENCES `lotes`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `saldos_estoque` ADD CONSTRAINT `fk_saldos_produto` FOREIGN KEY (`produto_id`) REFERENCES `produtos`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `fk_usuarios_perfil` FOREIGN KEY (`perfil_id`) REFERENCES `perfis`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;
