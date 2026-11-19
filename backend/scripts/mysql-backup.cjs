const { spawn } = require('node:child_process');
const { createHash, randomUUID } = require('node:crypto');
const { createReadStream, createWriteStream, existsSync } = require('node:fs');
const fs = require('node:fs/promises');
const path = require('node:path');
const readline = require('node:readline');
const { pipeline } = require('node:stream/promises');
const mysql = require('mysql2/promise');
const { projectRoot } = require('./project-paths.cjs');

const filename = 'sinstock.sql';
const manifestName = 'manifest.json';
const dumpOptions = [
  '--single-transaction',
  '--quick',
  '--no-tablespaces',
  '--set-gtid-purged=OFF',
  '--skip-column-statistics',
  '--hex-blob',
  '--triggers',
  '--routines',
  '--skip-events', // Sinstock runs its scheduled jobs in the application.
  '--order-by-primary',
  '--skip-comments',
  '--skip-dump-date',
  '--default-character-set=utf8mb4',
];

function configuration() {
  const url = new URL(process.env.DATABASE_URL || '');
  const database = decodeURIComponent(url.pathname.slice(1));
  if (url.protocol !== 'mysql:' || !database || !url.username)
    throw new Error('Configure um DATABASE_URL MySQL com usuário e banco.');
  return {
    database,
    connection: {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
    },
  };
}

function mysqlProgram(name) {
  const executable = name + (process.platform === 'win32' ? '.exe' : '');
  if (process.env.MYSQL_CLIENT_DIR)
    return path.join(process.env.MYSQL_CLIENT_DIR, executable);
  if (process.platform === 'win32' && process.env.ProgramFiles) {
    for (const version of ['8.4', '8.0']) {
      const installed = path.join(
        process.env.ProgramFiles,
        'MySQL',
        'MySQL Server ' + version,
        'bin',
        executable,
      );
      if (existsSync(installed)) return installed;
    }
  }
  return executable;
}

function runMysql(name, connection, args, input = 'ignore') {
  return new Promise((resolve, reject) => {
    const child = spawn(
      mysqlProgram(name),
      [
        '--no-defaults',
        '--protocol=TCP',
        '--host=' + connection.host,
        '--port=' + connection.port,
        '--user=' + connection.user,
        ...args,
      ],
      {
        stdio: [input, 'ignore', 'pipe'],
        env: { ...process.env, MYSQL_PWD: connection.password },
        windowsHide: true,
      },
    );
    let errors = '';
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
      errors = (errors + chunk).slice(-4000);
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(name + ' falhou. ' + errors.trim()));
    });
  });
}

async function* dumpLines(raw) {
  const lines = readline.createInterface({
    input: createReadStream(raw, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });
  for await (const line of lines) {
    // Prisma's original one-statement SIGNAL triggers retain a statement
    // terminator that MySQL rejects inside mysqldump's executable comment.
    yield line.replace(
      /^(\/\*!50003 CREATE\*\/ .*\/\*!50003 TRIGGER .* FOR EACH ROW SIGNAL .*); (\*\/;;)$/,
      '$1 $2',
    ) + '\n';
  }
}

async function dump(connection, database, file) {
  const raw = file + '.raw';
  try {
    await runMysql('mysqldump', connection, [
      ...dumpOptions,
      '--result-file=' + raw,
      '--',
      database,
    ]);
    await pipeline(dumpLines(raw), createWriteStream(file, { mode: 0o600 }));
  } finally {
    await fs.rm(raw, { force: true });
  }
}

async function checksum(file) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}

