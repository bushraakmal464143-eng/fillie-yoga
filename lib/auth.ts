import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_COOKIE = "om_admin";

const DEFAULT_ADMIN_EMAIL = "gillania349@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "Filliefaragie@admin$";

export function getAdminToken(): string {
  return process.env.ADMIN_SESSION_TOKEN ?? "omathome-admin-session";
}

export function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
}

export function getAdminPassword(): string {
  // Strip wrapping quotes from .env values like ADMIN_PASSWORD='secret$'
  return (process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD)
    .trim()
    .replace(/^['"]|['"]$/g, "");
}

function safeEqualString(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function isAdminEmail(email: string): boolean {
  return safeEqualString(email.trim().toLowerCase(), getAdminEmail());
}

export function isAdminCredentials(email: string, password: string): boolean {
  return isAdminEmail(email) && safeEqualString(password, getAdminPassword());
}

export function setAdminSession(response: NextResponse) {
  response.cookies.set(ADMIN_COOKIE, getAdminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === getAdminToken();
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }
  return null;
}
