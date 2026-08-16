-- High School Coach verification evidence.
-- A Coach may submit their own institutional/coaching evidence for review.
-- Submission never creates Scholar access and never creates an active `coach`
-- support relationship. Approval/rejection authority is intentionally not
-- granted to authenticated users in this migration; that verifier contract is
-- a separate governed capability.

create table if not exists public.coach_verification_requests (
  id uuid primary key default gen_random_uuid(),
  coach_user_id uuid not null unique references public.profiles(id) on delete cascade,
  school text not null,
  school_city text,
  school_state text,
  official_school_email text not null,
  primary_sport text not null,
  coach_role text not null,
  years_coaching text,
  roster_size text,
  upload_game_film text,
  send_player_recommendations text,
  support_focus jsonb not null default '[]'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'under_review', 'approved', 'rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coach_verification_status_idx
  on public.coach_verification_requests(status);

alter table public.coach_verification_requests enable row level security;

grant select, insert, update on public.coach_verification_requests to authenticated;

-- Coaches can see only their own verification request.
drop policy if exists "Coaches can view own verification request"
  on public.coach_verification_requests;
create policy "Coaches can view own verification request"
on public.coach_verification_requests
for select
to authenticated
using (coach_user_id = (select auth.uid()));

-- A request can only be created by the authenticated Coach role owner.
drop policy if exists "Coaches can submit own verification request"
  on public.coach_verification_requests;
create policy "Coaches can submit own verification request"
on public.coach_verification_requests
for insert
to authenticated
with check (
  coach_user_id = (select auth.uid())
  and status = 'pending'
  and exists (
    select 1
      from public.profiles as profile
     where profile.id = (select auth.uid())
       and coalesce(profile.profile_mode, profile.role, profile.requested_role) = 'coach'
       and profile.onboarding_completed = true
  )
);

-- Coaches may correct their evidence while the request remains pending. They
-- cannot self-approve, self-reject, add review notes, or mark review complete.
drop policy if exists "Coaches can update pending verification evidence"
  on public.coach_verification_requests;
create policy "Coaches can update pending verification evidence"
on public.coach_verification_requests
for update
to authenticated
using (
  coach_user_id = (select auth.uid())
  and status = 'pending'
)
with check (
  coach_user_id = (select auth.uid())
  and status = 'pending'
  and reviewed_at is null
  and review_notes is null
);
