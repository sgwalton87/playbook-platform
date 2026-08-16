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

select to_regprocedure('public.set_active_support_scholar_context(uuid)') is not null as setter_exists \gset
\if :setter_exists \else \echo 'missing active Scholar context setter' \quit 1 \endif
select to_regprocedure('public.get_available_support_scholar_contexts()') is not null as list_exists \gset
\if :list_exists \else \echo 'missing available Scholar context projection' \quit 1 \endif
select to_regprocedure('public.get_active_support_scholar_context()') is not null as getter_exists \gset
\if :getter_exists \else \echo 'missing active Scholar context projection' \quit 1 \endif

select has_function_privilege('authenticated','public.set_active_support_scholar_context(uuid)','EXECUTE')
   and has_function_privilege('authenticated','public.get_available_support_scholar_contexts()','EXECUTE')
   and has_function_privilege('authenticated','public.get_active_support_scholar_context()','EXECUTE') as rpc_access \gset
\if :rpc_access \else \echo 'authenticated users require narrow active Scholar context RPCs' \quit 1 \endif

select position('supporter_id=actor_id' in pg_get_functiondef('public.set_active_support_scholar_context(uuid)'::regprocedure)) > 0
   and position('status=''active''' in pg_get_functiondef('public.set_active_support_scholar_context(uuid)'::regprocedure)) > 0 as active_relationship_required \gset
\if :active_relationship_required \else \echo 'setter must require active supporter relationship' \quit 1 \endif

select position('r.status=''active''' in pg_get_functiondef('public.get_active_support_scholar_context()'::regprocedure)) > 0 as getter_rechecks_active \gset
\if :getter_rechecks_active \else \echo 'active context projection must re-check relationship status' \quit 1 \endif

rollback;
