-- Canonical Network + Feed projection convergence.
-- Keep public.profiles owner-scoped. Shared surfaces receive only explicitly
-- presentation-grade identity fields through bounded SECURITY DEFINER RPCs.

create or replace function public.get_public_member_identities(requested_ids uuid[])
returns table (
  id uuid,
  username text,
  full_name text,
  first_name text,
  last_name text,
  role text,
  avatar_url text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id,
    p.username,
    p.full_name,
    p.first_name,
    p.last_name,
    private.normalize_playbook_profile_role(coalesce(p.profile_mode, p.role, p.requested_role)) as role,
    p.avatar_url
  from public.profiles p
  where cardinality(requested_ids) between 1 and 100
    and p.id = any(requested_ids)
    and p.profile_visibility = 'public';
$$;

revoke all on function public.get_public_member_identities(uuid[]) from public, anon, authenticated;
grant execute on function public.get_public_member_identities(uuid[]) to anon, authenticated;

comment on function public.get_public_member_identities(uuid[]) is
  'Returns a bounded set of presentation-grade identities for explicitly public Playbook profiles. It does not expose contact, verification, household, safety, onboarding, administration, or authority data.';

create or replace function public.get_public_network_directory(
  search_text text default null,
  result_limit integer default 100
)
returns table (
  id uuid,
  username text,
  full_name text,
  first_name text,
  last_name text,
  role text,
  avatar_url text,
  school text,
  sport text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id,
    p.username,
    p.full_name,
    p.first_name,
    p.last_name,
    private.normalize_playbook_profile_role(coalesce(p.profile_mode, p.role, p.requested_role)) as role,
    p.avatar_url,
    p.school,
    p.sport
  from public.profiles p
  where auth.uid() is not null
    and p.id <> auth.uid()
    and p.profile_visibility = 'public'
    and (
      nullif(trim(coalesce(search_text, '')), '') is null
      or coalesce(p.full_name, '') ilike '%' || trim(search_text) || '%'
      or coalesce(p.username, '') ilike '%' || trim(search_text) || '%'
      or coalesce(p.school, '') ilike '%' || trim(search_text) || '%'
      or coalesce(p.sport, '') ilike '%' || trim(search_text) || '%'
    )
  order by p.created_at desc nulls last, p.id
  limit least(greatest(coalesce(result_limit, 100), 1), 100);
$$;

revoke all on function public.get_public_network_directory(text, integer) from public, anon, authenticated;
grant execute on function public.get_public_network_directory(text, integer) to authenticated;

comment on function public.get_public_network_directory(text, integer) is
  'Authenticated, bounded network discovery over public Playbook presentation fields only. Canonical profiles remain owner-scoped.';

-- Legacy social-network tables are deployed runtime entities whose creating DDL
-- is absent from the committed migration history. Do not fabricate them for
-- local certification. Resolve their evidence only when each table actually
-- exists in the executing database.
create or replace function private.can_resolve_network_identity(target_user_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  allowed boolean := false;
begin
  if caller_id is null or target_user_id is null then
    return false;
  end if;

  if to_regclass('public.user_connections') is not null then
    execute $sql$
      select exists (
        select 1 from public.user_connections c
        where (c.user_id = $1 and c.connected_user_id = $2)
           or (c.user_id = $2 and c.connected_user_id = $1)
      )
    $sql$ into allowed using caller_id, target_user_id;
    if allowed then return true; end if;
  end if;

  if to_regclass('public.connection_requests') is not null then
    execute $sql$
      select exists (
        select 1 from public.connection_requests r
        where r.status = 'pending'
          and ((r.requester_id = $1 and r.recipient_id = $2)
            or (r.requester_id = $2 and r.recipient_id = $1))
      )
    $sql$ into allowed using caller_id, target_user_id;
    if allowed then return true; end if;
  end if;

  return false;
end;
$$;

create or replace function public.get_network_member_identities(requested_ids uuid[])
returns table (
  id uuid,
  username text,
  full_name text,
  first_name text,
  last_name text,
  role text,
  avatar_url text,
  school text,
  sport text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id,
    p.username,
    p.full_name,
    p.first_name,
    p.last_name,
    private.normalize_playbook_profile_role(coalesce(p.profile_mode, p.role, p.requested_role)) as role,
    p.avatar_url,
    p.school,
    p.sport
  from public.profiles p
  where auth.uid() is not null
    and cardinality(requested_ids) between 1 and 100
    and p.id = any(requested_ids)
    and (p.profile_visibility = 'public' or private.can_resolve_network_identity(p.id));
$$;

revoke all on function private.can_resolve_network_identity(uuid) from public, anon, authenticated;
revoke all on function public.get_network_member_identities(uuid[]) from public, anon, authenticated;
grant execute on function private.can_resolve_network_identity(uuid) to authenticated;
grant execute on function public.get_network_member_identities(uuid[]) to authenticated;

comment on function public.get_network_member_identities(uuid[]) is
  'Resolves minimal presentation identity for public profiles or governed connection partners/pending requests when legacy network tables exist. No broader profile authority is granted.';

-- Feed categories intentionally use the existing durable post_type field rather
-- than requiring a new hosted-schema column. This keeps preview and production
-- compatible while allowing truthful Leadership/Finance/Civic/SEL filtering.
