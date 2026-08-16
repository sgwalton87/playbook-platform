-- Canonical Events + Mentorship Circles.
-- Durable community operations replace historical React-only arrays.

create or replace function private.current_user_is_platform_operator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('founder','admin')
  );
$$;

create or replace function private.current_user_is_mentor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and private.normalize_playbook_profile_role(coalesce(p.profile_mode,p.role,p.requested_role)) = 'mentor'
      and p.onboarding_completed = true
  );
$$;

create table if not exists public.community_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  event_type text not null check (event_type in ('workshop','lab','civic','social','virtual','course','networking')),
  pillar text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'America/Los_Angeles',
  location text,
  virtual_url text,
  capacity integer check (capacity is null or capacity > 0),
  xp_reward integer not null default 0 check (xp_reward >= 0),
  coin_reward integer not null default 0 check (coin_reward >= 0),
  status text not null default 'draft' check (status in ('draft','published','cancelled','completed')),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.community_event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.community_events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('interested','going','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id,user_id)
);

create table if not exists public.community_event_attendance (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.community_events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  attended boolean not null default true,
  verified_by uuid not null references public.profiles(id) on delete restrict,
  verified_at timestamptz not null default now(),
  notes text,
  reward_issued boolean not null default false,
  unique(event_id,user_id)
);

create table if not exists public.mentor_circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  pillar text not null,
  mentor_user_id uuid not null references public.profiles(id) on delete restrict,
  capacity integer not null default 12 check (capacity > 0),
  status text not null default 'active' check (status in ('draft','active','paused','closed')),
  next_session_at timestamptz,
  timezone text not null default 'America/Los_Angeles',
  location text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mentor_circle_memberships (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.mentor_circles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active','waitlisted','left','removed')),
  joined_at timestamptz not null default now(),
  ended_at timestamptz,
  unique(circle_id,user_id)
);

alter table public.community_events enable row level security;
alter table public.community_event_rsvps enable row level security;
alter table public.community_event_attendance enable row level security;
alter table public.mentor_circles enable row level security;
alter table public.mentor_circle_memberships enable row level security;

grant select on public.community_events, public.mentor_circles to authenticated;
grant select on public.community_event_rsvps, public.community_event_attendance, public.mentor_circle_memberships to authenticated;

drop policy if exists "Authenticated can view published community events" on public.community_events;
create policy "Authenticated can view published community events" on public.community_events for select to authenticated
using (status in ('published','completed') or created_by = auth.uid() or private.current_user_is_platform_operator());

drop policy if exists "Users view own event RSVPs" on public.community_event_rsvps;
create policy "Users view own event RSVPs" on public.community_event_rsvps for select to authenticated
using (user_id = auth.uid() or private.current_user_is_platform_operator());

drop policy if exists "Users view own verified event attendance" on public.community_event_attendance;
create policy "Users view own verified event attendance" on public.community_event_attendance for select to authenticated
using (user_id = auth.uid() or private.current_user_is_platform_operator());

drop policy if exists "Authenticated can view active mentor circles" on public.mentor_circles;
create policy "Authenticated can view active mentor circles" on public.mentor_circles for select to authenticated
using (status = 'active' or mentor_user_id = auth.uid() or private.current_user_is_platform_operator());

drop policy if exists "Users view circle memberships" on public.mentor_circle_memberships;
create policy "Users view circle memberships" on public.mentor_circle_memberships for select to authenticated
using (
  user_id = auth.uid()
  or exists (select 1 from public.mentor_circles c where c.id = circle_id and c.mentor_user_id = auth.uid())
  or private.current_user_is_platform_operator()
);

create or replace function public.rsvp_community_event(requested_event_id uuid, requested_status text)
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

  select * into event_row from public.community_events e
  where e.id=requested_event_id and e.status='published' for update;
  if not found then raise exception 'Published event not found.' using errcode='P0002'; end if;
  if event_row.ends_at < now() then raise exception 'Event has ended.' using errcode='P0001'; end if;

  select r.status into existing_status from public.community_event_rsvps r
  where r.event_id=requested_event_id and r.user_id=actor_id;

  select count(*) into current_going from public.community_event_rsvps r
  where r.event_id=requested_event_id and r.status='going';

  if requested_status='going' and existing_status is distinct from 'going'
     and event_row.capacity is not null and current_going >= event_row.capacity then
    raise exception 'Event is at capacity.' using errcode='P0001';
  end if;

  insert into public.community_event_rsvps(event_id,user_id,status,updated_at)
  values(requested_event_id,actor_id,requested_status,now())
  on conflict(event_id,user_id) do update set status=excluded.status,updated_at=now()
  returning id into saved_id;

  select count(*) into current_going from public.community_event_rsvps r
  where r.event_id=requested_event_id and r.status='going';

  return query select saved_id,requested_status,current_going,event_row.capacity;
end;
$$;

