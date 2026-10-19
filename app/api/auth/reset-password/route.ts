import { NextResponse } from "next/server";
import { recordAuthEvent } from "@/lib/admin-members";
import { getClientMeta, recordLoginEvent } from "@/lib/login-log";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { resetPasswordWithOtp } from "@/lib/supabase-user";
import { setUserSession } from "@/lib/user-auth";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    code?: string;
    password?: string;
  };

  const email = body.email?.trim() ?? "";
  const code = body.code?.trim() ?? "";
  const password = body.password ?? "";

  if (!email || !code || !password) {
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

  const result = await resetPasswordWithOtp({ email, code, password });
  if (result.error) {
    const status = result.error.toLowerCase().includes("log in") ? 200 : 400;
    if (status === 200) {
      return NextResponse.json({ ok: true, needsLogin: true, message: result.error });
    }
    return NextResponse.json({ error: result.error }, { status });
  }

  if (result.user) {
    const meta = getClientMeta(request);
    await recordLoginEvent({
      userId: result.user.id,
      name: result.user.name,
      email: result.user.email,
      action: "login",
      ip: meta.ip,
      userAgent: meta.userAgent,
    });
    await recordAuthEvent({
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      eventType: "login",
      headers: request.headers,
    });
  }

  const response = NextResponse.json({ user: result.user });
  if (!isSupabaseConfigured() && result.user) {
    setUserSession(response, result.user.id);
  }
  return response;
}
