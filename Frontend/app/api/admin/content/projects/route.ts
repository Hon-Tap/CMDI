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
    // ignore
  }

  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
  const ssl = isLocalHost ? undefined : { rejectUnauthorized: false };

  return { connectionString: DATABASE_URL, hostname, ssl };
}

function getPool() {
  if (global.adminPool) return global.adminPool;

  const cfg = getDbConfig();

  global.adminPool = new Pool({
    connectionString: cfg.connectionString,
    ssl: cfg.ssl,

    // ✅ safer defaults for serverless
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

function clampInt(v: string | null, fallback: number, min: number, max: number) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

function safeErrorPayload(e: any, publicMessage: string) {
  if (isProd()) return { error: publicMessage };
  return { error: publicMessage, details: e?.message, code: e?.code };
}

const ALLOWED_STATUS = new Set(["draft", "published", "archived"]);

function normalizeStatus(v: unknown) {
  const s = String(v ?? "draft").trim().toLowerCase();
  return ALLOWED_STATUS.has(s) ? s : "draft";
}

/**
 * GET /api/admin/content/projects?page=1&pageSize=20&q=wash
 * Returns { data, meta }
 */
export async function GET(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

    const pool = getPool();
    const { searchParams } = new URL(req.url);

    const page = clampInt(searchParams.get("page"), 1, 1, 10000);
    const pageSize = clampInt(searchParams.get("pageSize"), 20, 1, 100);
    const q = (searchParams.get("q") || "").trim();

    const where: string[] = [];
    const params: any[] = [];

    if (q) {
      params.push(`%${q}%`);
      const p = `$${params.length}`;
      where.push(`(
        title ILIKE ${p}
        OR status ILIKE ${p}
        OR category ILIKE ${p}
        OR location ILIKE ${p}
      )`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const offset = (page - 1) * pageSize;

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM projects ${whereSql}`,
      params
    );
    const total = countRes.rows?.[0]?.total ?? 0;

    const listParams = [...params, pageSize, offset];

    const listRes = await pool.query(
      `SELECT id, title, description, image_url, status, location, category, created_at, updated_at
       FROM projects
       ${whereSql}
       ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );

    return NextResponse.json({
      data: listRes.rows ?? [],
      meta: { page, pageSize, total },
    });
  } catch (e: any) {
    console.error("ADMIN_PROJECTS_GET_ERROR", { message: e?.message, code: e?.code });
    return NextResponse.json(safeErrorPayload(e, "Failed to load projects"), { status: 500 });
  }
}

/**
 * POST /api/admin/content/projects
 * Body: { title, description, image_url, status, location, category }
 */
export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

    const pool = getPool();

    const body = await req.json().catch(() => null);
    const title = String(body?.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const description = String(body?.description ?? "").trim() || null;
    const image_url = String(body?.image_url ?? "").trim() || null;
    const status = normalizeStatus(body?.status);
    const location = String(body?.location ?? "").trim() || null;
    const category = String(body?.category ?? "").trim() || null;

    const { rows } = await pool.query(
      `INSERT INTO projects (title, description, image_url, status, location, category, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6, NOW(), NOW())
       RETURNING id, title, description, image_url, status, location, category, created_at, updated_at`,
      [title, description, image_url, status, location, category]
    );

    return NextResponse.json({ ok: true, project: rows[0] }, { status: 201 });
  } catch (e: any) {
    console.error("ADMIN_PROJECTS_POST_ERROR", { message: e?.message, code: e?.code });
    return NextResponse.json(safeErrorPayload(e, "Failed to create project"), { status: 500 });
  }
}
