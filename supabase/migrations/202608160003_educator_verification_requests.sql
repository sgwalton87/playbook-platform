create table if not exists public.educator_verification_requests (
  id uuid primary key default gen_random_uuid(),
  educator_user_id uuid not null unique references public.profiles(id) on delete cascade,
  school text not null,
  school_district text,
  official_edu_email text not null,
  subjects_taught jsonb not null default '[]'::jsonb,
  existing_students_to_support text,
  open_to_letters text,
  support_focus jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending','under_review','approved','rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.educator_verification_requests enable row level security;
grant select, insert, update on public.educator_verification_requests to authenticated;

drop policy if exists "Educators can view own verification request" on public.educator_verification_requests;
create policy "Educators can view own verification request"
on public.educator_verification_requests for select to authenticated
using (educator_user_id = (select auth.uid()));

drop policy if exists "Educators can submit own verification request" on public.educator_verification_requests;
create policy "Educators can submit own verification request"
on public.educator_verification_requests for insert to authenticated
with check (
  educator_user_id = (select auth.uid())
  and status = 'pending'
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and coalesce(p.profile_mode,p.role::text,p.requested_role) = 'educator'
      and p.onboarding_completed = true
  )
);

drop policy if exists "Educators can update pending verification evidence" on public.educator_verification_requests;
create policy "Educators can update pending verification evidence"
on public.educator_verification_requests for update to authenticated
using (educator_user_id = (select auth.uid()) and status = 'pending')
with check (
  educator_user_id = (select auth.uid())
  and status = 'pending'
  and reviewed_at is null
  and review_notes is null
);
