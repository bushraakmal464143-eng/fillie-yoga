import { createClient } from "@supabase/supabase-js";
import { requireServiceRoleKey, requireSupabaseUrl } from "./env";

export function createAdminClient() {
  return createClient(requireSupabaseUrl(), requireServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
