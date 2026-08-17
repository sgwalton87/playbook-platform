-- Canonical recruiting visits + append-only offer evidence.
-- Recruiting targets remain the school/program pipeline owner. Timeline events are
-- derived history and never replace the visit/offer source records introduced here.

create table if not exists public.recruiting_visits (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null references public.profiles(id) on delete cascade,
  recruiting_target_id uuid not null references public.recruiting_targets(id) on delete cascade,
  visit_kind text not null check (visit_kind in (
    'official','unofficial','camp_showcase','game_event','virtual','other'
  )),
  status text not null default 'planned' check (status in (
    'planned','confirmed','completed','cancelled'
  )),
  scheduled_start timestamptz not null,
  scheduled_end timestamptz,
  location text,
  notes text,
  provenance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recruiting_visits_time_order check (
    scheduled_end is null or scheduled_end >= scheduled_start
  ),
  constraint recruiting_visits_notes_length check (
    notes is null or length(notes) <= 4000
  )
);

create index if not exists recruiting_visits_scholar_schedule_idx
  on public.recruiting_visits(scholar_id, scheduled_start desc);
create index if not exists recruiting_visits_target_schedule_idx
  on public.recruiting_visits(recruiting_target_id, scheduled_start desc);

create table if not exists public.recruiting_offers (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null references public.profiles(id) on delete cascade,
  recruiting_target_id uuid not null references public.recruiting_targets(id) on delete cascade,
  offer_kind text not null check (offer_kind in (
    'verbal','written','athletic_aid','roster_opportunity','walk_on','other'
  )),
  offer_status text not null default 'received' check (offer_status in (
    'received','considering','accepted','declined','withdrawn'
  )),
  offered_at date not null default current_date,
  terms_summary text,
  source_label text,
  source_url text,
  athlete_evidence_id uuid references public.athlete_evidence(id) on delete restrict,
  verification_state text not null default 'self_reported' check (verification_state in (
    'self_reported','submitted','verified','rejected'
  )),
  verified_by uuid,
  verified_at timestamptz,
  verification_note text,
  supersedes_offer_id uuid references public.recruiting_offers(id) on delete restrict,
  provenance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint recruiting_offers_terms_length check (
    terms_summary is null or length(terms_summary) <= 4000
  ),
  constraint recruiting_offers_source_url_length check (
    source_url is null or length(source_url) <= 2048
  ),
  constraint recruiting_offers_verification_consistency check (
    (verification_state in ('verified','rejected') and verified_by is not null and verified_at is not null)
    or (verification_state in ('self_reported','submitted'))
  )
);

create index if not exists recruiting_offers_scholar_date_idx
  on public.recruiting_offers(scholar_id, offered_at desc, created_at desc);
create index if not exists recruiting_offers_target_date_idx
  on public.recruiting_offers(recruiting_target_id, offered_at desc, created_at desc);
create index if not exists recruiting_offers_supersedes_idx
  on public.recruiting_offers(supersedes_offer_id)
  where supersedes_offer_id is not null;
create index if not exists recruiting_offers_evidence_idx
  on public.recruiting_offers(athlete_evidence_id)
  where athlete_evidence_id is not null;

alter table public.recruiting_visits enable row level security;
alter table public.recruiting_offers enable row level security;

revoke all on public.recruiting_visits from anon, authenticated;
revoke all on public.recruiting_offers from anon, authenticated;
grant select, insert, update on public.recruiting_visits to authenticated;
grant select, insert on public.recruiting_offers to authenticated;

drop policy if exists recruiting_visits_owner_select on public.recruiting_visits;
create policy recruiting_visits_owner_select
  on public.recruiting_visits for select to authenticated
  using ((select auth.uid()) = scholar_id);

drop policy if exists recruiting_visits_owner_insert on public.recruiting_visits;
create policy recruiting_visits_owner_insert
  on public.recruiting_visits for insert to authenticated
  with check ((select auth.uid()) = scholar_id);

drop policy if exists recruiting_visits_owner_update on public.recruiting_visits;
create policy recruiting_visits_owner_update
  on public.recruiting_visits for update to authenticated
  using ((select auth.uid()) = scholar_id)
  with check ((select auth.uid()) = scholar_id);

drop policy if exists recruiting_offers_owner_select on public.recruiting_offers;
create policy recruiting_offers_owner_select
  on public.recruiting_offers for select to authenticated
  using ((select auth.uid()) = scholar_id);

drop policy if exists recruiting_offers_owner_insert on public.recruiting_offers;
create policy recruiting_offers_owner_insert
  on public.recruiting_offers for insert to authenticated
  with check ((select auth.uid()) = scholar_id);

