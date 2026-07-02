-- Playbook Graph v1.0
-- Production-grade foundation for Playbook Record™, Living Evidence™, Trust Layer™, Scholar Vault™, and Opportunity Engine™.

create extension if not exists pgcrypto;

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Enums
do $$ begin
  create type public.playbook_record_type as enum ('scholar','scholar_athlete','parent','mentor','coach','educator','organization','alumni','admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.record_status as enum ('active','inactive','archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.achievement_category as enum ('academic','athletic','career','service','leadership','financial_literacy','entrepreneurship','creative','civic','personal_growth','other');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.visibility_level as enum ('private','school','network','public');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.evidence_type as enum ('document','photo','video','link','certificate','transcript','recommendation','media','other');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.verification_status as enum ('unverified','pending','verified','rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.trust_level as enum ('activity','achievement','evidence','verification','outcome','impact');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.vault_item_type as enum ('document','photo','video','transcript','certificate','recommendation','media','other');
exception when duplicate_object then null;
end $$;

-- Tables
create table if not exists public.playbook_records (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  record_type public.playbook_record_type default 'scholar',
  status public.record_status default 'active',
  summary text,
  metadata jsonb default '{}'::jsonb,
  ai_context jsonb default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.playbook_records(id) on delete cascade,
  title text not null,
  category public.achievement_category not null default 'other',
  description text,
  organization text,
  role text,
  start_date date,
  end_date date,
  visibility public.visibility_level default 'private',
  metadata jsonb default '{}'::jsonb,
  ai_context jsonb default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  evidence_type public.evidence_type not null default 'other',
  title text not null,
  description text,
  url text,
  file_path text,
  storage_bucket text default 'scholar-vault',
  storage_object_path text,
  source text,
  verified boolean default false,
  metadata jsonb default '{}'::jsonb,
  ai_context jsonb default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  uploaded_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists public.verifications (
  id uuid primary key default gen_random_uuid(),
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  status public.verification_status default 'pending',
  verified_by uuid references public.profiles(id) on delete set null,
  verifier_role text,
  notes text,
  metadata jsonb default '{}'::jsonb,
  ai_context jsonb default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  prompt text,
  response text not null,
  metadata jsonb default '{}'::jsonb,
  ai_context jsonb default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists public.outcomes (
  id uuid primary key default gen_random_uuid(),
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  outcome_type text not null default 'other',
  title text not null,
  description text,
  value text,
  outcome_date date,
  metadata jsonb default '{}'::jsonb,
  ai_context jsonb default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists public.evidence_packs (
  id uuid primary key default gen_random_uuid(),
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  title text not null,
  summary text,
  metadata jsonb default '{}'::jsonb,
  ai_context jsonb default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.playbook_records(id) on delete cascade,
  achievement_id uuid references public.achievements(id) on delete set null,
  event_type text not null default 'achievement',
  title text not null,
  description text,
  event_date timestamptz,
  source text,
  verified boolean default false,
  metadata jsonb default '{}'::jsonb,
  ai_context jsonb default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists public.opportunity_matches (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.playbook_records(id) on delete cascade,
  opportunity_type text not null,
  title text not null,
  description text,
  readiness_score integer default 0,
  reasons jsonb default '[]'::jsonb,
  next_steps jsonb default '[]'::jsonb,
  status text default 'recommended',
  metadata jsonb default '{}'::jsonb,
  ai_context jsonb default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists public.trust_reports (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.playbook_records(id) on delete cascade,
  trust_score integer default 0,
  trust_level public.trust_level default 'activity',
  signals jsonb default '[]'::jsonb,
  missing jsonb default '[]'::jsonb,
  metadata jsonb default '{}'::jsonb,
  ai_context jsonb default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  generated_at timestamptz default now(),
  created_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists public.scholar_vault_items (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.playbook_records(id) on delete cascade,
  item_type public.vault_item_type not null default 'document',
  title text not null,
  description text,
  file_path text,
  storage_bucket text default 'scholar-vault',
  storage_object_path text,
  url text,
  visibility public.visibility_level default 'private',
  metadata jsonb default '{}'::jsonb,
  ai_context jsonb default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- Indexes
create index if not exists idx_playbook_records_profile_id on public.playbook_records(profile_id);
create index if not exists idx_achievements_record_id on public.achievements(record_id);
create index if not exists idx_evidence_achievement_id on public.evidence(achievement_id);
create index if not exists idx_verifications_achievement_id on public.verifications(achievement_id);
create index if not exists idx_reflections_achievement_id on public.reflections(achievement_id);
create index if not exists idx_outcomes_achievement_id on public.outcomes(achievement_id);
create index if not exists idx_evidence_packs_achievement_id on public.evidence_packs(achievement_id);
create index if not exists idx_timeline_events_record_id on public.timeline_events(record_id);
create index if not exists idx_timeline_events_achievement_id on public.timeline_events(achievement_id);
create index if not exists idx_opportunity_matches_record_id on public.opportunity_matches(record_id);
create index if not exists idx_trust_reports_record_id on public.trust_reports(record_id);
create index if not exists idx_scholar_vault_items_record_id on public.scholar_vault_items(record_id);

-- updated_at triggers
drop trigger if exists set_playbook_records_updated_at on public.playbook_records;
create trigger set_playbook_records_updated_at before update on public.playbook_records for each row execute function public.set_updated_at();

drop trigger if exists set_achievements_updated_at on public.achievements;
create trigger set_achievements_updated_at before update on public.achievements for each row execute function public.set_updated_at();

drop trigger if exists set_evidence_updated_at on public.evidence;
create trigger set_evidence_updated_at before update on public.evidence for each row execute function public.set_updated_at();

drop trigger if exists set_verifications_updated_at on public.verifications;
create trigger set_verifications_updated_at before update on public.verifications for each row execute function public.set_updated_at();

drop trigger if exists set_reflections_updated_at on public.reflections;
create trigger set_reflections_updated_at before update on public.reflections for each row execute function public.set_updated_at();

drop trigger if exists set_outcomes_updated_at on public.outcomes;
create trigger set_outcomes_updated_at before update on public.outcomes for each row execute function public.set_updated_at();

drop trigger if exists set_evidence_packs_updated_at on public.evidence_packs;
create trigger set_evidence_packs_updated_at before update on public.evidence_packs for each row execute function public.set_updated_at();

drop trigger if exists set_timeline_events_updated_at on public.timeline_events;
create trigger set_timeline_events_updated_at before update on public.timeline_events for each row execute function public.set_updated_at();

drop trigger if exists set_opportunity_matches_updated_at on public.opportunity_matches;
create trigger set_opportunity_matches_updated_at before update on public.opportunity_matches for each row execute function public.set_updated_at();

drop trigger if exists set_scholar_vault_items_updated_at on public.scholar_vault_items;
create trigger set_scholar_vault_items_updated_at before update on public.scholar_vault_items for each row execute function public.set_updated_at();

-- RLS
alter table public.playbook_records enable row level security;
alter table public.achievements enable row level security;
alter table public.evidence enable row level security;
alter table public.verifications enable row level security;
alter table public.reflections enable row level security;
alter table public.outcomes enable row level security;
alter table public.evidence_packs enable row level security;
alter table public.timeline_events enable row level security;
alter table public.opportunity_matches enable row level security;
alter table public.trust_reports enable row level security;
alter table public.scholar_vault_items enable row level security;

-- Basic owner policies

create policy if not exists "Users can manage own playbook records"
on public.playbook_records
for all
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create policy if not exists "Users can manage own achievements"
on public.achievements
for all
using (
  exists (
    select 1 from public.playbook_records r
    where r.id = achievements.record_id
    and r.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.playbook_records r
    where r.id = achievements.record_id
    and r.profile_id = auth.uid()
  )
);

create policy if not exists "Users can manage own evidence"
on public.evidence
for all
using (
  exists (
    select 1 from public.achievements a
    join public.playbook_records r on r.id = a.record_id
    where a.id = evidence.achievement_id
    and r.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.achievements a
    join public.playbook_records r on r.id = a.record_id
    where a.id = evidence.achievement_id
    and r.profile_id = auth.uid()
  )
);

create policy if not exists "Users can manage own verifications"
on public.verifications
for all
using (
  exists (
    select 1 from public.achievements a
    join public.playbook_records r on r.id = a.record_id
    where a.id = verifications.achievement_id
    and r.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.achievements a
    join public.playbook_records r on r.id = a.record_id
    where a.id = verifications.achievement_id
    and r.profile_id = auth.uid()
  )
);

create policy if not exists "Users can manage own reflections"
on public.reflections
for all
using (
  exists (
    select 1 from public.achievements a
    join public.playbook_records r on r.id = a.record_id
    where a.id = reflections.achievement_id
    and r.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.achievements a
    join public.playbook_records r on r.id = a.record_id
    where a.id = reflections.achievement_id
    and r.profile_id = auth.uid()
  )
);

create policy if not exists "Users can manage own outcomes"
on public.outcomes
for all
using (
  exists (
    select 1 from public.achievements a
    join public.playbook_records r on r.id = a.record_id
    where a.id = outcomes.achievement_id
    and r.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.achievements a
    join public.playbook_records r on r.id = a.record_id
    where a.id = outcomes.achievement_id
    and r.profile_id = auth.uid()
  )
);

create policy if not exists "Users can manage own evidence packs"
on public.evidence_packs
for all
using (
  exists (
    select 1 from public.achievements a
    join public.playbook_records r on r.id = a.record_id
    where a.id = evidence_packs.achievement_id
    and r.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.achievements a
    join public.playbook_records r on r.id = a.record_id
    where a.id = evidence_packs.achievement_id
    and r.profile_id = auth.uid()
  )
);

create policy if not exists "Users can manage own timeline events"
on public.timeline_events
for all
using (
  exists (
    select 1 from public.playbook_records r
    where r.id = timeline_events.record_id
    and r.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.playbook_records r
    where r.id = timeline_events.record_id
    and r.profile_id = auth.uid()
  )
);

create policy if not exists "Users can manage own opportunity matches"
on public.opportunity_matches
for all
using (
  exists (
    select 1 from public.playbook_records r
    where r.id = opportunity_matches.record_id
    and r.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.playbook_records r
    where r.id = opportunity_matches.record_id
    and r.profile_id = auth.uid()
  )
);

create policy if not exists "Users can manage own trust reports"
on public.trust_reports
for all
using (
  exists (
    select 1 from public.playbook_records r
    where r.id = trust_reports.record_id
    and r.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.playbook_records r
    where r.id = trust_reports.record_id
    and r.profile_id = auth.uid()
  )
);

create policy if not exists "Users can manage own vault items"
on public.scholar_vault_items
for all
using (
  exists (
    select 1 from public.playbook_records r
    where r.id = scholar_vault_items.record_id
    and r.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.playbook_records r
    where r.id = scholar_vault_items.record_id
    and r.profile_id = auth.uid()
  )
);
