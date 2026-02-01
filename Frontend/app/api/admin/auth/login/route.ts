export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { issueAdminToken, setAdminCookie } from "@/lib/adminAuth";

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

  // 🔥 Hard fail early: if this is missing, pg defaults to localhost -> ECONNREFUSED 127.0.0.1:5432
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

  // Most hosted Postgres providers require SSL; local dev typically does not.
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

  // Light, serverless-friendly pool defaults
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

  // ✅ Safe log: does NOT leak secrets
  console.log("DB_POOL_INIT", {
    hostname: cfg.hostname,
    ssl: Boolean(cfg.ssl),
    VERCEL_ENV: process.env.VERCEL_ENV,
  });

  return global.adminPool;
}

export async function POST(req: Request) {
  try {
    // 🔒 Fail fast if JWT secret missing (prevents confusing 500s later)
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

    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // Query: keep it tight
    const { rows } = await pool.query(
      `SELECT id, email, password_hash, role, is_active
       FROM admin_users
       WHERE email = $1
       LIMIT 1`,
      [email]
    );

    const user = rows[0];

    // Always keep this generic (don’t leak which check failed)
    if (!user || !user.is_active || user.role !== "admin") {
      console.warn("ADMIN_LOGIN_INVALID", { email });
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      console.warn("ADMIN_LOGIN_INVALID", { email });
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Token & cookie
    try {
      const token = await issueAdminToken();
      await setAdminCookie(token);
    } catch (tokenError: any) {
      console.error("JWT_TOKEN_ERROR", {
        message: tokenError?.message,
        code: tokenError?.code,
      });

      return NextResponse.json(
        {
          error: "Authentication configuration error",
          details: "Failed to issue/set admin token",
          code: "JWT_TOKEN_ERROR",
        },
        { status: 500 }
      );
    }

    // Last login update (don’t fail the whole login if this update fails)
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

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    // Useful debug without leaking secrets
    const meta = global.adminPoolMeta;

    console.error("FULL_LOGIN_ERROR_LOG", {
      message: e?.message,
      code: e?.code,
      db_hostname: meta?.hostname,
      VERCEL_ENV: meta?.vercelEnv,
      stack: e?.stack,
    });

    // Provide a hint for the most common issue you’re seeing
    const hint =
      e?.code === "MISSING_DATABASE_URL"
        ? "DATABASE_URL is not available in this deployment environment. On Vercel, set it for Preview and redeploy the preview deployment."
        : e?.message?.includes("ECONNREFUSED") && String(e?.message).includes("127.0.0.1:5432")
        ? "Your function is trying localhost. That means DATABASE_URL is missing/ignored in this deployment, or the deployment wasn't redeployed after env change."
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
