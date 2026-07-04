create table if not exists public.support_invitations (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null,
  scholar_name text,
  invitee_name text not null,
  invitee_email text not null,
  relationship text not null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined')),
  token text not null unique,
  permissions jsonb not null default '[]'::jsonb,
  destination text not null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  declined_at timestamptz
);

create index if not exists support_invitations_token_idx
on public.support_invitations(token);

create index if not exists support_invitations_scholar_idx
on public.support_invitations(scholar_id);

create index if not exists support_invitations_email_idx
on public.support_invitations(lower(invitee_email));

alter table public.support_invitations enable row level security;

drop policy if exists "Users can create support invitations"
on public.support_invitations;

create policy "Users can create support invitations"
on public.support_invitations
for insert
to authenticated
with check (auth.uid() = scholar_id);

drop policy if exists "Scholars can view their invitations"
on public.support_invitations;

create policy "Scholars can view their invitations"
on public.support_invitations
for select
to authenticated
using (auth.uid() = scholar_id);

drop policy if exists "Invitees can read invitations by email"
on public.support_invitations;

create policy "Invitees can read invitations by email"
on public.support_invitations
for select
to authenticated
using (
  lower(invitee_email) =
  lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "Invitees can update their invitation status"
on public.support_invitations;

create policy "Invitees can update their invitation status"
on public.support_invitations
for update
to authenticated
using (
  lower(invitee_email) =
  lower(coalesce(auth.jwt() ->> 'email', ''))
)
with check (
  lower(invitee_email) =
  lower(coalesce(auth.jwt() ->> 'email', ''))
);
