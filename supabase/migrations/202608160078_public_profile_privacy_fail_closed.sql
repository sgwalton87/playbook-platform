-- Audit repair: public profile publication must be explicit, auditable, and privacy-minimized.
-- Existing profiles were historically defaulted to public without an explicit publication consent record.

alter table public.profiles
  alter column profile_visibility set default 'private';

update public.profiles
   set profile_visibility='private'
 where coalesce(profile_visibility,'public')='public';

create table if not exists public.public_profile_publication_consents (
  scholar_id uuid primary key references public.profiles(id) on delete cascade,
  consent_version text not null,
  consented_at timestamptz not null,
  revoked_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.public_profile_publication_consents enable row level security;
revoke all on public.public_profile_publication_consents from anon,authenticated;

create or replace function private.get_public_profile_privacy_status()
returns table(
  profile_visibility text,
  active_consent boolean,
  consent_version text,
  consented_at timestamptz,
  revoked_at timestamptz
)
language sql
stable
security definer
set search_path=''
as $$
  select
    coalesce(p.profile_visibility,'private'),
    (coalesce(p.profile_visibility,'private')='public' and c.revoked_at is null and c.consent_version='public-profile-v1') as active_consent,
    c.consent_version,
    c.consented_at,
    c.revoked_at
  from public.profiles p
  left join public.public_profile_publication_consents c on c.scholar_id=p.id
  where p.id=auth.uid()
  limit 1;
$$;

revoke all on function private.get_public_profile_privacy_status() from public,anon,authenticated;
grant execute on function private.get_public_profile_privacy_status() to authenticated;

create or replace function public.get_public_profile_privacy_status()
returns table(
  profile_visibility text,
  active_consent boolean,
  consent_version text,
  consented_at timestamptz,
  revoked_at timestamptz
)
language sql
stable
security invoker
set search_path=''
as $$ select * from private.get_public_profile_privacy_status(); $$;

revoke all on function public.get_public_profile_privacy_status() from public,anon;
grant execute on function public.get_public_profile_privacy_status() to authenticated;

create or replace function private.set_public_profile_visibility(
  requested_public boolean,
  requested_consent_version text default null
)
returns table(
  profile_visibility text,
  active_consent boolean,
  consent_version text,
  consented_at timestamptz,
  revoked_at timestamptz
)
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
begin
  if actor_id is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;

  if not exists (
    select 1 from public.profiles p
     where p.id=actor_id
       and private.normalize_playbook_profile_role(coalesce(p.profile_mode,p.role,p.requested_role))
         in ('scholar','scholar-athlete','transition-youth')
  ) then
    raise exception 'A learner profile is required.' using errcode='42501';
  end if;

  if requested_public then
    if requested_consent_version <> 'public-profile-v1' then
      raise exception 'Current public profile publication consent is required.' using errcode='42501';
    end if;

    insert into public.public_profile_publication_consents(
      scholar_id,consent_version,consented_at,revoked_at,updated_at
    ) values (
      actor_id,requested_consent_version,now(),null,now()
    )
    on conflict(scholar_id) do update set
      consent_version=excluded.consent_version,
      consented_at=now(),
      revoked_at=null,
      updated_at=now();

    update public.profiles
       set profile_visibility='public'
     where id=actor_id;
  else
    update public.public_profile_publication_consents
       set revoked_at=now(),updated_at=now()
     where scholar_id=actor_id
       and revoked_at is null;

    update public.profiles
       set profile_visibility='private'
     where id=actor_id;
  end if;

  return query select * from private.get_public_profile_privacy_status();
end;
$$;

revoke all on function private.set_public_profile_visibility(boolean,text) from public,anon,authenticated;
grant execute on function private.set_public_profile_visibility(boolean,text) to authenticated;

create or replace function public.set_public_profile_visibility(
  requested_public boolean,
  requested_consent_version text default null
)
returns table(
  profile_visibility text,
  active_consent boolean,
  consent_version text,
  consented_at timestamptz,
  revoked_at timestamptz
)
language sql
security invoker
set search_path=''
as $$ select * from private.set_public_profile_visibility(requested_public,requested_consent_version); $$;

revoke all on function public.set_public_profile_visibility(boolean,text) from public,anon;
grant execute on function public.set_public_profile_visibility(boolean,text) to authenticated;

-- Keep the established result signature so existing profile UI remains compatible.
-- For non-owners, expose only the explicitly publication-consented, public-safe subset.
create or replace function private.get_public_scholar_profile(requested_username text)
returns table(
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
  weighted_gpa text,
  unweighted_gpa text,
  academic_gpa text,
  sat_score text,
  act_score text,
  intended_major text,
  dream_school text,
  "position" text,
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
set search_path=''
as $$
  select
    p.id,
    p.username,
    p.full_name,
    case when p.id=auth.uid() then p.first_name else null end,
    case when p.id=auth.uid() then p.last_name else null end,
    private.normalize_playbook_profile_role(coalesce(p.profile_mode,p.role,p.requested_role)) as role,
    p.avatar_url,
    p.cover_url,
    p.bio,
    case when p.id=auth.uid() then p.location else null end,
    case when p.id=auth.uid() then p.city else null end,
    case when p.id=auth.uid() then p.state else null end,
    case when p.id=auth.uid() then p.school else null end,
    p.sport,
    case when p.id=auth.uid() then p.grad_year else null end,
    case when p.id=auth.uid() then p.grade else null end,
    case when p.id=auth.uid() then p.gpa else null end,
    case when p.id=auth.uid() then p.weighted_gpa else null end,
    case when p.id=auth.uid() then p.unweighted_gpa else null end,
    case when p.id=auth.uid() then p.academic_gpa else null end,
    case when p.id=auth.uid() then p.sat_score else null end,
    case when p.id=auth.uid() then p.act_score else null end,
    p.intended_major,
    p.dream_school,
    p.position,
    case when p.id=auth.uid() then p.height else null end,
    case when p.id=auth.uid() then p.weight else null end,
    case when p.id=auth.uid() then p.dominant_hand else null end,
    case when p.id=auth.uid() then p.jersey_number else null end,
    case when p.id=auth.uid() then p.travel_team else null end,
    case when p.id=auth.uid() then p.club_team else null end,
    case when p.id=auth.uid() then p.coach_name else null end,
    p.highlight_reel_url,
    p.hudl,
    p.youtube,
    p.tiktok,
    p.instagram,
    p.twitter,
    p.linkedin,
    case when p.id=auth.uid() then p.ideal_profession else null end,
    case when p.id=auth.uid() then p.desired_salary_range else null end,
    case when p.id=auth.uid() then p.recruiting_status else null end,
    case when p.id=auth.uid() then p.desired_college_level else null end,
    p.favorite_quote,
    case when p.id=auth.uid() then p.xp else null end,
    case when p.id=auth.uid() then p.coin_balance else null end,
    coalesce(p.profile_visibility,'private')
  from public.profiles p
  where lower(trim(p.username))=lower(trim(requested_username))
    and private.normalize_playbook_profile_role(coalesce(p.profile_mode,p.role,p.requested_role))
      in ('scholar','scholar-athlete','transition-youth')
    and (
      p.id=auth.uid()
      or (
        coalesce(p.profile_visibility,'private')='public'
        and exists (
          select 1 from public.public_profile_publication_consents c
           where c.scholar_id=p.id
             and c.consent_version='public-profile-v1'
             and c.revoked_at is null
        )
      )
    )
  limit 1;
$$;

revoke all on function private.get_public_scholar_profile(text) from public;
grant execute on function private.get_public_scholar_profile(text) to anon,authenticated;

comment on table public.public_profile_publication_consents is
  'Versioned Scholar consent required before a profile may be anonymously published. Revocation is preserved for auditability.';
comment on function private.get_public_scholar_profile(text) is
  'Fail-closed public Scholar profile projection. Anonymous/non-owner viewers receive only the publication-consented public-safe field subset; sensitive academic, location, financial, recruiting, and athletic measurement fields remain owner-only.';
