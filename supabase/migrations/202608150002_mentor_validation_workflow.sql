-- Govern Mentor access as a staged trust workflow.
--
-- A Scholar originates the invitation. The invited Mentor may accept, but
-- acceptance creates only a pending relationship with zero permissions.
-- Activation requires either:
--   1. one approval from an active Parent/Guardian or Coach relationship; or
--   2. approvals from two distinct active members of the Scholar's support system.
--
-- All claims and approvals are authenticated, row-locked, replay-safe, and
-- evaluated against current active relationships. No invitation-supplied
-- permission payload is trusted as authorization.

alter table public.support_relationships
  drop constraint if exists support_relationships_status_check;

alter table public.support_relationships
  add constraint support_relationships_status_check
  check (status in ('pending_validation', 'active', 'removed', 'blocked'));

create table if not exists public.mentor_validation_requests (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null unique
    references public.support_relationships(id) on delete cascade,
  source_invitation_id uuid not null unique
    references public.support_invitations(id) on delete cascade,
  scholar_id uuid not null,
  mentor_id uuid not null,
  status text not null default 'pending'
    check (status in ('pending', 'validated', 'rejected', 'revoked')),
  validation_method text
    check (validation_method in ('parent_or_coach', 'two_support_members')),
  validated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mentor_validation_approvals (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null
    references public.mentor_validation_requests(id) on delete cascade,
  approver_relationship_id uuid not null
    references public.support_relationships(id) on delete cascade,
  approver_user_id uuid not null,
  approver_relationship text not null,
  created_at timestamptz not null default now(),
  unique (request_id, approver_user_id)
);

create index if not exists mentor_validation_requests_scholar_idx
  on public.mentor_validation_requests(scholar_id, status);

create index if not exists mentor_validation_requests_mentor_idx
  on public.mentor_validation_requests(mentor_id, status);

create index if not exists mentor_validation_approvals_request_idx
  on public.mentor_validation_approvals(request_id);

alter table public.mentor_validation_requests enable row level security;
alter table public.mentor_validation_approvals enable row level security;

drop policy if exists "Mentor validation participants can view requests"
  on public.mentor_validation_requests;
create policy "Mentor validation participants can view requests"
  on public.mentor_validation_requests
  for select
  to authenticated
  using (
    (select auth.uid()) = scholar_id
    or (select auth.uid()) = mentor_id
    or exists (
      select 1
      from public.support_relationships as support
      where support.scholar_id = mentor_validation_requests.scholar_id
        and support.supporter_id = (select auth.uid())
        and support.status = 'active'
    )
  );

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
          or request.mentor_id = (select auth.uid())
          or exists (
            select 1
            from public.support_relationships as support
            where support.scholar_id = request.scholar_id
              and support.supporter_id = (select auth.uid())
              and support.status = 'active'
          )
        )
    )
  );

revoke all on table public.mentor_validation_requests from anon;
revoke all on table public.mentor_validation_approvals from anon;
grant select on table public.mentor_validation_requests to authenticated;
grant select on table public.mentor_validation_approvals to authenticated;

-- Replace the Family-only claim primitive with a staged Family + Mentor claim.
-- Other support roles remain fail-closed until their own validation contracts exist.
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
  access_state text,
  validation_request_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation_row record;
  authenticated_user_id uuid := auth.uid();
  authenticated_email text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  created_relationship_id uuid;
  created_validation_request_id uuid;
  canonical_permissions jsonb;
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

  if authenticated_email = ''
     or lower(trim(invitation_row.invitee_email)) <> authenticated_email then
    raise exception 'This invitation belongs to a different email address.'
      using errcode = '42501';
  end if;

  if invitation_row.status <> 'pending' then
    raise exception 'Invitation is already %.', invitation_row.status
      using errcode = '23505';
  end if;

  if desired_status = 'declined' then
    update public.support_invitations
       set status = 'declined',
           accepted_at = null,
           declined_at = now()
     where id = invitation_row.id;

    return query
    select
      invitation_row.destination,
      invitation_row.scholar_id,
      invitation_row.invitee_name,
      invitation_row.relationship,
      'declined'::text,
      'declined'::text,
      null::uuid;
    return;
  end if;

  if invitation_row.relationship = 'parent_guardian' then
    canonical_permissions := jsonb_build_array(
      'view_progress',
      'view_deadlines',
      'support_tasks'
    );

    insert into public.support_relationships (
      scholar_id,
      supporter_id,
      supporter_email,
      supporter_name,
      relationship,
      permissions,
      source_invitation_id,
      status
    ) values (
      invitation_row.scholar_id,
      authenticated_user_id,
      invitation_row.invitee_email,
      invitation_row.invitee_name,
      'parent_guardian',
      canonical_permissions,
      invitation_row.id,
      'active'
    );

    update public.support_invitations
       set status = 'accepted',
           accepted_at = now(),
           declined_at = null
     where id = invitation_row.id;

    return query
    select
      invitation_row.destination,
      invitation_row.scholar_id,
      invitation_row.invitee_name,
      invitation_row.relationship,
      'accepted'::text,
      'active'::text,
      null::uuid;
    return;
  end if;

  if invitation_row.relationship = 'mentor' then
    -- A pending Mentor relationship carries no access permissions. Canonical
    -- Mentor permissions are issued only after the approval threshold is met.
    insert into public.support_relationships (
      scholar_id,
      supporter_id,
      supporter_email,
      supporter_name,
      relationship,
      permissions,
      source_invitation_id,
      status
    ) values (
      invitation_row.scholar_id,
      authenticated_user_id,
      invitation_row.invitee_email,
      invitation_row.invitee_name,
      'mentor',
      '[]'::jsonb,
      invitation_row.id,
      'pending_validation'
    )
    returning id into created_relationship_id;

    insert into public.mentor_validation_requests (
      relationship_id,
      source_invitation_id,
      scholar_id,
      mentor_id,
      status
    ) values (
      created_relationship_id,
      invitation_row.id,
      invitation_row.scholar_id,
      authenticated_user_id,
      'pending'
    )
    returning id into created_validation_request_id;

    update public.support_invitations
       set status = 'accepted',
           accepted_at = now(),
           declined_at = null
     where id = invitation_row.id;

    return query
    select
      '/pending?role=mentor&validation=required'::text,
      invitation_row.scholar_id,
      invitation_row.invitee_name,
      invitation_row.relationship,
      'accepted'::text,
      'pending_validation'::text,
      created_validation_request_id;
    return;
  end if;

  raise exception '% invitation validation is not implemented.', invitation_row.relationship
    using errcode = '0A000';
