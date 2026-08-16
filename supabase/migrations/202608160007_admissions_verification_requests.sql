create table if not exists public.admissions_verification_requests (
  id uuid primary key default gen_random_uuid(),
  admissions_user_id uuid not null unique references public.profiles(id) on delete cascade,
  college_name text not null,
  department text not null,
  admissions_region text,
  official_edu_email text not null,
  minimum_gpa_threshold text,
  target_majors jsonb not null default '[]'::jsonb,
  student_populations jsonb not null default '[]'::jsonb,
  student_contact_preference text,
  engagement_opportunities jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending','under_review','approved','rejected')),
  submitted_at timestamptz not null default now(), reviewed_at timestamptz, review_notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

alter table public.admissions_verification_requests enable row level security;
grant select, insert, update on public.admissions_verification_requests to authenticated;

drop policy if exists "Admissions users can view own verification request" on public.admissions_verification_requests;
create policy "Admissions users can view own verification request" on public.admissions_verification_requests for select to authenticated using (admissions_user_id = (select auth.uid()));

drop policy if exists "Admissions users can submit own verification request" on public.admissions_verification_requests;
create policy "Admissions users can submit own verification request" on public.admissions_verification_requests for insert to authenticated with check (
  admissions_user_id = (select auth.uid()) and status = 'pending' and exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.profile_mode,p.role::text,p.requested_role) = 'college-admissions' and p.onboarding_completed = true
  )
);

drop policy if exists "Admissions users can update pending verification evidence" on public.admissions_verification_requests;
create policy "Admissions users can update pending verification evidence" on public.admissions_verification_requests for update to authenticated
using (admissions_user_id = (select auth.uid()) and status = 'pending')
with check (admissions_user_id = (select auth.uid()) and status = 'pending' and reviewed_at is null and review_notes is null);