async function comparableChecksum(file) {
  const hash = createHash('sha256');
  for await (const line of dumpLines(file)) {
    // SHOW CREATE TABLE can reprint a column's character set after an import.
    // COLLATE already identifies that same character set.
    hash.update(
      line.replace(
        /^(  `[^`]+` [a-z]+(?:\([^)]*\))?) CHARACTER SET (\w+) COLLATE \2_/i,
        '$1 COLLATE $2_',
      ),
    );
  }
  return hash.digest('hex');
}

async function backup(connection, database, directory) {
  const db = await mysql.createConnection(connection);
  let schema;
  try {
    [[schema]] = await db.execute(
      'SELECT DEFAULT_CHARACTER_SET_NAME AS charset, DEFAULT_COLLATION_NAME AS collation FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?',
      [database],
    );
  } finally {
    await db.end();
  }
  if (!schema) throw new Error('Banco de origem não encontrado.');
  await fs.mkdir(directory, { recursive: true, mode: 0o700 });
  const staging = await fs.mkdtemp(path.join(directory, '.partial-'));
  const file = path.join(staging, filename);
  const metadata = path.join(staging, manifestName);
  const createdAt = new Date().toISOString();
  const destination = path.join(
    directory,
    createdAt.replace(/[:.]/g, '-') + '-' + randomUUID().slice(0, 8),
  );
  try {
    await dump(connection, database, file);
    await fs.chmod(file, 0o600);
    const { size } = await fs.stat(file);
    if (!size) throw new Error('O dump está vazio.');
    const manifest = {
      database,
      createdAt,
      ...schema,
      size,
      sha256: await checksum(file),
    };
    await fs.writeFile(metadata, JSON.stringify(manifest, null, 2) + '\n', {
      mode: 0o600,
    });
    await fs.rename(staging, destination);
    console.log('Backup criado em ' + destination);
  } catch (error) {
    await fs.rm(file, { force: true });
    await fs.rm(metadata, { force: true });
    await fs.rmdir(staging);
    throw error;
  }
}

async function verifyRestore(connection, directory) {
  const file = path.join(directory, filename);
  const manifest = JSON.parse(
    await fs.readFile(path.join(directory, manifestName), 'utf8'),
  );
  if (
    !/^[a-z0-9_]+$/i.test(manifest.charset) ||
    !/^[a-z0-9_]+$/i.test(manifest.collation)
  )
    throw new Error('Codificação ou collation inválida no manifesto.');
  const { size } = await fs.stat(file);
  if (
    !size ||
    size !== manifest.size ||
    (await checksum(file)) !== manifest.sha256
  )
    throw new Error('O arquivo SQL diverge do manifesto do backup.');

  const target = 'sinstock_restore_' + randomUUID().replace(/-/g, '');
  const staging = await fs.mkdtemp(path.join(directory, '.verify-'));
  const restored = path.join(staging, filename);
  let db,
    created = false;
  try {
    db = await mysql.createConnection(connection);
    await db.query(
      'CREATE DATABASE ?? CHARACTER SET ' +
        manifest.charset +
        ' COLLATE ' +
        manifest.collation,
      [target],
    );
    created = true;
    const input = await fs.open(file, 'r');
    try {
      await runMysql(
        'mysql',
        connection,
        [
          '--binary-mode',
          '--comments',
          '--default-character-set=utf8mb4',
          '--database=' + target,
        ],
        input.fd,
      );
    } finally {
      await input.close();
    }
    await dump(connection, target, restored);
    if (
      (await comparableChecksum(restored)) !== (await comparableChecksum(file))
    )
      throw new Error('O conteúdo restaurado diverge do dump original.');
    console.log(
      'Restauração validada em ' +
        target +
        '. O dump restaurado corresponde ao original.',
    );
  } finally {
    try {
      if (created) await db.query('DROP DATABASE ??', [target]);
    } finally {
      await db?.end();
      await fs.rm(restored, { force: true });
      await fs.rmdir(staging);
    }
  }
}

async function main() {
  const [action, directory] = process.argv.slice(2);
  const { connection, database } = configuration();
  if (action === 'backup') {
    const output = directory || process.env.SINSTOCK_BACKUP_DIR;
    await backup(
      connection,
      database,
      output
        ? path.resolve(output)
        : path.join(projectRoot, '.tmp', 'mysql-backups'),
    );
  } else if (action === 'verify' && directory) {
    await verifyRestore(connection, path.resolve(directory));
  } else {
    throw new Error(
      'Use backup [diretório de saída] ou verify <diretório da cópia>.',
    );
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
