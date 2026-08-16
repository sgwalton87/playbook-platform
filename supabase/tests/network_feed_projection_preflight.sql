\set ON_ERROR_STOP on

begin;

-- Functions exist with explicit execution boundaries.
select to_regprocedure('public.get_public_member_identities(uuid[])') is not null as member_identity_rpc_exists \gset
\if :member_identity_rpc_exists
\else
  \echo 'missing get_public_member_identities(uuid[])'
  \quit 1
\endif

select to_regprocedure('public.get_public_network_directory(text,integer)') is not null as network_directory_rpc_exists \gset
\if :network_directory_rpc_exists
\else
  \echo 'missing get_public_network_directory(text,integer)'
  \quit 1
\endif

-- Anonymous users may resolve only explicitly requested public identities, not
-- browse the network directory.
select has_function_privilege('anon', 'public.get_public_member_identities(uuid[])', 'EXECUTE') as anon_member_identity_exec \gset
\if :anon_member_identity_exec
\else
  \echo 'anon must be able to resolve bounded public post identities'
  \quit 1
\endif

select has_function_privilege('anon', 'public.get_public_network_directory(text,integer)', 'EXECUTE') as anon_directory_exec \gset
\if :anon_directory_exec
  \echo 'anon must not browse the authenticated network directory'
  \quit 1
\endif

select has_function_privilege('authenticated', 'public.get_public_network_directory(text,integer)', 'EXECUTE') as auth_directory_exec \gset
\if :auth_directory_exec
\else
  \echo 'authenticated must be able to browse bounded public network identities'
  \quit 1
\endif

-- Owner-only profiles remain owner-only; this package must not reopen direct
-- directory reads through RLS policy changes.
select count(*) = 0 as broad_profile_select_policy_absent
from pg_policies
where schemaname = 'public'
  and tablename = 'profiles'
  and cmd = 'SELECT'
  and (qual = 'true' or qual ilike '%profile_visibility%public%');
\gset
\if :broad_profile_select_policy_absent
\else
  \echo 'public.profiles gained a broad select policy; projection boundary failed'
  \quit 1
\endif

-- When the runtime feed table exists, the canonical pillar field is constrained.
do $$
begin
  if to_regclass('public.feed_posts') is not null then
    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'feed_posts' and column_name = 'pillar'
    ) then
      raise exception 'feed_posts.pillar missing';
    end if;
  end if;
end $$;

rollback;
