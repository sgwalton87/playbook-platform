alter table public.athlete_eligibility_checks
  add column if not exists ruleset_id uuid references public.athlete_eligibility_rulesets(id) on delete restrict,
  add column if not exists check_kind text not null default 'advisory_readiness' check (check_kind in ('advisory_readiness')),
  add column if not exists readiness_score numeric check (readiness_score is null or (readiness_score >= 0 and readiness_score <= 100)),
  add column if not exists verified_readiness_score numeric check (verified_readiness_score is null or (verified_readiness_score >= 0 and verified_readiness_score <= 100)),
  add column if not exists provenance jsonb not null default '{}'::jsonb;

alter table public.athlete_eligibility_checks
  alter column ruleset_id set not null;

create index if not exists athlete_eligibility_checks_ruleset_idx
  on public.athlete_eligibility_checks (ruleset_id, scholar_id, checked_at desc);

drop policy if exists athlete_eligibility_checks_owner_all on public.athlete_eligibility_checks;
drop policy if exists athlete_eligibility_checks_owner_select on public.athlete_eligibility_checks;
create policy athlete_eligibility_checks_owner_select
  on public.athlete_eligibility_checks
  for select
  to authenticated
  using ((select auth.uid()) = scholar_id);

revoke insert, update, delete on public.athlete_eligibility_checks from authenticated;
grant select on public.athlete_eligibility_checks to authenticated;

create table if not exists public.athlete_eligibility_requirement_evidence (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null,
  ruleset_id uuid not null references public.athlete_eligibility_rulesets(id) on delete restrict,
  requirement_key text not null,
  reported_state text not null check (reported_state in ('complete','incomplete')),
  athlete_evidence_id uuid references public.athlete_evidence(id) on delete restrict,
  note text,
  observed_at date not null default current_date,
  supersedes_id uuid references public.athlete_eligibility_requirement_evidence(id) on delete restrict,
  provenance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists athlete_eligibility_requirement_evidence_lookup_idx
  on public.athlete_eligibility_requirement_evidence (scholar_id, ruleset_id, requirement_key, observed_at desc, created_at desc);
create index if not exists athlete_eligibility_requirement_evidence_link_idx
  on public.athlete_eligibility_requirement_evidence (athlete_evidence_id)
  where athlete_evidence_id is not null;
create index if not exists athlete_eligibility_requirement_evidence_supersedes_idx
  on public.athlete_eligibility_requirement_evidence (supersedes_id)
  where supersedes_id is not null;

alter table public.athlete_eligibility_requirement_evidence enable row level security;
revoke all on public.athlete_eligibility_requirement_evidence from anon, authenticated;
grant select, insert on public.athlete_eligibility_requirement_evidence to authenticated;

drop policy if exists athlete_eligibility_requirement_evidence_owner_select on public.athlete_eligibility_requirement_evidence;
create policy athlete_eligibility_requirement_evidence_owner_select
  on public.athlete_eligibility_requirement_evidence
  for select
  to authenticated
  using ((select auth.uid()) = scholar_id);

drop policy if exists athlete_eligibility_requirement_evidence_owner_insert on public.athlete_eligibility_requirement_evidence;
create policy athlete_eligibility_requirement_evidence_owner_insert
  on public.athlete_eligibility_requirement_evidence
  for insert
  to authenticated
  with check ((select auth.uid()) = scholar_id);

create or replace function public.validate_athlete_eligibility_requirement_evidence()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  linked_evidence public.athlete_evidence%rowtype;
  prior_evidence public.athlete_eligibility_requirement_evidence%rowtype;
  requirement_exists boolean := false;
begin
  select exists (
    select 1
    from public.athlete_eligibility_rulesets r
    where r.id = new.ruleset_id
      and jsonb_path_exists(
        r.requirements_json,
        '$.** ? (@.key == $requested_key)',
        jsonb_build_object('requested_key', new.requirement_key)
      )
  ) into requirement_exists;

  if not requirement_exists then
    raise exception 'requirement key is not present in the selected eligibility ruleset' using errcode = '22023';
  end if;

  if new.athlete_evidence_id is not null then
    select * into linked_evidence
      from public.athlete_evidence
     where id = new.athlete_evidence_id;

    if linked_evidence.id is null or linked_evidence.scholar_id <> new.scholar_id then
      raise exception 'linked athletic evidence must belong to the same Scholar' using errcode = '42501';
    end if;
  end if;

  if new.supersedes_id is not null then
    select * into prior_evidence
      from public.athlete_eligibility_requirement_evidence
     where id = new.supersedes_id;

    if prior_evidence.id is null
       or prior_evidence.scholar_id <> new.scholar_id
       or prior_evidence.ruleset_id <> new.ruleset_id
       or prior_evidence.requirement_key <> new.requirement_key then
      raise exception 'superseded requirement evidence must match Scholar, ruleset, and requirement' using errcode = '22023';
    end if;
  end if;

  new.provenance := coalesce(new.provenance, '{}'::jsonb) || jsonb_build_object(
    'entry_kind', 'scholar_reported_requirement_evidence'
  );

  return new;
end;
$$;

drop trigger if exists athlete_eligibility_requirement_evidence_guard on public.athlete_eligibility_requirement_evidence;
create trigger athlete_eligibility_requirement_evidence_guard
before insert on public.athlete_eligibility_requirement_evidence
for each row execute function public.validate_athlete_eligibility_requirement_evidence();

comment on table public.athlete_eligibility_requirement_evidence is
  'Append-only Scholar reports about source-backed eligibility requirements. A report is not an official eligibility determination; linked verified athletic evidence may strengthen evidence quality but does not grant governing-body certification.';
comment on table public.athlete_eligibility_checks is
  'Ruleset-bound derived advisory readiness snapshots. Scholars may read their checks but cannot directly create, update, or delete derived eligibility interpretations.';