end;
$$;

revoke all on function public.claim_support_invitation(text, text) from public;
grant execute on function public.claim_support_invitation(text, text) to authenticated;

create or replace function public.approve_mentor_validation(
  validation_request_id uuid
)
returns table (
  request_id uuid,
  validation_status text,
  validated boolean,
  valid_approval_count integer,
  validation_method text,
  destination text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  authenticated_user_id uuid := auth.uid();
  request_row public.mentor_validation_requests%rowtype;
  approver_row public.support_relationships%rowtype;
  approval_count integer := 0;
  has_parent_or_coach boolean := false;
  resolved_method text;
begin
  if authenticated_user_id is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  select request.*
    into request_row
    from public.mentor_validation_requests as request
   where request.id = validation_request_id
   for update;

  if not found then
    raise exception 'Mentor validation request not found.' using errcode = 'P0002';
  end if;

  if request_row.status = 'validated' then
    select
      count(distinct approval.approver_user_id)::integer,
      coalesce(bool_or(support.relationship in ('parent_guardian', 'coach')), false)
      into approval_count, has_parent_or_coach
      from public.mentor_validation_approvals as approval
      join public.support_relationships as support
        on support.id = approval.approver_relationship_id
     where approval.request_id = request_row.id
       and support.status = 'active'
       and support.scholar_id = request_row.scholar_id;

    return query
    select
      request_row.id,
      request_row.status,
      true,
      approval_count,
      request_row.validation_method,
      '/mentor-os'::text;
    return;
  end if;

  if request_row.status <> 'pending' then
    raise exception 'Mentor validation request is %.', request_row.status
      using errcode = '23505';
  end if;

  select support.*
    into approver_row
    from public.support_relationships as support
   where support.scholar_id = request_row.scholar_id
     and support.supporter_id = authenticated_user_id
     and support.supporter_id <> request_row.mentor_id
     and support.id <> request_row.relationship_id
     and support.status = 'active'
   order by
     case when support.relationship in ('parent_guardian', 'coach') then 0 else 1 end,
     support.created_at,
     support.id
   limit 1;

  if not found then
    raise exception 'Only an active member of this Scholar support system may validate a Mentor.'
      using errcode = '42501';
  end if;

  insert into public.mentor_validation_approvals (
    request_id,
    approver_relationship_id,
    approver_user_id,
    approver_relationship
  ) values (
    request_row.id,
    approver_row.id,
    authenticated_user_id,
    approver_row.relationship
  )
  on conflict (request_id, approver_user_id) do nothing;

  select
    count(distinct approval.approver_user_id)::integer,
    coalesce(bool_or(support.relationship in ('parent_guardian', 'coach')), false)
    into approval_count, has_parent_or_coach
    from public.mentor_validation_approvals as approval
    join public.support_relationships as support
      on support.id = approval.approver_relationship_id
   where approval.request_id = request_row.id
     and support.status = 'active'
     and support.scholar_id = request_row.scholar_id
     and support.supporter_id <> request_row.mentor_id;

  if has_parent_or_coach or approval_count >= 2 then
    resolved_method := case
      when has_parent_or_coach then 'parent_or_coach'
      else 'two_support_members'
    end;

    update public.mentor_validation_requests
       set status = 'validated',
           validation_method = resolved_method,
           validated_at = now(),
           updated_at = now()
     where id = request_row.id;

    update public.support_relationships
       set status = 'active',
           permissions = jsonb_build_array(
             'view_progress',
             'recommend_actions',
             'support_tasks'
           )
     where id = request_row.relationship_id
       and status = 'pending_validation';

    return query
    select
      request_row.id,
      'validated'::text,
      true,
      approval_count,
      resolved_method,
      '/mentor-os'::text;
    return;
  end if;

  return query
  select
    request_row.id,
    'pending'::text,
    false,
    approval_count,
    null::text,
    '/pending?role=mentor&validation=required'::text;
end;
$$;

revoke all on function public.approve_mentor_validation(uuid) from public;
grant execute on function public.approve_mentor_validation(uuid) to authenticated;
