create table if not exists public.coin_ledger (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null,
  event_type text not null,
  source_id text,
  coins integer not null default 0,
  xp integer not null default 0,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.reward_events (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null,
  event_type text not null,
  source_id text,
  payload jsonb not null default '{}'::jsonb,
  processed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.coin_ledger enable row level security;
alter table public.reward_events enable row level security;

drop policy if exists "Scholars can view own coin ledger" on public.coin_ledger;
create policy "Scholars can view own coin ledger"
on public.coin_ledger
for select
to authenticated
using (auth.uid() = scholar_id);

drop policy if exists "Scholars can view own reward events" on public.reward_events;
create policy "Scholars can view own reward events"
on public.reward_events
for select
to authenticated
using (auth.uid() = scholar_id);
