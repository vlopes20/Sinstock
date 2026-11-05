import { config } from 'dotenv';
import { resolve } from 'node:path';
import { defineConfig, env } from 'prisma/config';

config({ path: resolve(__dirname, '.env'), quiet: true });

export default defineConfig({
  schema: 'backend/prisma/schema.prisma',

  migrations: {
    path: 'backend/prisma/migrations',
    seed: 'node backend/scripts/bootstrap-admin.cjs',
  },

  datasource: {
    url: env('DATABASE_URL'),
  },
});
