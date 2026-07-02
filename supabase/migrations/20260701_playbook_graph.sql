-- Playbook Graph Foundation
-- This migration defines the first database layer for Playbook Record™, Living Evidence™, Trust Layer™, and Opportunity Engine™.

create table if not exists public.playbook_records (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  record_type text default 'scholar',
  status text default 'active',
  summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  record_id uuid references public.playbook_records(id) on delete cascade,
  title text not null,
  category text not null default 'other',
  description text,
  organization text,
  role text,
  start_date date,
  end_date date,
  visibility text default 'private',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  achievement_id uuid references public.achievements(id) on delete cascade,
  evidence_type text not null default 'other',
  title text not null,
  description text,
  url text,
  file_path text,
  source text,
  verified boolean default false,
  uploaded_at timestamptz default now()
);

create table if not exists public.verifications (
  id uuid primary key default gen_random_uuid(),
  achievement_id uuid references public.achievements(id) on delete cascade,
  status text default 'pending',
  verified_by uuid references public.profiles(id) on delete set null,
  verifier_role text,
  notes text,
  verified_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  achievement_id uuid references public.achievements(id) on delete cascade,
  prompt text,
  response text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.outcomes (
  id uuid primary key default gen_random_uuid(),
  achievement_id uuid references public.achievements(id) on delete cascade,
  outcome_type text not null default 'other',
  title text not null,
  description text,
  value text,
  outcome_date date,
  created_at timestamptz default now()
);

create table if not exists public.evidence_packs (
  id uuid primary key default gen_random_uuid(),
  achievement_id uuid references public.achievements(id) on delete cascade,
  title text not null,
  summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  record_id uuid references public.playbook_records(id) on delete cascade,
  achievement_id uuid references public.achievements(id) on delete set null,
  event_type text not null default 'achievement',
  title text not null,
  description text,
  event_date timestamptz,
  source text,
  verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.opportunity_matches (
  id uuid primary key default gen_random_uuid(),
  record_id uuid references public.playbook_records(id) on delete cascade,
  opportunity_type text not null,
  title text not null,
  description text,
  readiness_score integer default 0,
  reasons jsonb default '[]'::jsonb,
  next_steps jsonb default '[]'::jsonb,
  status text default 'recommended',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.trust_reports (
  id uuid primary key default gen_random_uuid(),
  record_id uuid references public.playbook_records(id) on delete cascade,
  trust_score integer default 0,
  trust_level text default 'activity',
  signals jsonb default '[]'::jsonb,
  missing jsonb default '[]'::jsonb,
  generated_at timestamptz default now()
);

create table if not exists public.scholar_vault_items (
  id uuid primary key default gen_random_uuid(),
  record_id uuid references public.playbook_records(id) on delete cascade,
  item_type text not null default 'document',
  title text not null,
  description text,
  file_path text,
  url text,
  visibility text default 'private',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

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
