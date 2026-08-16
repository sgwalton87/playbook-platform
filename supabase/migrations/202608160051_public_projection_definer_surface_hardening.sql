-- Keep canonical profiles owner-scoped while removing SECURITY DEFINER bodies from the exposed public schema.
-- Private helpers retain the bounded projection logic; public RPCs are SECURITY INVOKER wrappers only.

-- Anonymous callers need schema resolution for the three explicitly public projection helpers only.
grant usage on schema private to anon;

create or replace function private.get_public_scholar_profile(requested_username text)
returns table (
  id uuid, username text, full_name text, first_name text, last_name text, role text,
  avatar_url text, cover_url text, bio text, location text, city text, state text,
  school text, sport text, grad_year integer, grade text, gpa numeric,
  weighted_gpa text, unweighted_gpa text, academic_gpa text, sat_score text, act_score text,
  intended_major text, dream_school text, "position" text, height text, weight text,
  dominant_hand text, jersey_number text, travel_team text, club_team text, coach_name text,
  highlight_reel_url text, hudl text, youtube text, tiktok text, instagram text, twitter text,
  linkedin text, ideal_profession text, desired_salary_range text, recruiting_status text,
  desired_college_level text, favorite_quote text, xp integer, coin_balance integer,
  profile_visibility text
)
language sql
stable
security definer
set search_path=''
as $$
  select
    p.id,p.username,p.full_name,p.first_name,p.last_name,
    private.normalize_playbook_profile_role(coalesce(p.profile_mode,p.role,p.requested_role)) as role,
    p.avatar_url,p.cover_url,p.bio,p.location,p.city,p.state,p.school,p.sport,p.grad_year,p.grade,p.gpa,
    p.weighted_gpa,p.unweighted_gpa,p.academic_gpa,p.sat_score,p.act_score,p.intended_major,p.dream_school,
    p.position as "position",p.height,p.weight,p.dominant_hand,p.jersey_number,p.travel_team,p.club_team,
    p.coach_name,p.highlight_reel_url,p.hudl,p.youtube,p.tiktok,p.instagram,p.twitter,p.linkedin,
    p.ideal_profession,p.desired_salary_range,p.recruiting_status,p.desired_college_level,p.favorite_quote,
    p.xp,p.coin_balance,p.profile_visibility
  from public.profiles p
  where lower(trim(p.username))=lower(trim(requested_username))
    and private.normalize_playbook_profile_role(coalesce(p.profile_mode,p.role,p.requested_role))
      in ('scholar','scholar-athlete','transition-youth')
    and (p.profile_visibility='public' or p.id=auth.uid())
  limit 1;
$$;

create or replace function private.get_public_scholar_identities(requested_ids uuid[])
returns table (
  id uuid, username text, full_name text, first_name text, last_name text, role text, avatar_url text
)
language sql
stable
security definer
set search_path=''
as $$
  select p.id,p.username,p.full_name,p.first_name,p.last_name,
    private.normalize_playbook_profile_role(coalesce(p.profile_mode,p.role,p.requested_role)) as role,
    p.avatar_url
  from public.profiles p
  where cardinality(requested_ids) between 1 and 100
    and p.id=any(requested_ids)
    and private.normalize_playbook_profile_role(coalesce(p.profile_mode,p.role,p.requested_role))
      in ('scholar','scholar-athlete','transition-youth')
    and (p.profile_visibility='public' or p.id=auth.uid());
$$;

create or replace function private.get_public_member_identities(requested_ids uuid[])
returns table (
  id uuid, username text, full_name text, first_name text, last_name text, role text, avatar_url text
)
language sql
stable
security definer
set search_path=''
as $$
  select p.id,p.username,p.full_name,p.first_name,p.last_name,
    private.normalize_playbook_profile_role(coalesce(p.profile_mode,p.role,p.requested_role)) as role,
    p.avatar_url
  from public.profiles p
  where cardinality(requested_ids) between 1 and 100
    and p.id=any(requested_ids)
    and p.profile_visibility='public';
$$;

create or replace function private.get_public_network_directory(search_text text default null,result_limit integer default 100)
returns table (
  id uuid, username text, full_name text, first_name text, last_name text, role text,
  avatar_url text, school text, sport text
)
language sql
stable
security definer
set search_path=''
as $$
  select p.id,p.username,p.full_name,p.first_name,p.last_name,
    private.normalize_playbook_profile_role(coalesce(p.profile_mode,p.role,p.requested_role)) as role,
    p.avatar_url,p.school,p.sport
  from public.profiles p
  where auth.uid() is not null
    and p.id<>auth.uid()
    and p.profile_visibility='public'
    and (
      nullif(trim(coalesce(search_text,'')),'') is null
      or coalesce(p.full_name,'') ilike '%'||trim(search_text)||'%'
      or coalesce(p.username,'') ilike '%'||trim(search_text)||'%'
      or coalesce(p.school,'') ilike '%'||trim(search_text)||'%'
      or coalesce(p.sport,'') ilike '%'||trim(search_text)||'%'
    )
  order by p.created_at desc nulls last,p.id
  limit least(greatest(coalesce(result_limit,100),1),100);
