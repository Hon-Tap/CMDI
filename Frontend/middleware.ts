import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (!isAdminRoute) return NextResponse.next();

  // Allow the login page and auth endpoints ALWAYS
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/auth")
  ) {
    return NextResponse.next();
  }

  // Require cookie for everything else under /admin and /api/admin
  const token = req.cookies.get("cmdi_admin")?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    // send user back after login
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
