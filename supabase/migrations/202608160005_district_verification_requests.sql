create table if not exists public.district_verification_requests (
  id uuid primary key default gen_random_uuid(),
  administrator_user_id uuid not null unique references public.profiles(id) on delete cascade,
  school_district text not null,
  school text,
  official_email text not null,
  administrator_title text not null,
  administrative_scope jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending','under_review','approved','rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.district_verification_requests enable row level security;
grant select, insert, update on public.district_verification_requests to authenticated;

drop policy if exists "Administrators can view own verification request" on public.district_verification_requests;
create policy "Administrators can view own verification request"
on public.district_verification_requests for select to authenticated
using (administrator_user_id = (select auth.uid()));

drop policy if exists "Administrators can submit own verification request" on public.district_verification_requests;
create policy "Administrators can submit own verification request"
on public.district_verification_requests for insert to authenticated
with check (
  administrator_user_id = (select auth.uid())
  and status = 'pending'
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and coalesce(p.profile_mode,p.role::text,p.requested_role) = 'district'
      and p.onboarding_completed = true
  )
);

drop policy if exists "Administrators can update pending verification evidence" on public.district_verification_requests;
create policy "Administrators can update pending verification evidence"
on public.district_verification_requests for update to authenticated
using (administrator_user_id = (select auth.uid()) and status = 'pending')
with check (
  administrator_user_id = (select auth.uid())
  and status = 'pending'
  and reviewed_at is null
  and review_notes is null
);
