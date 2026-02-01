// Frontend/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "cmdi_admin";
const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET ?? "dev-secret");

function clearAdminCookie(res: NextResponse) {
  // clear both common paths to avoid “can’t delete” loops
  res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  res.cookies.set(COOKIE_NAME, "", { path: "/admin", maxAge: 0 });
}

function isAdminSurface(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
}
function isAdminApi(pathname: string) {
  return pathname.startsWith("/api/admin");
}
function isAuthEndpoint(pathname: string) {
  return pathname.startsWith("/api/admin/auth");
}

async function verifyAdminJwt(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "admin") return false;
    return true; // jwtVerify already checks exp if present
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (!isAdminSurface(pathname)) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const tokenValid = token ? await verifyAdminJwt(token) : false;

  // Always allow the login page to render
  if (pathname === "/admin/login") {
    if (token && !tokenValid) {
      const res = NextResponse.next();
      clearAdminCookie(res);
      return res;
    }
    return
