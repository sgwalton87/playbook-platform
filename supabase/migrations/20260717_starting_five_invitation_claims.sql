create extension if not exists pgcrypto;

-- A support-network row becomes permanently linked to the supporter
-- after the invited person creates or signs into their Playbook profile.
alter table public.support_network_members
  add column if not exists supporter_profile_id uuid
    references public.profiles(id) on delete set null;

create index if not exists
  support_network_members_supporter_profile_id_idx
on public.support_network_members (supporter_profile_id);

create index if not exists
  support_network_members_pending_email_idx
on public.support_network_members (lower(email))
where supporter_profile_id is null
  and email is not null;

-- Invitations are separate from the permanent scholar/supporter relationship.
create table if not exists public.starting_five_invitations (
  id uuid primary key default gen_random_uuid(),

  member_id uuid not null
    references public.support_network_members(id)
    on delete cascade,

  invited_email text not null,
  token_hash text not null unique,

  expires_at timestamptz not null,
  sent_at timestamptz,
  claimed_at timestamptz,
  revoked_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists
  starting_five_invitations_member_id_idx
on public.starting_five_invitations (member_id);

create index if not exists
  starting_five_invitations_email_idx
on public.starting_five_invitations (lower(invited_email));

create index if not exists
  starting_five_invitations_active_idx
on public.starting_five_invitations (expires_at)
where claimed_at is null
  and revoked_at is null;

alter table public.starting_five_invitations enable row level security;

-- Claim an invitation only after the invited person has authenticated
-- with the same email address that received the invitation.
create or replace function public.claim_starting_five_invitation(
  p_token text
)
returns public.support_network_members
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  authenticated_email text;
  invitation_record public.starting_five_invitations;
  claimed_member public.support_network_members;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to claim this invitation.';
  end if;

  select email
  into authenticated_email
  from auth.users
  where id = auth.uid();

  if authenticated_email is null then
    raise exception 'Your Playbook account does not have an email address.';
  end if;

  select *
  into invitation_record
  from public.starting_five_invitations
  where token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and claimed_at is null
    and revoked_at is null
    and expires_at > now()
  for update;

  if invitation_record.id is null then
    raise exception 'This invitation is invalid, expired, revoked, or already claimed.';
  end if;

  if lower(invitation_record.invited_email) <> lower(authenticated_email) then
    raise exception 'This invitation belongs to a different email address.';
  end if;

  update public.support_network_members
  set
    supporter_profile_id = auth.uid(),
    status = 'connected',
    accepted_at = coalesce(accepted_at, now()),
    updated_at = now()
  where id = invitation_record.member_id
    and supporter_profile_id is null
  returning *
  into claimed_member;

  if claimed_member.id is null then
    raise exception 'This Starting Five relationship has already been claimed.';
  end if;

  update public.starting_five_invitations
  set
    claimed_at = now(),
    updated_at = now()
  where id = invitation_record.id;

  return claimed_member;
end;
$$;

revoke all
on function public.claim_starting_five_invitation(text)
from public;

grant execute
on function public.claim_starting_five_invitation(text)
to authenticated;
