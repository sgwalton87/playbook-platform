-- Governed portfolio sharing + NIL media kit projection.
-- Share rows own only share configuration/lifecycle. Canonical profile, athlete,
-- social, and media facts remain in their existing services and resolve live.

alter table public.portfolio_shares
  drop constraint if exists portfolio_shares_target_use_check;
alter table public.portfolio_shares
  add constraint portfolio_shares_target_use_check
  check (target_use in ('college','scholarship','internship','job','recruiting','nil'));

-- There are no production shares at convergence time. Close direct mutation so
-- opaque ids and packet allowlists cannot be bypassed by direct client writes.
revoke all on public.portfolio_shares from anon, authenticated;
grant select on public.portfolio_shares to authenticated;

create or replace function private.create_nil_media_kit_share(
  requested_packet jsonb,
  requested_expires_at timestamptz default null
)
returns table (
  share_id text,
  status text,
  expires_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  caller_name text;
  generated_share_id text;
  created_row public.portfolio_shares%rowtype;
begin
  if caller_id is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  if not private.current_user_is_onboarded_learner() then
    raise exception 'A completed learner profile is required.' using errcode = '42501';
  end if;

  if jsonb_typeof(requested_packet) is distinct from 'object' then
    raise exception 'Media kit packet must be a JSON object.' using errcode = '22023';
  end if;

  if exists (
    select 1
      from jsonb_each(requested_packet) item(key, value)
     where item.key not in (
       'include_bio',
       'include_profile_media',
       'include_social_links',
       'include_brand_interests',
       'include_athlete_profile',
       'include_highlight_film',
       'include_media_summary'
     )
        or jsonb_typeof(item.value) <> 'boolean'
  ) then
    raise exception 'Media kit packet contains an unsupported field or value.' using errcode = '22023';
  end if;

  if not exists (
    select 1 from jsonb_each(requested_packet) item(key, value)
     where item.value = 'true'::jsonb
  ) then
    raise exception 'Select at least one media kit section.' using errcode = '22023';
  end if;

  if requested_expires_at is not null and requested_expires_at <= now() then
    raise exception 'Share expiry must be in the future.' using errcode = '22023';
  end if;

  select coalesce(
           nullif(trim(full_name), ''),
           nullif(trim(username), ''),
           'Scholar'
         )
    into caller_name
    from public.profiles
   where id = caller_id;

  if caller_name is null then
    raise exception 'Scholar profile not found.' using errcode = 'P0002';
  end if;

  generated_share_id := encode(gen_random_bytes(32), 'hex');

  insert into public.portfolio_shares (
    share_id,
    scholar_id,
    scholar_name,
    target_use,
    packet,
    status,
    expires_at
  ) values (
    generated_share_id,
    caller_id,
    caller_name,
    'nil',
    requested_packet,
    'active',
    requested_expires_at
  )
  returning * into created_row;

  return query
  select created_row.share_id, created_row.status, created_row.expires_at, created_row.created_at;
end;
$$;

revoke all on function private.create_nil_media_kit_share(jsonb,timestamptz)
  from public, anon, authenticated;
grant execute on function private.create_nil_media_kit_share(jsonb,timestamptz)
  to authenticated;

create or replace function public.create_nil_media_kit_share(
  requested_packet jsonb,
  requested_expires_at timestamptz default null
)
returns table (
  share_id text,
  status text,
  expires_at timestamptz,
  created_at timestamptz
)
language sql
security invoker
set search_path = ''
as $$
  select *
    from private.create_nil_media_kit_share(requested_packet, requested_expires_at);
$$;

revoke all on function public.create_nil_media_kit_share(jsonb,timestamptz)
  from public, anon;
grant execute on function public.create_nil_media_kit_share(jsonb,timestamptz)
  to authenticated;

create or replace function private.revoke_portfolio_share(requested_share_id text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  updated_count integer;
begin
  if caller_id is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  update public.portfolio_shares
     set status = 'revoked'
   where share_id = requested_share_id
     and scholar_id = caller_id
     and status <> 'revoked';

  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

revoke all on function private.revoke_portfolio_share(text)
  from public, anon, authenticated;
grant execute on function private.revoke_portfolio_share(text)
  to authenticated;

create or replace function public.revoke_portfolio_share(requested_share_id text)
returns boolean
language sql
security invoker
set search_path = ''
as $$
  select private.revoke_portfolio_share(requested_share_id);
$$;

revoke all on function public.revoke_portfolio_share(text)
  from public, anon;
grant execute on function public.revoke_portfolio_share(text)
  to authenticated;

create or replace function private.resolve_portfolio_share(requested_share_id text)
returns table (
  share_id text,
  target_use text,
  expires_at timestamptz,
  packet jsonb,
  scholar jsonb,
  athlete jsonb,
  media jsonb
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  share_row public.portfolio_shares%rowtype;
  profile_row public.profiles%rowtype;
  athlete_row public.athlete_profiles%rowtype;
  profile_media_count integer := 0;
  scholar_projection jsonb;
  athlete_projection jsonb;
  media_projection jsonb;
begin
  if requested_share_id is null or length(trim(requested_share_id)) < 48 then
    return;
  end if;

  select * into share_row
    from public.portfolio_shares
   where portfolio_shares.share_id = requested_share_id
     and portfolio_shares.status = 'active'
     and (portfolio_shares.expires_at is null or portfolio_shares.expires_at > now())
     and portfolio_shares.target_use = 'nil';

  if not found then
    return;
  end if;

  select * into profile_row
    from public.profiles
   where id = share_row.scholar_id;

  if not found then
    return;
  end if;

  select * into athlete_row
    from public.athlete_profiles
   where scholar_id = share_row.scholar_id;

  if coalesce((share_row.packet ->> 'include_media_summary')::boolean, false) then
    select count(*)::integer into profile_media_count
      from public.album_media
     where user_id = share_row.scholar_id;
  end if;

  scholar_projection := jsonb_strip_nulls(jsonb_build_object(
    'displayName', coalesce(nullif(trim(profile_row.full_name), ''), nullif(trim(profile_row.username), ''), 'Scholar'),
    'bio', case when coalesce((share_row.packet ->> 'include_bio')::boolean, false) then nullif(trim(profile_row.bio), '') else null end,
    'avatarUrl', case when coalesce((share_row.packet ->> 'include_profile_media')::boolean, false) then nullif(trim(profile_row.avatar_url), '') else null end,
    'coverUrl', case when coalesce((share_row.packet ->> 'include_profile_media')::boolean, false) then nullif(trim(profile_row.cover_url), '') else null end,
    'socialLinks', case when coalesce((share_row.packet ->> 'include_social_links')::boolean, false) then jsonb_strip_nulls(jsonb_build_object(
      'instagram', nullif(trim(coalesce(profile_row.nil_instagram, profile_row.instagram)), ''),
      'tiktok', nullif(trim(coalesce(profile_row.nil_tiktok, profile_row.tiktok)), ''),
      'twitter', nullif(trim(coalesce(profile_row.nil_twitter, profile_row.twitter)), '')
    )) else null end,
    'brandInterests', case when coalesce((share_row.packet ->> 'include_brand_interests')::boolean, false) then to_jsonb(profile_row.nil_brand_interests) else null end
  ));

  athlete_projection := case
    when athlete_row.id is null then '{}'::jsonb
    else jsonb_strip_nulls(jsonb_build_object(
      'sport', case when coalesce((share_row.packet ->> 'include_athlete_profile')::boolean, false) then nullif(trim(athlete_row.sport), '') else null end,
      'position', case when coalesce((share_row.packet ->> 'include_athlete_profile')::boolean, false) then nullif(trim(athlete_row.position), '') else null end,
      'secondaryPosition', case when coalesce((share_row.packet ->> 'include_athlete_profile')::boolean, false) then nullif(trim(athlete_row.secondary_position), '') else null end,
      'graduationYear', case when coalesce((share_row.packet ->> 'include_athlete_profile')::boolean, false) then athlete_row.graduation_year else null end,
      'highlightUrl', case when coalesce((share_row.packet ->> 'include_highlight_film')::boolean, false) then nullif(trim(athlete_row.highlight_url), '') else null end
    ))
  end;

  media_projection := case
    when coalesce((share_row.packet ->> 'include_media_summary')::boolean, false)
      then jsonb_build_object('profileMediaCount', profile_media_count)
    else '{}'::jsonb
  end;

  return query
  select share_row.share_id, share_row.target_use, share_row.expires_at,
         share_row.packet, scholar_projection, athlete_projection, media_projection;
end;
$$;

revoke all on function private.resolve_portfolio_share(text)
  from public, anon, authenticated;
grant execute on function private.resolve_portfolio_share(text)
  to anon, authenticated;

create or replace function public.resolve_portfolio_share(requested_share_id text)
returns table (
  share_id text,
  target_use text,
  expires_at timestamptz,
  packet jsonb,
  scholar jsonb,
  athlete jsonb,
  media jsonb
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.resolve_portfolio_share(requested_share_id);
$$;

revoke all on function public.resolve_portfolio_share(text) from public;
grant execute on function public.resolve_portfolio_share(text) to anon, authenticated;

comment on function public.create_nil_media_kit_share(jsonb,timestamptz) is
  'Creates a high-entropy NIL media-kit share configuration from allowlisted Scholar-selected canonical-record sections.';
comment on function public.resolve_portfolio_share(text) is
  'Resolves only active, non-expired NIL portfolio shares into a narrow live projection of Scholar-selected canonical fields. It grants no Scholar Record permissions.';
comment on function public.revoke_portfolio_share(text) is
  'Lets the Scholar owner revoke a portfolio share without deleting canonical source records.';