create or replace function private.validate_recruiting_visit()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.recruiting_targets target
     where target.id = new.recruiting_target_id
       and target.scholar_id = new.scholar_id
  ) then
    raise exception 'Recruiting visit target must belong to the same Scholar.' using errcode = '42501';
  end if;

  if new.scheduled_end is not null and new.scheduled_end < new.scheduled_start then
    raise exception 'Visit end cannot be before visit start.' using errcode = '22023';
  end if;

  new.provenance := coalesce(new.provenance, '{}'::jsonb)
    || jsonb_build_object('record_kind','scholar_recruiting_visit');
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.validate_recruiting_visit() from public, anon, authenticated;

drop trigger if exists recruiting_visit_guard on public.recruiting_visits;
create trigger recruiting_visit_guard
before insert or update on public.recruiting_visits
for each row execute function private.validate_recruiting_visit();

create or replace function private.validate_recruiting_offer()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  evidence_row public.athlete_evidence%rowtype;
  prior_row public.recruiting_offers%rowtype;
begin
  if not exists (
    select 1 from public.recruiting_targets target
     where target.id = new.recruiting_target_id
       and target.scholar_id = new.scholar_id
  ) then
    raise exception 'Recruiting offer target must belong to the same Scholar.' using errcode = '42501';
  end if;

  if new.athlete_evidence_id is not null then
    select * into evidence_row from public.athlete_evidence where id = new.athlete_evidence_id;
    if evidence_row.id is null or evidence_row.scholar_id <> new.scholar_id then
      raise exception 'Linked athletic evidence must belong to the same Scholar.' using errcode = '42501';
    end if;
  end if;

  if new.supersedes_offer_id is not null then
    select * into prior_row from public.recruiting_offers where id = new.supersedes_offer_id;
    if prior_row.id is null
       or prior_row.scholar_id <> new.scholar_id
       or prior_row.recruiting_target_id <> new.recruiting_target_id then
      raise exception 'Superseded offer must match Scholar and recruiting target.' using errcode = '22023';
    end if;
  end if;

  -- Direct Scholar insertion is always a claim, never independent verification.
  new.verification_state := 'self_reported';
  new.verified_by := null;
  new.verified_at := null;
  new.verification_note := null;
  new.provenance := coalesce(new.provenance, '{}'::jsonb)
    || jsonb_build_object('record_kind','scholar_reported_recruiting_offer');
  return new;
end;
$$;

revoke all on function private.validate_recruiting_offer() from public, anon, authenticated;

drop trigger if exists recruiting_offer_guard on public.recruiting_offers;
create trigger recruiting_offer_guard
before insert on public.recruiting_offers
for each row execute function private.validate_recruiting_offer();

create or replace function private.project_recruiting_visit_timeline()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  event_kind text;
  event_summary text;
begin
  if tg_op = 'INSERT' then
    event_kind := 'visit_scheduled';
    event_summary := 'Recruiting visit recorded: ' || replace(new.visit_kind, '_', ' ') || ' · ' || new.status;
  elsif old.status is distinct from new.status
     or old.scheduled_start is distinct from new.scheduled_start
     or old.scheduled_end is distinct from new.scheduled_end then
    event_kind := 'visit_updated';
    event_summary := 'Recruiting visit updated: ' || replace(new.visit_kind, '_', ' ') || ' · ' || new.status;
  else
    return new;
  end if;

  insert into public.recruiting_target_events (
    scholar_id, recruiting_target_id, event_type, summary, occurred_at
  ) values (
    new.scholar_id, new.recruiting_target_id, event_kind, event_summary, now()
  );
  return new;
end;
$$;

revoke all on function private.project_recruiting_visit_timeline() from public, anon, authenticated;

drop trigger if exists recruiting_visit_timeline_projection on public.recruiting_visits;
create trigger recruiting_visit_timeline_projection
after insert or update on public.recruiting_visits
for each row execute function private.project_recruiting_visit_timeline();

create or replace function private.project_recruiting_offer_timeline()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.recruiting_target_events (
    scholar_id, recruiting_target_id, event_type, summary, occurred_at
  ) values (
    new.scholar_id,
    new.recruiting_target_id,
    'offer_recorded',
    'Scholar recorded a recruiting offer claim: ' || replace(new.offer_kind, '_', ' ') || ' · ' || new.offer_status,
    now()
  );
  return new;
end;
$$;

revoke all on function private.project_recruiting_offer_timeline() from public, anon, authenticated;

drop trigger if exists recruiting_offer_timeline_projection on public.recruiting_offers;
create trigger recruiting_offer_timeline_projection
after insert on public.recruiting_offers
for each row execute function private.project_recruiting_offer_timeline();

comment on table public.recruiting_visits is
  'Scholar-owned recruiting visit logistics tied to canonical recruiting targets. Visit records may project timeline history but remain the canonical visit owner.';
comment on table public.recruiting_offers is
  'Append-only Scholar recruiting offer claims with provenance and correction links. Direct Scholar entry is self-reported and is never independent verification or an admissions/aid/eligibility determination.';
