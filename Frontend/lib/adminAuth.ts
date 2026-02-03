import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "cmdi_admin";
const SECRET = process.env.ADMIN_JWT_SECRET;
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

type AdminPayload = {
  id: string | number;
  email: string;
  role: "admin";
  iat: number;
  exp: number;
};

// --- Utility Helpers ---

function b64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function b64urlJson(obj: any): string {
  return b64url(JSON.stringify(obj));
}

function sign(data: string): string {
  if (!SECRET) {
    throw new Error("ADMIN_JWT_SECRET is not defined in environment variables");
  }
  return b64url(crypto.createHmac("sha256", SECRET).update(data).digest());
}

// --- Core Functions ---

/**
 * Generates a signed JWT for the admin user
 */
export async function issueAdminToken(user: { id: string | number; email: string }) {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminPayload = {
    id: user.id,
    email: user.email,
    role: "admin",
    iat: now,
    exp: now + MAX_AGE_SECONDS,
  };

  const header = { alg: "HS256", typ: "JWT" };

  const p1 = b64urlJson(header);
  const p2 = b64urlJson(payload);
  const toSign = `${p1}.${p2}`;
  const sig = sign(toSign);

  return `${toSign}.${sig}`;
}

/**
 * Validates the token string and returns the payload
 */
export async function verifyAdminToken(token: string): Promise<AdminPayload> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token format");

  const [p1, p2, sig] = parts;
  
  // Validate Signature
  const expectedSig = sign(`${p1}.${p2}`);
  if (sig !== expectedSig) throw new Error("Invalid token signature");

  // Parse Payload
  const json = Buffer.from(p2.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
  const payload = JSON.parse(json) as AdminPayload;

  // Validate Logic
  if (payload.role !== "admin") throw new Error("Unauthorized role");
  
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) throw new Error("Token expired");

  return payload;
}

/**
 * Used in Server Components or Middleware to protect routes
 */
export async function requireAdminFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) throw new Error("No admin session found");

  try {
    return await verifyAdminToken(token);
  } catch (err) {
    throw new Error("Invalid admin session");
  }
}

/**
 * Clears the admin session
 */
export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", { 
    path: "/", 
    maxAge: 0,
    httpOnly: true 
  });
}

/**
 * Helper to get the current admin user from cookies without throwing
 */
export async function getAdminUser() {
  try {
    return await requireAdminFromCookies();
  } catch {
    return null;
  }
}