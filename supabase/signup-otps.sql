-- Run once in Supabase SQL Editor (required for signup OTP on Vercel).
create table if not exists public.signup_otps (
  email text primary key,
  name text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  last_sent_at timestamptz not null,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists signup_otps_expires_at_idx
  on public.signup_otps (expires_at);

alter table public.signup_otps enable row level security;

-- No public policies: only service-role API routes read/write signup_otps.
