import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "cmdi_admin";
const SECRET = process.env.ADMIN_JWT_SECRET || "dev-secret";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

type Payload = {
  role: "admin";
  iat: number;
  exp: number;
};

function b64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function b64urlJson(obj: any) {
  return b64url(JSON.stringify(obj));
}

function sign(data: string) {
  return b64url(crypto.createHmac("sha256", SECRET).update(data).digest());
}

export async function issueAdminToken() {
  const now = Math.floor(Date.now() / 1000);
  const payload: Payload = { role: "admin", iat: now, exp: now + MAX_AGE_SECONDS };

  const header = { alg: "HS256", typ: "JWT" };

  const p1 = b64urlJson(header);
  const p2 = b64urlJson(payload);
  const toSign = `${p1}.${p2}`;
  const sig = sign(toSign);

  return `${toSign}.${sig}`;
}

export async function verifyAdminToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token");

  const [p1, p2, sig] = parts;
  const expected = sign(`${p1}.${p2}`);
  if (sig !== expected) throw new Error("Bad signature");

  const json = Buffer.from(p2.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
  const payload = JSON.parse(json) as Payload;

  if (payload.role !== "admin") throw new Error("Not admin");
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) throw new Error("Expired");

  return payload;
}

export async function requireAdminFromCookies() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) throw new Error("Unauthorized");
  await verifyAdminToken(token);
}

export async function setAdminCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export function clearAdminCookie() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export async function checkPassword(password: string) {
  // simple compare for now (since you said no .env locally, this is a Vercel env var)
  const plain = process.env.ADMIN_PASSWORD || "";
  return password === plain;
}
