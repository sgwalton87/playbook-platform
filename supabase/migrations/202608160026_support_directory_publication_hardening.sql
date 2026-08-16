-- Support directory publication hardening.
-- Users may maintain their own directory evidence but may not self-publish it as
-- searchable authority. Search publication requires a future governed verifier.

-- Searchable profiles remain readable by authenticated users; owners may read
-- their own unpublished evidence.
drop policy if exists "Read searchable directory" on public.support_directory_profiles;
create policy "Read searchable directory"
on public.support_directory_profiles
for select
to authenticated
using (searchable is true or user_id = (select auth.uid()));

-- Direct self-management is restricted to unpublished evidence. This prevents a
-- client from bypassing the API and turning role identity into public authority.
drop policy if exists "Users manage own directory profile" on public.support_directory_profiles;
create policy "Users manage unpublished directory evidence"
on public.support_directory_profiles
for all
to authenticated
using (user_id = (select auth.uid()))
with check (
  user_id = (select auth.uid())
  and searchable is false
);
