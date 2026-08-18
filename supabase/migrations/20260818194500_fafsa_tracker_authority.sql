create table if not exists public.fafsa_tracker (
  user_id uuid primary key references auth.users(id) on delete cascade,
  award_year text not null check (award_year ~ '^[0-9]{4}-[0-9]{2}$'),
  status text not null default 'NOT_STARTED' check (status in ('NOT_STARTED','IN_PROGRESS','SUBMITTED','PROCESSED','ACTION_REQUIRED','COMPLETE')),
  fsa_id_ready boolean not null default false,
  contributors_ready boolean not null default false,
  finances_ready boolean not null default false,
  schools_added boolean not null default false,
  signature_ready boolean not null default false,
  submitted_at timestamptz,
  processed_at timestamptz,
  student_aid_index numeric,
  next_action text,
  notes text,
  source text not null default 'SCHOLAR_SELF_REPORTED' check (source in ('SCHOLAR_SELF_REPORTED','COUNSELOR_CONFIRMED','DOCUMENT_CONFIRMED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fafsa_tracker enable row level security;

drop policy if exists "Scholars read own FAFSA tracker" on public.fafsa_tracker;
create policy "Scholars read own FAFSA tracker" on public.fafsa_tracker
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Scholars create own FAFSA tracker" on public.fafsa_tracker;
create policy "Scholars create own FAFSA tracker" on public.fafsa_tracker
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Scholars update own FAFSA tracker" on public.fafsa_tracker;
create policy "Scholars update own FAFSA tracker" on public.fafsa_tracker
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.fafsa_tracker from anon;
grant select, insert, update on public.fafsa_tracker to authenticated;

create index if not exists fafsa_tracker_status_idx on public.fafsa_tracker(status, updated_at desc);
