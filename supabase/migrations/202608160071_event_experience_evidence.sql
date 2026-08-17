-- Shared Event experience convergence: detail, arrival evidence, networking opt-in, replay.

alter table public.community_events
  add column if not exists replay_url text,
  add column if not exists networking_enabled boolean not null default false,
  add column if not exists check_in_enabled boolean not null default false;

alter table public.community_events
  drop constraint if exists community_events_replay_url_length;
alter table public.community_events
  add constraint community_events_replay_url_length
  check (replay_url is null or length(replay_url) <= 2048);

create table if not exists public.community_event_checkin_codes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.community_events(id) on delete cascade,
  token_hash text not null unique,
  active boolean not null default true,
  valid_from timestamptz not null,
  valid_until timestamptz not null,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  constraint community_event_checkin_code_window check (valid_until > valid_from)
);

create index if not exists community_event_checkin_codes_event_idx
  on public.community_event_checkin_codes(event_id, active, valid_until desc);

create table if not exists public.community_event_checkins (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.community_events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  checkin_code_id uuid not null references public.community_event_checkin_codes(id) on delete restrict,
  checked_in_at timestamptz not null default now(),
  provenance jsonb not null default '{}'::jsonb,
  unique(event_id,user_id)
);

create index if not exists community_event_checkins_user_idx
  on public.community_event_checkins(user_id, checked_in_at desc);

create table if not exists public.community_event_networking_optins (
  event_id uuid not null references public.community_events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  headline text,
  opted_in_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(event_id,user_id),
  constraint community_event_networking_headline_length check (
    headline is null or length(headline) <= 280
  )
);

alter table public.community_event_checkin_codes enable row level security;
alter table public.community_event_checkins enable row level security;
alter table public.community_event_networking_optins enable row level security;

revoke all on public.community_event_checkin_codes from anon, authenticated;
revoke all on public.community_event_checkins from anon, authenticated;
revoke all on public.community_event_networking_optins from anon, authenticated;
grant select on public.community_event_checkins to authenticated;
grant select on public.community_event_networking_optins to authenticated;

drop policy if exists community_event_checkins_owner_select on public.community_event_checkins;
create policy community_event_checkins_owner_select
  on public.community_event_checkins for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists community_event_networking_owner_select on public.community_event_networking_optins;
create policy community_event_networking_owner_select
  on public.community_event_networking_optins for select to authenticated
  using ((select auth.uid()) = user_id);

create or replace function private.configure_community_event_experience(
  requested_event_id uuid,
  requested_replay_url text default null,
  requested_networking_enabled boolean default false,
  requested_check_in_enabled boolean default false
)
returns public.community_events
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved public.community_events%rowtype;
  normalized_replay text := nullif(trim(coalesce(requested_replay_url,'')), '');
begin
  if auth.uid() is null or not private.current_user_is_platform_operator() then
    raise exception 'Platform operator authority required.' using errcode='42501';
  end if;

  if normalized_replay is not null and normalized_replay !~ '^https?://' then
    raise exception 'Replay URL must be http or https.' using errcode='22023';
  end if;

  update public.community_events
     set replay_url=normalized_replay,
         networking_enabled=coalesce(requested_networking_enabled,false),
         check_in_enabled=coalesce(requested_check_in_enabled,false),
         updated_at=now()
   where id=requested_event_id
  returning * into saved;

  if saved.id is null then
    raise exception 'Community event not found.' using errcode='P0002';
  end if;
  return saved;
end;
$$;

revoke all on function private.configure_community_event_experience(uuid,text,boolean,boolean) from public,anon,authenticated;
grant execute on function private.configure_community_event_experience(uuid,text,boolean,boolean) to authenticated;

create or replace function public.configure_community_event_experience(
  requested_event_id uuid,
  requested_replay_url text default null,
  requested_networking_enabled boolean default false,
  requested_check_in_enabled boolean default false
)
returns public.community_events
language sql
security invoker
set search_path = ''
as $$
  select private.configure_community_event_experience(requested_event_id,requested_replay_url,requested_networking_enabled,requested_check_in_enabled);
