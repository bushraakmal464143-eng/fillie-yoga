import { createClient } from "@/lib/supabase/server";
import type { User } from "@/lib/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMailConfigured, sendSignupOtpEmail } from "@/lib/mail";
import {
  clearSignupOtp,
  generateOtpCode,
  saveSignupOtp,
  verifyStoredSignupOtp,
} from "@/lib/otp-store";
import { createUser } from "@/lib/user-store";
import { isSupabaseConfigured } from "@/lib/supabase/env";

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
    name:
      (profile?.name as string | undefined)?.trim() ||
      (user.user_metadata?.name as string | undefined)?.trim() ||
      (user.email?.split("@")[0] ?? ""),
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

async function createConfirmedSupabaseUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user: User | null; error: string | null }> {
  const admin = createAdminClient();
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  const existing = await findAuthUserByEmail(email);
  if (existing?.email_confirmed_at) {
    return {
      user: null,
      error: "An account with this email already exists. Try logging in instead.",
    };
  }

  if (existing && !existing.email_confirmed_at) {
    await admin.auth.admin.deleteUser(existing.id);
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (error || !data.user) {
    return { user: null, error: error?.message ?? "Could not create account." };
  }

  await ensureProfile(data.user.id, name, email);
  return signInAndGetUser(email, input.password);
}

export async function sendSignupOtp(input: {
  name: string;
  email: string;
}): Promise<{ error: string | null }> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  if (!isMailConfigured()) {
    return {
      error:
        "Email is not configured. Add SMTP_HOST, SMTP_USER, SMTP_PASS (and optional SMTP_FROM) to .env.local.",
    };
  }

  if (isSupabaseConfigured()) {
    const existing = await findAuthUserByEmail(email);
    if (existing?.email_confirmed_at) {
      return {
        error: "An account with this email already exists. Try logging in instead.",
      };
    }
  }

  const code = generateOtpCode();
  const saved = await saveSignupOtp({ email, name, code });
  if (saved.error) return saved;

  try {
    await sendSignupOtpEmail({ to: email, name, code });
  } catch (error) {
    await clearSignupOtp(email);
    const message = error instanceof Error ? error.message : "Could not send email.";
    return { error: `Could not send verification email: ${message}` };
  }

  return { error: null };
}

export async function verifySignupOtp(input: {
  name: string;
  email: string;
  password: string;
  code: string;
}): Promise<{ user: User | null; error: string | null }> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const code = input.code.trim();

  const verified = await verifyStoredSignupOtp({ email, code });
  if ("error" in verified) {
    return { user: null, error: verified.error };
  }

  const finalName = verified.name || name;

  if (isSupabaseConfigured()) {
    const created = await createConfirmedSupabaseUser({
      name: finalName,
      email,
      password: input.password,
    });
    return created;
  }

  try {
    const user = await createUser({
      name: finalName,
      email,
      password: input.password,
    });
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      error: null,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") {
      return {
        user: null,
        error: "An account with this email already exists. Try logging in instead.",
      };
    }
    return { user: null, error: "Could not create account." };
  }
}

export async function signInWithSupabase(
  email: string,
  password: string,
): Promise<{ user: User | null; error: string | null }> {
  const normalizedEmail = email.trim();
  const result = await signInAndGetUser(normalizedEmail, password);

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
