-- Read projections for Events and Mentorship Circles. Capacity/member counts are
-- derived server-side so clients do not need broad RSVP or membership table access.

create or replace function public.get_community_events()
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
    and (e.status='published' or (e.status='completed' and exists(select 1 from public.community_event_attendance a where a.event_id=e.id and a.user_id=auth.uid())))
  order by e.starts_at asc;
$$;

create or replace function public.get_mentor_circles()
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

revoke all on function public.get_community_events() from public,anon,authenticated;
revoke all on function public.get_mentor_circles() from public,anon,authenticated;
grant execute on function public.get_community_events() to authenticated;
grant execute on function public.get_mentor_circles() to authenticated;
