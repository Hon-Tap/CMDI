// Frontend/proxy.ts
import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "cmdi_admin";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

function isLoginPath(pathname: string) {
  return pathname === "/admin/login" || pathname.startsWith("/api/admin/auth/");
}

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Always allow the login + auth endpoints or you'll create redirect loops
  if (isLoginPath(pathname)) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;

  // If no cookie: redirect to login (for UI routes) or block (for API)
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  // Cookie exists: allow. (Do signature verification inside API routes.)
  return NextResponse.next();
}