$$;

create or replace function private.get_network_member_identities(requested_ids uuid[])
returns table (
  id uuid, username text, full_name text, first_name text, last_name text, role text,
  avatar_url text, school text, sport text
)
language sql
stable
security definer
set search_path=''
as $$
  select p.id,p.username,p.full_name,p.first_name,p.last_name,
    private.normalize_playbook_profile_role(coalesce(p.profile_mode,p.role,p.requested_role)) as role,
    p.avatar_url,p.school,p.sport
  from public.profiles p
  where auth.uid() is not null
    and cardinality(requested_ids) between 1 and 100
    and p.id=any(requested_ids)
    and (p.profile_visibility='public' or private.can_resolve_network_identity(p.id));
$$;

revoke all on function private.get_public_scholar_profile(text) from public,anon,authenticated;
revoke all on function private.get_public_scholar_identities(uuid[]) from public,anon,authenticated;
revoke all on function private.get_public_member_identities(uuid[]) from public,anon,authenticated;
revoke all on function private.get_public_network_directory(text,integer) from public,anon,authenticated;
revoke all on function private.get_network_member_identities(uuid[]) from public,anon,authenticated;

grant execute on function private.get_public_scholar_profile(text) to anon,authenticated;
grant execute on function private.get_public_scholar_identities(uuid[]) to anon,authenticated;
grant execute on function private.get_public_member_identities(uuid[]) to anon,authenticated;
grant execute on function private.get_public_network_directory(text,integer) to authenticated;
grant execute on function private.get_network_member_identities(uuid[]) to authenticated;

-- Public API wrappers deliberately contain no privileged SQL.
create or replace function public.get_public_scholar_profile(requested_username text)
returns table (
  id uuid, username text, full_name text, first_name text, last_name text, role text,
  avatar_url text, cover_url text, bio text, location text, city text, state text,
  school text, sport text, grad_year integer, grade text, gpa numeric,
  weighted_gpa text, unweighted_gpa text, academic_gpa text, sat_score text, act_score text,
  intended_major text, dream_school text, "position" text, height text, weight text,
  dominant_hand text, jersey_number text, travel_team text, club_team text, coach_name text,
  highlight_reel_url text, hudl text, youtube text, tiktok text, instagram text, twitter text,
  linkedin text, ideal_profession text, desired_salary_range text, recruiting_status text,
  desired_college_level text, favorite_quote text, xp integer, coin_balance integer,
  profile_visibility text
)
language sql stable security invoker set search_path=''
as $$ select * from private.get_public_scholar_profile(requested_username); $$;

create or replace function public.get_public_scholar_identities(requested_ids uuid[])
returns table (id uuid,username text,full_name text,first_name text,last_name text,role text,avatar_url text)
language sql stable security invoker set search_path=''
as $$ select * from private.get_public_scholar_identities(requested_ids); $$;

create or replace function public.get_public_member_identities(requested_ids uuid[])
returns table (id uuid,username text,full_name text,first_name text,last_name text,role text,avatar_url text)
language sql stable security invoker set search_path=''
as $$ select * from private.get_public_member_identities(requested_ids); $$;

create or replace function public.get_public_network_directory(search_text text default null,result_limit integer default 100)
returns table (id uuid,username text,full_name text,first_name text,last_name text,role text,avatar_url text,school text,sport text)
language sql stable security invoker set search_path=''
as $$ select * from private.get_public_network_directory(search_text,result_limit); $$;

create or replace function public.get_network_member_identities(requested_ids uuid[])
returns table (id uuid,username text,full_name text,first_name text,last_name text,role text,avatar_url text,school text,sport text)
language sql stable security invoker set search_path=''
as $$ select * from private.get_network_member_identities(requested_ids); $$;

revoke all on function public.get_public_scholar_profile(text) from public,anon,authenticated;
revoke all on function public.get_public_scholar_identities(uuid[]) from public,anon,authenticated;
revoke all on function public.get_public_member_identities(uuid[]) from public,anon,authenticated;
revoke all on function public.get_public_network_directory(text,integer) from public,anon,authenticated;
revoke all on function public.get_network_member_identities(uuid[]) from public,anon,authenticated;

grant execute on function public.get_public_scholar_profile(text) to anon,authenticated;
grant execute on function public.get_public_scholar_identities(uuid[]) to anon,authenticated;
grant execute on function public.get_public_member_identities(uuid[]) to anon,authenticated;
grant execute on function public.get_public_network_directory(text,integer) to authenticated;
grant execute on function public.get_network_member_identities(uuid[]) to authenticated;
