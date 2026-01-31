import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "dev-secret");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminUI = pathname.startsWith("/admin");
  const isAdminAPI = pathname.startsWith("/api/admin");

  if (!isAdminUI && !isAdminAPI) return NextResponse.next();

  // Allow login + auth endpoints
  if (pathname === "/admin/login" || pathname.startsWith("/api/admin/auth")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("cmdi_admin")?.value;
  if (!token) {
    if (isAdminAPI) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    if (isAdminAPI) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
