import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_COOKIE = "om_admin";

export function getAdminToken(): string {
  return process.env.ADMIN_SESSION_TOKEN ?? "omathome-admin-session";
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "omathome";
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
