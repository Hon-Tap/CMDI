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

  return { connectionString: DATABASE_URL, hostname, ssl };
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

  console.log("ADMIN_DB_POOL_INIT", { hostname: cfg.hostname, ssl: Boolean(cfg.ssl) });
  return global.adminPool;
}

async function requireAdmin() {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw Object.assign(new Error("ADMIN_JWT_SECRET is missing"), { code: "MISSING_ADMIN_JWT_SECRET" });
  }

  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) {
    return { ok: false as const, status: 401, message: "Unauthorized" };
  }

  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });

    // Optional: enforce role if you include it in token
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

    const page = clampInt(searchParams.get("page"), 1, 1, 10_000);
    const pageSize = clampInt(searchParams.get("pageSize"), 20, 1, 100);
    const q = (searchParams.get("q") || "").trim();

    const where: string[] = [];
    const params: any[] = [];
    if (q) {
      params.push(`%${q}%`);
      where.push(`(
        title ILIKE $${params.length}
        OR status ILIKE $${params.length}
        OR category ILIKE $${params.length}
        OR location ILIKE $${params.length}
      )`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const offset = (page - 1) * pageSize;

    // total
    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM projects ${whereSql}`,
      params
    );
    const total = countRes.rows?.[0]?.total ?? 0;

    // page
    params.push(pageSize);
    params.push(offset);

    const listRes = await pool.query(
      `SELECT id, title, description, image_url, status, location, category, created_at, updated_at
       FROM projects
       ${whereSql}
       ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return NextResponse.json({
      data: listRes.rows ?? [],
      meta: { page, pageSize, total },
    });
  } catch (e: any) {
    console.error("ADMIN_PROJECTS_GET_ERROR", { message: e?.message, code: e?.code });
    return NextResponse.json(
      { error: "Failed to load projects", details: e?.message, code: e?.code },
      { status: 500 }
    );
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

    const title = String(body?.title ?? "").trim() || null;
    const description = String(body?.description ?? "").trim() || null;
    const image_url = String(body?.image_url ?? "").trim() || null;
    const status = String(body?.status ?? "draft").trim() || "draft";
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
    return NextResponse.json(
      { error: "Failed to create project", details: e?.message, code: e?.code },
      { status: 500 }
    );
  }
}
