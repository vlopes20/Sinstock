// Compatibility entry point: create only the first local administrator.
// Existing accounts and passwords are never overwritten.
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
execFileSync(
  process.execPath,
  [resolve(__dirname, '../scripts/bootstrap-admin.cjs')],
  { stdio: 'inherit' },
);
