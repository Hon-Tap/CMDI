export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { issueAdminToken } from "@/lib/adminAuth";

const COOKIE_NAME = "cmdi_admin";

// Use a global to maintain the pool across hot-reloads in development
declare global {
  var adminPool: Pool | undefined;
}

/**
 * DB Config & SSL Logic
 * Render requires SSL (rejectUnauthorized: false) for external connections.
 */
function getDbPool() {
  if (global.adminPool) return global.adminPool;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw Object.assign(new Error("DATABASE_URL is missing"), { code: "MISSING_DATABASE_URL" });
  }

  const url = new URL(connectionString);
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";

  global.adminPool = new Pool({
    connectionString,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  return global.adminPool;
}

export async function POST(req: Request) {
  try {
    // 1. Config Check
    if (!process.env.ADMIN_JWT_SECRET) {
      return NextResponse.json(
        { error: "Auth config error", details: "ADMIN_JWT_SECRET missing" },
        { status: 500 }
      );
    }

    // 2. Body Parsing
    const body = await req.json().catch(() => null);
    if (!body?.email || !body?.password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const email = String(body.email).trim().toLowerCase();
    const password = String(body.password);

    // 3. DB Check
    const pool = getDbPool();
    const { rows } = await pool.query(
      "SELECT id, email, password_hash, role, is_active FROM admin_users WHERE email = $1 LIMIT 1",
      [email]
    );

    const user = rows[0];

    // 4. Verification Logic
    if (!user || !user.is_active || user.role !== "admin") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 5. Token Generation
    // Passing user data to match your new issueAdminToken signature
    const token = await issueAdminToken({
      id: user.id,
      email: user.email,
    });

    // 6. Response & Cookie Setting
    const res = NextResponse.json({ ok: true });
    const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL_ENV;

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // 7. Async Metadata Update (Last Login)
    // We don't 'await' this so the user logs in faster
    pool.query(
      "UPDATE admin_users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1",
      [user.id]
    ).catch(e => console.error("LOGIN_META_UPDATE_FAILED", e.message));

    return res;

  } catch (err: any) {
    console.error("AUTH_ROUTE_ERROR:", err.message);

    // Specific hint for the common "ECONNREFUSED 127.0.0.1:5432" error
    const isLocalRefused = err.message?.includes("127.0.0.1") || err.code === "MISSING_DATABASE_URL";
    
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: err.message,
        hint: isLocalRefused 
          ? "The server is trying to connect to a local database. Check your DATABASE_URL environment variable." 
          : undefined,
      },
      { status: 500 }
    );
  }
}