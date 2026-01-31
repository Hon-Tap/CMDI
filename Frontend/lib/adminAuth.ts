import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const COOKIE_NAME = "cmdi_admin";
const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "dev-secret");

export async function issueAdminToken() {
  return await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAdminToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  if (payload?.role !== "admin") throw new Error("Not admin");
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
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAdminCookie() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export async function checkPassword(password: string) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) return bcrypt.compare(password, hash);
  const plain = process.env.ADMIN_PASSWORD || "";
  return password === plain;
}
