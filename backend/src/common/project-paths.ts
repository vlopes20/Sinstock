import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

// Resolve from the module so source and compiled code work from any cwd.
function findProjectRoot(): string {
  let directory = resolve(__dirname);
  while (true) {
    if (
      existsSync(join(directory, 'package.json')) &&
      existsSync(join(directory, 'prisma.config.ts'))
    ) {
      return directory;
    }
    const parent = dirname(directory);
    if (parent === directory) {
      throw new Error('Não foi possível localizar a raiz do SINSTOCK.');
    }
    directory = parent;
  }
}

export const projectRoot = findProjectRoot();
export const environmentFile = join(projectRoot, '.env');
export const frontendRoot = join(projectRoot, 'frontend');
