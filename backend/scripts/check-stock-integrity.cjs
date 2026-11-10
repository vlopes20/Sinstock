require('./project-paths.cjs');
const mysql = require('mysql2/promise');
async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    const [invalid] = await connection.query('SELECT COUNT(*) AS total FROM saldos_estoque WHERE quantidade < 0 OR quantidade_reservada < 0 OR quantidade_reservada > quantidade');
    const [duplicates] = await connection.query('SELECT COUNT(*) AS total FROM (SELECT produto_id, filial_id, lote_id FROM saldos_estoque GROUP BY produto_id, filial_id, lote_id HAVING COUNT(*) > 1) d');
    const [foreignLots] = await connection.query('SELECT COUNT(*) AS total FROM saldos_estoque s JOIN lotes l ON l.id = s.lote_id WHERE s.produto_id <> l.produto_id');
    const report = { saldos_invalidos: Number(invalid[0].total), saldos_duplicados: Number(duplicates[0].total), lotes_incompativeis: Number(foreignLots[0].total) };
    console.log(JSON.stringify(report, null, 2));
    if (Object.values(report).some(Boolean)) process.exitCode = 1;
  } finally { await connection.end(); }
}
main().catch(() => { console.error('Não foi possível verificar a integridade do banco.'); process.exitCode = 1; });
