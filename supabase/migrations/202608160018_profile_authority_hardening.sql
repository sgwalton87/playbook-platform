-- Harden public.profiles as an identity/profile record rather than an
-- authority-escalation surface. Historically authenticated users had broad
-- INSERT/UPDATE table privileges on their own row, which allowed direct writes
-- to role, verification, onboarding-completion, admin, and reward fields.
--
-- This migration preserves user-editable profile data while moving durable role
-- initialization/selection and onboarding completion behind exact authenticated
-- RPC boundaries. Role identity still does not grant downstream role authority.

alter table public.profiles
  alter column verification_status set default 'email_pending'::text;

create schema if not exists private;

create or replace function private.normalize_playbook_profile_role(input_role text)
returns text
language sql
immutable
security invoker
set search_path = ''
as $$
  select case lower(trim(coalesce(input_role, '')))
    when 'scholar' then 'scholar'
    when 'student' then 'scholar'
    when 'learner' then 'scholar'
    when 'scholar-athlete' then 'scholar-athlete'
    when 'scholar_athlete' then 'scholar-athlete'
    when 'athlete' then 'scholar-athlete'
    when 'transition-youth' then 'transition-youth'
    when 'tay' then 'transition-youth'
    when 'family' then 'family'
    when 'parent' then 'family'
    when 'guardian' then 'family'
    when 'mentor' then 'mentor'
    when 'educator' then 'educator'
    when 'teacher' then 'educator'
    when 'high-school-counselor' then 'high-school-counselor'
    when 'counselor' then 'high-school-counselor'
    when 'coach' then 'coach'
    when 'high-school-coach' then 'coach'
    when 'college-coach' then 'college-coach'
    when 'recruiter' then 'college-coach'
    when 'college-admissions' then 'college-admissions'
    when 'admissions' then 'college-admissions'
    when 'admissions-officer' then 'college-admissions'
    when 'brand-partner' then 'brand-partner'
    when 'brand_partner' then 'brand-partner'
    when 'employer' then 'employer'
    when 'workforce' then 'employer'
    when 'district' then 'district'
    when 'admin' then 'district'
    when 'school_admin' then 'district'
    when 'athlete-abroad' then 'athlete-abroad'
    when 'international_athlete' then 'athlete-abroad'
    when 'other' then 'other'
    when 'community-partner' then 'other'
    when 'community_partner' then 'other'
    else null
  end;
$$;

