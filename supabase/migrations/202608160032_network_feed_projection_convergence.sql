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

-- The historical feed table predates the repository migration origin. Add the
-- optional canonical pillar metadata only when the deployed table exists.
do $$
begin
  if to_regclass('public.feed_posts') is not null then
    execute 'alter table public.feed_posts add column if not exists pillar text';
    execute $check$
      alter table public.feed_posts
      drop constraint if exists feed_posts_pillar_check
    $check$;
    execute $check$
      alter table public.feed_posts
      add constraint feed_posts_pillar_check
      check (pillar is null or pillar in ('Leadership','Finance','Civic','SEL','College','NIL','Community'))
      not valid
    $check$;
  end if;
end $$;
