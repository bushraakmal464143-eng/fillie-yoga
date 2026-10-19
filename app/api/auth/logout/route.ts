import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { signOutSupabase } from "@/lib/supabase-user";
import { findUserById } from "@/lib/user-store";
import { getClientMeta, recordLoginEvent } from "@/lib/login-log";
import { clearUserSession, getSessionUserId } from "@/lib/user-auth";

export async function POST(request: Request) {
  if (isSupabaseConfigured()) {
    await signOutSupabase();
    const response = NextResponse.json({ ok: true });
    clearAdminSession(response);
    return response;
  }

  const userId = await getSessionUserId();
  if (userId) {
    const user = await findUserById(userId);
    if (user) {
      const meta = getClientMeta(request);
      await recordLoginEvent({
        userId: user.id,
        name: user.name,
        email: user.email,
        action: "logout",
        ip: meta.ip,
        userAgent: meta.userAgent,
      });
    }
  }

  const response = NextResponse.json({ ok: true });
  clearUserSession(response);
  clearAdminSession(response);
  return response;
}