create or replace function private.initialize_playbook_profile(desired_role text)
returns table (
  role text,
  profile_mode text,
  verification_status text,
  onboarding_completed boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  authenticated_user_id uuid := auth.uid();
  authenticated_email text := nullif(trim(coalesce(auth.jwt() ->> 'email', '')), '');
  normalized_role text := private.normalize_playbook_profile_role(desired_role);
  existing_role text;
begin
  if authenticated_user_id is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  if normalized_role is null then
    raise exception 'Unsupported Playbook role.' using errcode = '22023';
  end if;

  select private.normalize_playbook_profile_role(
           coalesce(p.profile_mode, p.role, p.requested_role)
         )
    into existing_role
    from public.profiles p
   where p.id = authenticated_user_id;

  if found then
    if existing_role is null or existing_role <> normalized_role then
      raise exception 'Existing durable Playbook role does not match requested role.' using errcode = '42501';
    end if;

    update public.profiles
       set email = coalesce(email, authenticated_email),
           verification_status = case
             when verification_status is null
               or verification_status in ('email_pending', 'email_confirmed')
             then 'email_confirmed'
             else verification_status
           end,
           updated_at = now()
     where id = authenticated_user_id;
  else
    insert into public.profiles (
      id,
      email,
      role,
      profile_mode,
      requested_role,
      verification_status,
      onboarding_completed,
      onboarding_completed_at,
      updated_at
    ) values (
      authenticated_user_id,
      authenticated_email,
      normalized_role,
      normalized_role,
      normalized_role,
      'email_confirmed',
      false,
      null,
      now()
    );
  end if;

  return query
    select p.role, p.profile_mode, p.verification_status, p.onboarding_completed
      from public.profiles p
     where p.id = authenticated_user_id;
end;
$$;

create or replace function private.select_playbook_role(desired_role text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  authenticated_user_id uuid := auth.uid();
  normalized_role text := private.normalize_playbook_profile_role(desired_role);
  current_role text;
  completed boolean;
begin
  if authenticated_user_id is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  if normalized_role is null then
    raise exception 'Unsupported Playbook role.' using errcode = '22023';
  end if;

  select private.normalize_playbook_profile_role(
           coalesce(p.profile_mode, p.role, p.requested_role)
         ), coalesce(p.onboarding_completed, false)
    into current_role, completed
    from public.profiles p
   where p.id = authenticated_user_id
   for update;

  if not found then
    raise exception 'A durable Playbook profile is required before role selection.' using errcode = 'P0002';
  end if;

  if completed and current_role is distinct from normalized_role then
    raise exception 'Playbook role is locked after onboarding completion.' using errcode = '42501';
  end if;

  if current_role is distinct from normalized_role then
    update public.profiles
       set role = normalized_role,
           profile_mode = normalized_role,
           requested_role = normalized_role,
           verification_status = 'email_confirmed',
           verification_requested_at = null,
           verification_expires_at = null,
           verified_at = null,
           verified_by = null,
           updated_at = now()
     where id = authenticated_user_id;
  end if;

  return normalized_role;
end;
$$;

create or replace function private.complete_playbook_onboarding(
  expected_role text,
  mark_verification_pending boolean default false
)
returns table (
  onboarding_completed_at timestamptz,
  verification_status text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  authenticated_user_id uuid := auth.uid();
  normalized_expected_role text := private.normalize_playbook_profile_role(expected_role);
  durable_role text;
  completed_at timestamptz := now();
begin
  if authenticated_user_id is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  if normalized_expected_role is null then
    raise exception 'Unsupported Playbook role.' using errcode = '22023';
  end if;

  select private.normalize_playbook_profile_role(
           coalesce(p.profile_mode, p.role, p.requested_role)
         )
    into durable_role
    from public.profiles p
   where p.id = authenticated_user_id
   for update;

  if not found then
    raise exception 'A durable Playbook profile is required.' using errcode = 'P0002';
  end if;

  if durable_role is distinct from normalized_expected_role then
    raise exception 'Authenticated profile role does not match onboarding role.' using errcode = '42501';
  end if;

  update public.profiles
     set onboarding_completed = true,
         onboarding_completed_at = coalesce(public.profiles.onboarding_completed_at, completed_at),
         verification_status = case
           when mark_verification_pending
             and verification_status is distinct from 'approved'
           then 'pending'
           else verification_status
         end,
         updated_at = now()
   where id = authenticated_user_id;

  return query
    select p.onboarding_completed_at, p.verification_status
      from public.profiles p
     where p.id = authenticated_user_id;
end;
$$;

-- Public authenticated wrappers contain no mutation authority of their own.
create or replace function public.initialize_playbook_profile(desired_role text)
returns table (
  role text,
  profile_mode text,
  verification_status text,
  onboarding_completed boolean
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.initialize_playbook_profile(desired_role);
$$;

create or replace function public.select_playbook_role(desired_role text)
returns text
language sql
security invoker
set search_path = ''
as $$
  select private.select_playbook_role(desired_role);
$$;

create or replace function public.complete_playbook_onboarding(
  expected_role text,
  mark_verification_pending boolean default false
)
returns table (
  onboarding_completed_at timestamptz,
  verification_status text
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.complete_playbook_onboarding(expected_role, mark_verification_pending);
$$;

revoke all on function private.normalize_playbook_profile_role(text) from public, anon, authenticated;
revoke all on function private.initialize_playbook_profile(text) from public, anon, authenticated;
revoke all on function private.select_playbook_role(text) from public, anon, authenticated;
revoke all on function private.complete_playbook_onboarding(text, boolean) from public, anon, authenticated;

revoke all on function public.initialize_playbook_profile(text) from public, anon;
revoke all on function public.select_playbook_role(text) from public, anon;
revoke all on function public.complete_playbook_onboarding(text, boolean) from public, anon;

grant usage on schema private to authenticated;
grant execute on function private.initialize_playbook_profile(text) to authenticated;
grant execute on function private.select_playbook_role(text) to authenticated;
grant execute on function private.complete_playbook_onboarding(text, boolean) to authenticated;
grant execute on function public.initialize_playbook_profile(text) to authenticated;
grant execute on function public.select_playbook_role(text) to authenticated;
grant execute on function public.complete_playbook_onboarding(text, boolean) to authenticated;

-- Remove broad direct mutation. RLS still constrains the row; column privileges
-- now constrain what an authenticated client may mutate on that row.
revoke insert, update, delete on public.profiles from authenticated;

grant select on public.profiles to authenticated;
grant update (
  username,
  full_name,
  avatar_url,
  cover_url,
  bio,
  location,
  school,
  sport,
  grad_year,
  gpa,
  instagram,
  twitter,
  linkedin,
  last_seen,
  updated_at,
  gender,
  first_name,
  last_name,
  date_of_birth,
  "position",
  height,
  weight,
  dominant_hand,
  jersey_number,
  travel_team,
  club_team,
  coach_name,
  coach_email,
  sat_score,
  act_score,
  intended_major,
  dream_school,
  tiktok,
  hudl,
  youtube,
  highlight_reel_url,
  edu_email,
  pillars,
  has_iep,
  unhoused,
  foster_youth,
  migrant_student,
  free_reduced_lunch,
  first_generation,
  household_income,
  english_language_learner,
  school_district,
  zip_code,
  team_level,
  registration_type,
  academic_gpa,
  weighted_gpa,
  unweighted_gpa,
  current_math,
  current_english,
  current_science,
  college_goal,
  ideal_profession,
  desired_salary_range,
  recruiting_status,
  desired_college_level,
  athlete_email,
  camps_attended,
  nil_instagram,
  nil_tiktok,
  nil_twitter,
  nil_follower_range,
  nil_brand_interests,
  nil_worked_with_brands,
  nil_deal_types,
  dream_school_name,
  dream_school_id,
  favorite_quote,
  college_list_2,
  college_list_3,
  college_list_4,
  college_list_5,
  college_list_6,
  college_list_7,
  college_list_8,
  college_list_9,
  college_list_10,
  grade,
  city,
  state,
  profile_visibility,
  onboarding_data,
  public_profile_complete,
  community_safety_agreed,
  community_safety_agreed_at,
  community_safety_policy_version,
  email
) on public.profiles to authenticated;

-- Ensure row ownership is explicit for authenticated profile edits.
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- Direct profile creation is intentionally disabled. Authenticated initialization
-- must go through initialize_playbook_profile so role and verification defaults
-- cannot be forged through the Data API.
drop policy if exists "Users insert own profile" on public.profiles;