$$;

revoke all on function public.configure_community_event_experience(uuid,text,boolean,boolean) from public,anon;
grant execute on function public.configure_community_event_experience(uuid,text,boolean,boolean) to authenticated;

create or replace function private.create_community_event_checkin_code(
  requested_event_id uuid,
  requested_valid_from timestamptz,
  requested_valid_until timestamptz
)
returns table(token text,valid_from timestamptz,valid_until timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  raw_token text;
begin
  if auth.uid() is null or not private.current_user_is_platform_operator() then
    raise exception 'Platform operator authority required.' using errcode='42501';
  end if;
  if requested_valid_from is null or requested_valid_until is null
     or requested_valid_until <= requested_valid_from
     or requested_valid_until - requested_valid_from > interval '12 hours' then
    raise exception 'Check-in code window must be greater than zero and no longer than 12 hours.' using errcode='22023';
  end if;
  if not exists (
    select 1 from public.community_events e
     where e.id=requested_event_id and e.status='published' and e.check_in_enabled=true
  ) then
    raise exception 'Published event with check-in enabled is required.' using errcode='22023';
  end if;

  raw_token := encode(gen_random_bytes(32),'hex');
  insert into public.community_event_checkin_codes(event_id,token_hash,active,valid_from,valid_until,created_by)
  values(requested_event_id,encode(digest(raw_token,'sha256'),'hex'),true,requested_valid_from,requested_valid_until,auth.uid());

  return query select raw_token,requested_valid_from,requested_valid_until;
end;
$$;

revoke all on function private.create_community_event_checkin_code(uuid,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function private.create_community_event_checkin_code(uuid,timestamptz,timestamptz) to authenticated;

create or replace function public.create_community_event_checkin_code(
  requested_event_id uuid,
  requested_valid_from timestamptz,
  requested_valid_until timestamptz
)
returns table(token text,valid_from timestamptz,valid_until timestamptz)
language sql
security invoker
set search_path=''
as $$
  select * from private.create_community_event_checkin_code(requested_event_id,requested_valid_from,requested_valid_until);
$$;

revoke all on function public.create_community_event_checkin_code(uuid,timestamptz,timestamptz) from public,anon;
grant execute on function public.create_community_event_checkin_code(uuid,timestamptz,timestamptz) to authenticated;

create or replace function private.check_in_community_event(requested_token text)
returns table(event_id uuid,checked_in_at timestamptz,attendance_verified boolean)
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  code_row public.community_event_checkin_codes%rowtype;
  saved public.community_event_checkins%rowtype;
  attendance_exists boolean;
begin
  if actor_id is null then raise exception 'Authentication required.' using errcode='42501'; end if;
  if nullif(trim(coalesce(requested_token,'')),'') is null then
    raise exception 'Check-in token is required.' using errcode='22023';
  end if;

  select * into code_row
    from public.community_event_checkin_codes c
   where c.token_hash=encode(digest(trim(requested_token),'sha256'),'hex')
     and c.active=true
     and now() between c.valid_from and c.valid_until
   for update;
  if code_row.id is null then
    raise exception 'Check-in token is invalid or expired.' using errcode='42501';
  end if;

  if not exists (
    select 1 from public.community_events e
    join public.community_event_rsvps r on r.event_id=e.id and r.user_id=actor_id and r.status='going'
    where e.id=code_row.event_id and e.status='published' and e.check_in_enabled=true
  ) then
    raise exception 'A confirmed RSVP is required for event check-in.' using errcode='42501';
  end if;

  insert into public.community_event_checkins(event_id,user_id,checkin_code_id,provenance)
  values(code_row.event_id,actor_id,code_row.id,jsonb_build_object('record_kind','attendee_arrival_evidence'))
  on conflict(event_id,user_id) do update set checked_in_at=least(public.community_event_checkins.checked_in_at,excluded.checked_in_at)
  returning * into saved;

  select exists(
    select 1 from public.community_event_attendance a
     where a.event_id=code_row.event_id and a.user_id=actor_id and a.attended=true
  ) into attendance_exists;

  return query select saved.event_id,saved.checked_in_at,attendance_exists;
end;
$$;

revoke all on function private.check_in_community_event(text) from public,anon,authenticated;
grant execute on function private.check_in_community_event(text) to authenticated;

create or replace function public.check_in_community_event(requested_token text)
returns table(event_id uuid,checked_in_at timestamptz,attendance_verified boolean)
language sql
security invoker
set search_path=''
as $$ select * from private.check_in_community_event(requested_token); $$;

revoke all on function public.check_in_community_event(text) from public,anon;
grant execute on function public.check_in_community_event(text) to authenticated;

create or replace function private.set_community_event_networking_opt_in(
  requested_event_id uuid,
  requested_opt_in boolean,
  requested_headline text default null
)
returns boolean
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  normalized_headline text := nullif(left(trim(coalesce(requested_headline,'')),280),'');
begin
  if actor_id is null then raise exception 'Authentication required.' using errcode='42501'; end if;

  if not requested_opt_in then
    delete from public.community_event_networking_optins where event_id=requested_event_id and user_id=actor_id;
    return true;
  end if;

  if not exists (
    select 1 from public.community_events e
     where e.id=requested_event_id and e.status='published' and e.networking_enabled=true
  ) then
    raise exception 'Networking is not enabled for this event.' using errcode='22023';
  end if;

  if not exists (
    select 1 from public.community_event_rsvps r
     where r.event_id=requested_event_id and r.user_id=actor_id and r.status in ('going','interested')
    union all
    select 1 from public.community_event_attendance a
     where a.event_id=requested_event_id and a.user_id=actor_id and a.attended=true
  ) then
    raise exception 'An active RSVP or verified attendance is required for event networking.' using errcode='42501';
  end if;

  insert into public.community_event_networking_optins(event_id,user_id,headline,opted_in_at,updated_at)
  values(requested_event_id,actor_id,normalized_headline,now(),now())
  on conflict(event_id,user_id) do update set headline=excluded.headline,updated_at=now();
  return true;
end;
$$;

revoke all on function private.set_community_event_networking_opt_in(uuid,boolean,text) from public,anon,authenticated;
grant execute on function private.set_community_event_networking_opt_in(uuid,boolean,text) to authenticated;

create or replace function public.set_community_event_networking_opt_in(requested_event_id uuid,requested_opt_in boolean,requested_headline text default null)
returns boolean
language sql
security invoker
set search_path=''
as $$ select private.set_community_event_networking_opt_in(requested_event_id,requested_opt_in,requested_headline); $$;

revoke all on function public.set_community_event_networking_opt_in(uuid,boolean,text) from public,anon;
grant execute on function public.set_community_event_networking_opt_in(uuid,boolean,text) to authenticated;

create or replace function private.get_community_event_networking_directory(requested_event_id uuid)
returns table(user_id uuid,display_name text,avatar_url text,role text,headline text)
language plpgsql
stable
security definer
set search_path=''
as $$
declare actor_id uuid := auth.uid();
begin
  if actor_id is null then raise exception 'Authentication required.' using errcode='42501'; end if;
  if not exists(select 1 from public.community_events e where e.id=requested_event_id and e.status='published' and e.networking_enabled=true) then
    raise exception 'Networking is not enabled for this event.' using errcode='22023';
  end if;
  if not exists(
    select 1 from public.community_event_rsvps r where r.event_id=requested_event_id and r.user_id=actor_id and r.status in ('going','interested')
    union all select 1 from public.community_event_attendance a where a.event_id=requested_event_id and a.user_id=actor_id and a.attended=true
  ) then
    raise exception 'Event participation is required to view networking opt-ins.' using errcode='42501';
  end if;

  return query
  select o.user_id,
         coalesce(nullif(trim(p.full_name),''),nullif(trim(p.username),''),'Playbook member'),
         p.avatar_url,
         private.normalize_playbook_profile_role(coalesce(p.profile_mode,p.role,p.requested_role)),
         o.headline
    from public.community_event_networking_optins o
    join public.profiles p on p.id=o.user_id
   where o.event_id=requested_event_id
   order by o.opted_in_at asc,o.user_id;
end;
$$;

revoke all on function private.get_community_event_networking_directory(uuid) from public,anon,authenticated;
grant execute on function private.get_community_event_networking_directory(uuid) to authenticated;

create or replace function public.get_community_event_networking_directory(requested_event_id uuid)
returns table(user_id uuid,display_name text,avatar_url text,role text,headline text)
language sql
stable
security invoker
set search_path=''
as $$ select * from private.get_community_event_networking_directory(requested_event_id); $$;

revoke all on function public.get_community_event_networking_directory(uuid) from public,anon;
grant execute on function public.get_community_event_networking_directory(uuid) to authenticated;

create or replace function private.get_community_event_detail(requested_event_id uuid)
returns table(
  id uuid,title text,description text,event_type text,pillar text,starts_at timestamptz,ends_at timestamptz,timezone text,
  location text,virtual_url text,capacity integer,xp_reward integer,coin_reward integer,replay_url text,
  networking_enabled boolean,check_in_enabled boolean,my_rsvp text,attended boolean,checked_in_at timestamptz,networking_opted_in boolean
)
language plpgsql
stable
security definer
set search_path=''
as $$
declare actor_id uuid := auth.uid();
begin
  if actor_id is null then raise exception 'Authentication required.' using errcode='42501'; end if;
  return query
  select e.id,e.title,coalesce(e.description,''),e.event_type,coalesce(e.pillar,'Community'),e.starts_at,e.ends_at,coalesce(e.timezone,'America/Los_Angeles'),
         e.location,e.virtual_url,e.capacity,coalesce(e.xp_reward,0),coalesce(e.coin_reward,0),e.replay_url,e.networking_enabled,e.check_in_enabled,
         r.status,
         exists(select 1 from public.community_event_attendance a where a.event_id=e.id and a.user_id=actor_id and a.attended=true),
         (select c.checked_in_at from public.community_event_checkins c where c.event_id=e.id and c.user_id=actor_id limit 1),
         exists(select 1 from public.community_event_networking_optins o where o.event_id=e.id and o.user_id=actor_id)
    from public.community_events e
    left join public.community_event_rsvps r on r.event_id=e.id and r.user_id=actor_id
   where e.id=requested_event_id and e.status='published'
   limit 1;
end;
$$;

revoke all on function private.get_community_event_detail(uuid) from public,anon,authenticated;
grant execute on function private.get_community_event_detail(uuid) to authenticated;

create or replace function public.get_community_event_detail(requested_event_id uuid)
returns table(
  id uuid,title text,description text,event_type text,pillar text,starts_at timestamptz,ends_at timestamptz,timezone text,
  location text,virtual_url text,capacity integer,xp_reward integer,coin_reward integer,replay_url text,
  networking_enabled boolean,check_in_enabled boolean,my_rsvp text,attended boolean,checked_in_at timestamptz,networking_opted_in boolean
)
language sql
stable
security invoker
set search_path=''
as $$ select * from private.get_community_event_detail(requested_event_id); $$;

revoke all on function public.get_community_event_detail(uuid) from public,anon;
grant execute on function public.get_community_event_detail(uuid) to authenticated;

comment on table public.community_event_checkins is 'Attendee arrival evidence created through active event check-in tokens. Check-in is not verified attendance and does not issue rewards.';
comment on table public.community_event_networking_optins is 'Explicit event-scoped networking consent. Directory projection exposes only narrow safe identity fields to participating attendees.';
