-- Preserve the existing onboarding/profile autosave upsert shape without
-- restoring broad profile INSERT authority. Authenticated users may supply only
-- safe profile columns, and the INSERT branch is permitted only when the same
-- authenticated profile row already exists (so ON CONFLICT becomes an update).
-- New profile creation remains RPC-only through initialize_playbook_profile.

grant insert (
  id,
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

drop policy if exists "Existing profile owners can upsert safe fields"
  on public.profiles;
create policy "Existing profile owners can upsert safe fields"
on public.profiles
for insert
to authenticated
with check (
  id = (select auth.uid())
  and exists (
    select 1
      from public.profiles existing
     where existing.id = (select auth.uid())
  )
);
