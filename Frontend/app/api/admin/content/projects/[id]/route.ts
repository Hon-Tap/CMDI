export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Pool } from "pg";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const COOKIE_NAME = "cmdi_admin";

declare global {
  // eslint-disable-next-line no-var
  var adminPool: Pool | undefined;
}

function getDbConfig() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw Object.assign(new Error("DATABASE_URL is missing"), { code: "MISSING_DATABASE_URL" });
  }
  const hostname = new URL(DATABASE_URL).hostname || "unknown";
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
  const ssl = isLocalHost ? undefined : { rejectUnauthorized: false };
  return { connectionString: DATABASE_URL, ssl };
}

function getPool() {
  if (global.adminPool) return global.adminPool;

  const cfg = getDbConfig();
  global.adminPool = new Pool({
    connectionString: cfg.connectionString,
    ssl: cfg.ssl,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    keepAlive: true,
  });

  return global.adminPool;
}

async function requireAdmin() {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw Object.assign(new Error("ADMIN_JWT_SECRET is missing"), { code: "MISSING_ADMIN_JWT_SECRET" });
  }

  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return { ok: false as const, status: 401, message: "Unauthorized" };

  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    if (payload?.role && payload.role !== "admin") {
      return { ok: false as const, status: 403, message: "Forbidden" };
    }
    return { ok: true as const, payload };
  } catch {
    return { ok: false as const, status: 401, message: "Unauthorized" };
  }
}

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

    const pool = getPool();
    const id = ctx.params.id;

    const { rows } = await pool.query(
      `SELECT id, title, description, image_url, status, location, category, created_at, updated_at
       FROM projects
       WHERE id = $1
       LIMIT 1`,
      [id]
    );

    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ project: rows[0] });
  } catch (e: any) {
    console.error("ADMIN_PROJECT_GET_ONE_ERROR", { message: e?.message, code: e?.code });
    return NextResponse.json({ error: "Failed", details: e?.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

    const pool = getPool();
    const id = ctx.params.id;
    const body = await req.json().catch(() => null);

    // Build a safe partial update
    const fields: string[] = [];
    const values: any[] = [];

    const set = (col: string, val: any) => {
      values.push(val);
      fields.push(`${col} = $${values.length}`);
    };

    if (body?.title !== undefined) set("title", String(body.title).trim() || null);
    if (body?.description !== undefined) set("description", String(body.description).trim() || null);
    if (body?.image_url !== undefined) set("image_url", String(body.image_url).trim() || null);
    if (body?.status !== undefined) set("status", String(body.status).trim() || "draft");
    if (body?.location !== undefined) set("location", String(body.location).trim() || null);
    if (body?.category !== undefined) set("category", String(body.category).trim() || null);

    // always touch updated_at
    fields.push(`updated_at = NOW()`);

    if (fields.length === 1) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);

    const { rows } = await pool.query(
      `UPDATE projects
       SET ${fields.join(", ")}
       WHERE id = $${values.length}
       RETURNING id, title, description, image_url, status, location, category, created_at, updated_at`,
      values
    );

    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, project: rows[0] });
  } catch (e: any) {
    console.error("ADMIN_PROJECT_PATCH_ERROR", { message: e?.message, code: e?.code });
    return NextResponse.json({ error: "Failed", details: e?.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

    const pool = getPool();
    const id = ctx.params.id;

    await pool.query(`DELETE FROM projects WHERE id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("ADMIN_PROJECT_DELETE_ERROR", { message: e?.message, code: e?.code });
    return NextResponse.json({ error: "Failed", details: e?.message }, { status: 500 });
  }
}
