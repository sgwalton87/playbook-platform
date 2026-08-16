-- Move canonical Community + Mentorship authority out of the exposed public SECURITY DEFINER surface.
-- Public RPC signatures remain stable as SECURITY INVOKER wrappers. Private helpers retain
-- authentication/role gates, row locks, capacity rules, reward idempotency, and bounded projections.

create or replace function private.rsvp_community_event(requested_event_id uuid, requested_status text)
returns table (rsvp_id uuid, status text, going_count integer, capacity integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  event_row public.community_events%rowtype;
  existing_status text;
  current_going integer;
  saved_id uuid;
begin
  if actor_id is null then raise exception 'Authentication required.' using errcode='42501'; end if;
  if requested_status not in ('interested','going','cancelled') then raise exception 'Unsupported RSVP status.' using errcode='22023'; end if;
  select * into event_row from public.community_events e where e.id=requested_event_id and e.status='published' for update;
  if not found then raise exception 'Published event not found.' using errcode='P0002'; end if;
  if event_row.ends_at is null or event_row.starts_at is null then raise exception 'Event schedule is incomplete.' using errcode='P0001'; end if;
  if event_row.ends_at < now() then raise exception 'Event has ended.' using errcode='P0001'; end if;
  select r.status into existing_status from public.community_event_rsvps r where r.event_id=requested_event_id and r.user_id=actor_id;
  select count(*) into current_going from public.community_event_rsvps r where r.event_id=requested_event_id and r.status='going';
  if requested_status='going' and existing_status is distinct from 'going' and event_row.capacity is not null and current_going >= event_row.capacity then
    raise exception 'Event is at capacity.' using errcode='P0001';
  end if;
  insert into public.community_event_rsvps(event_id,user_id,status,updated_at)
  values(requested_event_id,actor_id,requested_status,now())
  on conflict(event_id,user_id) do update set status=excluded.status,updated_at=now()
  returning id into saved_id;
  select count(*) into current_going from public.community_event_rsvps r where r.event_id=requested_event_id and r.status='going';
  return query select saved_id,requested_status,current_going,event_row.capacity;
end;
$$;

create or replace function private.create_community_event(
  event_title text,
  event_description text,
  event_type_input text,
  pillar_input text,
  starts_at_input timestamptz,
  ends_at_input timestamptz,
  timezone_input text,
  location_input text,
  virtual_url_input text,
  capacity_input integer,
  xp_reward_input integer,
  coin_reward_input integer,
  publish_now boolean default true
)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  saved_id uuid;
begin
  if actor_id is null or not private.current_user_is_platform_operator() then
    raise exception 'Platform operator authority required.' using errcode='42501';
  end if;
  if length(trim(coalesce(event_title,''))) < 3 or length(trim(coalesce(event_description,''))) < 10 then
    raise exception 'Event title and description are required.' using errcode='22023';
  end if;
  if event_type_input not in ('workshop','lab','civic','social','virtual','course','networking','community') then
    raise exception 'Unsupported event type.' using errcode='22023';
  end if;
  if ends_at_input <= starts_at_input then
    raise exception 'Event end must be after start.' using errcode='22023';
  end if;
  insert into public.community_events(
    title,description,event_type,pillar,starts_at,ends_at,timezone,location,virtual_url,
    capacity,xp_reward,coin_reward,status,created_by,updated_at
  ) values(
    trim(event_title),trim(event_description),event_type_input,
    coalesce(nullif(trim(pillar_input),''),'Community'),starts_at_input,ends_at_input,
    coalesce(nullif(trim(timezone_input),''),'America/Los_Angeles'),
    nullif(trim(coalesce(location_input,'')),''),nullif(trim(coalesce(virtual_url_input,'')),''),
    capacity_input,greatest(coalesce(xp_reward_input,0),0),greatest(coalesce(coin_reward_input,0),0),
    case when publish_now then 'published' else 'draft' end,actor_id,now()
  ) returning id into saved_id;
  return saved_id;
end;
$$;

create or replace function private.verify_community_event_attendance(
  requested_event_id uuid,
  requested_user_id uuid,
  attended_input boolean default true,
  notes_input text default null
)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  event_row public.community_events%rowtype;
  saved_id uuid;
  reward_already_issued boolean := false;
begin
  if actor_id is null or not private.current_user_is_platform_operator() then
    raise exception 'Platform operator authority required.' using errcode='42501';
  end if;
  select * into event_row from public.community_events where id=requested_event_id for update;
  if not found then raise exception 'Event not found.' using errcode='P0002'; end if;
  insert into public.community_event_attendance(event_id,user_id,attended,verified_by,verified_at,notes,reward_issued)
  values(requested_event_id,requested_user_id,attended_input,actor_id,now(),nullif(trim(coalesce(notes_input,'')),''),false)
  on conflict(event_id,user_id) do update
    set attended=excluded.attended,verified_by=actor_id,verified_at=now(),notes=excluded.notes
  returning id,reward_issued into saved_id,reward_already_issued;
  if attended_input and not reward_already_issued and (coalesce(event_row.coin_reward,0) > 0 or coalesce(event_row.xp_reward,0) > 0) then
    if private.record_learning_reward(
      requested_user_id,'event.attended',requested_event_id::text,
      coalesce(event_row.coin_reward,0),coalesce(event_row.xp_reward,0),
      'Verified attendance: ' || event_row.title
    ) then
      update public.community_event_attendance set reward_issued=true where id=saved_id;
    end if;
  end if;
  return saved_id;
end;
$$;

create or replace function private.create_mentor_circle(
  circle_name text,
  circle_description text,
  pillar_input text,
  mentor_user_id_input uuid,
  capacity_input integer default 12,
  next_session_at_input timestamptz default null,
  timezone_input text default 'America/Los_Angeles',
  location_input text default null
)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  mentor_id uuid := coalesce(mentor_user_id_input,actor_id);
  saved_id uuid;
begin
  if actor_id is null then raise exception 'Authentication required.' using errcode='42501'; end if;
  if not private.current_user_is_platform_operator() then
    if actor_id <> mentor_id or not private.current_user_is_mentor() then
      raise exception 'Verified Mentor or platform operator authority required.' using errcode='42501';
    end if;
  end if;
  if not exists (
    select 1 from public.profiles p
    where p.id=mentor_id
      and private.normalize_playbook_profile_role(coalesce(p.profile_mode,p.role,p.requested_role))='mentor'
      and p.onboarding_completed=true
  ) then
    raise exception 'Mentor owner must be an onboarded Mentor.' using errcode='42501';
  end if;
  if length(trim(coalesce(circle_name,''))) < 3 or length(trim(coalesce(circle_description,''))) < 10 then
    raise exception 'Circle name and description are required.' using errcode='22023';
  end if;
  insert into public.mentor_circles(
    name,description,pillar,mentor_user_id,capacity,status,next_session_at,timezone,location,created_by
  ) values(
    trim(circle_name),trim(circle_description),coalesce(nullif(trim(pillar_input),''),'Community'),
    mentor_id,greatest(coalesce(capacity_input,12),1),'active',next_session_at_input,
    coalesce(nullif(trim(timezone_input),''),'America/Los_Angeles'),
    nullif(trim(coalesce(location_input,'')),''),actor_id
  ) returning id into saved_id;
  return saved_id;
end;
$$;

create or replace function private.join_mentor_circle(requested_circle_id uuid, requested_action text default 'join')
returns table (membership_id uuid, membership_status text, active_count integer, capacity integer)
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  circle_row public.mentor_circles%rowtype;
  count_active integer;
  next_status text;
  saved_id uuid;
begin
  if actor_id is null then raise exception 'Authentication required.' using errcode='42501'; end if;
  if requested_action not in ('join','leave') then raise exception 'Unsupported circle action.' using errcode='22023'; end if;
  select * into circle_row from public.mentor_circles c where c.id=requested_circle_id and c.status='active' for update;
  if not found then raise exception 'Active mentor circle not found.' using errcode='P0002'; end if;
  select count(*) into count_active from public.mentor_circle_memberships m where m.circle_id=requested_circle_id and m.status='active';
  next_status := case when requested_action='leave' then 'left' when count_active < circle_row.capacity then 'active' else 'waitlisted' end;
  insert into public.mentor_circle_memberships(circle_id,user_id,status,joined_at,ended_at)
  values(requested_circle_id,actor_id,next_status,now(),case when next_status='left' then now() else null end)
  on conflict(circle_id,user_id) do update
    set status=excluded.status,
        joined_at=case when excluded.status in ('active','waitlisted') then now() else mentor_circle_memberships.joined_at end,
        ended_at=excluded.ended_at
  returning id into saved_id;
  select count(*) into count_active from public.mentor_circle_memberships m where m.circle_id=requested_circle_id and m.status='active';
  return query select saved_id,next_status,count_active,circle_row.capacity;
end;
$$;

create or replace function private.get_community_events()
returns table (
  id uuid,
  title text,
  description text,
  event_type text,
  pillar text,
  starts_at timestamptz,
  ends_at timestamptz,
  timezone text,
  location text,
  virtual_url text,
  capacity integer,
  going_count integer,
  interested_count integer,
  xp_reward integer,
  coin_reward integer,
  status text,
  my_rsvp text,
  attended boolean
)
language sql
stable
security definer
set search_path=''
as $$
  select e.id,e.title,e.description,e.event_type,e.pillar,e.starts_at,e.ends_at,e.timezone,e.location,e.virtual_url,e.capacity,
    (select count(*)::integer from public.community_event_rsvps r where r.event_id=e.id and r.status='going') as going_count,
    (select count(*)::integer from public.community_event_rsvps r where r.event_id=e.id and r.status='interested') as interested_count,
    e.xp_reward,e.coin_reward,e.status,
    (select r.status from public.community_event_rsvps r where r.event_id=e.id and r.user_id=auth.uid()) as my_rsvp,
    coalesce((select a.attended from public.community_event_attendance a where a.event_id=e.id and a.user_id=auth.uid()),false) as attended
  from public.community_events e
  where auth.uid() is not null
    and (
      e.status='published'
      or (e.status='completed' and exists(
        select 1 from public.community_event_attendance a where a.event_id=e.id and a.user_id=auth.uid()
      ))
    )
  order by e.starts_at asc;
$$;

create or replace function private.get_mentor_circles()
returns table (
  id uuid,
  name text,
  description text,
  pillar text,
  mentor_user_id uuid,
  mentor_name text,
  mentor_username text,
  mentor_avatar_url text,
  capacity integer,
  active_count integer,
  waitlist_count integer,
  status text,
  next_session_at timestamptz,
  timezone text,
  location text,
  my_membership text
)
language sql
stable
security definer
set search_path=''
as $$
  select c.id,c.name,c.description,c.pillar,c.mentor_user_id,
    coalesce(nullif(trim(p.full_name),''),nullif(trim(concat_ws(' ',p.first_name,p.last_name)),''),p.username,'Playbook Mentor') as mentor_name,
    p.username,p.avatar_url,c.capacity,
    (select count(*)::integer from public.mentor_circle_memberships m where m.circle_id=c.id and m.status='active') as active_count,
    (select count(*)::integer from public.mentor_circle_memberships m where m.circle_id=c.id and m.status='waitlisted') as waitlist_count,
    c.status,c.next_session_at,c.timezone,c.location,
    (select m.status from public.mentor_circle_memberships m where m.circle_id=c.id and m.user_id=auth.uid()) as my_membership
  from public.mentor_circles c
  join public.profiles p on p.id=c.mentor_user_id
  where auth.uid() is not null and c.status='active'
  order by c.next_session_at asc nulls last,c.created_at desc;
$$;

revoke all on function private.rsvp_community_event(uuid,text) from public,anon,authenticated;
revoke all on function private.create_community_event(text,text,text,text,timestamptz,timestamptz,text,text,text,integer,integer,integer,boolean) from public,anon,authenticated;
revoke all on function private.verify_community_event_attendance(uuid,uuid,boolean,text) from public,anon,authenticated;
revoke all on function private.create_mentor_circle(text,text,text,uuid,integer,timestamptz,text,text) from public,anon,authenticated;
revoke all on function private.join_mentor_circle(uuid,text) from public,anon,authenticated;
revoke all on function private.get_community_events() from public,anon,authenticated;
revoke all on function private.get_mentor_circles() from public,anon,authenticated;
grant execute on function private.rsvp_community_event(uuid,text) to authenticated;
grant execute on function private.create_community_event(text,text,text,text,timestamptz,timestamptz,text,text,text,integer,integer,integer,boolean) to authenticated;
grant execute on function private.verify_community_event_attendance(uuid,uuid,boolean,text) to authenticated;
grant execute on function private.create_mentor_circle(text,text,text,uuid,integer,timestamptz,text,text) to authenticated;
grant execute on function private.join_mentor_circle(uuid,text) to authenticated;
grant execute on function private.get_community_events() to authenticated;
grant execute on function private.get_mentor_circles() to authenticated;

create or replace function public.rsvp_community_event(requested_event_id uuid, requested_status text)
returns table (rsvp_id uuid, status text, going_count integer, capacity integer)
language sql
security invoker
set search_path=''
as $$ select * from private.rsvp_community_event(requested_event_id,requested_status); $$;

create or replace function public.create_community_event(
  event_title text,event_description text,event_type_input text,pillar_input text,
  starts_at_input timestamptz,ends_at_input timestamptz,timezone_input text,location_input text,
  virtual_url_input text,capacity_input integer,xp_reward_input integer,coin_reward_input integer,
  publish_now boolean default true
)
returns uuid
language sql
security invoker
set search_path=''
as $$ select private.create_community_event(event_title,event_description,event_type_input,pillar_input,starts_at_input,ends_at_input,timezone_input,location_input,virtual_url_input,capacity_input,xp_reward_input,coin_reward_input,publish_now); $$;

create or replace function public.verify_community_event_attendance(
  requested_event_id uuid, requested_user_id uuid, attended_input boolean default true, notes_input text default null
)
returns uuid
language sql
security invoker
set search_path=''
as $$ select private.verify_community_event_attendance(requested_event_id,requested_user_id,attended_input,notes_input); $$;

create or replace function public.create_mentor_circle(
  circle_name text,circle_description text,pillar_input text,mentor_user_id_input uuid,
  capacity_input integer default 12,next_session_at_input timestamptz default null,
  timezone_input text default 'America/Los_Angeles',location_input text default null
)
returns uuid
language sql
security invoker
set search_path=''
as $$ select private.create_mentor_circle(circle_name,circle_description,pillar_input,mentor_user_id_input,capacity_input,next_session_at_input,timezone_input,location_input); $$;

create or replace function public.join_mentor_circle(requested_circle_id uuid, requested_action text default 'join')
returns table (membership_id uuid, membership_status text, active_count integer, capacity integer)
language sql
security invoker
set search_path=''
as $$ select * from private.join_mentor_circle(requested_circle_id,requested_action); $$;

create or replace function public.get_community_events()
returns table (
  id uuid,title text,description text,event_type text,pillar text,starts_at timestamptz,ends_at timestamptz,
  timezone text,location text,virtual_url text,capacity integer,going_count integer,interested_count integer,
  xp_reward integer,coin_reward integer,status text,my_rsvp text,attended boolean
)
language sql
stable
security invoker
set search_path=''
as $$ select * from private.get_community_events(); $$;

create or replace function public.get_mentor_circles()
returns table (
  id uuid,name text,description text,pillar text,mentor_user_id uuid,mentor_name text,mentor_username text,
  mentor_avatar_url text,capacity integer,active_count integer,waitlist_count integer,status text,
  next_session_at timestamptz,timezone text,location text,my_membership text
)
language sql
stable
security invoker
set search_path=''
as $$ select * from private.get_mentor_circles(); $$;

revoke all on function public.rsvp_community_event(uuid,text) from public,anon,authenticated;
revoke all on function public.create_community_event(text,text,text,text,timestamptz,timestamptz,text,text,text,integer,integer,integer,boolean) from public,anon,authenticated;
revoke all on function public.verify_community_event_attendance(uuid,uuid,boolean,text) from public,anon,authenticated;
revoke all on function public.create_mentor_circle(text,text,text,uuid,integer,timestamptz,text,text) from public,anon,authenticated;
revoke all on function public.join_mentor_circle(uuid,text) from public,anon,authenticated;
revoke all on function public.get_community_events() from public,anon,authenticated;
revoke all on function public.get_mentor_circles() from public,anon,authenticated;
grant execute on function public.rsvp_community_event(uuid,text) to authenticated;
grant execute on function public.create_community_event(text,text,text,text,timestamptz,timestamptz,text,text,text,integer,integer,integer,boolean) to authenticated;
grant execute on function public.verify_community_event_attendance(uuid,uuid,boolean,text) to authenticated;
grant execute on function public.create_mentor_circle(text,text,text,uuid,integer,timestamptz,text,text) to authenticated;
grant execute on function public.join_mentor_circle(uuid,text) to authenticated;
grant execute on function public.get_community_events() to authenticated;
grant execute on function public.get_mentor_circles() to authenticated;
