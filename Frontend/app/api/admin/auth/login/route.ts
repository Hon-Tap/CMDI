export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { issueAdminToken, setAdminCookie } from "@/lib/adminAuth";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "").trim();

  if (!email || password.length < 6) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const { rows } = await pool.query(
      "SELECT id, email, password_hash, role, is_active FROM admin_users WHERE email=$1 LIMIT 1",
      [email]
    );

    const user = rows[0];
    if (!user || !user.is_active || user.role !== "admin") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = await issueAdminToken({ sub: String(user.id), email: user.email, role: "admin" });
    await setAdminCookie(token);

    await pool.query("UPDATE admin_users SET last_login_at=NOW(), updated_at=NOW() WHERE id=$1", [user.id]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("LOGIN_DB_ERROR", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
