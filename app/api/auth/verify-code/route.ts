import { NextResponse } from "next/server";
import { verifySignupOtp } from "@/lib/supabase-user";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { setUserSession } from "@/lib/user-auth";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
    code?: string;
  };

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";
  const code = body.code?.trim() ?? "";

  if (!name || !email || !password || !code) {
    return NextResponse.json({ error: "Please fill in all fields." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  if (!/^\d{6,8}$/.test(code)) {
    return NextResponse.json({ error: "Enter the 6-digit code from your email." }, { status: 400 });
  }

  const result = await verifySignupOtp({ name, email, password, code });
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const response = NextResponse.json({ user: result.user });

  // Local auth (no Supabase) needs the cookie session set here.
  if (!isSupabaseConfigured() && result.user) {
    setUserSession(response, result.user.id);
  }

  return response;
}
