import { createHash, randomInt, timingSafeEqual } from "crypto";
import { promises as fs } from "fs";
import path from "path";

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

async function readStore(): Promise<OtpStore> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as OtpStore;
    return { pending: Array.isArray(parsed.pending) ? parsed.pending : [] };
  } catch {
    return { pending: [] };
  }
}

async function writeStore(store: OtpStore): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2), "utf8");
}

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

export async function saveSignupOtp(input: {
  email: string;
  name: string;
  code: string;
}): Promise<{ error: string | null }> {
  const email = normalizeEmail(input.email);
  const now = Date.now();
  const store = await readStore();
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
  await writeStore(store);
  return { error: null };
}

export async function verifyStoredSignupOtp(input: {
  email: string;
  code: string;
}): Promise<{ name: string } | { error: string }> {
  const email = normalizeEmail(input.email);
  const code = input.code.trim();
  const now = Date.now();
  const store = await readStore();
  store.pending = store.pending.filter((row) => row.expiresAt > now);

  const index = store.pending.findIndex((row) => row.email === email);
  if (index === -1) {
    await writeStore(store);
    return { error: "Code expired or not found. Request a new one." };
  }

  const pending = store.pending[index];
  if (pending.attempts >= MAX_ATTEMPTS) {
    store.pending.splice(index, 1);
    await writeStore(store);
    return { error: "Too many invalid attempts. Request a new code." };
  }

  if (!codesMatch(email, code, pending.codeHash)) {
    pending.attempts += 1;
    store.pending[index] = pending;
    await writeStore(store);
    return { error: "Invalid or expired code. Please try again." };
  }

  store.pending.splice(index, 1);
  await writeStore(store);
  return { name: pending.name };
}

export async function clearSignupOtp(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  const store = await readStore();
  store.pending = store.pending.filter((row) => row.email !== normalized);
  await writeStore(store);
}
