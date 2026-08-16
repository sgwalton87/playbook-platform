\set ON_ERROR_STOP on
begin;

select to_regprocedure('public.get_public_member_identities(uuid[])') is not null
   and to_regprocedure('private.get_public_member_identities(uuid[])') is not null as member_identity_rpc_exists \gset
\if :member_identity_rpc_exists \else \echo 'missing public/private member identity projection pair' \quit 1 \endif

select to_regprocedure('public.get_public_network_directory(text,integer)') is not null
   and to_regprocedure('private.get_public_network_directory(text,integer)') is not null as network_directory_rpc_exists \gset
\if :network_directory_rpc_exists \else \echo 'missing public/private network directory projection pair' \quit 1 \endif

select to_regprocedure('public.get_network_member_identities(uuid[])') is not null
   and to_regprocedure('private.get_network_member_identities(uuid[])') is not null as network_identity_rpc_exists \gset
\if :network_identity_rpc_exists \else \echo 'missing public/private network identity projection pair' \quit 1 \endif

select to_regprocedure('private.can_resolve_network_identity(uuid)') is not null as private_helper_exists \gset
\if :private_helper_exists \else \echo 'missing private network evidence helper' \quit 1 \endif

select count(*)=3 as public_network_wrappers_are_invokers
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public'
  and p.proname in ('get_public_member_identities','get_public_network_directory','get_network_member_identities')
  and not p.prosecdef \gset
\if :public_network_wrappers_are_invokers \else \echo 'network projection RPCs must be SECURITY INVOKER wrappers' \quit 1 \endif

select count(*)=3 as private_network_helpers_are_definers
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='private'
  and p.proname in ('get_public_member_identities','get_public_network_directory','get_network_member_identities')
  and p.prosecdef \gset
\if :private_network_helpers_are_definers \else \echo 'network projection bodies must remain bounded private SECURITY DEFINER helpers' \quit 1 \endif

select has_function_privilege('anon','public.get_public_member_identities(uuid[])','EXECUTE')
   and has_function_privilege('anon','private.get_public_member_identities(uuid[])','EXECUTE') as anon_member_identity_exec \gset
\if :anon_member_identity_exec \else \echo 'anon must resolve bounded public member identities through wrapper/helper path' \quit 1 \endif

select has_function_privilege('anon','public.get_public_network_directory(text,integer)','EXECUTE')
    or has_function_privilege('anon','private.get_public_network_directory(text,integer)','EXECUTE') as anon_directory_exec \gset
\if :anon_directory_exec \echo 'anon must not browse authenticated network directory' \quit 1 \endif

select has_function_privilege('anon','public.get_network_member_identities(uuid[])','EXECUTE')
    or has_function_privilege('anon','private.get_network_member_identities(uuid[])','EXECUTE') as anon_network_identity_exec \gset
\if :anon_network_identity_exec \echo 'anon must not resolve relationship-aware identities' \quit 1 \endif

select has_function_privilege('authenticated','private.can_resolve_network_identity(uuid)','EXECUTE') as auth_private_helper_exec \gset
\if :auth_private_helper_exec \echo 'authenticated must not call relationship evidence helper directly' \quit 1 \endif

select has_function_privilege('authenticated','public.get_public_network_directory(text,integer)','EXECUTE')
   and has_function_privilege('authenticated','private.get_public_network_directory(text,integer)','EXECUTE') as auth_directory_exec \gset
\if :auth_directory_exec \else \echo 'authenticated must browse bounded public network identities' \quit 1 \endif

select has_function_privilege('authenticated','public.get_network_member_identities(uuid[])','EXECUTE')
   and has_function_privilege('authenticated','private.get_network_member_identities(uuid[])','EXECUTE') as auth_network_identity_exec \gset
\if :auth_network_identity_exec \else \echo 'authenticated must resolve governed connection identities' \quit 1 \endif

select count(*)=0 as broad_profile_select_policy_absent
from pg_policies
where schemaname='public' and tablename='profiles' and cmd='SELECT'
  and (qual='true' or qual ilike '%profile_visibility%public%') \gset
\if :broad_profile_select_policy_absent \else \echo 'public.profiles gained a broad select policy; projection boundary failed' \quit 1 \endif

-- High-traffic social/attention policies keep the same ownership semantics while
-- caching auth.uid() once per statement. This prevents per-row auth initPlan work.
with expected(tablename,policyname,cmd) as (
  values
    ('posts','Authenticated users can create posts','INSERT'),
    ('posts','Users can update own posts','UPDATE'),
    ('posts','Users can delete own posts','DELETE'),
    ('notifications','Users can view own notifications','SELECT'),
    ('notifications','Users can update own notifications','UPDATE'),
    ('connections','Users can view own connections','SELECT'),
    ('connections','Users can create connection requests','INSERT'),
    ('connection_requests','Users can view own connection requests','SELECT'),
    ('connection_requests','Users can create connection requests','INSERT'),
    ('connection_requests','Recipients can respond to connection requests','UPDATE'),
    ('user_connections','Users can view own connections','SELECT'),
    ('user_connections','Users can create own connections','INSERT'),
    ('user_connections','Users can remove own connections','DELETE')
)
select count(*)=13 as social_attention_policy_set_intact
from expected e
join pg_policies p
  on p.schemaname='public'
 and p.tablename=e.tablename
 and p.policyname=e.policyname
 and p.cmd=e.cmd \gset
\if :social_attention_policy_set_intact \else \echo 'social/attention RLS policy set changed unexpectedly' \quit 1 \endif

with target as (
  select p.*
  from pg_policies p
  where p.schemaname='public'
    and (p.tablename,p.policyname) in (
      ('posts','Authenticated users can create posts'),
      ('posts','Users can update own posts'),
      ('posts','Users can delete own posts'),
      ('notifications','Users can view own notifications'),
      ('notifications','Users can update own notifications'),
      ('connections','Users can view own connections'),
      ('connections','Users can create connection requests'),
      ('connection_requests','Users can view own connection requests'),
      ('connection_requests','Users can create connection requests'),
      ('connection_requests','Recipients can respond to connection requests'),
      ('user_connections','Users can view own connections'),
      ('user_connections','Users can create own connections'),
      ('user_connections','Users can remove own connections')
    )
)
select count(*)=13
   and bool_and((coalesce(qual,'') || ' ' || coalesce(with_check,'')) ilike '%select auth.uid()%')
as social_attention_auth_inputs_cached
from target \gset
\if :social_attention_auth_inputs_cached \else \echo 'social/attention RLS auth.uid() inputs must use statement-cached SELECT form' \quit 1 \endif

rollback;
