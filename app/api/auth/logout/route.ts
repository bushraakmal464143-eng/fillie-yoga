import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { signOutSupabase } from "@/lib/supabase-user";
import { clearUserSession } from "@/lib/user-auth";

export async function POST() {
  if (isSupabaseConfigured()) {
    await signOutSupabase();
    return NextResponse.json({ ok: true });
  }

  const response = NextResponse.json({ ok: true });
  clearUserSession(response);
  return response;
}
