-- Remove ambiguous generic role aliases from the database authority normalizer.
-- `admin` may refer to platform administration and must never silently become
-- District / School Administrator. `partner` is likewise ambiguous between
-- Employer/Workforce Partner and Community Partner. Exact role identity is
-- required for authority-bearing profile RPCs.

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
    when 'school_admin' then 'district'
    when 'athlete-abroad' then 'athlete-abroad'
    when 'international_athlete' then 'athlete-abroad'
    when 'other' then 'other'
    when 'community-partner' then 'other'
    when 'community_partner' then 'other'
    else null
  end;
$$;

revoke all on function private.normalize_playbook_profile_role(text)
  from public, anon, authenticated;
