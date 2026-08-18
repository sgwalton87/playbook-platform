\set ON_ERROR_STOP on
begin;

select to_regclass('public.marketplace_application_submissions') is not null as submission_table_exists \gset
\if :submission_table_exists
\else
  \echo 'Marketplace applicant submission table is missing'
  \quit 1
\endif

select relrowsecurity as submission_rls from pg_class where oid='public.marketplace_application_submissions'::regclass \gset
\if :submission_rls
\else
  \echo 'Marketplace applicant submissions must keep RLS enabled'
  \quit 1
\endif

select not has_table_privilege('anon','public.marketplace_application_submissions','SELECT')
   and not has_table_privilege('anon','public.marketplace_application_submissions','INSERT')
   and not has_table_privilege('anon','public.marketplace_application_submissions','UPDATE')
   and not has_table_privilege('anon','public.marketplace_application_submissions','DELETE')
   and not has_table_privilege('authenticated','public.marketplace_application_submissions','SELECT')
   and not has_table_privilege('authenticated','public.marketplace_application_submissions','INSERT')
   and not has_table_privilege('authenticated','public.marketplace_application_submissions','UPDATE')
   and not has_table_privilege('authenticated','public.marketplace_application_submissions','DELETE') as direct_submission_access_denied \gset
\if :direct_submission_access_denied
\else
  \echo 'Marketplace applicant submission table must remain RPC-only'
  \quit 1
\endif

select to_regprocedure('public.submit_marketplace_application(uuid,text)') is not null
   and to_regprocedure('private.submit_marketplace_application(uuid,text)') is not null
   and to_regprocedure('public.withdraw_marketplace_application(uuid)') is not null
   and to_regprocedure('private.withdraw_marketplace_application(uuid)') is not null
   and to_regprocedure('public.get_my_marketplace_application_submissions()') is not null
   and to_regprocedure('private.get_my_marketplace_application_submissions()') is not null
   and to_regprocedure('public.get_marketplace_applicants(uuid)') is not null
   and to_regprocedure('private.get_marketplace_applicants(uuid)') is not null as applicant_rpc_chain_exists \gset
\if :applicant_rpc_chain_exists
\else
  \echo 'Marketplace applicant RPC chain is incomplete'
  \quit 1
\endif

select bool_and(not p.prosecdef) as public_invokers
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in (
  'submit_marketplace_application','withdraw_marketplace_application',
  'get_my_marketplace_application_submissions','get_marketplace_applicants'
) \gset
\if :public_invokers
\else
  \echo 'public Marketplace applicant RPCs must remain SECURITY INVOKER wrappers'
  \quit 1
\endif

select bool_and(p.prosecdef) as private_definers
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='private' and p.proname in (
  'submit_marketplace_application','withdraw_marketplace_application',
  'get_my_marketplace_application_submissions','get_marketplace_applicants'
) \gset
\if :private_definers
\else
  \echo 'private Marketplace applicant helpers must retain SECURITY DEFINER authority'
  \quit 1
\endif

select not has_function_privilege('anon','public.submit_marketplace_application(uuid,text)','EXECUTE')
   and not has_function_privilege('anon','public.withdraw_marketplace_application(uuid)','EXECUTE')
   and not has_function_privilege('anon','public.get_my_marketplace_application_submissions()','EXECUTE')
   and not has_function_privilege('anon','public.get_marketplace_applicants(uuid)','EXECUTE')
   and has_function_privilege('authenticated','public.submit_marketplace_application(uuid,text)','EXECUTE')
   and has_function_privilege('authenticated','public.withdraw_marketplace_application(uuid)','EXECUTE')
   and has_function_privilege('authenticated','public.get_my_marketplace_application_submissions()','EXECUTE')
   and has_function_privilege('authenticated','public.get_marketplace_applicants(uuid)','EXECUTE') as wrapper_grants_bounded \gset
\if :wrapper_grants_bounded
\else
  \echo 'Marketplace applicant wrapper grants are incorrect'
  \quit 1
\endif

select pg_get_functiondef('private.submit_marketplace_application(uuid,text)'::regprocedure) ~ 'current_user_is_onboarded_learner'
   and pg_get_functiondef('private.submit_marketplace_application(uuid,text)'::regprocedure) ~ 'w\.scholar_id=actor_id'
   and pg_get_functiondef('private.submit_marketplace_application(uuid,text)'::regprocedure) ~ 'w\.status=''submitted'''
   and pg_get_functiondef('private.submit_marketplace_application(uuid,text)'::regprocedure) ~ 'o\.id::text=workspace\.opportunity_id'
   and pg_get_functiondef('private.submit_marketplace_application(uuid,text)'::regprocedure) ~ 'o\.status=''published'''
   and pg_get_functiondef('private.submit_marketplace_application(uuid,text)'::regprocedure) ~ 'p\.active is true'
   and pg_get_functiondef('private.submit_marketplace_application(uuid,text)'::regprocedure) ~ 'o\.deadline is null or o\.deadline>=current_date'
   and pg_get_functiondef('private.submit_marketplace_application(uuid,text)'::regprocedure) ~ 'marketplace-applicant-share-v1' as explicit_submission_guards \gset
