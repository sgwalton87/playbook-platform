-- Narrow operator-only projection for Event Operations UI.
-- Mutation authority remains in the existing governed Event RPCs.

create or replace function private.get_community_event_operations()
returns table(
  id uuid,
  title text,
  status text,
  starts_at timestamptz,
  ends_at timestamptz,
  timezone text,
  location text,
  replay_url text,
  networking_enabled boolean,
  check_in_enabled boolean
)
language plpgsql
stable
security definer
set search_path=''
as $$
begin
  if auth.uid() is null or not private.current_user_is_platform_operator() then
    raise exception 'Platform operator authority required.' using errcode='42501';
  end if;

  return query
  select e.id,e.title,coalesce(e.status,'draft'),e.starts_at,e.ends_at,
         coalesce(e.timezone,'America/Los_Angeles'),e.location,e.replay_url,
         e.networking_enabled,e.check_in_enabled
    from public.community_events e
   order by e.starts_at desc nulls last,e.created_at desc,e.id;
end;
$$;

revoke all on function private.get_community_event_operations() from public,anon,authenticated;
grant execute on function private.get_community_event_operations() to authenticated;

create or replace function public.get_community_event_operations()
returns table(
  id uuid,
  title text,
  status text,
  starts_at timestamptz,
  ends_at timestamptz,
  timezone text,
  location text,
  replay_url text,
  networking_enabled boolean,
  check_in_enabled boolean
)
language sql
stable
security invoker
set search_path=''
as $$ select * from private.get_community_event_operations(); $$;

revoke all on function public.get_community_event_operations() from public,anon;
grant execute on function public.get_community_event_operations() to authenticated;

comment on function public.get_community_event_operations() is
  'Operator-only Event Operations projection. Does not expose attendee lists, check-in token hashes, or private Scholar data.';
