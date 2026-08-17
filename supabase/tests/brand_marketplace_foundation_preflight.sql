\set ON_ERROR_STOP on
begin;

select to_regclass('public.brand_partner_verification_requests') is not null
   and to_regclass('public.brand_partners') is not null
   and to_regclass('public.brand_campaign_drafts') is not null as marketplace_tables_exist \gset
\if :marketplace_tables_exist \else \echo 'Brand Marketplace foundation tables are incomplete' \quit 1 \endif

select bool_and(relrowsecurity) as marketplace_rls_enabled
from pg_class
where oid in ('public.brand_partner_verification_requests'::regclass,'public.brand_partners'::regclass,'public.brand_campaign_drafts'::regclass) \gset
\if :marketplace_rls_enabled \else \echo 'Brand Marketplace foundation tables must retain RLS' \quit 1 \endif

select count(*) = 6 as organization_profile_columns_exist
from information_schema.columns
where table_schema='public' and table_name='brand_partners'
  and column_name in ('summary','website_url','logo_url','location','partnership_focus','updated_at') \gset
\if :organization_profile_columns_exist \else \echo 'Operational Organization Profile columns are incomplete' \quit 1 \endif

select to_regprocedure('public.ensure_brand_partner_organization()') is not null
   and to_regprocedure('private.ensure_brand_partner_organization()') is not null
   and to_regprocedure('public.update_brand_partner_organization(text,text,text,text,jsonb)') is not null
   and to_regprocedure('private.update_brand_partner_organization(text,text,text,text,jsonb)') is not null
   and to_regprocedure('public.create_brand_campaign_draft(text,text,text,jsonb)') is not null
   and to_regprocedure('private.create_brand_campaign_draft(text,text,text,jsonb)') is not null as governed_rpc_chain_exists \gset
\if :governed_rpc_chain_exists \else \echo 'Brand Marketplace governed RPC chain is incomplete' \quit 1 \endif

select count(*)=3 as public_wrappers_invoker
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public'
  and p.proname in ('ensure_brand_partner_organization','update_brand_partner_organization','create_brand_campaign_draft')
  and not p.prosecdef \gset
\if :public_wrappers_invoker \else \echo 'Brand Marketplace public wrappers must remain SECURITY INVOKER' \quit 1 \endif

select count(*)=3 as private_helpers_definer
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='private'
  and p.proname in ('ensure_brand_partner_organization','update_brand_partner_organization','create_brand_campaign_draft')
  and p.prosecdef \gset
\if :private_helpers_definer \else \echo 'Brand Marketplace mutation bodies must remain private SECURITY DEFINER helpers' \quit 1 \endif

select pg_get_functiondef('private.ensure_brand_partner_organization()'::regprocedure) ilike '%current_user_has_brand_campaign_authority%'
   and pg_get_functiondef('private.ensure_brand_partner_organization()'::regprocedure) ilike '%campaign_scope_approved is true%'
   and pg_get_functiondef('private.ensure_brand_partner_organization()'::regprocedure) ilike '%compliance_scope_approved is true%'
   and pg_get_functiondef('private.ensure_brand_partner_organization()'::regprocedure) ilike '%on conflict(brand_user_id)%' as organization_bootstrap_guarded \gset
\if :organization_bootstrap_guarded \else \echo 'Organization bootstrap must require approved authority and remain idempotent' \quit 1 \endif

select exists(
  select 1 from pg_trigger t join pg_class c on c.oid=t.tgrelid
  where c.relname='brand_campaign_drafts' and t.tgname='brand_campaign_scope_guard' and not t.tgisinternal
) as campaign_scope_trigger_exists \gset
\if :campaign_scope_trigger_exists \else \echo 'Campaign scope guard trigger is missing' \quit 1 \endif

select pg_get_functiondef('private.validate_brand_campaign_scope()'::regprocedure) ilike '%verification.campaign_types%?%new.campaign_type%'
   and pg_get_functiondef('private.validate_brand_campaign_scope()'::regprocedure) ilike '%partner.verification_request_id=v.id%'
   and pg_get_functiondef('private.validate_brand_campaign_scope()'::regprocedure) ilike '%campaign_scope_approved is true%'
   and pg_get_functiondef('private.validate_brand_campaign_scope()'::regprocedure) ilike '%compliance_scope_approved is true%' as campaign_scope_enforced \gset
\if :campaign_scope_enforced \else \echo 'Campaign rows must stay inside verified organization and campaign scope' \quit 1 \endif

select pg_get_functiondef('private.create_brand_campaign_draft(text,text,text,jsonb)'::regprocedure) ilike '%ensure_brand_partner_organization%'
   and pg_get_functiondef('private.create_brand_campaign_draft(text,text,text,jsonb)'::regprocedure) ilike '%''draft''%' as campaign_creation_is_draft_only \gset
\if :campaign_creation_is_draft_only \else \echo 'Campaign Builder must create verified drafts only' \quit 1 \endif

select has_function_privilege('authenticated','public.ensure_brand_partner_organization()','EXECUTE')
   and has_function_privilege('authenticated','public.update_brand_partner_organization(text,text,text,text,jsonb)','EXECUTE')
   and has_function_privilege('authenticated','public.create_brand_campaign_draft(text,text,text,jsonb)','EXECUTE')
   and not has_function_privilege('anon','public.ensure_brand_partner_organization()','EXECUTE')
   and not has_function_privilege('anon','public.update_brand_partner_organization(text,text,text,text,jsonb)','EXECUTE')
   and not has_function_privilege('anon','public.create_brand_campaign_draft(text,text,text,jsonb)','EXECUTE') as wrapper_permissions_bounded \gset
\if :wrapper_permissions_bounded \else \echo 'Brand Marketplace wrapper permissions broadened unexpectedly' \quit 1 \endif

select not has_function_privilege('authenticated','private.validate_brand_campaign_scope()','EXECUTE')
   and not has_function_privilege('anon','private.validate_brand_campaign_scope()','EXECUTE') as trigger_helper_private \gset
\if :trigger_helper_private \else \echo 'Campaign scope trigger helper must remain non-callable to clients' \quit 1 \endif

select count(*)=1 as partner_update_policy_hardened
from pg_policies
where schemaname='public' and tablename='brand_partners'
  and policyname='Verified brand users can update own organization'
  and with_check ilike '%verification_request_id%'
  and with_check ilike '%compliance_scope_approved%true%' \gset
\if :partner_update_policy_hardened \else \echo 'Organization update RLS must preserve verification ownership' \quit 1 \endif

select count(*)=1 as campaign_update_policy_hardened
from pg_policies
where schemaname='public' and tablename='brand_campaign_drafts'
  and policyname='Verified brands can update own campaign drafts'
  and with_check ilike '%verification_request_id%'
  and with_check ilike '%compliance_scope_approved%true%' \gset
\if :campaign_update_policy_hardened \else \echo 'Campaign update RLS must preserve verified partner linkage' \quit 1 \endif

rollback;
