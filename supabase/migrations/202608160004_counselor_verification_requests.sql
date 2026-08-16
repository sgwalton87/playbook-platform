create table if not exists public.counselor_verification_requests (
  id uuid primary key default gen_random_uuid(),
  counselor_user_id uuid not null unique references public.profiles(id) on delete cascade,
  school text not null,
  school_district text,
  official_email text not null,
  counselor_scope jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending','under_review','approved','rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.counselor_verification_requests enable row level security;
grant select, insert, update on public.counselor_verification_requests to authenticated;

drop policy if exists "Counselors can view own verification request" on public.counselor_verification_requests;
create policy "Counselors can view own verification request"
on public.counselor_verification_requests for select to authenticated
using (counselor_user_id = (select auth.uid()));

drop policy if exists "Counselors can submit own verification request" on public.counselor_verification_requests;
create policy "Counselors can submit own verification request"
on public.counselor_verification_requests for insert to authenticated
with check (
  counselor_user_id = (select auth.uid())
  and status = 'pending'
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and coalesce(p.profile_mode,p.role,p.requested_role) = 'high-school-counselor'
      and p.onboarding_completed = true
  )
);

drop policy if exists "Counselors can update pending verification evidence" on public.counselor_verification_requests;
create policy "Counselors can update pending verification evidence"
on public.counselor_verification_requests for update to authenticated
using (counselor_user_id = (select auth.uid()) and status = 'pending')
with check (
  counselor_user_id = (select auth.uid())
  and status = 'pending'
  and reviewed_at is null
  and review_notes is null
);
