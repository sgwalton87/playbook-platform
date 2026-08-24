-- Prevent profile INSERT policy self-reference recursion while preserving
-- owner-only upsert semantics for profile autosave.
create or replace function private.has_existing_profile_owner()
returns boolean
language sql
security definer
set search_path=''
set row_security = off
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
  );
$$;

revoke all on function private.has_existing_profile_owner() from public, anon, authenticated;
grant execute on function private.has_existing_profile_owner() to authenticated;

drop policy if exists "Existing profile owners can upsert safe fields"
  on public.profiles;
create policy "Existing profile owners can upsert safe fields"
on public.profiles
for insert
to authenticated
with check (
  id = (select auth.uid())
  and private.has_existing_profile_owner()
);
