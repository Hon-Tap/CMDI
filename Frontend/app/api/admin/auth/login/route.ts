export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { issueAdminToken } from "@/lib/adminAuth";

const COOKIE_NAME = "cmdi_admin";

declare global {
  // eslint-disable-next-line no-var
  var adminPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var adminPoolMeta:
    | {
        hostname: string;
        vercelEnv?: string;
      }
    | undefined;
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
    throw Object.assign(new Error("DATABASE_URL is not a valid URL"), {
      code: "INVALID_DATABASE_URL",
    });
  }

  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
  const ssl = isLocalHost ? undefined : { rejectUnauthorized: false };

  return {
    connectionString: DATABASE_URL,
    hostname,
    ssl,
  };
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

  global.adminPoolMeta = {
    hostname: cfg.hostname,
    vercelEnv: process.env.VERCEL_ENV,
  };

  console.log("DB_POOL_INIT", {
    hostname: cfg.hostname,
    ssl: Boolean(cfg.ssl),
    VERCEL_ENV: process.env.VERCEL_ENV,
  });

  return global.adminPool;
}

function cookieSecureFlag() {
  // local dev usually http; Vercel preview/prod are https
  if (process.env.NODE_ENV === "production") return true;
  if (process.env.VERCEL_ENV === "preview") return true;
  if (process.env.VERCEL_ENV === "production") return true;
  return false;
}

export async function POST(req: Request) {
  try {
    if (!process.env.ADMIN_JWT_SECRET) {
      return NextResponse.json(
        {
          error: "Authentication configuration error",
          details: "ADMIN_JWT_SECRET is missing",
          code: "MISSING_ADMIN_JWT_SECRET",
        },
        { status: 500 }
      );
    }

    const pool = getPool();

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const { rows } = await pool.query(
      `SELECT id, email, password_hash, role, is_active
       FROM admin_users
       WHERE email = $1
       LIMIT 1`,
      [email]
    );

    const user = rows[0];

    if (!user || !user.is_active || user.role !== "admin") {
      console.warn("ADMIN_LOGIN_INVALID", { email });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      console.warn("ADMIN_LOGIN_INVALID", { email });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    let token: string;
    try {
      token = await issueAdminToken();
    } catch (tokenError: any) {
      console.error("JWT_ISSUE_ERROR", {
        message: tokenError?.message,
        code: tokenError?.code,
      });

      return NextResponse.json(
        {
          error: "Authentication configuration error",
          details: "Failed to issue admin token",
          code: "JWT_ISSUE_ERROR",
        },
        { status: 500 }
      );
    }

    // ✅ IMPORTANT: set cookie on the NextResponse (not cookies().set())
    const res = NextResponse.json({ ok: true });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: cookieSecureFlag(),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // best-effort last login update
    pool
      .query(
        `UPDATE admin_users
         SET last_login_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [user.id]
      )
      .catch((e) => {
        console.error("LAST_LOGIN_UPDATE_FAILED", { id: user.id, code: e?.code });
      });

    return res;
  } catch (e: any) {
    const meta = global.adminPoolMeta;

    console.error("FULL_LOGIN_ERROR_LOG", {
      message: e?.message,
      code: e?.code,
      db_hostname: meta?.hostname,
      VERCEL_ENV: meta?.vercelEnv,
    });

    const hint =
      e?.code === "MISSING_DATABASE_URL"
        ? "DATABASE_URL is not set for this deployment environment (Preview/Production). Set it in Vercel and redeploy."
        : e?.message?.includes("ECONNREFUSED") &&
          String(e?.message).includes("127.0.0.1:5432")
        ? "The function is trying localhost: DATABASE_URL is missing/ignored in this deployment, or the deployment wasn't redeployed after env changes."
        : undefined;

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: e?.message ?? "Unknown error",
        code: e?.code,
        hint,
      },
      { status: 500 }
    );
  }
}
