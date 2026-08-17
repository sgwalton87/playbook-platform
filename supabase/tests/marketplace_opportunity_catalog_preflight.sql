\set ON_ERROR_STOP on
begin;

select to_regclass('public.marketplace_opportunities') is not null as catalog_exists \gset
\if :catalog_exists
\else
  \echo 'canonical Marketplace opportunity catalog is missing'
  \quit 1
\endif

select relrowsecurity as catalog_rls from pg_class where oid='public.marketplace_opportunities'::regclass \gset
\if :catalog_rls
\else
  \echo 'Marketplace opportunity catalog must keep RLS enabled'
  \quit 1
\endif

select not has_table_privilege('anon','public.marketplace_opportunities','SELECT')
   and not has_table_privilege('anon','public.marketplace_opportunities','INSERT')
   and not has_table_privilege('anon','public.marketplace_opportunities','UPDATE')
   and not has_table_privilege('anon','public.marketplace_opportunities','DELETE')
   and not has_table_privilege('authenticated','public.marketplace_opportunities','SELECT')
   and not has_table_privilege('authenticated','public.marketplace_opportunities','INSERT')
   and not has_table_privilege('authenticated','public.marketplace_opportunities','UPDATE')
   and not has_table_privilege('authenticated','public.marketplace_opportunities','DELETE') as direct_table_access_denied \gset
\if :direct_table_access_denied
\else
  \echo 'Marketplace catalog direct client table access must remain denied'
  \quit 1
\endif

select to_regprocedure('public.create_marketplace_opportunity(text,text,text,text,text,date,text,jsonb,jsonb,jsonb,uuid)') is not null
   and to_regprocedure('private.create_marketplace_opportunity(text,text,text,text,text,date,text,jsonb,jsonb,jsonb,uuid)') is not null
   and to_regprocedure('public.update_marketplace_opportunity_draft(uuid,text,text,text,text,date,text,jsonb,jsonb,jsonb)') is not null
   and to_regprocedure('private.update_marketplace_opportunity_draft(uuid,text,text,text,text,date,text,jsonb,jsonb,jsonb)') is not null
   and to_regprocedure('public.submit_marketplace_opportunity_for_review(uuid)') is not null
   and to_regprocedure('private.submit_marketplace_opportunity_for_review(uuid)') is not null
   and to_regprocedure('public.review_marketplace_opportunity(uuid,text,text)') is not null
   and to_regprocedure('private.review_marketplace_opportunity(uuid,text,text)') is not null
   and to_regprocedure('public.get_marketplace_opportunities()') is not null
   and to_regprocedure('private.get_marketplace_opportunities()') is not null
   and to_regprocedure('public.get_own_marketplace_opportunities()') is not null
   and to_regprocedure('private.get_own_marketplace_opportunities()') is not null
   and to_regprocedure('public.get_marketplace_opportunities_for_review()') is not null
   and to_regprocedure('private.get_marketplace_opportunities_for_review()') is not null as rpc_chain_exists \gset
\if :rpc_chain_exists
\else
  \echo 'Marketplace opportunity RPC chain is incomplete'
  \quit 1
\endif

select bool_and(not p.prosecdef) as public_invokers
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in (
  'create_marketplace_opportunity','update_marketplace_opportunity_draft','submit_marketplace_opportunity_for_review',
  'review_marketplace_opportunity','get_marketplace_opportunities','get_own_marketplace_opportunities','get_marketplace_opportunities_for_review'
) \gset
\if :public_invokers
\else
  \echo 'public Marketplace opportunity RPCs must remain SECURITY INVOKER wrappers'
  \quit 1
\endif

select bool_and(p.prosecdef) as private_definers
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='private' and p.proname in (
  'assert_marketplace_opportunity_partner_scope','create_marketplace_opportunity','update_marketplace_opportunity_draft',
  'submit_marketplace_opportunity_for_review','review_marketplace_opportunity','get_marketplace_opportunities',
  'get_own_marketplace_opportunities','get_marketplace_opportunities_for_review'
) \gset
\if :private_definers
\else
  \echo 'private Marketplace opportunity helpers must retain SECURITY DEFINER authority'
  \quit 1
\endif

select not has_function_privilege('anon','public.get_marketplace_opportunities()','EXECUTE')
   and not has_function_privilege('anon','public.create_marketplace_opportunity(text,text,text,text,text,date,text,jsonb,jsonb,jsonb,uuid)','EXECUTE')
   and not has_function_privilege('anon','public.review_marketplace_opportunity(uuid,text,text)','EXECUTE')
   and has_function_privilege('authenticated','public.get_marketplace_opportunities()','EXECUTE')
   and has_function_privilege('authenticated','public.create_marketplace_opportunity(text,text,text,text,text,date,text,jsonb,jsonb,jsonb,uuid)','EXECUTE')
   and has_function_privilege('authenticated','public.review_marketplace_opportunity(uuid,text,text)','EXECUTE') as wrapper_grants_bounded \gset
