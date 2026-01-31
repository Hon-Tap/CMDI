import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";

const SECRET = process.env.ADMIN_JWT_SECRET ?? "dev-secret";

/**
 * Base64URL -> Buffer
 */
function b64urlToBuffer(input: string): Buffer {
  // base64url => base64
  let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  // pad
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  return Buffer.from(b64, "base64");
}

/**
 * Buffer/string -> Base64URL string (no padding)
 */
function toB64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

type JwtPayload = {
  exp?: number;
  role?: string;
  [key: string]: unknown;
};

function safeJsonParse(buf: Buffer): JwtPayload | null {
  try {
    const txt = buf.toString("utf8");
    return JSON.parse(txt) as JwtPayload;
  } catch {
    return null;
  }
}

function signHmac(input: string): string {
  // HMAC SHA256 over header.payload, base64url output
  const digest = crypto.createHmac("sha256", SECRET).update(input).digest();
  return toB64url(digest);
}

function timingSafeEqualStr(a: string, b: string): boolean {
  // Prevent subtle timing leaks
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function verifyAdminJwt(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [p1, p2, sig] = parts;

  // Compute expected signature
  const expected = signHmac(`${p1}.${p2}`);

  // timing-safe compare
  if (!timingSafeEqualStr(sig, expected)) return false;

  const payload = safeJsonParse(b64urlToBuffer(p2));
  if (!payload) return false;

  // Must be admin
  if (payload.role !== "admin") return false;

  // Must not be expired
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number") return false;
  if (payload.exp < now) return false;

  return true;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminUI = pathname.startsWith("/admin");
  const isAdminAPI = pathname.startsWith("/api/admin");

  if (!isAdminUI && !isAdminAPI) return NextResponse.next();

  // Allow login page + auth endpoints
  if (pathname === "/admin/login" || pathname.startsWith("/api/admin/auth")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("cmdi_admin")?.value;

  if (!token || !verifyAdminJwt(token)) {
    if (isAdminAPI) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
