create table if not exists public.community_partner_verification_requests (
  id uuid primary key default gen_random_uuid(),
  partner_user_id uuid not null unique references public.profiles(id) on delete cascade,
  organization_name text not null,
  organization_type text not null,
  official_email text not null,
  organization_website text,
  community_services jsonb not null default '[]'::jsonb,
  service_area text not null,
  status text not null default 'pending' check (status in ('pending','under_review','approved','rejected')),
  service_scope_status text not null default 'pending' check (service_scope_status in ('pending','approved','rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.community_partner_verification_requests enable row level security;
grant select, insert, update on public.community_partner_verification_requests to authenticated;

drop policy if exists "Community partners can view own verification request" on public.community_partner_verification_requests;
create policy "Community partners can view own verification request" on public.community_partner_verification_requests
for select to authenticated using (partner_user_id = (select auth.uid()));

drop policy if exists "Community partners can submit own verification request" on public.community_partner_verification_requests;
create policy "Community partners can submit own verification request" on public.community_partner_verification_requests
for insert to authenticated with check (
  partner_user_id = (select auth.uid()) and status = 'pending' and service_scope_status = 'pending'
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and coalesce(p.profile_mode,p.role,p.requested_role) = 'other'
      and p.onboarding_completed = true
  )
);

drop policy if exists "Community partners can update pending verification evidence" on public.community_partner_verification_requests;
create policy "Community partners can update pending verification evidence" on public.community_partner_verification_requests
for update to authenticated
using (partner_user_id = (select auth.uid()) and status = 'pending' and service_scope_status = 'pending')
with check (
  partner_user_id = (select auth.uid()) and status = 'pending' and service_scope_status = 'pending'
  and reviewed_at is null and review_notes is null
);
