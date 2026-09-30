import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import * as mysql from 'mysql2/promise';

async function main() {
  console.log('Iniciando a execução do seed no banco de dados...');

  const connection = await mysql.createConnection(process.env.DATABASE_URL!);

  try {
    // 1. Perfis (Admin e Operador)
    const permissoesAdmin = JSON.stringify({ admin: true, todas: true });
    const permissoesOperador = JSON.stringify({ operacoes: true });

    await connection.execute(
      `INSERT INTO perfis (id, nome, permissoes) 
       VALUES (1, 'Administrador', ?) 
       ON DUPLICATE KEY UPDATE nome = 'Administrador', permissoes = ?`,
      [permissoesAdmin, permissoesAdmin],
    );

    await connection.execute(
      `INSERT INTO perfis (id, nome, permissoes) 
       VALUES (2, 'Operador', ?) 
       ON DUPLICATE KEY UPDATE nome = 'Operador', permissoes = ?`,
      [permissoesOperador, permissoesOperador],
    );

    // 2. Usuário Admin
    const senhaHash = await bcrypt.hash('123456', 10);

    await connection.execute(
      `INSERT INTO usuarios (id, nome, email, senha_hash, perfil_id, ativo) 
       VALUES (1, 'Administrador Sinstock', 'admin@sinstock.com', ?, 1, true) 
       ON DUPLICATE KEY UPDATE senha_hash = ?, perfil_id = 1, ativo = true`,
      [senhaHash, senhaHash],
    );

    // 3. Filiais
    await connection.execute(
      `INSERT INTO filiais (id, nome, codigo) 
       VALUES (1, 'Filial Matriz', 'FILIAL-01') 
       ON DUPLICATE KEY UPDATE nome = 'Filial Matriz'`,
    );

    // 4. Categorias de Produtos
    await connection.execute(
      `INSERT INTO categorias (id, nome, descricao) 
       VALUES (1, 'Limpeza e Higiene', 'Produtos voltados para limpeza geral') 
       ON DUPLICATE KEY UPDATE nome = 'Limpeza e Higiene'`,
    );

    // 5. Fornecedores
    await connection.execute(
      `INSERT INTO fornecedores (id, nome_juridico, cnpj, telefone, email, cidade, estado) 
       VALUES (1, 'Distribuidora Sinstock Ltda', '12345678000195', '11999998888', 'contato@distribuidorasinstock.com.br', 'São Paulo', 'SP') 
       ON DUPLICATE KEY UPDATE nome_juridico = 'Distribuidora Sinstock Ltda', cnpj = '12345678000195'`,
    );

    // 6. Produtos
    await connection.execute(
      `INSERT INTO produtos (id, categoria_id, nome, codigo_barras, estoque_minimo) 
       VALUES (1, 1, 'Detergente Neutro 500ml', '7891234560001', 20) 
       ON DUPLICATE KEY UPDATE nome = 'Detergente Neutro 500ml', estoque_minimo = 20`,
    );

    await connection.execute(
      `INSERT INTO produtos (id, categoria_id, nome, codigo_barras, estoque_minimo) 
       VALUES (2, 1, 'Sabão em Pó 1kg', '7891234560002', 15) 
       ON DUPLICATE KEY UPDATE nome = 'Sabão em Pó 1kg', estoque_minimo = 15`,
    );

    // 7. Lote (Com data de validade próxima para testar a Engine de Alertas)
    await connection.execute(
      `INSERT INTO lotes (id, produto_id, numero_lote, data_fabricacao, data_validade) 
       VALUES (1, 1, 'LOTE-DET-2026-01', '2026-01-10', '2026-10-15') 
       ON DUPLICATE KEY UPDATE numero_lote = 'LOTE-DET-2026-01'`,
    );

    // 8. Saldo de Estoque (Abaixo do estoque mínimo para disparar alerta)
    await connection.execute(
      `INSERT INTO saldos_estoque (id, produto_id, lote_id, filial_id, quantidade) 
       VALUES (1, 1, 1, 1, 5) 
       ON DUPLICATE KEY UPDATE quantidade = 5`,
    );

    // 9. Nota Fiscal de Entrada
    await connection.execute(
      `INSERT INTO notas_fiscais_entrada (id, fornecedor_id, usuario_id, numero_nf, data_emissao, total, status) 
       VALUES (1, 1, 1, 'NF-100200', '2026-09-01', 1500.00, 'RECEBIDA') 
       ON DUPLICATE KEY UPDATE numero_nf = 'NF-100200'`,
    );

    console.log(
      'Seed concluído com sucesso! Perfis, Usuários, Filiais, Fornecedores, Produtos, Lotes, Estoque e NFs cadastrados.',
    );
  } catch (error) {
    console.error('Erro durante a execução do seed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main();