-- Safe public Scholar Record projection and public-media boundary.
--
-- public.profiles remains the canonical identity/profile record and keeps its
-- owner-only RLS. This migration exposes only an explicit presentation-grade
-- subset through a narrow RPC. Internal onboarding, verification, household,
-- safety, administration, contact, and authority fields remain inaccessible.

create or replace function public.get_public_scholar_profile(requested_username text)
returns table (
  id uuid,
  username text,
  full_name text,
  first_name text,
  last_name text,
  role text,
  avatar_url text,
  cover_url text,
  bio text,
  location text,
  city text,
  state text,
  school text,
  sport text,
  grad_year integer,
  grade text,
  gpa numeric,
  weighted_gpa numeric,
  unweighted_gpa numeric,
  academic_gpa numeric,
  sat_score integer,
  act_score integer,
  intended_major text,
  dream_school text,
  position text,
  height text,
  weight text,
  dominant_hand text,
  jersey_number text,
  travel_team text,
  club_team text,
  coach_name text,
  highlight_reel_url text,
  hudl text,
  youtube text,
  tiktok text,
  instagram text,
  twitter text,
  linkedin text,
  ideal_profession text,
  desired_salary_range text,
  recruiting_status text,
  desired_college_level text,
  favorite_quote text,
  xp integer,
  coin_balance integer,
  profile_visibility text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id,
    p.username,
    p.full_name,
    p.first_name,
    p.last_name,
    private.normalize_playbook_profile_role(coalesce(p.profile_mode, p.role, p.requested_role)) as role,
    p.avatar_url,
    p.cover_url,
    p.bio,
    p.location,
    p.city,
    p.state,
    p.school,
    p.sport,
    p.grad_year,
    p.grade,
    p.gpa,
    p.weighted_gpa,
    p.unweighted_gpa,
    p.academic_gpa,
    p.sat_score,
    p.act_score,
    p.intended_major,
    p.dream_school,
    p.position,
    p.height,
    p.weight,
    p.dominant_hand,
    p.jersey_number,
    p.travel_team,
    p.club_team,
    p.coach_name,
    p.highlight_reel_url,
    p.hudl,
    p.youtube,
    p.tiktok,
    p.instagram,
    p.twitter,
    p.linkedin,
    p.ideal_profession,
    p.desired_salary_range,
    p.recruiting_status,
    p.desired_college_level,
    p.favorite_quote,
    p.xp,
    p.coin_balance,
    p.profile_visibility
  from public.profiles p
  where lower(trim(p.username)) = lower(trim(requested_username))
    and private.normalize_playbook_profile_role(coalesce(p.profile_mode, p.role, p.requested_role))
      in ('scholar', 'scholar-athlete', 'transition-youth')
    and (
      p.profile_visibility = 'public'
      or p.id = auth.uid()
    )
  limit 1;
$$;

revoke all on function public.get_public_scholar_profile(text) from public, anon, authenticated;
grant execute on function public.get_public_scholar_profile(text) to anon, authenticated;

comment on function public.get_public_scholar_profile(text) is
  'Returns only presentation-grade learner profile fields when the profile is public or owned by the caller. Canonical data remains in public.profiles.';

-- Feed rows must respect their declared visibility. Historical unconditional
-- SELECT policies accidentally made every feed row public.
drop policy if exists "Public can read feed posts" on public.feed_posts;
drop policy if exists "Public can view feed posts" on public.feed_posts;
drop policy if exists "Public can view public feed posts" on public.feed_posts;
create policy "Public can view public feed posts"
on public.feed_posts
for select
to public
using (visibility = 'public');

drop policy if exists "Users can view own feed posts" on public.feed_posts;
create policy "Users can view own feed posts"
on public.feed_posts
for select
to authenticated
using ((select auth.uid()) = user_id);

-- The photos bucket is intentionally public-read media, but uploads must be
-- authenticated and namespaced to the authenticated user's first path segment.
-- Anonymous/public uploads are prohibited.
drop policy if exists "Allow public uploads" on storage.objects;
drop policy if exists "Allow uploads" on storage.objects;

drop policy if exists "Authenticated users upload own public photos" on storage.objects;
create policy "Authenticated users upload own public photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (storage.foldername(name))[2] in ('feed', 'gallery')
);
