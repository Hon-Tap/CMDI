export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { checkPassword, issueAdminToken, setAdminCookie } from "@/lib/adminAuth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const password = body?.password;

  if (typeof password !== "string" || password.length < 6) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const ok = await checkPassword(password);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = await issueAdminToken();
  await setAdminCookie(token);

  return NextResponse.json({ ok: true });
}
