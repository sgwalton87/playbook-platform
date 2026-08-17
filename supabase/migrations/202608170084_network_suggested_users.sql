-- Deterministic, privacy-preserving Suggested Users authority.
-- Suggestions are not AI recommendations. They are explainable Network candidates
-- ranked only by canonical mutual-connection count under the public profile boundary.

create or replace function private.get_network_suggested_users(result_limit integer default 12)
returns table(
  id uuid,
  username text,
  full_name text,
  first_name text,
  last_name text,
  role text,
  avatar_url text,
  school text,
  sport text,
  mutual_count bigint
)
language sql
stable
security definer
set search_path=''
as $$
  with actor as (
    select auth.uid() as id
  ), actor_edges as (
    select c.connected_user_id
    from public.user_connections c
    cross join actor a
    where c.user_id=a.id
  ), eligible as (
    select p.*
    from public.profiles p
    cross join actor a
    where a.id is not null
      and p.id<>a.id
      and p.profile_visibility='public'
      and exists (
        select 1
        from public.public_profile_publication_consents consent
        where consent.scholar_id=p.id
          and consent.consent_version='public-profile-v1'
          and consent.revoked_at is null
      )
      and not exists (
        select 1
        from public.user_connections c
        where (c.user_id=a.id and c.connected_user_id=p.id)
           or (c.user_id=p.id and c.connected_user_id=a.id)
      )
      and not exists (
        select 1
        from public.connection_requests r
        where r.status='pending'
          and ((r.requester_id=a.id and r.recipient_id=p.id)
            or (r.requester_id=p.id and r.recipient_id=a.id))
      )
  ), ranked as (
    select
      p.id,
      p.username,
      p.full_name,
      p.first_name,
      p.last_name,
      private.normalize_playbook_profile_role(coalesce(p.profile_mode,p.role,p.requested_role)) as role,
      p.avatar_url,
      p.school,
      p.sport,
      count(distinct target_edge.connected_user_id)::bigint as mutual_count
    from eligible p
    join public.user_connections target_edge
      on target_edge.user_id=p.id
     and target_edge.connected_user_id in (select connected_user_id from actor_edges)
    group by p.id,p.username,p.full_name,p.first_name,p.last_name,p.profile_mode,p.role,p.requested_role,p.avatar_url,p.school,p.sport
  )
  select r.id,r.username,r.full_name,r.first_name,r.last_name,r.role,r.avatar_url,r.school,r.sport,r.mutual_count
  from ranked r
  where r.mutual_count>0
  order by r.mutual_count desc,
    lower(coalesce(r.full_name,r.username,'')) asc,
    r.id asc
  limit least(greatest(coalesce(result_limit,12),1),24);
$$;

revoke all on function private.get_network_suggested_users(integer) from public,anon,authenticated;
grant execute on function private.get_network_suggested_users(integer) to authenticated;

create or replace function public.get_network_suggested_users(result_limit integer default 12)
returns table(
  id uuid,
  username text,
  full_name text,
  first_name text,
  last_name text,
  role text,
  avatar_url text,
  school text,
  sport text,
  mutual_count bigint
)
language sql
stable
security invoker
set search_path=''
as $$
  select * from private.get_network_suggested_users(result_limit);
$$;

revoke all on function public.get_network_suggested_users(integer) from public,anon;
grant execute on function public.get_network_suggested_users(integer) to authenticated;

comment on function public.get_network_suggested_users(integer) is
  'Explainable deterministic Network suggestions: public-consented, not connected/pending, at least one mutual connection, ranked by mutual count with stable tie-breaks. No private graph identities or AI score are exposed.';