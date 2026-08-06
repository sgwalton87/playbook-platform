create extension if not exists pgcrypto;

create table if not exists scholar_profiles (id uuid primary key references auth.users(id), display_name text not null, role text not null default 'SCHOLAR', onboarding_status text not null default 'STARTED', created_at timestamptz not null default now());
create table if not exists scholar_goals (id uuid primary key default gen_random_uuid(), scholar_id uuid not null references scholar_profiles(id), title text not null, status text not null default 'ACTIVE', provenance jsonb not null default '[]', created_at timestamptz not null default now());
create table if not exists scholar_milestones (id uuid primary key default gen_random_uuid(), scholar_id uuid not null references scholar_profiles(id), goal_id uuid references scholar_goals(id), milestone_type text not null, approval_id text, provenance jsonb not null default '[]', occurred_at timestamptz not null default now());

alter table scholar_profiles enable row level security;
alter table scholar_goals enable row level security;
alter table scholar_milestones enable row level security;
drop policy if exists "scholar-profile-own" on scholar_profiles;
drop policy if exists "scholar-goals-own" on scholar_goals;
drop policy if exists "scholar-milestones-own" on scholar_milestones;
create policy "scholar-profile-own" on scholar_profiles using (auth.uid() = id) with check (auth.uid() = id);
create policy "scholar-goals-own" on scholar_goals using (auth.uid() = scholar_id) with check (auth.uid() = scholar_id);
create policy "scholar-milestones-own" on scholar_milestones using (auth.uid() = scholar_id) with check (auth.uid() = scholar_id);
