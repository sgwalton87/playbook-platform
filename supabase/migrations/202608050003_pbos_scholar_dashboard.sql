alter table scholar_goals add column if not exists idempotency_key text;
alter table scholar_milestones add column if not exists idempotency_key text;
create unique index if not exists scholar_goals_idempotency_idx on scholar_goals(idempotency_key);
create unique index if not exists scholar_milestones_idempotency_idx on scholar_milestones(idempotency_key);

create table if not exists scholar_dashboard_projections (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null references scholar_profiles(id),
  scholar_record_id uuid not null references scholar_profiles(id),
  goal_id uuid not null references scholar_goals(id),
  section_ids text[] not null default '{}',
  exchange_approval_id text not null,
  provenance jsonb not null default '[]',
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table scholar_dashboard_projections enable row level security;
drop policy if exists "scholar-dashboard-own" on scholar_dashboard_projections;
create policy "scholar-dashboard-own" on scholar_dashboard_projections
  using (auth.uid() = scholar_id) with check (auth.uid() = scholar_id);
create index if not exists scholar_dashboard_projections_scholar_idx on scholar_dashboard_projections(scholar_id, updated_at desc);
