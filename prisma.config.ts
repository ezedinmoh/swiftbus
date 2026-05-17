import * as fs from 'fs';
import * as path from 'path';
import { defineConfig } from "prisma/config";

// Manual .env loader for Prisma CLI commands
try {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const index = trimmed.indexOf('=');
        if (index === -1) return;
        const key = trimmed.slice(0, index).trim();
        let val = trimmed.slice(index + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      });
  }
} catch {
  // Silent fallback
}

// Production: use Turso (libSQL) — set TURSO_DATABASE_URL in Vercel env vars
// Development: use local SQLite file via DATABASE_URL
const dbUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db';

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: dbUrl,
  },
});
