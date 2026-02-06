import { Pool, QueryResultRow } from "pg";

/**
 * 1. Global Type Definition
 * Prevents TypeScript errors and connection leaks during development 
 * and build discovery phases.
 */
declare global {
  var pgPool: Pool | undefined;
}

/**
 * 2. Singleton Initialization
 * Reuses the existing pool if it exists, preventing the "Too many clients" 
 * error and build-time hanging.
 */
const pool =
  global.pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.DATABASE_SSL === "true"
        ? { rejectUnauthorized: false }
        : undefined,
    // 3. CRITICAL: Prevents the 40-minute build hang if the DB is unreachable
    connectionTimeoutMillis: 5000, 
    idleTimeoutMillis: 10000,
  });

// Save to global object in non-production environments
if (process.env.NODE_ENV !== "production") {
  global.pgPool = pool;
}

/**
 * 4. Type-Safe Query Function
 * "T extends QueryResultRow" fixes the error: 
 * "Type 'T' does not satisfy the constraint 'QueryResultRow'".
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params: any[] = []
) {
  // Optional: Safety check to log if queries are firing during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
     console.warn("⚠️ Database query attempted during build phase.");
  }

  const res = await pool.query<T>(text, params);
  return res;
}

export default pool;