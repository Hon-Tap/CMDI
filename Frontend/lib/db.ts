import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

export async function query<T = any>(text: string, params: any[] = []) {
  const res = await pool.query<T>(text, params);
  return res;
}
