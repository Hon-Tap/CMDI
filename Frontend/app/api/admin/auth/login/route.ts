export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { issueAdminToken, setAdminCookie } from "@/lib/adminAuth";

declare global {
  var adminPool: Pool | undefined;
}

// 1. Singleton pattern for the database pool to prevent connection exhaustion
let pool: Pool;
if (!global.adminPool) {
  global.adminPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Ensure SSL is required for production (Neon/Supabase/Render require this)
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    max: 10, // Limit connections in serverless
  });
}
pool = global.adminPool;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "").trim();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // 2. Database Query
    const { rows } = await pool.query(
      "SELECT id, email, password_hash, role, is_active FROM admin_users WHERE email=$1 LIMIT 1",
      [email]
    );

    const user = rows[0];

    // 3. Credential Check
    if (!user || !user.is_active || user.role !== "admin") {
      console.warn(`Login attempt failed for: ${email} (User not found or inactive)`);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordCorrect) {
      console.warn(`Login attempt failed for: ${email} (Wrong password)`);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 4. Token & Cookie Generation
    // This is a common failure point if ADMIN_JWT_SECRET is missing
    try {
      const token = await issueAdminToken();
      
      await setAdminCookie(token);
    } catch (tokenError) {
      console.error("JWT_TOKEN_ERROR:", tokenError);
      return NextResponse.json({ error: "Authentication configuration error" }, { status: 500 });
    }

    // 5. Update Last Login
    await pool.query(
      "UPDATE admin_users SET last_login_at=NOW(), updated_at=NOW() WHERE id=$1", 
      [user.id]
    );

    return NextResponse.json({ ok: true });

  } catch (e: any) {
    // This logs to your Vercel Dashboard > Logs
    console.error("FULL_LOGIN_ERROR_LOG:", {
      message: e.message,
      stack: e.stack,
      code: e.code // PostgreSQL error codes are very helpful
    });
    
    return NextResponse.json(
      { error: "Internal Server Error", details: e.message }, 
      { status: 500 }
    );
  }
}