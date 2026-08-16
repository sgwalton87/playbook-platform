\set ON_ERROR_STOP on
begin;

select to_regclass('public.active_support_scholar_contexts') is not null as context_table_exists \gset
\if :context_table_exists \else \echo 'missing active_support_scholar_contexts' \quit 1 \endif

select relrowsecurity from pg_class where oid='public.active_support_scholar_contexts'::regclass \gset
\if :relrowsecurity \else \echo 'active Scholar context table must enforce RLS' \quit 1 \endif

select not has_table_privilege('authenticated','public.active_support_scholar_contexts','INSERT')
   and not has_table_privilege('authenticated','public.active_support_scholar_contexts','UPDATE')
   and not has_table_privilege('authenticated','public.active_support_scholar_contexts','DELETE') as no_direct_mutation \gset
\if :no_direct_mutation \else \echo 'authenticated clients must not directly mutate active Scholar context' \quit 1 \endif

select to_regprocedure('public.set_active_support_scholar_context(uuid)') is not null
   and to_regprocedure('public.get_available_support_scholar_contexts()') is not null
   and to_regprocedure('public.get_active_support_scholar_context()') is not null
   and to_regprocedure('private.set_active_support_scholar_context(uuid)') is not null
   and to_regprocedure('private.get_available_support_scholar_contexts()') is not null
   and to_regprocedure('private.get_active_support_scholar_context()') is not null as all_context_functions_exist \gset
\if :all_context_functions_exist \else \echo 'active Scholar context wrapper/helper functions are incomplete' \quit 1 \endif

select not (select prosecdef from pg_proc where oid='public.set_active_support_scholar_context(uuid)'::regprocedure)
   and not (select prosecdef from pg_proc where oid='public.get_available_support_scholar_contexts()'::regprocedure)
   and not (select prosecdef from pg_proc where oid='public.get_active_support_scholar_context()'::regprocedure) as public_invoker_only \gset
\if :public_invoker_only \else \echo 'public active Scholar context RPCs must be SECURITY INVOKER' \quit 1 \endif

select (select prosecdef from pg_proc where oid='private.set_active_support_scholar_context(uuid)'::regprocedure)
   and (select prosecdef from pg_proc where oid='private.get_available_support_scholar_contexts()'::regprocedure)
   and (select prosecdef from pg_proc where oid='private.get_active_support_scholar_context()'::regprocedure) as private_definer_only \gset
\if :private_definer_only \else \echo 'private active Scholar context helpers must retain SECURITY DEFINER authority' \quit 1 \endif

select has_function_privilege('authenticated','public.set_active_support_scholar_context(uuid)','EXECUTE')
   and has_function_privilege('authenticated','public.get_available_support_scholar_contexts()','EXECUTE')
   and has_function_privilege('authenticated','public.get_active_support_scholar_context()','EXECUTE')
   and has_function_privilege('authenticated','private.set_active_support_scholar_context(uuid)','EXECUTE')
   and has_function_privilege('authenticated','private.get_available_support_scholar_contexts()','EXECUTE')
   and has_function_privilege('authenticated','private.get_active_support_scholar_context()','EXECUTE') as authenticated_rpc_chain \gset
\if :authenticated_rpc_chain \else \echo 'authenticated users require the narrow active Scholar context wrapper/helper chain' \quit 1 \endif

select not has_function_privilege('anon','public.set_active_support_scholar_context(uuid)','EXECUTE')
   and not has_function_privilege('anon','public.get_available_support_scholar_contexts()','EXECUTE')
   and not has_function_privilege('anon','public.get_active_support_scholar_context()','EXECUTE')
   and not has_function_privilege('anon','private.set_active_support_scholar_context(uuid)','EXECUTE')
   and not has_function_privilege('anon','private.get_available_support_scholar_contexts()','EXECUTE')
   and not has_function_privilege('anon','private.get_active_support_scholar_context()','EXECUTE') as anon_context_denied \gset
\if :anon_context_denied \else \echo 'anonymous callers must not resolve or mutate active Scholar context' \quit 1 \endif

select pg_get_functiondef('private.set_active_support_scholar_context(uuid)'::regprocedure) ~ 'supporter_id\s*=\s*actor_id'
   and pg_get_functiondef('private.set_active_support_scholar_context(uuid)'::regprocedure) ~ 'status\s*=\s*''active'''
   and pg_get_functiondef('private.set_active_support_scholar_context(uuid)'::regprocedure) ~ 'auth\.uid\(\)' as active_relationship_required \gset
\if :active_relationship_required \else \echo 'private setter must derive caller identity and require an active supporter relationship' \quit 1 \endif

select pg_get_functiondef('private.get_available_support_scholar_contexts()'::regprocedure) ~ 'r\.supporter_id\s*=\s*auth\.uid\(\)'
   and pg_get_functiondef('private.get_available_support_scholar_contexts()'::regprocedure) ~ 'r\.status\s*=\s*''active''' as available_contexts_bounded \gset
\if :available_contexts_bounded \else \echo 'available Scholar contexts must remain bounded to the caller active relationships' \quit 1 \endif

select pg_get_functiondef('private.get_active_support_scholar_context()'::regprocedure) ~ 'r\.status\s*=\s*''active'''
   and pg_get_functiondef('private.get_active_support_scholar_context()'::regprocedure) ~ 'c\.supporter_id\s*=\s*auth\.uid\(\)' as getter_rechecks_active \gset
\if :getter_rechecks_active \else \echo 'active context projection must re-check relationship status and caller ownership' \quit 1 \endif

select count(*) = 3 as anon_private_execute_still_bounded
from pg_proc p
join pg_namespace n on n.oid=p.pronamespace
where n.nspname='private'
  and has_function_privilege('anon', p.oid, 'EXECUTE');
\gset
\if :anon_private_execute_still_bounded \else \echo 'anonymous private EXECUTE broadened beyond the three intentional public-profile projection helpers' \quit 1 \endif

rollback;
