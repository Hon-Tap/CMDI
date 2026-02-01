import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "cmdi_admin";
const SECRET = process.env.ADMIN_JWT_SECRET ?? "dev-secret";

type JwtPayload = {
  exp?: number;
  role?: string;
  [key: string]: unknown;
};

/** Buffer/string -> Base64URL (no padding) */
function toB64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/** Base64URL -> Buffer */
function b64urlToBuffer(input: string): Buffer {
  let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  return Buffer.from(b64, "base64");
}

function safeJsonParse(buf: Buffer): JwtPayload | null {
  try {
    return JSON.parse(buf.toString("utf8")) as JwtPayload;
  } catch {
    return null;
  }
}

function signHmac(input: string): string {
  const digest = crypto.createHmac("sha256", SECRET).update(input).digest();
  return toB64url(digest);
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function verifyAdminJwt(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [p1, p2, sig] = parts;

  const expected = signHmac(`${p1}.${p2}`);
  if (!timingSafeEqualStr(sig, expected)) return false;

  const payload = safeJsonParse(b64urlToBuffer(p2));
  if (!payload) return false;

  if (payload.role !== "admin") return false;

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number") return false;
  if (payload.exp < now) return false;

  return true;
}

function clearAdminCookie(res: NextResponse) {
  // Clear cookie to prevent redirect loops caused by stale/invalid tokens.
  res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

function isPublicAdminPath(pathname: string) {
  // Always allow these to render/call without auth
  return (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/auth")
  );
}

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const isAdminUI = pathname.startsWith("/admin");
  const isAdminAPI = pathname.startsWith("/api/admin");

  // Only guard admin surfaces
  if (!isAdminUI && !isAdminAPI) return NextResponse.next();

  // Allow login + auth endpoints
  if (isPublicAdminPath(pathname)) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const ok = token ? verifyAdminJwt(token) : false;

  if (!ok) {
    // API: return 401 JSON
    if (isAdminAPI) {
      const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      clearAdminCookie(res);
      return res;
    }

    // UI: redirect to login, preserving where user wanted to go
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", `${pathname}${search || ""}`);

    const res = NextResponse.redirect(url);
    clearAdminCookie(res);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
