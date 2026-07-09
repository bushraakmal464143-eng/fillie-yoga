import { createClient } from "@/lib/supabase/server";
import type { User } from "@/lib/types";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getSessionUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email, created_at")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    name: profile?.name ?? (user.user_metadata?.name as string | undefined) ?? "",
    email: profile?.email ?? user.email ?? "",
    createdAt: profile?.created_at
      ? new Date(profile.created_at).getTime()
      : Date.now(),
  };
}

async function findAuthUserByEmail(email: string) {
  const admin = createAdminClient();
  let page = 1;

  while (page <= 10) {
    const { data } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    const match = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );
    if (match) return match;
    if (data.users.length < 100) break;
    page += 1;
  }

  return null;
}

async function ensureProfile(userId: string, name: string, email: string) {
  const admin = createAdminClient();
  await admin.from("profiles").upsert({ id: userId, name, email }, { onConflict: "id" });
}

async function signInAndGetUser(email: string, password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) return { user: null, error: error.message };

  const user = await getSessionUser();
  return { user, error: null };
}

export async function sendSignupOtp(input: {
  name: string;
  email: string;
}): Promise<{ error: string | null }> {
  const email = input.email.trim();
  const name = input.name.trim();
  const supabase = await createClient();

  const existing = await findAuthUserByEmail(email);
  if (existing?.email_confirmed_at) {
    return {
      error: "An account with this email already exists. Try logging in instead.",
    };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      data: { name },
    },
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("rate limit")) {
      return { error: "Too many attempts. Wait a few minutes and try again." };
    }
    if (message.includes("already") || message.includes("registered")) {
      return {
        error: "An account with this email already exists. Try logging in instead.",
      };
    }
    return { error: error.message };
  }

  return { error: null };
}

export async function verifySignupOtp(input: {
  name: string;
  email: string;
  password: string;
  code: string;
}): Promise<{ user: User | null; error: string | null }> {
  const email = input.email.trim();
  const name = input.name.trim();
  const code = input.code.trim();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "email",
  });

  if (error || !data.user) {
    return { user: null, error: "Invalid or expired code. Please try again." };
  }

  const { error: passwordError } = await supabase.auth.updateUser({
    password: input.password,
  });

  if (passwordError) {
    return { user: null, error: passwordError.message };
  }

  await ensureProfile(data.user.id, name, email);

  const user = await getSessionUser();
  if (!user) {
    return { user: null, error: "Account verified but session could not start. Please log in." };
  }

  return { user, error: null };
}

export async function signInWithSupabase(
  email: string,
  password: string,
): Promise<{ user: User | null; error: string | null }> {
  const normalizedEmail = email.trim();
  let result = await signInAndGetUser(normalizedEmail, password);

  if (!result.error) return result;

  const message = result.error.toLowerCase();
  const needsConfirm =
    message.includes("email not confirmed") || message.includes("not confirmed");

  if (!needsConfirm) {
    return { user: null, error: "Invalid email or password." };
  }

  return {
    user: null,
    error: "Please verify your email first. Use Sign up to receive a new code.",
  };
}

export async function signOutSupabase(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
