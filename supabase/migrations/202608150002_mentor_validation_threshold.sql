-- Scholar-invited Mentor validation.
-- Mentor acceptance creates a pending validation request, never immediate access.
-- Activation requires either one Parent/Guardian or Coach approval, or two
-- distinct active support-system members.

create table if not exists public.mentor_validation_requests (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null unique references public.support_invitations(id) on delete cascade,
  scholar_id uuid not null,
  mentor_user_id uuid not null,
  mentor_email text not null,
  mentor_name text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create table if not exists public.mentor_validation_approvals (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.mentor_validation_requests(id) on delete cascade,
  approver_relationship_id uuid not null references public.support_relationships(id) on delete restrict,
  approver_user_id uuid not null,
  relationship_snapshot text not null,
  created_at timestamptz not null default now(),
  unique (request_id, approver_user_id)
);

create index if not exists mentor_validation_requests_scholar_idx
  on public.mentor_validation_requests(scholar_id);
create index if not exists mentor_validation_requests_mentor_idx
  on public.mentor_validation_requests(mentor_user_id);
create index if not exists mentor_validation_approvals_request_idx
  on public.mentor_validation_approvals(request_id);

alter table public.mentor_validation_requests enable row level security;
alter table public.mentor_validation_approvals enable row level security;

grant select, insert, update on public.mentor_validation_requests to authenticated;
grant select, insert on public.mentor_validation_approvals to authenticated;

-- Request visibility: scholar owner, invited mentor, or an already-active
-- support-system member for the same scholar.
drop policy if exists "Mentor validation participants can view requests"
  on public.mentor_validation_requests;
create policy "Mentor validation participants can view requests"
on public.mentor_validation_requests
for select
to authenticated
using (
  scholar_id = (select auth.uid())
  or mentor_user_id = (select auth.uid())
  or exists (
    select 1
      from public.support_relationships as relationship
     where relationship.scholar_id = mentor_validation_requests.scholar_id
       and relationship.supporter_id = (select auth.uid())
       and relationship.status = 'active'
  )
);

-- Only the authenticated invitee can create the request, and only from a
-- Scholar-originated pending Mentor invitation matching the JWT email.
drop policy if exists "Invited mentors can create validation requests"
  on public.mentor_validation_requests;
create policy "Invited mentors can create validation requests"
on public.mentor_validation_requests
for insert
to authenticated
with check (
  mentor_user_id = (select auth.uid())
  and lower(trim(mentor_email)) = lower(trim(coalesce((select auth.jwt()) ->> 'email', '')))
  and status = 'pending'
  and exists (
    select 1
      from public.support_invitations as invitation
     where invitation.id = invitation_id
       and invitation.scholar_id = mentor_validation_requests.scholar_id
       and invitation.status = 'pending'
       and invitation.relationship = 'mentor'
       and lower(trim(invitation.invitee_email)) = lower(trim(coalesce((select auth.jwt()) ->> 'email', '')))
  )
);

-- Approval-state updates are only legal after the validated Mentor relationship
-- has actually been created, keeping the audit state subordinate to access truth.
drop policy if exists "Validated mentors can mark requests approved"
  on public.mentor_validation_requests;
create policy "Validated mentors can mark requests approved"
on public.mentor_validation_requests
for update
to authenticated
using (
  mentor_user_id = (select auth.uid())
  and status = 'pending'
)
with check (
  mentor_user_id = (select auth.uid())
  and status = 'approved'
  and approved_at is not null
  and exists (
    select 1
      from public.support_relationships as relationship
     where relationship.source_invitation_id = mentor_validation_requests.invitation_id
       and relationship.scholar_id = mentor_validation_requests.scholar_id
       and relationship.supporter_id = (select auth.uid())
       and relationship.relationship = 'mentor'
       and relationship.status = 'active'
  )
);

-- Approval visibility follows the request's governed participant boundary.
drop policy if exists "Mentor validation participants can view approvals"
  on public.mentor_validation_approvals;
create policy "Mentor validation participants can view approvals"
on public.mentor_validation_approvals
for select
to authenticated
using (
  exists (
    select 1
      from public.mentor_validation_requests as request
     where request.id = mentor_validation_approvals.request_id
       and (
         request.scholar_id = (select auth.uid())
         or request.mentor_user_id = (select auth.uid())
         or exists (
           select 1
             from public.support_relationships as viewer_relationship
            where viewer_relationship.scholar_id = request.scholar_id
              and viewer_relationship.supporter_id = (select auth.uid())
              and viewer_relationship.status = 'active'
         )
       )
  )
);

-- One authenticated support-system member may contribute at most one approval.
-- The relationship snapshot must match the active relationship row; no role can
-- be self-asserted by the client.
drop policy if exists "Active support members can validate mentors"
  on public.mentor_validation_approvals;
create policy "Active support members can validate mentors"
on public.mentor_validation_approvals
for insert
to authenticated
with check (
  approver_user_id = (select auth.uid())
  and exists (
    select 1
      from public.mentor_validation_requests as request
      join public.support_relationships as relationship
        on relationship.id = mentor_validation_approvals.approver_relationship_id
       and relationship.scholar_id = request.scholar_id
       and relationship.supporter_id = (select auth.uid())
       and relationship.status = 'active'
     where request.id = mentor_validation_approvals.request_id
       and request.status = 'pending'
       and request.mentor_user_id <> (select auth.uid())
       and mentor_validation_approvals.relationship_snapshot = relationship.relationship
  )
);

-- A Mentor can activate only after the support-system threshold is true.
drop policy if exists "Validated mentors can activate invited support relationships"
  on public.support_relationships;
create policy "Validated mentors can activate invited support relationships"
on public.support_relationships
for insert
to authenticated
with check (
  supporter_id = (select auth.uid())
  and lower(trim(supporter_email)) = lower(trim(coalesce((select auth.jwt()) ->> 'email', '')))
  and relationship = 'mentor'
  and permissions = '["view_progress","recommend_actions","support_tasks"]'::jsonb
  and source_invitation_id is not null
  and exists (
    select 1
      from public.mentor_validation_requests as request
     where request.invitation_id = support_relationships.source_invitation_id
       and request.scholar_id = support_relationships.scholar_id
       and request.mentor_user_id = (select auth.uid())
       and request.status = 'pending'
       and (
         exists (
           select 1
             from public.mentor_validation_approvals as approval
             join public.support_relationships as validator_relationship
               on validator_relationship.id = approval.approver_relationship_id
              and validator_relationship.supporter_id = approval.approver_user_id
              and validator_relationship.scholar_id = request.scholar_id
              and validator_relationship.status = 'active'
            where approval.request_id = request.id
              and validator_relationship.relationship in ('parent_guardian', 'coach')
         )
         or (
           select count(distinct approval.approver_user_id)
             from public.mentor_validation_approvals as approval
             join public.support_relationships as validator_relationship
               on validator_relationship.id = approval.approver_relationship_id
              and validator_relationship.supporter_id = approval.approver_user_id
              and validator_relationship.scholar_id = request.scholar_id
              and validator_relationship.status = 'active'
            where approval.request_id = request.id
         ) >= 2
       )
  )
);

-- Extend invitation claim behavior. Parent/Guardian still activates immediately;
-- Mentor acceptance creates only a pending validation request. Decline is safe
-- for any invitation relationship because it grants no access.
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

  select invitation.*
    into invitation_row
    from public.support_invitations as invitation
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
    )
    returning id into created_validation_request_id;

    update public.support_invitations
       set status = 'accepted', accepted_at = now(), declined_at = null
     where id = invitation_row.id;

    return query select invitation_row.destination, invitation_row.scholar_id,
      invitation_row.invitee_name, invitation_row.relationship, 'accepted'::text,
      'pending_validation'::text, created_validation_request_id;
    return;
  end if;

  raise exception 'This relationship requires a governed verification contract before access can be activated.' using errcode = '42501';
