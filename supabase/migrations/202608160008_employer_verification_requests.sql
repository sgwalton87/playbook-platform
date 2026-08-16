create table if not exists public.employer_verification_requests (
  id uuid primary key default gen_random_uuid(),
  employer_user_id uuid not null unique references public.profiles(id) on delete cascade,
  organization_name text not null,
  official_email text not null,
  organization_website text,
  opportunity_types jsonb not null default '[]'::jsonb,
  candidate_audience text,
  status text not null default 'pending' check (status in ('pending','under_review','approved','rejected')),
  submitted_at timestamptz not null default now(), reviewed_at timestamptz, review_notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.employer_verification_requests enable row level security;
grant select, insert, update on public.employer_verification_requests to authenticated;

drop policy if exists "Employers can view own verification request" on public.employer_verification_requests;
create policy "Employers can view own verification request" on public.employer_verification_requests for select to authenticated using (employer_user_id = (select auth.uid()));

drop policy if exists "Employers can submit own verification request" on public.employer_verification_requests;
create policy "Employers can submit own verification request" on public.employer_verification_requests for insert to authenticated with check (
  employer_user_id = (select auth.uid()) and status = 'pending' and exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.profile_mode,p.role::text,p.requested_role) = 'employer' and p.onboarding_completed = true
  )
);

drop policy if exists "Employers can update pending verification evidence" on public.employer_verification_requests;
create policy "Employers can update pending verification evidence" on public.employer_verification_requests for update to authenticated
using (employer_user_id = (select auth.uid()) and status = 'pending')
with check (employer_user_id = (select auth.uid()) and status = 'pending' and reviewed_at is null and review_notes is null);
