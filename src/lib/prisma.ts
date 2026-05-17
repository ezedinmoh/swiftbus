import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getPrismaInstance(): PrismaClient {
  // Production (Vercel): use Turso via libSQL adapter
  if (process.env.TURSO_DATABASE_URL) {
    const { PrismaLibSQL } = require('@prisma/adapter-libsql');
    const { createClient } = require('@libsql/client');
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    const adapter = new PrismaLibSQL(client);
    return new PrismaClient({ adapter });
  }

  // Local development: use better-sqlite3 (no network, instant)
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  const url = process.env.DATABASE_URL || 'file:./dev.db';
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? getPrismaInstance();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
