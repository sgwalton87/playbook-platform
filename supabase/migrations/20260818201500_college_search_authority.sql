alter table public.colleges enable row level security;
alter table public.college_list enable row level security;

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

-- The public college directory is non-sensitive reference data. Keep read access
-- public while preventing clients from mutating the canonical catalog.
revoke insert, update, delete, truncate, references, trigger on public.colleges from anon, authenticated;
grant select on public.colleges to anon, authenticated;

create unique index if not exists college_list_user_name_unique
  on public.college_list(user_id, lower(college_name));
