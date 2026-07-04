create table if not exists public.portfolio_shares (
  id uuid primary key default gen_random_uuid(),
  share_id text not null unique,
  scholar_id uuid not null,
  scholar_name text not null,
  target_use text not null,
  packet jsonb not null default '{}'::jsonb,
  status text not null default 'active'
    check (status in ('draft', 'active', 'expired', 'revoked')),
  expires_at timestamptz,
  view_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.recommender_requests (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null,
  scholar_name text not null,
  recommender_name text not null,
  recommender_email text not null,
  recommender_role text not null,
  opportunity_name text not null,
  evidence jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  letter_text text,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.application_workspaces (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null,
  opportunity_name text not null,
  opportunity_type text not null,
  deadline date,
  requirements jsonb not null default '[]'::jsonb,
  resume_version jsonb,
  essays jsonb not null default '[]'::jsonb,
  recommendation_request_ids jsonb not null default '[]'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  status text not null default 'building'
    check (status in ('building', 'ready', 'submitted', 'archived')),
  created_at timestamptz not null default now()
);

alter table public.portfolio_shares enable row level security;
alter table public.recommender_requests enable row level security;
alter table public.application_workspaces enable row level security;
