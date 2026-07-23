-- Run once in Supabase → SQL Editor if login_events does not exist yet.

create table if not exists public.login_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  email text not null,
  name text not null default '',
  event_type text not null default 'login'
    check (event_type in ('login', 'signup', 'logout')),
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists login_events_created_at_idx
  on public.login_events (created_at desc);

create index if not exists login_events_user_id_idx
  on public.login_events (user_id);

alter table public.login_events enable row level security;
