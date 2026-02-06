import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "cmdi_admin";
const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET ?? "dev-secret");

function clearAdminCookie(res: NextResponse) {
  // Clear at / to avoid “undeletable cookie” loops
  res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

const isAdminSurface = (p: string) => p.startsWith("/admin") || p.startsWith("/api/admin");
const isAdminApi = (p: string) => p.startsWith("/api/admin");
const isAuthEndpoint = (p: string) => p.startsWith("/api/admin/auth");

async function verifyAdminJwt(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload?.role === "admin";
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (!isAdminSurface(pathname)) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const tokenValid = token ? await verifyAdminJwt(token) : false;

  // Always allow login UI
  if (pathname === "/admin/login") {
    // If user has a bad cookie, clear it so the page can behave normally
    if (token && !tokenValid) {
      const res = NextResponse.next();
      clearAdminCookie(res);
      return res;
    }
    // If already logged in, go straight to dashboard
    if (tokenValid) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Always allow auth endpoints
  if (isAuthEndpoint(pathname)) return NextResponse.next();

  // Require valid token for everything else
  if (!tokenValid) {
    if (isAdminApi(pathname)) {
      const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      clearAdminCookie(res);
      return res;
    }

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
