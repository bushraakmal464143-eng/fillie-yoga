import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSessionUser } from "@/lib/supabase-user";
import { findUserById } from "@/lib/user-store";
import { getSessionUserId, toPublicUser } from "@/lib/user-auth";

export async function GET() {
  if (isSupabaseConfigured()) {
    const user = await getSessionUser();
    return NextResponse.json({ user });
  }

  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ user: null });
  }

  const user = await findUserById(userId);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user: toPublicUser(user) });
}
