-- Governed moderation authority for Platform Founder/Admin roles.
-- This does not grant generic platform-admin access to profiles or unrelated data.

create or replace function private.current_user_is_platform_moderator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.profiles
     where id = auth.uid()
       and role in ('founder', 'admin')
  );
$$;

revoke all on function private.current_user_is_platform_moderator() from public;
revoke all on function private.current_user_is_platform_moderator() from anon;
revoke all on function private.current_user_is_platform_moderator() from authenticated;

drop policy if exists "Platform moderators can review reports" on public.moderation_reports;
create policy "Platform moderators can review reports"
on public.moderation_reports
for select
to authenticated
using ((select private.current_user_is_platform_moderator()));

drop policy if exists "Platform moderators can update reports" on public.moderation_reports;
create policy "Platform moderators can update reports"
on public.moderation_reports
for update
to authenticated
using ((select private.current_user_is_platform_moderator()))
with check (
  (select private.current_user_is_platform_moderator())
  and status in ('reviewing', 'resolved', 'dismissed')
  and reviewed_by = (select auth.uid())
  and reviewed_at is not null
);

drop policy if exists "Platform moderators can record moderation actions" on public.moderation_actions;
create policy "Platform moderators can record moderation actions"
on public.moderation_actions
for insert
to authenticated
with check (
  (select private.current_user_is_platform_moderator())
  and moderator_id = (select auth.uid())
);

drop policy if exists "Platform moderators can view moderation actions" on public.moderation_actions;
create policy "Platform moderators can view moderation actions"
on public.moderation_actions
for select
to authenticated
using ((select private.current_user_is_platform_moderator()));
