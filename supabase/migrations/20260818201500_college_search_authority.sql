-- Production already contains legacy colleges and college_list tables that were
-- created before the repository's governed migration chain. Reconcile them here
-- so a zero-to-current replay and production converge on the same authority.
create table if not exists public.colleges (
  id uuid primary key default gen_random_uuid(),
  unit_id text,
  name text not null,
  city text,
  state text,
  school_url text,
  ownership text,
  highest_degree text,
  created_at timestamptz not null default now()
);

create table if not exists public.college_list (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  college_name text not null,
  college_type text,
  status text not null default 'considering',
  deadline date,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.colleges enable row level security;
alter table public.college_list enable row level security;

drop policy if exists "Public can view colleges" on public.colleges;
create policy "Public can view colleges"
on public.colleges for select to anon, authenticated
using (true);

drop policy if exists "Users manage own college_list" on public.college_list;
drop policy if exists "Scholars read own college list" on public.college_list;
drop policy if exists "Scholars create own college list" on public.college_list;
drop policy if exists "Scholars update own college list" on public.college_list;
drop policy if exists "Scholars delete own college list" on public.college_list;

create policy "Scholars read own college list"
on public.college_list for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Scholars create own college list"
on public.college_list for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Scholars update own college list"
on public.college_list for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Scholars delete own college list"
on public.college_list for delete to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.college_list from anon;
grant select, insert, update, delete on public.college_list to authenticated;

-- The college directory is non-sensitive reference data. Clients may read it,
-- but catalog mutation remains outside learner-facing authority.
revoke insert, update, delete, truncate, references, trigger on public.colleges from anon, authenticated;
grant select on public.colleges to anon, authenticated;

create unique index if not exists college_list_user_name_unique
  on public.college_list(user_id, college_name);