end;
$$;

revoke all on function public.claim_support_invitation(text, text) from public;
revoke all on function public.claim_support_invitation(text, text) from anon;
grant execute on function public.claim_support_invitation(text, text) to authenticated;

create or replace function public.approve_mentor_validation(validation_request_id uuid)
returns table (
  request_id uuid,
  approval_count bigint,
  privileged_validator boolean,
  threshold_met boolean
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  request_row public.mentor_validation_requests%rowtype;
  relationship_row public.support_relationships%rowtype;
  approvals_count bigint;
  has_privileged boolean;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  select request.* into request_row
    from public.mentor_validation_requests as request
   where request.id = validation_request_id;

  if not found then
    raise exception 'Mentor validation request not found.' using errcode = 'P0002';
  end if;

  if request_row.status <> 'pending' then
    raise exception 'Mentor validation request is not pending.' using errcode = '23505';
  end if;

  if request_row.mentor_user_id = auth.uid() then
    raise exception 'A mentor candidate cannot validate their own request.' using errcode = '42501';
  end if;

  select relationship.* into relationship_row
    from public.support_relationships as relationship
   where relationship.scholar_id = request_row.scholar_id
     and relationship.supporter_id = auth.uid()
     and relationship.status = 'active'
   order by case
     when relationship.relationship = 'parent_guardian' then 0
     when relationship.relationship = 'coach' then 1
     else 2
   end, relationship.created_at asc
   limit 1;

  if not found then
    raise exception 'Only active members of this Scholar support system can validate a mentor.' using errcode = '42501';
  end if;

  insert into public.mentor_validation_approvals (
    request_id, approver_relationship_id, approver_user_id, relationship_snapshot
  ) values (
    request_row.id, relationship_row.id, auth.uid(), relationship_row.relationship
  );

  select
    count(distinct approval.approver_user_id),
    coalesce(bool_or(validator_relationship.relationship in ('parent_guardian', 'coach')), false)
  into approvals_count, has_privileged
  from public.mentor_validation_approvals as approval
  join public.support_relationships as validator_relationship
    on validator_relationship.id = approval.approver_relationship_id
   and validator_relationship.supporter_id = approval.approver_user_id
   and validator_relationship.scholar_id = request_row.scholar_id
   and validator_relationship.status = 'active'
  where approval.request_id = request_row.id;

  return query select request_row.id, approvals_count, has_privileged,
    (has_privileged or approvals_count >= 2);
end;
$$;

revoke all on function public.approve_mentor_validation(uuid) from public;
revoke all on function public.approve_mentor_validation(uuid) from anon;
grant execute on function public.approve_mentor_validation(uuid) to authenticated;

create or replace function public.finalize_mentor_validation(validation_request_id uuid)
returns table (
  request_id uuid,
  scholar_id uuid,
  mentor_user_id uuid,
  status text
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  request_row public.mentor_validation_requests%rowtype;
  approvals_count bigint;
  has_privileged boolean;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  select request.* into request_row
    from public.mentor_validation_requests as request
   where request.id = validation_request_id;

  if not found then
    raise exception 'Mentor validation request not found.' using errcode = 'P0002';
  end if;

  if request_row.mentor_user_id <> auth.uid() then
    raise exception 'Only the invited mentor can finalize this validation.' using errcode = '42501';
  end if;

  if request_row.status <> 'pending' then
    raise exception 'Mentor validation request is not pending.' using errcode = '23505';
  end if;

  select
    count(distinct approval.approver_user_id),
    coalesce(bool_or(validator_relationship.relationship in ('parent_guardian', 'coach')), false)
  into approvals_count, has_privileged
  from public.mentor_validation_approvals as approval
  join public.support_relationships as validator_relationship
    on validator_relationship.id = approval.approver_relationship_id
   and validator_relationship.supporter_id = approval.approver_user_id
   and validator_relationship.scholar_id = request_row.scholar_id
   and validator_relationship.status = 'active'
  where approval.request_id = request_row.id;

  if not has_privileged and approvals_count < 2 then
    raise exception 'Mentor validation threshold has not been met.' using errcode = '42501';
  end if;

  insert into public.support_relationships (
    scholar_id, supporter_id, supporter_email, supporter_name, relationship,
    permissions, source_invitation_id, status
  ) values (
    request_row.scholar_id, request_row.mentor_user_id, request_row.mentor_email,
    request_row.mentor_name, 'mentor',
    '["view_progress","recommend_actions","support_tasks"]'::jsonb,
    request_row.invitation_id, 'active'
  );

  update public.mentor_validation_requests
     set status = 'approved', approved_at = now()
   where id = request_row.id;

  return query select request_row.id, request_row.scholar_id,
    request_row.mentor_user_id, 'approved'::text;
end;
$$;

revoke all on function public.finalize_mentor_validation(uuid) from public;
revoke all on function public.finalize_mentor_validation(uuid) from anon;
grant execute on function public.finalize_mentor_validation(uuid) to authenticated;
