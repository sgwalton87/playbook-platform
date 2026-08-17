\set ON_ERROR_STOP on
begin;

select column_default = '''private''::text' as private_default
from information_schema.columns
where table_schema='public' and table_name='profiles' and column_name='profile_visibility' \gset
\if :private_default
\else
  \echo 'profiles.profile_visibility must default private'
  \quit 1
\endif

select to_regclass('public.public_profile_publication_consents') is not null as consent_table_exists \gset
\if :consent_table_exists
\else
  \echo 'Public profile publication consent table is missing'
  \quit 1
\endif

select relrowsecurity as consent_rls
from pg_class where oid='public.public_profile_publication_consents'::regclass \gset
\if :consent_rls
\else
  \echo 'Public profile publication consent must keep RLS enabled'
  \quit 1
\endif

select not has_table_privilege('anon','public.public_profile_publication_consents','SELECT')
   and not has_table_privilege('authenticated','public.public_profile_publication_consents','SELECT')
   and not has_table_privilege('authenticated','public.public_profile_publication_consents','INSERT')
   and not has_table_privilege('authenticated','public.public_profile_publication_consents','UPDATE')
   and not has_table_privilege('authenticated','public.public_profile_publication_consents','DELETE') as direct_consent_access_denied \gset
\if :direct_consent_access_denied
\else
  \echo 'Publication consent table must remain RPC-only'
  \quit 1
\endif

select to_regprocedure('public.get_public_profile_privacy_status()') is not null
   and to_regprocedure('private.get_public_profile_privacy_status()') is not null
   and to_regprocedure('public.set_public_profile_visibility(boolean,text)') is not null
   and to_regprocedure('private.set_public_profile_visibility(boolean,text)') is not null as privacy_rpc_chain_exists \gset
\if :privacy_rpc_chain_exists
\else
  \echo 'Public profile privacy RPC chain is incomplete'
  \quit 1
\endif

select not p.prosecdef as public_invoker
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname='set_public_profile_visibility' \gset
\if :public_invoker
\else
  \echo 'Public profile visibility wrapper must remain SECURITY INVOKER'
  \quit 1
\endif

select p.prosecdef as private_definer
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='private' and p.proname='set_public_profile_visibility' \gset
\if :private_definer
\else
  \echo 'Private profile visibility authority must remain SECURITY DEFINER'
  \quit 1
\endif

select not has_function_privilege('anon','public.get_public_profile_privacy_status()','EXECUTE')
   and not has_function_privilege('anon','public.set_public_profile_visibility(boolean,text)','EXECUTE')
   and has_function_privilege('authenticated','public.get_public_profile_privacy_status()','EXECUTE')
   and has_function_privilege('authenticated','public.set_public_profile_visibility(boolean,text)','EXECUTE') as privacy_grants_bounded \gset
\if :privacy_grants_bounded
\else
  \echo 'Public profile privacy grants are incorrect'
  \quit 1
\endif

select pg_get_functiondef('private.set_public_profile_visibility(boolean,text)'::regprocedure) ~ 'public-profile-v1'
   and pg_get_functiondef('private.set_public_profile_visibility(boolean,text)'::regprocedure) ~ 'requested_public'
   and pg_get_functiondef('private.set_public_profile_visibility(boolean,text)'::regprocedure) ~ 'revoked_at=now\(\)'
   and pg_get_functiondef('private.set_public_profile_visibility(boolean,text)'::regprocedure) ~ 'profile_visibility=''private'''
   and pg_get_functiondef('private.set_public_profile_visibility(boolean,text)'::regprocedure) ~ 'profile_visibility=''public''' as explicit_consent_and_revocation \gset
\if :explicit_consent_and_revocation
\else
  \echo 'Public profile publication must require versioned consent and auditable revocation'
  \quit 1
\endif

select pg_get_functiondef('private.get_public_scholar_profile(text)'::regprocedure) ~ 'public_profile_publication_consents'
   and pg_get_functiondef('private.get_public_scholar_profile(text)'::regprocedure) ~ 'public-profile-v1'
   and pg_get_functiondef('private.get_public_scholar_profile(text)'::regprocedure) ~ 'revoked_at is null'
   and pg_get_functiondef('private.get_public_scholar_profile(text)'::regprocedure) ~ 'p\.id=auth\.uid\(\)' as publication_requires_consent_or_owner \gset
\if :publication_requires_consent_or_owner
\else
  \echo 'Anonymous public profile access must require active publication consent; owner access must remain available'
  \quit 1
\endif

select pg_get_functiondef('private.get_public_scholar_profile(text)'::regprocedure) ~ 'case when p\.id=auth\.uid\(\) then p\.gpa else null end'
   and pg_get_functiondef('private.get_public_scholar_profile(text)'::regprocedure) ~ 'case when p\.id=auth\.uid\(\) then p\.sat_score else null end'
   and pg_get_functiondef('private.get_public_scholar_profile(text)'::regprocedure) ~ 'case when p\.id=auth\.uid\(\) then p\.act_score else null end'
   and pg_get_functiondef('private.get_public_scholar_profile(text)'::regprocedure) ~ 'case when p\.id=auth\.uid\(\) then p\.desired_salary_range else null end'
   and pg_get_functiondef('private.get_public_scholar_profile(text)'::regprocedure) ~ 'case when p\.id=auth\.uid\(\) then p\.coin_balance else null end'
   and pg_get_functiondef('private.get_public_scholar_profile(text)'::regprocedure) ~ 'case when p\.id=auth\.uid\(\) then p\.height else null end'
   and pg_get_functiondef('private.get_public_scholar_profile(text)'::regprocedure) ~ 'case when p\.id=auth\.uid\(\) then p\.coach_name else null end' as sensitive_fields_owner_only \gset
\if :sensitive_fields_owner_only
\else
  \echo 'Sensitive academic, financial, recruiting, location, and athletic fields must remain owner-only'
  \quit 1
\endif

rollback;
