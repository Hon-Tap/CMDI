import { NextResponse } from "next/server";
import { z } from "zod";
import { checkPassword, issueAdminToken, setAdminCookie } from "@/lib/adminAuth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const parsed = z.object({ password: z.string().min(6) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const ok = await checkPassword(parsed.data.password);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = await issueAdminToken();
  await setAdminCookie(token);

  return NextResponse.json({ ok: true });
}
