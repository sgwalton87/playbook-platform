create table if not exists public.recruiting_target_events (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null,
  recruiting_target_id uuid not null references public.recruiting_targets(id) on delete cascade,
  event_type text not null default 'stage_change',
  from_stage text,
  to_stage text,
  summary text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists recruiting_target_events_scholar_time_idx
  on public.recruiting_target_events (scholar_id, occurred_at desc);
create index if not exists recruiting_target_events_target_time_idx
  on public.recruiting_target_events (recruiting_target_id, occurred_at desc);
create index if not exists athlete_financial_entries_nil_deal_idx
  on public.athlete_financial_entries (nil_deal_id)
  where nil_deal_id is not null;

alter table public.recruiting_target_events enable row level security;

drop policy if exists recruiting_target_events_owner_all on public.recruiting_target_events;
create policy recruiting_target_events_owner_all
  on public.recruiting_target_events
  for all
  to authenticated
  using ((select auth.uid()) = scholar_id)
  with check ((select auth.uid()) = scholar_id);
