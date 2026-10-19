import { NextResponse } from "next/server";
import { recordAuthEvent } from "@/lib/admin-members";
import {
  clearAdminSession,
  isAdminCredentials,
  isAdminEmail,
  setAdminSession,
} from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ensureAndSignInAdmin, signInWithSupabase } from "@/lib/supabase-user";
import { ensureAdminUser, findUserByEmail, touchUserLogin } from "@/lib/user-store";
import { getClientMeta, recordLoginEvent } from "@/lib/login-log";
import { setUserSession, toPublicUser, verifyPassword } from "@/lib/user-auth";
import type { User } from "@/lib/types";

async function recordLogin(user: User, request: Request) {
  const meta = getClientMeta(request);
  await recordLoginEvent({
    userId: user.id,
    name: user.name,
    email: user.email,
    action: "login",
    ip: meta.ip,
    userAgent: meta.userAgent,
  });
  await recordAuthEvent({
    userId: user.id,
    email: user.email,
    name: user.name,
    eventType: "login",
    headers: request.headers,
  });
}

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

  const adminCreds = isAdminCredentials(email, password);
  const adminEmail = isAdminEmail(email);

  if (isSupabaseConfigured()) {
    let result = await signInWithSupabase(email, password);

    // Sync / create the admin Auth user when env credentials match.
    if (result.error && adminCreds) {
      result = await ensureAndSignInAdmin({ email, password });
    }

    if (result.error && !adminCreds) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    if (result.error || !result.user) {
      if (!adminCreds) {
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }

      // Last resort: desk access via admin cookie if Auth sync failed.
      const fallbackUser: User = {
        id: "admin-local",
        name: "Studio Admin",
        email: email.trim().toLowerCase(),
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      };
      await recordLogin(fallbackUser, request);
      const response = NextResponse.json({ user: fallbackUser, isAdmin: true });
      setAdminSession(response);
      return response;
    }

    await recordLogin(result.user, request);

    // Any successful login as the admin email opens the studio desk
    // (covers Vercel env quirks where ADMIN_PASSWORD $ may be truncated).
    const grantAdmin = adminEmail || adminCreds;
    const response = NextResponse.json({ user: result.user, isAdmin: grantAdmin });
    if (grantAdmin) setAdminSession(response);
    else clearAdminSession(response);
    return response;
  }

  if (adminCreds) {
    const user = await ensureAdminUser({
      email,
      password,
      name: "Studio Admin",
    });
    await touchUserLogin(user.id);
    await recordLogin(user, request);

    const response = NextResponse.json({ user, isAdmin: true });
    setUserSession(response, user.id);
    setAdminSession(response);
    return response;
  }

  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await touchUserLogin(user.id);
  await recordLogin(toPublicUser(user), request);

  const publicUser = toPublicUser({ ...user, lastLoginAt: Date.now() });
  const response = NextResponse.json({ user: publicUser, isAdmin: false });
  setUserSession(response, user.id);
  clearAdminSession(response);
  return response;
}
