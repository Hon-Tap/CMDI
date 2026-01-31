import { query } from "@/lib/db";

type ListOpts = {
  table: string;
  page: number;
  pageSize: number;
  orderBy?: string;
  orderDir?: "asc" | "desc";
  q?: string;
  searchCols?: string[];
};

export async function listRows(opts: ListOpts) {
  const { table, page, pageSize, q, searchCols = [], orderBy = "id", orderDir = "desc" } = opts;

  const where: string[] = [];
  const params: any[] = [];
  let p = 1;

  if (q && searchCols.length) {
    const likes = searchCols.map((c) => `"${c}" ILIKE $${p++}`);
    params.push(`%${q}%`);
    where.push(`(${likes.join(" OR ")})`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const offset = (page - 1) * pageSize;

  const totalRes = await query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM ${table} ${whereSql}`, params);
  const total = parseInt(totalRes.rows[0]?.count || "0", 10);

  params.push(pageSize, offset);
  const dataRes = await query(
    `SELECT * FROM ${table} ${whereSql} ORDER BY "${orderBy}" ${orderDir} LIMIT $${p++} OFFSET $${p++}`,
    params
  );

  return { data: dataRes.rows, meta: { page, pageSize, total } };
}

export async function getRow(table: string, id: string | number) {
  const res = await query(`SELECT * FROM ${table} WHERE id=$1`, [id]);
  return res.rows[0] ?? null;
}

export async function insertRow(table: string, data: Record<string, any>) {
  const keys = Object.keys(data);
  const vals = Object.values(data);

  if (!keys.length) throw new Error("No data");

  const cols = keys.map((k) => `"${k}"`).join(", ");
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

  const res = await query(
    `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`,
    vals
  );
  return res.rows[0];
}

export async function updateRow(table: string, id: string | number, data: Record<string, any>) {
  const keys = Object.keys(data);
  const vals = Object.values(data);

  if (!keys.length) return await getRow(table, id);

  const setSql = keys.map((k, i) => `"${k}"=$${i + 1}`).join(", ");
  const res = await query(
    `UPDATE ${table} SET ${setSql} WHERE id=$${keys.length + 1} RETURNING *`,
    [...vals, id]
  );
  return res.rows[0];
}

export async function deleteRow(table: string, id: string | number) {
  await query(`DELETE FROM ${table} WHERE id=$1`, [id]);
  return { ok: true };
}
