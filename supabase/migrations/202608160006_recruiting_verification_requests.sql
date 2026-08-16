create table if not exists public.recruiting_verification_requests (
  id uuid primary key default gen_random_uuid(),
  recruiter_user_id uuid not null unique references public.profiles(id) on delete cascade,
  college_name text not null,
  conference text,
  division_level text,
  official_edu_email text not null,
  primary_sport_recruiting text not null,
  positions_recruiting text,
  recruiting_radius jsonb not null default '[]'::jsonb,
  graduation_classes_recruiting jsonb not null default '[]'::jsonb,
  preferred_recruiting_contact text,
  authorization_status text,
  status text not null default 'pending' check (status in ('pending','under_review','approved','rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.recruiting_verification_requests enable row level security;
grant select, insert, update on public.recruiting_verification_requests to authenticated;

drop policy if exists "Recruiters can view own verification request" on public.recruiting_verification_requests;
create policy "Recruiters can view own verification request"
on public.recruiting_verification_requests for select to authenticated
using (recruiter_user_id = (select auth.uid()));

drop policy if exists "Recruiters can submit own verification request" on public.recruiting_verification_requests;
create policy "Recruiters can submit own verification request"
on public.recruiting_verification_requests for insert to authenticated
with check (
  recruiter_user_id = (select auth.uid())
  and status = 'pending'
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and coalesce(p.profile_mode,p.role,p.requested_role) = 'college-coach'
      and p.onboarding_completed = true
  )
);

drop policy if exists "Recruiters can update pending verification evidence" on public.recruiting_verification_requests;
create policy "Recruiters can update pending verification evidence"
on public.recruiting_verification_requests for update to authenticated
using (recruiter_user_id = (select auth.uid()) and status = 'pending')
with check (
  recruiter_user_id = (select auth.uid())
  and status = 'pending'
  and reviewed_at is null
  and review_notes is null
);
