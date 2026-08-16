\set ON_ERROR_STOP on

begin;

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

select to_regprocedure('public.get_network_member_identities(uuid[])') is not null as network_identity_rpc_exists \gset
\if :network_identity_rpc_exists
\else
  \echo 'missing get_network_member_identities(uuid[])'
  \quit 1
\endif

select to_regprocedure('private.can_resolve_network_identity(uuid)') is not null as private_helper_exists \gset
\if :private_helper_exists
\else
  \echo 'missing private network evidence helper'
  \quit 1
\endif

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

select has_function_privilege('anon', 'public.get_network_member_identities(uuid[])', 'EXECUTE') as anon_network_identity_exec \gset
\if :anon_network_identity_exec
  \echo 'anon must not resolve relationship-aware identities'
  \quit 1
\endif

select has_function_privilege('authenticated', 'private.can_resolve_network_identity(uuid)', 'EXECUTE') as auth_private_helper_exec \gset
\if :auth_private_helper_exec
  \echo 'authenticated must not call the private relationship evidence helper directly'
  \quit 1
\endif

select has_function_privilege('authenticated', 'public.get_public_network_directory(text,integer)', 'EXECUTE') as auth_directory_exec \gset
\if :auth_directory_exec
\else
  \echo 'authenticated must be able to browse bounded public network identities'
  \quit 1
\endif

select has_function_privilege('authenticated', 'public.get_network_member_identities(uuid[])', 'EXECUTE') as auth_network_identity_exec \gset
\if :auth_network_identity_exec
\else
  \echo 'authenticated must be able to resolve governed connection identities'
  \quit 1
\endif

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

rollback;
