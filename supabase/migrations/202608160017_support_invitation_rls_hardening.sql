-- Harden support_invitations against direct Data API privilege escalation.
-- Scholars may originate structurally valid invitations, but invitees may not
-- directly mutate invitation rows. Acceptance/decline remains atomic through
-- claim_support_invitation, whose implementation is moved behind a private
-- SECURITY DEFINER boundary with explicit identity and verification checks.

-- Replace the role-owner INSERT policy with a field-constrained contract.
drop policy if exists "Scholar Record owners can create support invitations"
  on public.support_invitations;

create policy "Scholar Record owners can create governed support invitations"
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
  and status = 'pending'
  and accepted_at is null
  and declined_at is null
  and length(trim(token)) >= 32
  and length(trim(invitee_email)) > 3
  and length(trim(invitee_name)) > 0
  and relationship in (
    'parent_guardian',
    'mentor',
    'coach',
    'educator',
    'counselor',
    'district_admin',
    'college_recruiter',
    'college_admissions',
    'community_partner',
    'employer_partner'
  )
  and permissions = case relationship
    when 'parent_guardian' then '["view_progress","view_deadlines","support_tasks"]'::jsonb
    when 'mentor' then '["view_progress","recommend_actions","support_tasks"]'::jsonb
    else '[]'::jsonb
  end
  and destination = case relationship
    when 'parent_guardian' then '/family-os'
    when 'mentor' then '/mentor-os'
    when 'coach' then '/coach-os'
    when 'educator' then '/educator-os'
    when 'counselor' then '/counselor-os'
    when 'district_admin' then '/district-os'
    when 'college_recruiter' then '/recruiting-os'
    when 'college_admissions' then '/admissions-os'
    when 'community_partner' then '/community-partner-os'
    when 'employer_partner' then '/employer-os'
    else ''
  end
);

-- Invitees may read their invitation but may not directly mutate status,
-- permissions, relationship, destination, or timestamps through the Data API.
drop policy if exists "Invitees can update their invitation status"
  on public.support_invitations;
revoke update on public.support_invitations from authenticated;

-- Optimize and consolidate invitation participant reads.
drop policy if exists "Scholars can view their invitations"
  on public.support_invitations;
drop policy if exists "Invitees can read invitations by email"
  on public.support_invitations;

drop policy if exists "Invitation participants can view invitations"
  on public.support_invitations;
create policy "Invitation participants can view invitations"
on public.support_invitations
for select
to authenticated
using (
  scholar_id = (select auth.uid())
  or lower(trim(invitee_email)) = lower(trim(coalesce((select auth.jwt()) ->> 'email', '')))
);

grant select, insert on public.support_invitations to authenticated;

-- Move the mature claim implementation out of the exposed public schema and
-- make it privileged only for the exact updates/inserts that it validates.
-- ALTER preserves the already-tested claim behavior from the preceding migration.
alter function public.claim_support_invitation(text, text) security definer;
alter function public.claim_support_invitation(text, text) set schema private;
alter function private.claim_support_invitation(text, text) set search_path = '';

revoke all on function private.claim_support_invitation(text, text) from public;
revoke all on function private.claim_support_invitation(text, text) from anon;
revoke all on function private.claim_support_invitation(text, text) from authenticated;

-- Authenticated public RPC wrapper. It is SECURITY INVOKER and contains no data
-- mutation capability of its own. The private implementation re-validates the
-- JWT identity, invitation email, pending state, role verification, permissions,
-- and supported relationship before mutating canonical state.
create or replace function public.claim_support_invitation(
  invitation_token text,
  desired_status text default 'accepted'
)
returns table (
  destination text,
  scholar_id uuid,
  invitee_name text,
  relationship text,
  status text,
  activation_state text,
  validation_request_id uuid
)
language sql
security invoker
set search_path = ''
as $$
  select *
    from private.claim_support_invitation(invitation_token, desired_status);
$$;

revoke all on function public.claim_support_invitation(text, text) from public;
revoke all on function public.claim_support_invitation(text, text) from anon;
grant execute on function public.claim_support_invitation(text, text) to authenticated;

-- The wrapper needs access to the private namespace/function, but private is not
-- an exposed Data API schema. No authenticated table access is granted there.
grant usage on schema private to authenticated;
grant execute on function private.claim_support_invitation(text, text) to authenticated;
