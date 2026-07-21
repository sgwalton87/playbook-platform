-- ============================================================
-- PLAYBOOK FOUNDER ACADEMY
-- Sprint 2: Internal Applications
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.founder_applications (
  id uuid primary key default gen_random_uuid(),

  applicant_id uuid not null references auth.users(id) on delete cascade,

  cohort_name text not null default 'Fall 2026',

  status text not null default 'draft'
    check (
      status in (
        'draft',
        'submitted',
        'under_review',
        'interview',
        'accepted',
        'waitlisted',
        'declined'
      )
    ),

  -- Student information
  full_name text,
  preferred_name text,
  email text,
  phone text,
  age integer,
  grade_level text,
  school_name text,
  city text,
  referral_organization text,

  -- Parent / guardian
  guardian_name text,
  guardian_relationship text,
  guardian_email text,
  guardian_phone text,

  -- Business idea
  business_name text,
  business_description text,
  product_or_service text,
  target_customer text,
  problem_solved text,
  competitive_difference text,
  business_stage text,

  -- Entrepreneur mindset
  entrepreneurship_motivation text,
  program_motivation text,
  learning_goals text,
  challenge_overcome text,
  setback_response text,
  weekly_commitment text,

  -- Startup funding
  funding_plan text,
  supplies_needed text,
  eight_week_goal text,

  -- Availability and support
  can_attend_weekly boolean,
  can_attend_showcase boolean,
  can_complete_assignments boolean,
  transportation_needs text,
  accommodation_needs text,

  -- Storytelling
  media_comfort text,
  smartphone_access text,
  bonus_video_path text,

  -- Final responses
  dream_business text,
  selection_case text,
  additional_information text,

  -- Agreements
  funding_agreement boolean not null default false,
  attendance_agreement boolean not null default false,
  assignment_agreement boolean not null default false,
  professionalism_agreement boolean not null default false,
  accuracy_agreement boolean not null default false,

  applicant_signature text,
  guardian_signature text,
  signature_date date,

  -- Review fields
  motivation_score integer check (
    motivation_score is null or motivation_score between 0 and 30
  ),
  feasibility_score integer check (
    feasibility_score is null or feasibility_score between 0 and 25
  ),
  customer_score integer check (
    customer_score is null or customer_score between 0 and 20
  ),
  coachability_score integer check (
    coachability_score is null or coachability_score between 0 and 15
  ),
  communication_score integer check (
    communication_score is null or communication_score between 0 and 10
  ),

  reviewer_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,

  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (applicant_id, cohort_name)
);

create index if not exists founder_applications_applicant_idx
  on public.founder_applications(applicant_id);

create index if not exists founder_applications_status_idx
  on public.founder_applications(status);

create index if not exists founder_applications_cohort_idx
  on public.founder_applications(cohort_name);

alter table public.founder_applications enable row level security;

drop policy if exists "Applicants can view own founder application"
  on public.founder_applications;

create policy "Applicants can view own founder application"
on public.founder_applications
for select
to authenticated
using (auth.uid() = applicant_id);

drop policy if exists "Applicants can create own founder application"
  on public.founder_applications;

create policy "Applicants can create own founder application"
on public.founder_applications
for insert
to authenticated
with check (auth.uid() = applicant_id);

drop policy if exists "Applicants can update own application before review"
  on public.founder_applications;

create policy "Applicants can update own application before review"
on public.founder_applications
for update
to authenticated
using (
  auth.uid() = applicant_id
  and status in ('draft', 'submitted')
)
with check (
  auth.uid() = applicant_id
);

-- Admin access follows the existing profiles.role structure.
-- Add additional staff roles here later if needed.

drop policy if exists "Admins can view all founder applications"
  on public.founder_applications;

create policy "Admins can view all founder applications"
on public.founder_applications
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "Admins can update founder applications"
  on public.founder_applications;

create policy "Admins can update founder applications"
on public.founder_applications
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create or replace function public.set_founder_application_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists founder_application_updated_at
  on public.founder_applications;

create trigger founder_application_updated_at
before update on public.founder_applications
for each row
execute function public.set_founder_application_updated_at();

-- ============================================================
-- PRIVATE VIDEO STORAGE
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'founder-application-videos',
  'founder-application-videos',
  false,
  104857600,
  array[
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]
)
on conflict (id) do nothing;

drop policy if exists "Applicants upload own founder videos"
  on storage.objects;

create policy "Applicants upload own founder videos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'founder-application-videos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Applicants view own founder videos"
  on storage.objects;

create policy "Applicants view own founder videos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'founder-application-videos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Applicants update own founder videos"
  on storage.objects;

create policy "Applicants update own founder videos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'founder-application-videos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'founder-application-videos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Admins view founder application videos"
  on storage.objects;

create policy "Admins view founder application videos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'founder-application-videos'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);
