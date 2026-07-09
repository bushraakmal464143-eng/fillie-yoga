import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { signInWithSupabase } from "@/lib/supabase-user";
import { findUserByEmail } from "@/lib/user-store";
import { setUserSession, toPublicUser, verifyPassword } from "@/lib/user-auth";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Please enter your email and password." }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    const result = await signInWithSupabase(email, password);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }
    return NextResponse.json({ user: result.user });
  }

  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const response = NextResponse.json({ user: toPublicUser(user) });
  setUserSession(response, user.id);
  return response;
}
