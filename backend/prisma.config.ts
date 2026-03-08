import dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: ['.env.test', '.env.test.local'] });
} else {
  dotenv.config({ path: ['.env', '.env.local'] });
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
