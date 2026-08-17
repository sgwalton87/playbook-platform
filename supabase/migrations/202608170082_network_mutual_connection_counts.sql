-- Privacy-preserving Mutual Connections authority.
-- Returns only counts for bounded requested Network member ids; it never exposes
-- the identities or private graph of another member's connections.

create or replace function private.get_network_mutual_connection_counts(requested_ids uuid[])
returns table(member_id uuid, mutual_count bigint)
language sql
stable
security definer
set search_path=''
as $$
  with actor as (
    select auth.uid() as id
  ), requested as (
    select distinct unnest(requested_ids) as member_id
    where cardinality(requested_ids) between 1 and 100
  ), eligible as (
    select r.member_id
    from requested r
    cross join actor a
    where a.id is not null
      and r.member_id <> a.id
      and (
        exists (
          select 1
          from public.profiles p
          where p.id=r.member_id
            and p.profile_visibility='public'
            and exists (
              select 1
              from public.public_profile_publication_consents c
              where c.scholar_id=p.id
                and c.consent_version='public-profile-v1'
                and c.revoked_at is null
            )
        )
        or private.can_resolve_network_identity(r.member_id)
      )
  ), actor_edges as (
    select c.connected_user_id
    from public.user_connections c
    cross join actor a
    where c.user_id=a.id
  )
  select
    e.member_id,
    count(distinct target_edge.connected_user_id)::bigint as mutual_count
  from eligible e
  left join public.user_connections target_edge
    on target_edge.user_id=e.member_id
   and target_edge.connected_user_id in (select connected_user_id from actor_edges)
  group by e.member_id
  order by e.member_id;
$$;

revoke all on function private.get_network_mutual_connection_counts(uuid[]) from public,anon,authenticated;
grant execute on function private.get_network_mutual_connection_counts(uuid[]) to authenticated;

create or replace function public.get_network_mutual_connection_counts(requested_ids uuid[])
returns table(member_id uuid, mutual_count bigint)
language sql
stable
security invoker
set search_path=''
as $$
  select * from private.get_network_mutual_connection_counts(requested_ids);
$$;

revoke all on function public.get_network_mutual_connection_counts(uuid[]) from public,anon;
grant execute on function public.get_network_mutual_connection_counts(uuid[]) to authenticated;

comment on function public.get_network_mutual_connection_counts(uuid[]) is
  'Authenticated bounded Network projection returning privacy-preserving mutual connection counts only; no third-party connection identities are exposed.';