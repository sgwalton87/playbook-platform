-- Canonical Network public-profile link authority.
-- Relationship identity may be visible to an authorized participant even when the
-- member has not published a public profile. This projection reveals only whether
-- a requested member id currently satisfies the public-profile publication boundary.

create or replace function private.get_network_public_profile_linkable_ids(requested_ids uuid[])
returns table(id uuid)
language sql
stable
security definer
set search_path=''
as $$
  select p.id
  from public.profiles p
  where auth.uid() is not null
    and cardinality(requested_ids) between 1 and 100
    and p.id=any(requested_ids)
    and p.profile_visibility='public'
    and exists (
      select 1
      from public.public_profile_publication_consents c
      where c.scholar_id=p.id
        and c.consent_version='public-profile-v1'
        and c.revoked_at is null
    );
$$;

revoke all on function private.get_network_public_profile_linkable_ids(uuid[]) from public,anon,authenticated;
grant execute on function private.get_network_public_profile_linkable_ids(uuid[]) to authenticated;

create or replace function public.get_network_public_profile_linkable_ids(requested_ids uuid[])
returns table(id uuid)
language sql
stable
security invoker
set search_path=''
as $$
  select * from private.get_network_public_profile_linkable_ids(requested_ids);
$$;

revoke all on function public.get_network_public_profile_linkable_ids(uuid[]) from public,anon;
grant execute on function public.get_network_public_profile_linkable_ids(uuid[]) to authenticated;

comment on function public.get_network_public_profile_linkable_ids(uuid[]) is
  'Authenticated bounded Network projection returning only requested member ids whose public profiles are currently publishable under public-profile-v1 consent.';
