-- Elijah OS: run this once in your Supabase project (SQL Editor → New query → paste → Run).
-- It creates one row per signed-in user holding all app data as JSON,
-- and row-level security so each user can only read and write their own row.

create table if not exists public.user_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_state enable row level security;

create policy "Read own state" on public.user_state
  for select using (auth.uid() = user_id);

create policy "Insert own state" on public.user_state
  for insert with check (auth.uid() = user_id);

create policy "Update own state" on public.user_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
