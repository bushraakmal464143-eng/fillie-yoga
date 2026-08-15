-- Run this once in Supabase SQL Editor if yoga_sessions already exists.
alter table public.yoga_sessions
  add column if not exists meeting_url text;
