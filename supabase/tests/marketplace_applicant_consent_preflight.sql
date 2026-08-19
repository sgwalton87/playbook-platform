\set ON_ERROR_STOP on
begin;

select to_regclass('public.marketplace_application_shares') is not null
   and to_regclass('public.marketplace_application_outcomes') is not null as applicant_tables_exist \gset
\if :applicant_tables_exist
\else
  \echo 'Marketplace applicant consent/outcome tables are missing'
  \quit 1
\endif

select (select relrowsecurity from pg_class where oid='public.marketplace_application_shares'::regclass)
   and (select relrowsecurity from pg_class where oid='public.marketplace_application_outcomes'::regclass) as applicant_rls_enabled \gset
\if :applicant_rls_enabled
\else
  \echo 'Marketplace applicant tables must keep RLS enabled'
  \quit 1
\endif

select not has_table_privilege('anon','public.marketplace_application_shares','SELECT')
   and not has_table_privilege('authenticated','public.marketplace_application_shares','SELECT')
   and not has_table_privilege('authenticated','public.marketplace_application_shares','INSERT')
   and not has_table_privilege('authenticated','public.marketplace_application_shares','UPDATE')
   and not has_table_privilege('authenticated','public.marketplace_application_outcomes','SELECT')
   and not has_table_privilege('authenticated','public.marketplace_application_outcomes','INSERT')
   and not has_table_privilege('authenticated','public.marketplace_application_outcomes','UPDATE') as direct_access_denied \gset
\if :direct_access_denied
\else
  \echo 'Marketplace applicant authority must remain RPC-only'
  \quit 1
\endif

select to_regprocedure('public.share_marketplace_application(uuid)') is not null
   and to_regprocedure('private.share_marketplace_application(uuid)') is not null
   and to_regprocedure('public.revoke_marketplace_application_share(uuid)') is not null
   and to_regprocedure('private.revoke_marketplace_application_share(uuid)') is not null
   and to_regprocedure('public.get_own_marketplace_application_shares()') is not null
   and to_regprocedure('public.get_marketplace_applicants()') is not null
   and to_regprocedure('public.set_marketplace_applicant_outcome(uuid,text,text)') is not null as applicant_rpc_chain_exists \gset
\if :applicant_rpc_chain_exists
\else
  \echo 'Marketplace applicant RPC chain is incomplete'
  \quit 1
\endif

select not has_function_privilege('anon','public.share_marketplace_application(uuid)','EXECUTE')
   and not has_function_privilege('anon','public.get_marketplace_applicants()','EXECUTE')
   and has_function_privilege('authenticated','public.share_marketplace_application(uuid)','EXECUTE')
   and has_function_privilege('authenticated','public.revoke_marketplace_application_share(uuid)','EXECUTE')
   and has_function_privilege('authenticated','public.get_marketplace_applicants()','EXECUTE')
   and has_function_privilege('authenticated','public.set_marketplace_applicant_outcome(uuid,text,text)','EXECUTE') as applicant_rpc_grants_bounded \gset
\if :applicant_rpc_grants_bounded
\else
  \echo 'Marketplace applicant RPC grants are incorrect'
  \quit 1
\endif

select pg_get_functiondef('private.share_marketplace_application(uuid)'::regprocedure) ~ 'w\.scholar_id=actor_id'
   and pg_get_functiondef('private.share_marketplace_application(uuid)'::regprocedure) ~ 'w\.status=''submitted'''
   and pg_get_functiondef('private.share_marketplace_application(uuid)'::regprocedure) ~ 'workspace\.opportunity_id'
   and pg_get_functiondef('private.share_marketplace_application(uuid)'::regprocedure) ~ '''active''' as scholar_consent_explicit \gset
\if :scholar_consent_explicit
\else
  \echo 'Marketplace application sharing must require submitted Scholar-owned workspace and explicit active consent'
  \quit 1
\endif

select pg_get_functiondef('private.revoke_marketplace_application_share(uuid)'::regprocedure) ~ 's\.scholar_id=actor_id'
   and pg_get_functiondef('private.revoke_marketplace_application_share(uuid)'::regprocedure) ~ '''revoked'''
   and pg_get_functiondef('private.revoke_marketplace_application_share(uuid)'::regprocedure) ~ '''withdrawn''' as scholar_revocation_preserved \gset
\if :scholar_revocation_preserved
\else
  \echo 'Scholar applicant consent must be revocable and withdraw the visible outcome'
  \quit 1
\endif

select pg_get_functiondef('public.get_marketplace_applicants()'::regprocedure) ~ 'current_user_has_brand_campaign_authority'
   and pg_get_functiondef('public.get_marketplace_applicants()'::regprocedure) ~ 's\.consent_status=''active'''
   and pg_get_function_result('public.get_marketplace_applicants()'::regprocedure) not ilike '%document%'
   and pg_get_function_result('public.get_marketplace_applicants()'::regprocedure) not ilike '%transcript%'
   and pg_get_function_result('public.get_marketplace_applicants()'::regprocedure) not ilike '%email%'
   and pg_get_function_result('public.get_marketplace_applicants()'::regprocedure) not ilike '%phone%' as partner_projection_bounded \gset
\if :partner_projection_bounded
\else
  \echo 'Brand Partner applicant projection leaks data or bypasses verified authority'
  \quit 1
\endif

select pg_get_functiondef('public.set_marketplace_applicant_outcome(uuid,text,text)'::regprocedure) ~ 'current_user_has_brand_campaign_authority'
   and pg_get_functiondef('public.set_marketplace_applicant_outcome(uuid,text,text)'::regprocedure) ~ 's\.consent_status=''active'''
   and pg_get_functiondef('public.set_marketplace_applicant_outcome(uuid,text,text)'::regprocedure) ~ '''under_review'''
   and pg_get_functiondef('public.set_marketplace_applicant_outcome(uuid,text,text)'::regprocedure) ~ '''selected'''
   and pg_get_functiondef('public.set_marketplace_applicant_outcome(uuid,text,text)'::regprocedure) ~ '''not_selected''' as human_outcome_tracking_bounded \gset
\if :human_outcome_tracking_bounded
\else
  \echo 'Marketplace outcome tracking must remain verified, consent-gated, and human-recorded'
  \quit 1
\endif

rollback;