create or replace function public.create_community_event(
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
  if actor_id is null or not private.current_user_is_platform_operator() then raise exception 'Platform operator authority required.' using errcode='42501'; end if;
  if length(trim(coalesce(event_title,''))) < 3 or length(trim(coalesce(event_description,''))) < 10 then raise exception 'Event title and description are required.' using errcode='22023'; end if;
  if ends_at_input <= starts_at_input then raise exception 'Event end must be after start.' using errcode='22023'; end if;
  insert into public.community_events(title,description,event_type,pillar,starts_at,ends_at,timezone,location,virtual_url,capacity,xp_reward,coin_reward,status,created_by)
  values(trim(event_title),trim(event_description),event_type_input,pillar_input,starts_at_input,ends_at_input,coalesce(nullif(trim(timezone_input),''),'America/Los_Angeles'),nullif(trim(coalesce(location_input,'')),''),nullif(trim(coalesce(virtual_url_input,'')),''),capacity_input,greatest(coalesce(xp_reward_input,0),0),greatest(coalesce(coin_reward_input,0),0),case when publish_now then 'published' else 'draft' end,actor_id)
  returning id into saved_id;
  return saved_id;
end;
$$;

create or replace function public.verify_community_event_attendance(requested_event_id uuid, requested_user_id uuid, attended_input boolean default true, notes_input text default null)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  event_row public.community_events%rowtype;
  saved_id uuid;
  reward_new boolean := false;
begin
  if actor_id is null or not private.current_user_is_platform_operator() then raise exception 'Platform operator authority required.' using errcode='42501'; end if;
  select * into event_row from public.community_events where id=requested_event_id for update;
  if not found then raise exception 'Event not found.' using errcode='P0002'; end if;

  insert into public.community_event_attendance(event_id,user_id,attended,verified_by,verified_at,notes,reward_issued)
  values(requested_event_id,requested_user_id,attended_input,actor_id,now(),nullif(trim(coalesce(notes_input,'')),''),false)
  on conflict(event_id,user_id) do update set attended=excluded.attended,verified_by=actor_id,verified_at=now(),notes=excluded.notes
  returning id,reward_issued into saved_id,reward_new;

  if attended_input and not reward_new and (event_row.coin_reward > 0 or event_row.xp_reward > 0) then
    if private.record_learning_reward(requested_user_id,'event.attended',requested_event_id::text,event_row.coin_reward,event_row.xp_reward,'Verified attendance: ' || event_row.title) then
      update public.community_event_attendance set reward_issued=true where id=saved_id;
    end if;
  end if;
  return saved_id;
end;
$$;

create or replace function public.create_mentor_circle(
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
    if actor_id <> mentor_id or not private.current_user_is_mentor() then raise exception 'Verified Mentor or platform operator authority required.' using errcode='42501'; end if;
  end if;
  if not exists (select 1 from public.profiles p where p.id=mentor_id and private.normalize_playbook_profile_role(coalesce(p.profile_mode,p.role,p.requested_role))='mentor' and p.onboarding_completed=true) then
    raise exception 'Mentor owner must be an onboarded Mentor.' using errcode='42501';
  end if;
  insert into public.mentor_circles(name,description,pillar,mentor_user_id,capacity,status,next_session_at,timezone,location,created_by)
  values(trim(circle_name),trim(circle_description),pillar_input,mentor_id,greatest(coalesce(capacity_input,12),1),'active',next_session_at_input,coalesce(nullif(trim(timezone_input),''),'America/Los_Angeles'),nullif(trim(coalesce(location_input,'')),''),actor_id)
  returning id into saved_id;
  return saved_id;
end;
$$;

create or replace function public.join_mentor_circle(requested_circle_id uuid, requested_action text default 'join')
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
  on conflict(circle_id,user_id) do update set status=excluded.status,joined_at=case when excluded.status in ('active','waitlisted') then now() else mentor_circle_memberships.joined_at end,ended_at=excluded.ended_at
  returning id into saved_id;

  select count(*) into count_active from public.mentor_circle_memberships m where m.circle_id=requested_circle_id and m.status='active';
  return query select saved_id,next_status,count_active,circle_row.capacity;
end;
$$;

revoke all on function private.current_user_is_platform_operator() from public,anon,authenticated;
revoke all on function private.current_user_is_mentor() from public,anon,authenticated;
revoke all on function public.rsvp_community_event(uuid,text) from public,anon,authenticated;
revoke all on function public.create_community_event(text,text,text,text,timestamptz,timestamptz,text,text,text,integer,integer,integer,boolean) from public,anon,authenticated;
revoke all on function public.verify_community_event_attendance(uuid,uuid,boolean,text) from public,anon,authenticated;
revoke all on function public.create_mentor_circle(text,text,text,uuid,integer,timestamptz,text,text) from public,anon,authenticated;
revoke all on function public.join_mentor_circle(uuid,text) from public,anon,authenticated;
grant execute on function public.rsvp_community_event(uuid,text) to authenticated;
grant execute on function public.create_community_event(text,text,text,text,timestamptz,timestamptz,text,text,text,integer,integer,integer,boolean) to authenticated;
grant execute on function public.verify_community_event_attendance(uuid,uuid,boolean,text) to authenticated;
grant execute on function public.create_mentor_circle(text,text,text,uuid,integer,timestamptz,text,text) to authenticated;
grant execute on function public.join_mentor_circle(uuid,text) to authenticated;
