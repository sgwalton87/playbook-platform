-- A support-system invitation is authority-bearing. It may only originate from
-- the authenticated owner of a self-owned Scholar Record role. This replaces
-- the earlier ownership-only insert policy, which did not distinguish Scholar
-- accounts from unrelated authenticated roles.

drop policy if exists "Users can create support invitations"
  on public.support_invitations;

create policy "Scholar Record owners can create support invitations"
on public.support_invitations
for insert
to authenticated
with check (
  scholar_id = (select auth.uid())
  and exists (
    select 1
      from public.profiles as profile
     where profile.id = (select auth.uid())
       and coalesce(profile.profile_mode, profile.role, profile.requested_role)
         in ('scholar', 'scholar-athlete', 'transition-youth')
  )
);

grant insert on public.support_invitations to authenticated;
