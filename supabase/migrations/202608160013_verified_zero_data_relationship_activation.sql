-- Verified external/support relationship activation.
-- Relationship identity is not data authority: every relationship created by
-- this migration carries an empty permission set and exists only after the
-- role's independent verification contract is approved.

create or replace function public.verified_zero_data_relationship_ready(
  relationship_kind text,
  user_id uuid
)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select case relationship_kind
    when 'educator' then exists (
      select 1 from public.profiles p
      join public.educator_verification_requests v on v.educator_user_id = p.id
      where p.id = user_id
        and coalesce(p.profile_mode,p.role,p.requested_role) = 'educator'
        and p.onboarding_completed = true
        and v.status = 'approved'
    )
    when 'counselor' then exists (
      select 1 from public.profiles p
      join public.counselor_verification_requests v on v.counselor_user_id = p.id
      where p.id = user_id
        and coalesce(p.profile_mode,p.role,p.requested_role) = 'high-school-counselor'
        and p.onboarding_completed = true
        and v.status = 'approved'
    )
    when 'district_admin' then exists (
      select 1 from public.profiles p
      join public.district_verification_requests v on v.administrator_user_id = p.id
      where p.id = user_id
        and coalesce(p.profile_mode,p.role,p.requested_role) = 'district'
        and p.onboarding_completed = true
        and v.status = 'approved'
    )
    when 'college_recruiter' then exists (
      select 1 from public.profiles p
      join public.recruiting_verification_requests v on v.recruiter_user_id = p.id
      where p.id = user_id
        and coalesce(p.profile_mode,p.role,p.requested_role) = 'college-coach'
        and p.onboarding_completed = true
        and v.status = 'approved'
    )
    when 'college_admissions' then exists (
      select 1 from public.profiles p
      join public.admissions_verification_requests v on v.admissions_user_id = p.id
      where p.id = user_id
        and coalesce(p.profile_mode,p.role,p.requested_role) = 'college-admissions'
        and p.onboarding_completed = true
        and v.status = 'approved'
    )
    when 'community_partner' then exists (
      select 1 from public.profiles p
      join public.community_partner_verification_requests v on v.partner_user_id = p.id
      where p.id = user_id
        and coalesce(p.profile_mode,p.role,p.requested_role) = 'other'
        and p.onboarding_completed = true
        and v.status = 'approved'
        and v.service_scope_status = 'approved'
    )
    when 'employer_partner' then exists (
      select 1 from public.profiles p
      join public.employer_verification_requests v on v.employer_user_id = p.id
      where p.id = user_id
        and coalesce(p.profile_mode,p.role,p.requested_role) = 'employer'
        and p.onboarding_completed = true
        and v.status = 'approved'
    )
    else false
  end;
$$;

revoke all on function public.verified_zero_data_relationship_ready(text, uuid) from public;
revoke all on function public.verified_zero_data_relationship_ready(text, uuid) from anon;
grant execute on function public.verified_zero_data_relationship_ready(text, uuid) to authenticated;

drop policy if exists "Verified external supporters can activate zero-data relationships"
  on public.support_relationships;
create policy "Verified external supporters can activate zero-data relationships"
on public.support_relationships
for insert
to authenticated
with check (
  supporter_id = (select auth.uid())
  and relationship in (
    'educator',
    'counselor',
    'district_admin',
    'college_recruiter',
    'college_admissions',
    'community_partner',
    'employer_partner'
  )
  and permissions = '[]'::jsonb
  and status = 'active'
  and source_invitation_id is not null
  and lower(trim(supporter_email)) = lower(trim(coalesce((select auth.jwt()) ->> 'email', '')))
  and public.verified_zero_data_relationship_ready(relationship, (select auth.uid()))
  and exists (
    select 1
      from public.support_invitations invitation
     where invitation.id = support_relationships.source_invitation_id
       and invitation.scholar_id = support_relationships.scholar_id
       and invitation.relationship = support_relationships.relationship
       and invitation.status = 'pending'
       and invitation.permissions = '[]'::jsonb
       and lower(trim(invitation.invitee_email)) = lower(trim(coalesce((select auth.jwt()) ->> 'email', '')))
  )
);

