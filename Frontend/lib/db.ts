// Frontend/lib/db.ts
import "server-only";
import { Pool, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

let prodPool: Pool | undefined;

function envTrue(v: string | undefined) {
  return v === "true" || v === "1" || v === "yes";
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not defined in environment variables");

  return new Pool({
    connectionString,
    ssl: envTrue(process.env.DATABASE_SSL) ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10_000,
    allowExitOnIdle: true,
  });
}

function getPool() {
  if (process.env.NODE_ENV !== "production") {
    global.pgPool ??= createPool();
    return global.pgPool;
  }
  prodPool ??= createPool();
  return prodPool;
}

export async function query<T extends QueryResultRow = any>(text: string, params: any[] = []) {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    throw new Error("Database query attempted during build phase.");
  }
  return getPool().query<T>(text, params);
}
