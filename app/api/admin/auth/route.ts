import { NextResponse } from "next/server";
import {
  clearAdminSession,
  isAdminAuthenticated,
  isAdminCredentials,
  setAdminSession,
} from "@/lib/auth";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  return NextResponse.json({ authenticated });
}

/** Kept for compatibility — prefer signing in via the main site login. */
export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  if (!email || !password || !isAdminCredentials(email, password)) {
    return NextResponse.json(
      { error: "Use the main site Log in with your admin email and password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  setAdminSession(response);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  clearAdminSession(response);
  return response;
}