-- Preserve Family, Mentor, and verified Coach behavior while extending the
-- atomic claim primitive to exact verified zero-data relationship identities.
drop function if exists public.claim_support_invitation(text, text);
create function public.claim_support_invitation(
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
language plpgsql
security invoker
set search_path = ''
as $$
declare
  invitation_row public.support_invitations%rowtype;
  authenticated_user_id uuid := auth.uid();
  authenticated_email text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  created_validation_request_id uuid;
begin
  if authenticated_user_id is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  if desired_status not in ('accepted', 'declined') then
    raise exception 'Invalid invitation status.' using errcode = '22023';
  end if;

  select invitation.* into invitation_row
    from public.support_invitations invitation
   where invitation.token = invitation_token
   for update;

  if not found then
    raise exception 'Invitation not found.' using errcode = 'P0002';
  end if;

  if authenticated_email = '' or lower(trim(invitation_row.invitee_email)) <> authenticated_email then
    raise exception 'This invitation belongs to a different email address.' using errcode = '42501';
  end if;

  if invitation_row.status <> 'pending' then
    raise exception 'Invitation is already %.', invitation_row.status using errcode = '23505';
  end if;

  if desired_status = 'declined' then
    update public.support_invitations
       set status = 'declined', accepted_at = null, declined_at = now()
     where id = invitation_row.id;
    return query select invitation_row.destination, invitation_row.scholar_id,
      invitation_row.invitee_name, invitation_row.relationship, 'declined'::text,
      'declined'::text, null::uuid;
    return;
  end if;

  if invitation_row.relationship = 'parent_guardian' then
    insert into public.support_relationships (
      scholar_id, supporter_id, supporter_email, supporter_name, relationship,
      permissions, source_invitation_id, status
    ) values (
      invitation_row.scholar_id, authenticated_user_id, invitation_row.invitee_email,
      invitation_row.invitee_name, invitation_row.relationship,
      invitation_row.permissions, invitation_row.id, 'active'
    );
    update public.support_invitations
       set status = 'accepted', accepted_at = now(), declined_at = null
     where id = invitation_row.id;
    return query select invitation_row.destination, invitation_row.scholar_id,
      invitation_row.invitee_name, invitation_row.relationship, 'accepted'::text,
      'active'::text, null::uuid;
    return;
  end if;

  if invitation_row.relationship = 'mentor' then
    insert into public.mentor_validation_requests (
      invitation_id, scholar_id, mentor_user_id, mentor_email, mentor_name, status
    ) values (
      invitation_row.id, invitation_row.scholar_id, authenticated_user_id,
      invitation_row.invitee_email, invitation_row.invitee_name, 'pending'
    ) returning id into created_validation_request_id;
    update public.support_invitations
       set status = 'accepted', accepted_at = now(), declined_at = null
     where id = invitation_row.id;
    return query select invitation_row.destination, invitation_row.scholar_id,
      invitation_row.invitee_name, invitation_row.relationship, 'accepted'::text,
      'pending_validation'::text, created_validation_request_id;
    return;
  end if;

  if invitation_row.relationship = 'coach' then
    if invitation_row.permissions <> '[]'::jsonb then
      raise exception 'Coach relationship invitations may not grant Scholar-data permissions.' using errcode = '42501';
    end if;
    if not exists (
      select 1 from public.profiles p
      join public.coach_verification_requests v on v.coach_user_id = p.id
      where p.id = authenticated_user_id
        and coalesce(p.profile_mode,p.role,p.requested_role) = 'coach'
        and p.onboarding_completed = true
        and v.status = 'approved'
    ) then
      raise exception 'Coach identity verification must be approved before relationship activation.' using errcode = '42501';
    end if;
    insert into public.support_relationships (
      scholar_id, supporter_id, supporter_email, supporter_name, relationship,
      permissions, source_invitation_id, status
    ) values (
      invitation_row.scholar_id, authenticated_user_id, invitation_row.invitee_email,
      invitation_row.invitee_name, 'coach', '[]'::jsonb, invitation_row.id, 'active'
    );
    update public.support_invitations
       set status = 'accepted', accepted_at = now(), declined_at = null
     where id = invitation_row.id;
    return query select invitation_row.destination, invitation_row.scholar_id,
      invitation_row.invitee_name, 'coach'::text, 'accepted'::text,
      'active_relationship_only'::text, null::uuid;
    return;
  end if;

  if invitation_row.relationship in (
    'educator',
    'counselor',
    'district_admin',
    'college_recruiter',
    'college_admissions',
    'community_partner',
    'employer_partner'
  ) then
    if invitation_row.permissions <> '[]'::jsonb then
      raise exception 'Verified relationship identity invitations may not grant Scholar-data permissions.' using errcode = '42501';
    end if;

    if not public.verified_zero_data_relationship_ready(
      invitation_row.relationship,
      authenticated_user_id
    ) then
      raise exception 'Role verification and scope must be approved before relationship activation.' using errcode = '42501';
    end if;

    insert into public.support_relationships (
      scholar_id, supporter_id, supporter_email, supporter_name, relationship,
      permissions, source_invitation_id, status
    ) values (
      invitation_row.scholar_id, authenticated_user_id, invitation_row.invitee_email,
      invitation_row.invitee_name, invitation_row.relationship,
      '[]'::jsonb, invitation_row.id, 'active'
    );

    update public.support_invitations
       set status = 'accepted', accepted_at = now(), declined_at = null
     where id = invitation_row.id;

    return query select invitation_row.destination, invitation_row.scholar_id,
      invitation_row.invitee_name, invitation_row.relationship, 'accepted'::text,
      'active_relationship_only'::text, null::uuid;
    return;
  end if;

  raise exception 'This relationship requires a governed verification contract before access can be activated.' using errcode = '42501';
end;
$$;

revoke all on function public.claim_support_invitation(text, text) from public;
revoke all on function public.claim_support_invitation(text, text) from anon;
grant execute on function public.claim_support_invitation(text, text) to authenticated;
