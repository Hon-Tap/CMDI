// Frontend/lib/db.ts
import { Pool, type QueryResultRow } from "pg";

/**
 * We keep a single pg Pool instance across hot-reloads in dev.
 * In CI / `next build`, we also ensure the pool doesn't keep the Node
 * event-loop alive (which can make builds appear to "hang").
 */

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

/** Narrow helper: true-ish env values */
function envTrue(v: string | undefined) {
  return v === "true" || v === "1" || v === "yes";
}

/**
 * Build a new Pool.
 * NOTE: allowExitOnIdle prevents `next build` from hanging due to an idle pool
 * keeping the process alive.
 */
function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    // Fail fast with a clear error (better than mysterious timeouts).
    throw new Error("DATABASE_URL is not defined in environment variables");
  }

  return new Pool({
    connectionString,
    ssl: envTrue(process.env.DATABASE_SSL) ? { rejectUnauthorized: false } : undefined,

    // Fast failure when DB is unreachable
    connectionTimeoutMillis: 5000,

    // Keep idle clients short-lived
    idleTimeoutMillis: 10_000,

    // ✅ Critical: lets Node exit when nothing else is pending (fixes build hang)
    allowExitOnIdle: true,
  });
}

/**
 * Singleton Pool:
 * - Dev: reuse via global to avoid "Too many clients" during HMR
 * - Prod: just one instance per runtime
 */
export const pool: Pool = global.pgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  global.pgPool = pool;
}

/**
 * Type-safe query helper.
 * Also warns if a query is attempted during the production build phase,
 * which often indicates accidental build-time data fetching.
 */
export async function query<T extends QueryResultRow = any>(text: string, params: any[] = []) {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    // eslint-disable-next-line no-console
    console.warn("⚠️ Database query attempted during build phase.");
  }

  return pool.query<T>(text, params);
}

export default pool;