\if :explicit_submission_guards
\else
  \echo 'Marketplace submission must require Scholar ownership, submitted workspace, matching live opportunity, and current consent'
  \quit 1
\endif

select pg_get_functiondef('private.withdraw_marketplace_application(uuid)'::regprocedure) ~ 's\.scholar_id=actor_id'
   and pg_get_functiondef('private.withdraw_marketplace_application(uuid)'::regprocedure) ~ 's\.status=''submitted'''
   and pg_get_functiondef('private.withdraw_marketplace_application(uuid)'::regprocedure) ~ 'status=''withdrawn'''
   and pg_get_functiondef('private.withdraw_marketplace_application(uuid)'::regprocedure) ~ 'withdrawn_at=now\(\)' as withdrawal_scholar_owned \gset
\if :withdrawal_scholar_owned
\else
  \echo 'Marketplace applicant withdrawal must remain Scholar-owned and auditable'
  \quit 1
\endif

select pg_get_functiondef('private.get_marketplace_applicants(uuid)'::regprocedure) ~ 'current_user_has_brand_campaign_authority'
   and pg_get_functiondef('private.get_marketplace_applicants(uuid)'::regprocedure) ~ 'p\.brand_user_id=auth\.uid\(\)'
   and pg_get_functiondef('private.get_marketplace_applicants(uuid)'::regprocedure) ~ 'p\.active is true'
   and pg_get_functiondef('private.get_marketplace_applicants(uuid)'::regprocedure) ~ 's\.status=''submitted''' as applicant_projection_owner_scoped \gset
\if :applicant_projection_owner_scoped
\else
  \echo 'Brand Partner applicant projection must remain partner-owned and active-submission-only'
  \quit 1
\endif

select pg_get_function_result('public.get_marketplace_applicants(uuid)'::regprocedure) ilike '%scholar_display_name%'
   and pg_get_function_result('public.get_marketplace_applicants(uuid)'::regprocedure) ilike '%scholar_username%'
   and pg_get_function_result('public.get_marketplace_applicants(uuid)'::regprocedure) ilike '%application_status%'
   and pg_get_function_result('public.get_marketplace_applicants(uuid)'::regprocedure) not ilike '%email%'
   and pg_get_function_result('public.get_marketplace_applicants(uuid)'::regprocedure) not ilike '%phone%'
   and pg_get_function_result('public.get_marketplace_applicants(uuid)'::regprocedure) not ilike '%document%'
   and pg_get_function_result('public.get_marketplace_applicants(uuid)'::regprocedure) not ilike '%essay%'
   and pg_get_function_result('public.get_marketplace_applicants(uuid)'::regprocedure) not ilike '%resume%'
   and pg_get_function_result('public.get_marketplace_applicants(uuid)'::regprocedure) not ilike '%evidence%'
   and pg_get_function_result('public.get_marketplace_applicants(uuid)'::regprocedure) not ilike '%recommendation%'
   and pg_get_function_result('public.get_marketplace_applicants(uuid)'::regprocedure) not ilike '%academic%'
   and pg_get_function_result('public.get_marketplace_applicants(uuid)'::regprocedure) not ilike '%support%' as applicant_projection_narrow \gset
\if :applicant_projection_narrow
\else
  \echo 'Brand Partner applicant projection exposes fields beyond the narrow consent boundary'
  \quit 1
\endif

select count(*)=1 as workspace_policy_still_scholar_owned
from pg_policies
where schemaname='public'
  and tablename='application_workspaces'
  and policyname='application-workspaces-own'
  and qual like '%scholar_id%auth.uid%'
  and with_check like '%scholar_id%auth.uid%' \gset
\if :workspace_policy_still_scholar_owned
\else
  \echo 'Application Workspace RLS must remain Scholar-owned after Marketplace applicant sharing'
  \quit 1
\endif

select not has_table_privilege('authenticated','public.application_workspace_documents','SELECT')
       or exists (
         select 1 from pg_policies where schemaname='public' and tablename='application_workspace_documents' and qual like '%scholar_id%auth.uid%'
       ) as documents_not_broadened_to_partner \gset
\if :documents_not_broadened_to_partner
\else
  \echo 'Marketplace applicant sharing must not broaden private application document access'
  \quit 1
\endif

rollback;