\if :wrapper_grants_bounded
\else
  \echo 'Marketplace wrapper grants are incorrect'
  \quit 1
\endif

select pg_get_constraintdef(oid) ~ '''internship'''
   and pg_get_constraintdef(oid) ~ '''job'''
   and pg_get_constraintdef(oid) ~ '''sponsorship'''
   and pg_get_constraintdef(oid) ~ '''nil'''
   and pg_get_constraintdef(oid) ~ '''scholarship'''
   and pg_get_constraintdef(oid) ~ '''mentorship''' as canonical_type_taxonomy
from pg_constraint
where conrelid='public.marketplace_opportunities'::regclass
  and contype='c'
  and pg_get_constraintdef(oid) like '%opportunity_type%'
limit 1 \gset
\if :canonical_type_taxonomy
\else
  \echo 'Marketplace listing type taxonomy is incomplete'
  \quit 1
\endif

select pg_get_functiondef('private.create_marketplace_opportunity(text,text,text,text,text,date,text,jsonb,jsonb,jsonb,uuid)'::regprocedure) ~ 'ensure_brand_partner_organization'
   and pg_get_functiondef('private.create_marketplace_opportunity(text,text,text,text,text,date,text,jsonb,jsonb,jsonb,uuid)'::regprocedure) ~ 'assert_marketplace_opportunity_partner_scope'
   and pg_get_functiondef('private.create_marketplace_opportunity(text,text,text,text,text,date,text,jsonb,jsonb,jsonb,uuid)'::regprocedure) ~ '''draft''' as partner_creation_private_draft_only \gset
\if :partner_creation_private_draft_only
\else
  \echo 'Brand Partner listing creation must remain verified, partner-scoped, and draft-only'
  \quit 1
\endif

select pg_get_functiondef('private.submit_marketplace_opportunity_for_review(uuid)'::regprocedure) ~ '''review_requested'''
   and not (pg_get_functiondef('private.submit_marketplace_opportunity_for_review(uuid)'::regprocedure) ~ '''published''') as submit_does_not_publish \gset
\if :submit_does_not_publish
\else
  \echo 'Brand Partner review submission must never self-publish'
  \quit 1
\endif

select pg_get_functiondef('private.review_marketplace_opportunity(uuid,text,text)'::regprocedure) ~ 'current_user_is_platform_operator'
   and pg_get_functiondef('private.review_marketplace_opportunity(uuid,text,text)'::regprocedure) ~ 'when ''approve'' then ''published'''
   and pg_get_functiondef('private.review_marketplace_opportunity(uuid,text,text)'::regprocedure) ~ 'reviewed_by=actor_id'
   and pg_get_functiondef('private.review_marketplace_opportunity(uuid,text,text)'::regprocedure) ~ 'reviewed_at=now\(\)' as human_publication_guarded \gset
\if :human_publication_guarded
\else
  \echo 'Marketplace publication must remain an explicit human operator decision'
  \quit 1
\endif

select pg_get_function_result('public.get_marketplace_opportunities()'::regprocedure) not ilike '%review_notes%'
   and pg_get_function_result('public.get_marketplace_opportunities()'::regprocedure) not ilike '%reviewed_by%'
   and pg_get_function_result('public.get_marketplace_opportunities()'::regprocedure) not ilike '%created_by%'
   and pg_get_function_result('public.get_marketplace_opportunities()'::regprocedure) not ilike '%status%' as scholar_projection_excludes_internal_fields \gset
\if :scholar_projection_excludes_internal_fields
\else
  \echo 'Scholar Marketplace projection leaks internal publication workflow fields'
  \quit 1
\endif

select pg_get_functiondef('private.get_marketplace_opportunities()'::regprocedure) ~ 'auth\.uid\(\) is not null'
   and pg_get_functiondef('private.get_marketplace_opportunities()'::regprocedure) ~ 'o.status=''published'''
   and pg_get_functiondef('private.get_marketplace_opportunities()'::regprocedure) ~ 'p.active is true' as scholar_projection_published_only \gset
\if :scholar_projection_published_only
\else
  \echo 'Scholar Marketplace projection must remain authenticated and published-only'
  \quit 1
\endif

select to_regclass('public.marketplace_jobs') is null
   and to_regclass('public.marketplace_internships') is null
   and to_regclass('public.marketplace_scholarships') is null
   and to_regclass('public.marketplace_sponsorships') is null
   and to_regclass('public.marketplace_nil_opportunities') is null
   and to_regclass('public.marketplace_mentorships') is null as no_parallel_type_tables \gset
\if :no_parallel_type_tables
\else
  \echo 'type-specific Marketplace opportunity tables violate canonical ownership'
  \quit 1
\endif

rollback;
