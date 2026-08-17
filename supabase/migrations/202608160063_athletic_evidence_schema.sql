create table if not exists public.athlete_evidence (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null,
  sport text not null,
  category text not null check (category in (
    'measurement',
    'statistic',
    'competition_result',
    'award',
    'film',
    'other'
  )),
  metric_name text not null,
  value_text text,
  value_numeric numeric,
  unit text,
  context jsonb not null default '{}'::jsonb,
  observed_at date not null,
  source_type text not null default 'self_reported' check (source_type in (
    'self_reported',
    'document',
    'link',
    'coach',
    'official_result',
    'third_party',
    'other'
  )),
  source_label text,
  source_url text,
  verification_state text not null default 'self_reported' check (verification_state in (
    'self_reported',
    'submitted',
    'verified',
    'rejected',
    'superseded'
  )),
  verified_by uuid,
  verified_at timestamptz,
  verification_note text,
  supersedes_evidence_id uuid references public.athlete_evidence(id) on delete restrict,
  provenance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint athlete_evidence_has_value check (
    value_text is not null or value_numeric is not null
  ),
  constraint athlete_evidence_verified_state_consistent check (
    verification_state <> 'verified'
    or (verified_by is not null and verified_at is not null)
  )
);

create index if not exists athlete_evidence_scholar_observed_idx
  on public.athlete_evidence (scholar_id, observed_at desc, created_at desc);

create index if not exists athlete_evidence_scholar_sport_idx
  on public.athlete_evidence (scholar_id, sport, category, observed_at desc);

create index if not exists athlete_evidence_supersedes_idx
  on public.athlete_evidence (supersedes_evidence_id)
  where supersedes_evidence_id is not null;

alter table public.athlete_evidence enable row level security;

drop policy if exists athlete_evidence_owner_select on public.athlete_evidence;
create policy athlete_evidence_owner_select
  on public.athlete_evidence
  for select
  to authenticated
  using ((select auth.uid()) = scholar_id);

drop policy if exists athlete_evidence_owner_insert_self_reported on public.athlete_evidence;
create policy athlete_evidence_owner_insert_self_reported
  on public.athlete_evidence
  for insert
  to authenticated
  with check (
    (select auth.uid()) = scholar_id
    and verification_state = 'self_reported'
    and verified_by is null
    and verified_at is null
    and verification_note is null
  );

create or replace function public.validate_athlete_evidence_supersession()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.supersedes_evidence_id is not null then
    if not exists (
      select 1
      from public.athlete_evidence prior
      where prior.id = new.supersedes_evidence_id
        and prior.scholar_id = new.scholar_id
    ) then
      raise exception 'Superseded athletic evidence must belong to the same Scholar';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists athlete_evidence_supersession_guard on public.athlete_evidence;
create trigger athlete_evidence_supersession_guard
before insert on public.athlete_evidence
for each row execute function public.validate_athlete_evidence_supersession();

comment on table public.athlete_evidence is
  'Append-only Scholar-owned athletic evidence. Direct Scholar writes are self-reported only; verification authority is intentionally fail-closed pending a governed verification workflow.';
