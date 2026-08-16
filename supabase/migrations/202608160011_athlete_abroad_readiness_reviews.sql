create table if not exists public.athlete_abroad_readiness_reviews (
  id uuid primary key default gen_random_uuid(),
  athlete_user_id uuid not null unique references public.profiles(id) on delete cascade,
  destination_regions jsonb not null default '[]'::jsonb,
  passport_readiness text not null,
  eligibility_context text not null,
  support_needs jsonb not null default '[]'::jsonb,
  review_status text not null default 'pending' check (review_status in ('pending','under_review','approved','rejected')),
  jurisdiction_scope_status text not null default 'pending' check (jurisdiction_scope_status in ('pending','approved','rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.athlete_abroad_readiness_reviews enable row level security;
grant select, insert, update on public.athlete_abroad_readiness_reviews to authenticated;

drop policy if exists "Athletes Abroad can view own readiness review" on public.athlete_abroad_readiness_reviews;
create policy "Athletes Abroad can view own readiness review" on public.athlete_abroad_readiness_reviews
for select to authenticated using (athlete_user_id = (select auth.uid()));

drop policy if exists "Athletes Abroad can submit own readiness review" on public.athlete_abroad_readiness_reviews;
create policy "Athletes Abroad can submit own readiness review" on public.athlete_abroad_readiness_reviews
for insert to authenticated with check (
  athlete_user_id = (select auth.uid()) and review_status = 'pending' and jurisdiction_scope_status = 'pending'
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and coalesce(p.profile_mode,p.role,p.requested_role) = 'athlete-abroad'
      and p.onboarding_completed = true
  )
);

drop policy if exists "Athletes Abroad can update pending readiness evidence" on public.athlete_abroad_readiness_reviews;
create policy "Athletes Abroad can update pending readiness evidence" on public.athlete_abroad_readiness_reviews
for update to authenticated
using (athlete_user_id = (select auth.uid()) and review_status = 'pending' and jurisdiction_scope_status = 'pending')
with check (
  athlete_user_id = (select auth.uid()) and review_status = 'pending' and jurisdiction_scope_status = 'pending'
  and reviewed_at is null and review_notes is null
);
