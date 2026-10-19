-- Run once in Supabase SQL Editor to support Stripe checkout → admin + email notify.
alter table public.subscriptions
  add column if not exists stripe_subscription_id text,
  add column if not exists customer_email text,
  add column if not exists customer_name text,
  add column if not exists notify_email_sent_at timestamptz;

create unique index if not exists subscriptions_stripe_id_uidx
  on public.subscriptions (stripe_subscription_id)
  where stripe_subscription_id is not null;
