-- Independent verification requests for Educator, High School Counselor, and
-- High School Coach. Shared infrastructure does not imply shared authority.

create table if not exists public.role_verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  requested_role text not null
    check (requested_role in ('educator', 'high-school-counselor', 'coach')),
  official_email text not null,
  organization_name text not null,
  evidence jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'expired')),
  submitted_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days'),
  reviewed_at timestamptz,
  reviewed_by uuid,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists role_verification_requests_user_idx
  on public.role_verification_requests(user_id);
create index if not exists role_verification_requests_status_idx
  on public.role_verification_requests(status);
create unique index if not exists role_verification_requests_one_pending_per_role
  on public.role_verification_requests(user_id, requested_role)
  where status = 'pending';

alter table public.role_verification_requests enable row level security;
grant select, insert on public.role_verification_requests to authenticated;

-- Users may inspect their own request.
drop policy if exists "Users can view own role verification requests"
  on public.role_verification_requests;
create policy "Users can view own role verification requests"
on public.role_verification_requests
for select
to authenticated
using (user_id = (select auth.uid()));

-- Submission is self-owned, role-scoped, pending-only, and cannot contain review
-- output. Approval/rejection updates are intentionally unavailable to users.
drop policy if exists "Users can submit own institutional verification requests"
  on public.role_verification_requests;
create policy "Users can submit own institutional verification requests"
on public.role_verification_requests
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and requested_role in ('educator', 'high-school-counselor', 'coach')
  and status = 'pending'
  and reviewed_at is null
  and reviewed_by is null
  and review_notes is null
);

-- Verification status on profiles is an authority field, not a user profile
-- preference. Preserve the one browser-owned transition required by signup and
-- reject all user attempts to manufacture approval/rejection evidence.
create or replace function public.protect_profile_verification_authority()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null or auth.uid() <> new.id then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.verification_status in ('approved', 'rejected') then
      raise exception 'Users cannot self-assign a privileged verification status.' using errcode = '42501';
    end if;
    if new.verification_expires_at is not null then
      raise exception 'Users cannot self-assign verification expiration.' using errcode = '42501';
    end if;
    return new;
  end if;

  if new.verification_status is distinct from old.verification_status then
    if not (
      old.verification_status = 'email_pending'
      and new.verification_status = 'email_confirmed'
    ) then
      raise exception 'Verification status is controlled by the governed review process.' using errcode = '42501';
    end if;
  end if;

  if new.verification_expires_at is distinct from old.verification_expires_at then
    raise exception 'Verification expiration is controlled by the governed review process.' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_verification_authority
  on public.profiles;
create trigger protect_profile_verification_authority
before insert or update on public.profiles
for each row execute function public.protect_profile_verification_authority();

-- Review writes are deliberately not granted to authenticated. A privileged
-- administrative/service workflow will own approved/rejected transitions.
revoke update, delete on public.role_verification_requests from authenticated;
