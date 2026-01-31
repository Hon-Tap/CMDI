import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";

const SECRET = process.env.ADMIN_JWT_SECRET || "dev-secret";

function b64urlToJson(p2: string) {
  const b64 = p2.replace(/-/g, "+").replace(/_/g, "/");
  const json = Buffer.from(b64, "base64").toString("utf8");
  return JSON.parse(json);
}

function b64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function sign(data: string) {
  return b64url(crypto.createHmac("sha256", SECRET).update(data).digest());
}

function verify(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [p1, p2, sig] = parts;
  const expected = sign(`${p1}.${p2}`);
  if (sig !== expected) return false;

  try {
    const payload = b64urlToJson(p2);
    const now = Math.floor(Date.now() / 1000);
    if (payload?.role !== "admin") return false;
    if (payload?.exp < now) return false;
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminUI = pathname.startsWith("/admin");
  const isAdminAPI = pathname.startsWith("/api/admin");

  if (!isAdminUI && !isAdminAPI) return NextResponse.next();

  if (pathname === "/admin/login" || pathname.startsWith("/api/admin/auth")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("cmdi_admin")?.value;
  if (!token || !verify(token)) {
    if (isAdminAPI) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
