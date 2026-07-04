create table if not exists public.athlete_profiles (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null,
  sport text not null,
  position text,
  secondary_position text,
  graduation_year integer not null,
  governing_path text not null default 'undecided',
  recruiting_status text not null default 'exploring',
  highlight_url text,
  target_schools jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.athlete_eligibility_checks (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null,
  governing_body text not null,
  division text,
  ruleset_version text not null,
  source_url text,
  status text not null default 'needs_review',
  findings jsonb not null default '[]'::jsonb,
  checked_at timestamptz not null default now()
);

create table if not exists public.recruiting_targets (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null,
  school_name text not null,
  athletic_program text,
  division text,
  coach_name text,
  coach_email text,
  stage text not null default 'researching',
  next_action text,
  next_action_due_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.nil_deals (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null,
  brand_name text not null,
  opportunity_title text not null,
  stage text not null default 'lead',
  compensation_type text,
  compensation_amount numeric,
  deliverables jsonb not null default '[]'::jsonb,
  contract_status text not null default 'not_received',
  disclosure_status text not null default 'not_started',
  payment_status text not null default 'not_due',
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.athlete_financial_entries (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null,
  nil_deal_id uuid references public.nil_deals(id) on delete set null,
  entry_type text not null,
  amount numeric not null,
  category text not null,
  occurred_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.athlete_profiles enable row level security;
alter table public.athlete_eligibility_checks enable row level security;
alter table public.recruiting_targets enable row level security;
alter table public.nil_deals enable row level security;
alter table public.athlete_financial_entries enable row level security;
