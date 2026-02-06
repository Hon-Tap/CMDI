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

function isProd() {
  return process.env.NODE_ENV === "production";
}

function safeErrorPayload(e: any, publicMessage: string) {
  if (isProd()) return { error: publicMessage };
  return { error: publicMessage, details: e?.message, code: e?.code };
}

function getDbConfig() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw Object.assign(new Error("DATABASE_URL is missing"), {
      code: "MISSING_DATABASE_URL",
    });
  }

  let hostname = "unknown";
  try {
    hostname = new URL(DATABASE_URL).hostname || "unknown";
  } catch {
    // ignore parse errors
  }

  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
  const ssl = isLocalHost ? undefined : { rejectUnauthorized: false };

  return { connectionString: DATABASE_URL, ssl, hostname };
}

function getPool() {
  if (global.adminPool) return global.adminPool;

  const cfg = getDbConfig();
  global.adminPool = new Pool({
    connectionString: cfg.connectionString,
    ssl: cfg.ssl,

    // ✅ safer for serverless
    max: 1,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    keepAlive: true,
  });

  console.log("ADMIN_DB_POOL_INIT", { hostname: cfg.hostname, ssl: Boolean(cfg.ssl) });
  return global.adminPool;
}

async function requireAdmin() {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw Object.assign(new Error("ADMIN_JWT_SECRET is missing"), {
      code: "MISSING_ADMIN_JWT_SECRET",
    });
  }

  // ✅ cookies() is sync in route handlers
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

function parseId(raw: string) {
  // Your DB uses numeric ids; enforce it.
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0 || Math.trunc(n) !== n) return null;
  return n;
}

const ALLOWED_STATUS = new Set(["draft", "published", "archived"]);
function normalizeStatus(v: unknown) {
  const s = String(v ?? "draft").trim().toLowerCase();
  return ALLOWED_STATUS.has(s) ? s : "draft";
}

/**
 * GET /api/admin/content/projects/:id
 */
export async function GET(_req: Request, ctx: { params: { id: string } }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

    const id = parseId(ctx.params.id);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const pool = getPool();

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
    return NextResponse.json(safeErrorPayload(e, "Failed to load project"), { status: 500 });
  }
}

/**
 * PATCH /api/admin/content/projects/:id
 * Body: partial fields { title?, description?, image_url?, status?, location?, category? }
 */
export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

    const id = parseId(ctx.params.id);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const pool = getPool();
    const body = await req.json().catch(() => null);

    const fields: string[] = [];
    const values: any[] = [];

    const set = (col: string, val: any) => {
      values.push(val);
      fields.push(`${col} = $${values.length}`);
    };

    if (body?.title !== undefined) {
      const title = String(body.title).trim();
      // If title is provided, it must not be empty.
      if (!title) return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
      set("title", title);
    }

    if (body?.description !== undefined) set("description", String(body.description).trim() || null);
    if (body?.image_url !== undefined) set("image_url", String(body.image_url).trim() || null);
    if (body?.status !== undefined) set("status", normalizeStatus(body.status));
    if (body?.location !== undefined) set("location", String(body.location).trim() || null);
    if (body?.category !== undefined) set("category", String(body.category).trim() || null);

    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    // always touch updated_at
    fields.push("updated_at = NOW()");

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
    return NextResponse.json(safeErrorPayload(e, "Failed to update project"), { status: 500 });
  }
}

/**
 * DELETE /api/admin/content/projects/:id
 *
 * Default behavior: SOFT delete (archive)
 * Hard delete: pass ?hard=1
 */
export async function DELETE(req: Request, ctx: { params: { id: string } }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

    const id = parseId(ctx.params.id);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const pool = getPool();

    const url = new URL(req.url);
    const hard = url.searchParams.get("hard") === "1";

    if (hard) {
      const res = await pool.query(`DELETE FROM projects WHERE id = $1`, [id]);
      // res.rowCount is available in pg; keep response simple either way
      return NextResponse.json({ ok: true, deleted: true });
    }

    // ✅ Soft delete
    const { rows } = await pool.query(
      `UPDATE projects
       SET status = 'archived', updated_at = NOW()
       WHERE id = $1
       RETURNING id, status, updated_at`,
      [id]
    );

    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ ok: true, archived: true, project: rows[0] });
  } catch (e: any) {
    console.error("ADMIN_PROJECT_DELETE_ERROR", { message: e?.message, code: e?.code });
    return NextResponse.json(safeErrorPayload(e, "Failed to delete project"), { status: 500 });
  }
}
