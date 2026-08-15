import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSessionUser } from "@/lib/supabase-user";
import { findUserById } from "@/lib/user-store";
import { getSessionUserId, toPublicUser } from "@/lib/user-auth";
import type { User } from "@/lib/types";

/** Logged-in member from Supabase auth or local cookie session. */
export async function getCurrentUser(): Promise<User | null> {
  if (isSupabaseConfigured()) {
    return getSessionUser();
  }

  const userId = await getSessionUserId();
  if (!userId) return null;

  const user = await findUserById(userId);
  return user ? toPublicUser(user) : null;
}
