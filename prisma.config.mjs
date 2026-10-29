import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Empty fallback keeps `prisma generate` working during `npm install`
    // even before a local .env exists. Migrate commands still need the URL.
    url: process.env.DATABASE_URL ?? '',
  },
});
