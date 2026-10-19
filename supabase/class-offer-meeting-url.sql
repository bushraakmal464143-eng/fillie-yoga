-- Run once in Supabase SQL Editor if class_offers already exists.
alter table public.class_offers
  add column if not exists meeting_url text;
