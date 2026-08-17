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

create or replace function public.record_recruiting_target_event()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.recruiting_target_events (
      scholar_id,
      recruiting_target_id,
      event_type,
      to_stage,
      summary
    ) values (
      new.scholar_id,
      new.id,
      'target_created',
      new.stage,
      'Recruiting target added'
    );
    return new;
  end if;

  if tg_op = 'UPDATE' and old.stage is distinct from new.stage then
    insert into public.recruiting_target_events (
      scholar_id,
      recruiting_target_id,
      event_type,
      from_stage,
      to_stage,
      summary
    ) values (
      new.scholar_id,
      new.id,
      'stage_change',
      old.stage,
      new.stage,
      'Recruiting stage updated'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists recruiting_target_event_trigger on public.recruiting_targets;
create trigger recruiting_target_event_trigger
after insert or update of stage on public.recruiting_targets
for each row execute function public.record_recruiting_target_event();
