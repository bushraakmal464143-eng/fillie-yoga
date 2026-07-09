-- Om At Home / Fillie Yoga — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor

-- ─── Profiles (extends auth.users) ───────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are readable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Class offers ────────────────────────────────────────────────────────────

create table if not exists public.class_offers (
  id text primary key,
  key text not null unique,
  icon text not null default 'icon-yin',
  vb text not null default '0 0 48 48',
  icon_bg text not null,
  icon_color text not null,
  title text not null,
  description text not null,
  tag_bg text not null,
  tag_color text not null,
  tag text not null,
  schedule jsonb,
  special boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.class_offers enable row level security;

create policy "Class offers are publicly readable"
  on public.class_offers for select
  using (true);

-- ─── Yoga sessions (weekly schedule) ─────────────────────────────────────────

create table if not exists public.yoga_sessions (
  id serial primary key,
  day text not null,
  class_type text not null,
  time text not null,
  duration text not null,
  bg text not null default '#2980B922',
  color text not null default '#1E6FA8',
  spots int not null default 8,
  special boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.yoga_sessions enable row level security;

create policy "Yoga sessions are publicly readable"
  on public.yoga_sessions for select
  using (true);

-- ─── Pricing plans ───────────────────────────────────────────────────────────

create table if not exists public.pricing_plans (
  id text primary key,
  name text not null,
  price numeric(10, 2) not null,
  currency text not null default '$',
  period text not null default 'mo',
  section_label text not null,
  section_title text not null,
  features text[] not null default '{}',
  cta_text text not null,
  trial_cta_text text not null,
  subscribe_cta_text text not null,
  note text not null default '',
  highlighted boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pricing_plans enable row level security;

create policy "Pricing plans are publicly readable"
  on public.pricing_plans for select
  using (true);

-- ─── Bookings ────────────────────────────────────────────────────────────────

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  session_id int not null references public.yoga_sessions (id) on delete cascade,
  booking_type text not null check (booking_type in ('trial', 'member')),
  guest_name text,
  guest_email text,
  booked_at timestamptz not null default now(),
  cancelled_at timestamptz
);

alter table public.bookings enable row level security;

create policy "Users can read own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "Users can insert own bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "Users can update own bookings"
  on public.bookings for update
  using (auth.uid() = user_id);

-- ─── Subscriptions ─────────────────────────────────────────────────────────────

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id text not null references public.pricing_plans (id),
  status text not null default 'active' check (status in ('active', 'cancelled', 'past_due', 'trialing')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can read own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Admin writes use the service-role key from Next.js API routes (bypasses RLS).
