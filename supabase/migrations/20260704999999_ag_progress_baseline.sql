-- Historical bootstrap baseline for A-G progress persistence.
-- The subsequent 20260705_fix_ag_progress_upsert migration adds the canonical
-- (user_id, subject) uniqueness rule and RLS policies.

create table if not exists public.ag_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  subject text not null,
  subject_name text not null,
  years_required numeric not null default 1,
  years_completed numeric not null default 0,
  in_progress boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  courses_taken text[] default '{}'::text[],
  current_course text
);
