-- Govern Family support-network consent as one atomic, authenticated claim.
-- The invitee must be the signed-in account whose JWT email matches the
-- invitation. Parent/Guardian acceptance creates exactly one relationship and
-- consumes the invitation in the same transaction; decline consumes it without
-- creating access. Other relationship types remain fail-closed until their
-- verification contracts are implemented.

create unique index if not exists support_relationships_source_invitation_unique
  on public.support_relationships (source_invitation_id)
  where source_invitation_id is not null;

create or replace function public.claim_support_invitation(
  invitation_token text,
  desired_status text default 'accepted'
)
returns table (
  destination text,
  scholar_id uuid,
  invitee_name text,
  relationship text,
  status text
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  invitation_row public.support_invitations%rowtype;
  authenticated_user_id uuid := auth.uid();
  authenticated_email text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
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

  -- Family is the only support relationship whose accepted authority contract
  -- is complete in this package. Mentor, Educator, District, University, and
  -- Employer relationships require separate verification/authority contracts.
  if invitation_row.relationship <> 'parent_guardian' then
    raise exception 'This relationship requires a governed verification contract before access can be activated.' using errcode = '42501';
  end if;

  if desired_status = 'accepted' then
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
      invitation_row.relationship,
      invitation_row.permissions,
      invitation_row.id,
      'active'
    );

    update public.support_invitations
       set status = 'accepted',
           accepted_at = now(),
           declined_at = null
     where id = invitation_row.id;
  else
    update public.support_invitations
       set status = 'declined',
           accepted_at = null,
           declined_at = now()
     where id = invitation_row.id;
  end if;

  return query
  select
    invitation_row.destination,
    invitation_row.scholar_id,
    invitation_row.invitee_name,
    invitation_row.relationship,
    desired_status;
end;
$$;

revoke all on function public.claim_support_invitation(text, text) from public;
grant execute on function public.claim_support_invitation(text, text) to authenticated;
