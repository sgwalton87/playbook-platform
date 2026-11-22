-- Server-owned SMTP acceptance evidence. SMTP acceptance does not prove inbox delivery.
create table public.support_invitation_smtp_receipts (
  invitation_id uuid primary key references public.support_invitations(id) on delete cascade,
  message_id text not null check (length(message_id) between 1 and 1024),
  accepted_at timestamptz not null default now()
);

alter table public.support_invitation_smtp_receipts enable row level security;
revoke all on table public.support_invitation_smtp_receipts from public, anon, authenticated, service_role;
grant select, insert on table public.support_invitation_smtp_receipts to service_role;
