-- Summit is a governed type of the shared Community Event service.
-- No Summit-specific event table or parallel RSVP/attendance implementation is introduced.

alter table public.community_events
  drop constraint if exists community_events_event_type_check;

alter table public.community_events
  add constraint community_events_event_type_check
  check (event_type in (
    'workshop','lab','civic','social','virtual','course','networking','community','summit'
  ));

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
  if length(trim(coalesce(event_title,''))) < 3
     or length(trim(coalesce(event_description,''))) < 10 then
    raise exception 'Event title and description are required.' using errcode='22023';
  end if;
  if event_type_input not in (
    'workshop','lab','civic','social','virtual','course','networking','community','summit'
  ) then
    raise exception 'Unsupported event type.' using errcode='22023';
  end if;
  if starts_at_input is null or ends_at_input is null or ends_at_input <= starts_at_input then
    raise exception 'Event end must be after start.' using errcode='22023';
  end if;
  if capacity_input is not null and capacity_input <= 0 then
    raise exception 'Event capacity must be positive when provided.' using errcode='22023';
  end if;

  insert into public.community_events(
    title,description,event_type,pillar,starts_at,ends_at,timezone,location,virtual_url,
    capacity,xp_reward,coin_reward,status,created_by,updated_at
  ) values (
    trim(event_title),trim(event_description),event_type_input,
    coalesce(nullif(trim(pillar_input),''),'Community'),
    starts_at_input,ends_at_input,
    coalesce(nullif(trim(timezone_input),''),'America/Los_Angeles'),
    nullif(trim(coalesce(location_input,'')),''),
    nullif(trim(coalesce(virtual_url_input,'')),''),
    capacity_input,
    greatest(coalesce(xp_reward_input,0),0),
    greatest(coalesce(coin_reward_input,0),0),
    case when publish_now then 'published' else 'draft' end,
    actor_id,now()
  ) returning id into saved_id;

  return saved_id;
end;
$$;

revoke all on function private.create_community_event(text,text,text,text,timestamptz,timestamptz,text,text,text,integer,integer,integer,boolean)
  from public,anon,authenticated;
grant execute on function private.create_community_event(text,text,text,text,timestamptz,timestamptz,text,text,text,integer,integer,integer,boolean)
  to authenticated;

comment on constraint community_events_event_type_check on public.community_events is
  'Canonical shared Event type taxonomy. Summit is a Community Event type and inherits shared RSVP, reminders, check-in, attendance, networking, replay, and rewards.';
