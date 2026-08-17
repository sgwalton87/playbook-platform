-- Verified Coach / College Recruiter discovery and zero-data connection convergence.
--
-- Canonical verification remains the authority for role identity. The shared
-- support directory is only a safe searchable projection, and support
-- relationships remain a separate consent boundary. Directory discovery never
-- grants Scholar-record access.

alter table public.support_invitations
  add column if not exists invitee_user_id uuid references public.profiles(id) on delete cascade;

create index if not exists support_invitations_invitee_user_idx
  on public.support_invitations(invitee_user_id)
  where invitee_user_id is not null;

-- Direct Scholar-created invitations remain the existing email-addressed path.
-- Only the governed directory RPC below may create account-addressed invitations.
drop policy if exists "Scholar Record owners can create governed support invitations"
  on public.support_invitations;
create policy "Scholar Record owners can create governed support invitations"
on public.support_invitations
for insert
to authenticated
with check (
  scholar_id = (select auth.uid())
  and invitee_user_id is null
  and exists (
    select 1
      from public.profiles as profile
     where profile.id = (select auth.uid())
       and coalesce(profile.profile_mode, profile.role::text, profile.requested_role)
         in ('scholar', 'scholar-athlete', 'transition-youth')
  )
  and status = 'pending'
  and accepted_at is null
  and declined_at is null
  and length(trim(token)) >= 32
  and length(trim(invitee_email)) > 3
  and length(trim(invitee_name)) > 0
  and relationship in (
    'parent_guardian', 'mentor', 'coach', 'educator', 'counselor',
    'district_admin', 'college_recruiter', 'college_admissions',
    'community_partner', 'employer_partner'
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

-- Participant reads support either the legacy email route or the new exact-user
-- directory route. A directory-addressed invitation never falls back to email.
drop policy if exists "Invitation participants can view invitations"
  on public.support_invitations;
create policy "Invitation participants can view invitations"
on public.support_invitations
for select
to authenticated
using (
  scholar_id = (select auth.uid())
  or (
    invitee_user_id is not null
    and invitee_user_id = (select auth.uid())
  )
  or (
    invitee_user_id is null
    and lower(trim(invitee_email)) = lower(trim(coalesce((select auth.jwt()) ->> 'email', '')))
  )
);

create or replace function private.refresh_verified_recruiting_directory_profile(
  subject_user_id uuid,
  relationship_kind text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_row public.profiles%rowtype;
  coach_row public.coach_verification_requests%rowtype;
  recruiting_row public.recruiting_verification_requests%rowtype;
  directory_role text;
  directory_name text;
  directory_org text;
  directory_expertise text[];
begin
  select * into profile_row from public.profiles where id = subject_user_id;
  if not found then return; end if;

  directory_name := coalesce(nullif(trim(profile_row.full_name), ''), nullif(trim(profile_row.username), ''));

  if relationship_kind = 'coach' then
    select * into coach_row
      from public.coach_verification_requests
     where coach_user_id = subject_user_id;

    directory_role := 'coach';
    if not found
       or coach_row.status <> 'approved'
       or coalesce(profile_row.profile_mode, profile_row.role::text, profile_row.requested_role) <> 'coach'
       or profile_row.onboarding_completed is distinct from true then
      update public.support_directory_profiles
         set searchable = false
       where user_id = subject_user_id and role = directory_role;
      return;
    end if;

    directory_name := coalesce(directory_name, 'Verified Coach');
    directory_org := nullif(trim(coach_row.school), '');
    directory_expertise := array_remove(array[
      nullif(trim(coach_row.primary_sport), ''),
      nullif(trim(coach_row.coach_role), '')
    ], null);

  elsif relationship_kind = 'college_recruiter' then
    select * into recruiting_row
      from public.recruiting_verification_requests
     where recruiter_user_id = subject_user_id;

    directory_role := 'college_recruiter';
    if not found
       or recruiting_row.status <> 'approved'
       or coalesce(profile_row.profile_mode, profile_row.role::text, profile_row.requested_role) <> 'college-coach'
       or profile_row.onboarding_completed is distinct from true then
      update public.support_directory_profiles
         set searchable = false
       where user_id = subject_user_id and role = directory_role;
      return;
    end if;

    directory_name := coalesce(directory_name, 'Verified College Recruiter');
    directory_org := nullif(trim(recruiting_row.college_name), '');
    directory_expertise := array_remove(array[
      nullif(trim(recruiting_row.primary_sport_recruiting), ''),
      nullif(trim(recruiting_row.positions_recruiting), ''),
      nullif(trim(recruiting_row.division_level), ''),
      nullif(trim(recruiting_row.conference), '')
    ], null);
  else
    raise exception 'unsupported recruiting directory relationship' using errcode = '22023';
  end if;

  insert into public.support_directory_profiles (
    user_id, role, display_name, organization, expertise, searchable
  ) values (
    subject_user_id, directory_role, directory_name, directory_org,
    coalesce(directory_expertise, '{}'::text[]), true
  )
  on conflict (user_id) do update
    set role = excluded.role,
        display_name = excluded.display_name,
        organization = excluded.organization,
        expertise = excluded.expertise,
        searchable = true;
end;
$$;

revoke all on function private.refresh_verified_recruiting_directory_profile(uuid, text)
  from public, anon, authenticated;

create or replace function private.sync_verified_recruiting_directory_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'coach_verification_requests' then
    perform private.refresh_verified_recruiting_directory_profile(new.coach_user_id, 'coach');
  elsif tg_table_name = 'recruiting_verification_requests' then
    perform private.refresh_verified_recruiting_directory_profile(new.recruiter_user_id, 'college_recruiter');
  end if;
  return new;
end;
$$;

revoke all on function private.sync_verified_recruiting_directory_profile()
  from public, anon, authenticated;

drop trigger if exists coach_verification_directory_projection
  on public.coach_verification_requests;
create trigger coach_verification_directory_projection
after insert or update of status on public.coach_verification_requests
for each row execute function private.sync_verified_recruiting_directory_profile();

drop trigger if exists recruiting_verification_directory_projection
  on public.recruiting_verification_requests;
create trigger recruiting_verification_directory_projection
after insert or update of status on public.recruiting_verification_requests
for each row execute function private.sync_verified_recruiting_directory_profile();

-- Backfill only currently approved, role-valid verification records.
do $$
declare
  record_row record;
begin
  for record_row in select coach_user_id as user_id from public.coach_verification_requests loop
    perform private.refresh_verified_recruiting_directory_profile(record_row.user_id, 'coach');
  end loop;
  for record_row in select recruiter_user_id as user_id from public.recruiting_verification_requests loop
    perform private.refresh_verified_recruiting_directory_profile(record_row.user_id, 'college_recruiter');
  end loop;
end
$$;

create or replace function private.create_verified_recruiting_support_invitation(
  target_user_id uuid,
  relationship_kind text
)
returns table (
  invitation_id uuid,
  target_id uuid,
  relationship text,
  status text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  scholar_user_id uuid := auth.uid();
  scholar_name text;
  target_name text;
  target_role text;
  target_destination text;
  created_id uuid;
begin
  if scholar_user_id is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  if relationship_kind not in ('coach', 'college_recruiter') then
    raise exception 'Only verified Coach or College Recruiter connections are supported.' using errcode = '22023';
  end if;

  select coalesce(nullif(trim(full_name), ''), nullif(trim(username), ''), 'Scholar')
    into scholar_name
    from public.profiles
   where id = scholar_user_id
     and coalesce(profile_mode, role::text, requested_role) in ('scholar', 'scholar-athlete', 'transition-youth')
     and onboarding_completed = true;

  if scholar_name is null then
    raise exception 'A completed Scholar Record owner profile is required.' using errcode = '42501';
  end if;

  if target_user_id = scholar_user_id then
    raise exception 'You cannot connect your Scholar Record to yourself.' using errcode = '22023';
  end if;

  select display_name, role
    into target_name, target_role
    from public.support_directory_profiles
   where user_id = target_user_id
     and searchable = true
     and role = relationship_kind;

  if target_name is null or target_role is null then
    raise exception 'Verified directory profile not found.' using errcode = 'P0002';
  end if;

  if relationship_kind = 'coach' then
    if not exists (
      select 1
        from public.profiles p
        join public.coach_verification_requests v on v.coach_user_id = p.id
       where p.id = target_user_id
         and coalesce(p.profile_mode,p.role::text,p.requested_role) = 'coach'
         and p.onboarding_completed = true
         and v.status = 'approved'
    ) then
      raise exception 'Coach verification is no longer active.' using errcode = '42501';
    end if;
    target_destination := '/coach-os';
  else
    if not public.verified_zero_data_relationship_ready('college_recruiter', target_user_id) then
      raise exception 'College Recruiter verification is no longer active.' using errcode = '42501';
    end if;
    target_destination := '/recruiting-os';
  end if;

  if exists (
    select 1 from public.support_relationships r
     where r.scholar_id = scholar_user_id
       and r.supporter_id = target_user_id
       and r.relationship = relationship_kind
       and r.status = 'active'
  ) then
    raise exception 'This verified support relationship is already active.' using errcode = '23505';
  end if;

  if exists (
    select 1 from public.support_invitations i
     where i.scholar_id = scholar_user_id
       and i.invitee_user_id = target_user_id
       and i.relationship = relationship_kind
       and i.status = 'pending'
  ) then
    raise exception 'A connection invitation is already pending.' using errcode = '23505';
  end if;

  insert into public.support_invitations (
    scholar_id, scholar_name, invitee_name, invitee_email, invitee_user_id,
    relationship, status, token, permissions, destination
  ) values (
    scholar_user_id, scholar_name, target_name, 'private-routing@playbook.invalid', target_user_id,
    relationship_kind, 'pending', encode(gen_random_bytes(32), 'hex'), '[]'::jsonb, target_destination
  ) returning id into created_id;

  return query select created_id, target_user_id, relationship_kind, 'pending'::text;
end;
$$;

revoke all on function private.create_verified_recruiting_support_invitation(uuid, text)
  from public, anon, authenticated;
grant execute on function private.create_verified_recruiting_support_invitation(uuid, text)
  to authenticated;

create or replace function public.create_verified_recruiting_support_invitation(
  target_user_id uuid,
  relationship_kind text
)
returns table (
  invitation_id uuid,
  target_id uuid,
  relationship text,
  status text
)
language sql
security invoker
set search_path = ''
as $$
  select *
    from private.create_verified_recruiting_support_invitation(target_user_id, relationship_kind);
$$;

revoke all on function public.create_verified_recruiting_support_invitation(uuid, text)
  from public, anon;
grant execute on function public.create_verified_recruiting_support_invitation(uuid, text)
  to authenticated;

-- Replace the private claim implementation so account-addressed directory
-- invitations are claimed by exact user id. Legacy invitations continue to be
-- claimed by JWT email. The real authenticated email is used only inside the
-- resulting relationship record and is never copied into a Scholar-visible
-- directory invitation.
create or replace function private.claim_support_invitation(
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
security definer
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

  if invitation_row.invitee_user_id is not null then
    if invitation_row.invitee_user_id <> authenticated_user_id then
      raise exception 'This invitation belongs to a different account.' using errcode = '42501';
    end if;
  elsif authenticated_email = '' or lower(trim(invitation_row.invitee_email)) <> authenticated_email then
    raise exception 'This invitation belongs to a different email address.' using errcode = '42501';
  end if;

  if invitation_row.status <> 'pending' then
    raise exception 'Invitation is already %.', invitation_row.status using errcode = '23505';
  end if;

  if desired_status = 'declined' then
    update public.support_invitations
       set status='declined', accepted_at=null, declined_at=now()
     where id=invitation_row.id;
    return query select invitation_row.destination, invitation_row.scholar_id,
      invitation_row.invitee_name, invitation_row.relationship, 'declined'::text,
      'declined'::text, null::uuid;
    return;
  end if;

  if invitation_row.relationship = 'parent_guardian' then
    if invitation_row.invitee_user_id is not null then
      raise exception 'Family invitations must use the governed family invitation route.' using errcode = '42501';
    end if;
    insert into public.support_relationships (
      scholar_id,supporter_id,supporter_email,supporter_name,relationship,permissions,source_invitation_id,status
    ) values (
      invitation_row.scholar_id,authenticated_user_id,authenticated_email,invitation_row.invitee_name,
      invitation_row.relationship,invitation_row.permissions,invitation_row.id,'active'
    );
    update public.support_invitations set status='accepted',accepted_at=now(),declined_at=null where id=invitation_row.id;
    return query select invitation_row.destination,invitation_row.scholar_id,invitation_row.invitee_name,
      invitation_row.relationship,'accepted'::text,'active'::text,null::uuid;
    return;
  end if;

  if invitation_row.relationship = 'mentor' then
    if invitation_row.invitee_user_id is not null then
      raise exception 'Mentor invitations must use the governed mentor invitation route.' using errcode = '42501';
    end if;
    insert into public.mentor_validation_requests (
      invitation_id,scholar_id,mentor_user_id,mentor_email,mentor_name,status
    ) values (
      invitation_row.id,invitation_row.scholar_id,authenticated_user_id,authenticated_email,
      invitation_row.invitee_name,'pending'
    ) returning id into created_validation_request_id;
    update public.support_invitations set status='accepted',accepted_at=now(),declined_at=null where id=invitation_row.id;
    return query select invitation_row.destination,invitation_row.scholar_id,invitation_row.invitee_name,
      invitation_row.relationship,'accepted'::text,'pending_validation'::text,created_validation_request_id;
    return;
  end if;

  if invitation_row.relationship = 'coach' then
    if invitation_row.permissions <> '[]'::jsonb then
      raise exception 'Coach relationship invitations may not grant Scholar-data permissions.' using errcode = '42501';
    end if;
    if not exists (
      select 1 from public.profiles p
      join public.coach_verification_requests v on v.coach_user_id=p.id
      where p.id=authenticated_user_id
        and coalesce(p.profile_mode,p.role::text,p.requested_role)='coach'
        and p.onboarding_completed=true and v.status='approved'
    ) then
      raise exception 'Coach identity verification must be approved before relationship activation.' using errcode = '42501';
    end if;
    insert into public.support_relationships (
      scholar_id,supporter_id,supporter_email,supporter_name,relationship,permissions,source_invitation_id,status
    ) values (
      invitation_row.scholar_id,authenticated_user_id,authenticated_email,invitation_row.invitee_name,
      'coach','[]'::jsonb,invitation_row.id,'active'
    );
    update public.support_invitations set status='accepted',accepted_at=now(),declined_at=null where id=invitation_row.id;
    return query select invitation_row.destination,invitation_row.scholar_id,invitation_row.invitee_name,
      'coach'::text,'accepted'::text,'active_relationship_only'::text,null::uuid;
    return;
  end if;

  if invitation_row.relationship in (
    'educator','counselor','district_admin','college_recruiter',
    'college_admissions','community_partner','employer_partner'
  ) then
    if invitation_row.permissions <> '[]'::jsonb then
      raise exception 'Verified relationship identity invitations may not grant Scholar-data permissions.' using errcode = '42501';
    end if;
    if not public.verified_zero_data_relationship_ready(invitation_row.relationship, authenticated_user_id) then
      raise exception 'Role verification and scope must be approved before relationship activation.' using errcode = '42501';
    end if;
    insert into public.support_relationships (
      scholar_id,supporter_id,supporter_email,supporter_name,relationship,permissions,source_invitation_id,status
    ) values (
      invitation_row.scholar_id,authenticated_user_id,authenticated_email,invitation_row.invitee_name,
      invitation_row.relationship,'[]'::jsonb,invitation_row.id,'active'
    );
    update public.support_invitations set status='accepted',accepted_at=now(),declined_at=null where id=invitation_row.id;
    return query select invitation_row.destination,invitation_row.scholar_id,invitation_row.invitee_name,
      invitation_row.relationship,'accepted'::text,'active_relationship_only'::text,null::uuid;
    return;
  end if;

  raise exception 'This relationship requires a governed verification contract before access can be activated.' using errcode = '42501';
end;
$$;

revoke all on function private.claim_support_invitation(text, text) from public, anon;
grant execute on function private.claim_support_invitation(text, text) to authenticated;

comment on function public.create_verified_recruiting_support_invitation(uuid, text) is
  'Creates a zero-data Coach or College Recruiter support invitation from an approved searchable directory identity without exposing verification email evidence.';
