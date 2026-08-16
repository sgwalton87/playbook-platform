-- Foundational identity baseline reconstructed from the live Playbook OS schema.
-- This migration restores the missing canonical origin for public.profiles so a
-- fresh local database can replay repository migrations deterministically.
--
-- IMPORTANT: public.profiles.role is TEXT in the hosted Playbook database. The
-- legacy member_role enum still exists for historical compatibility, but the
-- canonical profiles.role column must not be reconstructed as that enum.

create extension if not exists pgcrypto;

do $$ begin
  create type public.member_role as enum (
    'scholar_athlete',
    'mentor',
    'coach',
    'recruiter',
    'teacher',
    'admin',
    'parent',
    'member',
    'scholar',
    'scholar-athlete',
    'transition-youth',
    'college-admin',
    'other'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  full_name text,
  role text not null default 'scholar_athlete',
  avatar_url text,
  cover_url text,
  bio text,
  location text,
  school text,
  sport text,
  grad_year integer,
  gpa numeric,
  instagram text,
  twitter text,
  linkedin text,
  onboarding_complete boolean default false,
  coin_balance integer not null default 0,
  is_active boolean default true,
  last_seen timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  email text,
  profile_mode text
);

alter table public.profiles enable row level security;

drop policy if exists "Users view own profile" on public.profiles;
create policy "Users view own profile"
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
on public.profiles
for insert
to authenticated
with check (id = (select auth.uid()));

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

grant select, insert, update on public.profiles to authenticated;
