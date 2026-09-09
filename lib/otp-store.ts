import { createHash, randomInt, timingSafeEqual } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type PendingSignup = {
  email: string;
  name: string;
  codeHash: string;
  expiresAt: number;
  lastSentAt: number;
  attempts: number;
};

type OtpStore = {
  pending: PendingSignup[];
};

const DATA_PATH = path.join(process.cwd(), "data", "signup-otps.json");
const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashCode(email: string, code: string) {
  return createHash("sha256").update(`${normalizeEmail(email)}:${code}`).digest("hex");
}

function codesMatch(email: string, code: string, codeHash: string) {
  const next = Buffer.from(hashCode(email, code), "hex");
  const stored = Buffer.from(codeHash, "hex");
  if (next.length !== stored.length) return false;
  return timingSafeEqual(next, stored);
}

export function generateOtpCode(): string {
  return String(randomInt(100000, 1000000));
}

async function readFileStore(): Promise<OtpStore> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as OtpStore;
    return { pending: Array.isArray(parsed.pending) ? parsed.pending : [] };
  } catch {
    return { pending: [] };
  }
}

async function writeFileStore(store: OtpStore): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2), "utf8");
}

type SignupOtpRow = {
  email: string;
  name: string;
  code_hash: string;
  expires_at: string;
  last_sent_at: string;
  attempts: number;
};

function rowToPending(row: SignupOtpRow): PendingSignup {
  return {
    email: row.email,
    name: row.name,
    codeHash: row.code_hash,
    expiresAt: new Date(row.expires_at).getTime(),
    lastSentAt: new Date(row.last_sent_at).getTime(),
    attempts: row.attempts,
  };
}

async function purgeExpiredSupabaseRows(now: number): Promise<void> {
  await createAdminClient()
    .from("signup_otps")
    .delete()
    .lt("expires_at", new Date(now).toISOString());
}

async function getSupabasePending(email: string, now: number): Promise<PendingSignup | null> {
  const { data, error } = await createAdminClient()
    .from("signup_otps")
    .select("email, name, code_hash, expires_at, last_sent_at, attempts")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const pending = rowToPending(data as SignupOtpRow);
  if (pending.expiresAt <= now) {
    await createAdminClient().from("signup_otps").delete().eq("email", email);
    return null;
  }
  return pending;
}

export async function saveSignupOtp(input: {
  email: string;
  name: string;
  code: string;
}): Promise<{ error: string | null }> {
  const email = normalizeEmail(input.email);
  const now = Date.now();

  if (isSupabaseConfigured()) {
    await purgeExpiredSupabaseRows(now);

    const existing = await getSupabasePending(email, now);
    if (existing && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
      return { error: `Please wait ${waitSec}s before requesting another code.` };
    }

    const { error } = await createAdminClient().from("signup_otps").upsert(
      {
        email,
        name: input.name.trim(),
        code_hash: hashCode(email, input.code),
        expires_at: new Date(now + OTP_TTL_MS).toISOString(),
        last_sent_at: new Date(now).toISOString(),
        attempts: 0,
      },
      { onConflict: "email" },
    );

    if (error) {
      console.error("[signup_otps] save failed:", error);
      return { error: "Could not save verification code. Run supabase/signup-otps.sql in Supabase." };
    }

    return { error: null };
  }

  const store = await readFileStore();
  store.pending = store.pending.filter((row) => row.expiresAt > now);

  const existing = store.pending.find((row) => row.email === email);
  if (existing && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
    const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
    return { error: `Please wait ${waitSec}s before requesting another code.` };
  }

  const next: PendingSignup = {
    email,
    name: input.name.trim(),
    codeHash: hashCode(email, input.code),
    expiresAt: now + OTP_TTL_MS,
    lastSentAt: now,
    attempts: 0,
  };

  store.pending = [...store.pending.filter((row) => row.email !== email), next];
  await writeFileStore(store);
  return { error: null };
}

export async function verifyStoredSignupOtp(input: {
  email: string;
  code: string;
}): Promise<{ name: string } | { error: string }> {
  const email = normalizeEmail(input.email);
  const code = input.code.trim();
  const now = Date.now();

  if (isSupabaseConfigured()) {
    const pending = await getSupabasePending(email, now);
    if (!pending) {
      return { error: "Code expired or not found. Request a new one." };
    }

    if (pending.attempts >= MAX_ATTEMPTS) {
      await createAdminClient().from("signup_otps").delete().eq("email", email);
      return { error: "Too many invalid attempts. Request a new code." };
    }

    if (!codesMatch(email, code, pending.codeHash)) {
      const { error } = await createAdminClient()
        .from("signup_otps")
        .update({ attempts: pending.attempts + 1 })
        .eq("email", email);
      if (error) console.error("[signup_otps] attempt update failed:", error);
      return { error: "Invalid or expired code. Please try again." };
    }

    await createAdminClient().from("signup_otps").delete().eq("email", email);
    return { name: pending.name };
  }

  const store = await readFileStore();
  store.pending = store.pending.filter((row) => row.expiresAt > now);

  const index = store.pending.findIndex((row) => row.email === email);
  if (index === -1) {
    await writeFileStore(store);
    return { error: "Code expired or not found. Request a new one." };
  }

  const pending = store.pending[index];
  if (pending.attempts >= MAX_ATTEMPTS) {
    store.pending.splice(index, 1);
    await writeFileStore(store);
    return { error: "Too many invalid attempts. Request a new code." };
  }

  if (!codesMatch(email, code, pending.codeHash)) {
    pending.attempts += 1;
    store.pending[index] = pending;
    await writeFileStore(store);
    return { error: "Invalid or expired code. Please try again." };
  }

  store.pending.splice(index, 1);
  await writeFileStore(store);
  return { name: pending.name };
}

export async function clearSignupOtp(email: string): Promise<void> {
  const normalized = normalizeEmail(email);

  if (isSupabaseConfigured()) {
    await createAdminClient().from("signup_otps").delete().eq("email", normalized);
    return;
  }

  const store = await readFileStore();
  store.pending = store.pending.filter((row) => row.email !== normalized);
  await writeFileStore(store);
}
