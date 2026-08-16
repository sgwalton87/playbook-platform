\set ON_ERROR_STOP on
begin;

select exists(
  select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname='profiles' and c.relrowsecurity
) as profiles_rls_enabled \gset
\if :profiles_rls_enabled \else \echo 'public.profiles must remain RLS enabled' \quit 1 \endif

select to_regprocedure('public.get_public_scholar_profile(text)') is not null
   and to_regprocedure('public.get_public_scholar_identities(uuid[])') is not null
   and to_regprocedure('private.get_public_scholar_profile(text)') is not null
   and to_regprocedure('private.get_public_scholar_identities(uuid[])') is not null as scholar_projection_functions_exist \gset
\if :scholar_projection_functions_exist \else \echo 'public Scholar projection wrapper/helper set is incomplete' \quit 1 \endif

select count(*)=2 as public_scholar_wrappers_are_invokers
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public'
  and p.proname in ('get_public_scholar_profile','get_public_scholar_identities')
  and not p.prosecdef \gset
\if :public_scholar_wrappers_are_invokers \else \echo 'public Scholar projection RPCs must be SECURITY INVOKER wrappers' \quit 1 \endif

select count(*)=2 as private_scholar_helpers_are_definers
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='private'
  and p.proname in ('get_public_scholar_profile','get_public_scholar_identities')
  and p.prosecdef \gset
\if :private_scholar_helpers_are_definers \else \echo 'private Scholar projection helpers must retain bounded SECURITY DEFINER authority' \quit 1 \endif

select has_schema_privilege('anon','private','USAGE') as anon_private_usage \gset
\if :anon_private_usage \else \echo 'anon requires private schema USAGE only for explicit public projection helpers' \quit 1 \endif

select has_function_privilege('anon','private.get_public_scholar_profile(text)','EXECUTE')
   and has_function_privilege('anon','private.get_public_scholar_identities(uuid[])','EXECUTE')
   and has_function_privilege('anon','public.get_public_scholar_profile(text)','EXECUTE')
   and has_function_privilege('anon','public.get_public_scholar_identities(uuid[])','EXECUTE') as anon_scholar_projection_exec \gset
\if :anon_scholar_projection_exec \else \echo 'anonymous public Scholar projections are not executable through the governed wrapper/helper path' \quit 1 \endif

select count(*)=3 as anon_private_execute_is_projection_only
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='private'
  and has_function_privilege('anon',p.oid,'EXECUTE')
  and p.proname in ('get_public_scholar_profile','get_public_scholar_identities','get_public_member_identities') \gset
\if :anon_private_execute_is_projection_only \else \echo 'anonymous private EXECUTE boundary is not the expected three projection helpers' \quit 1 \endif

select count(*)=3 as anon_private_execute_total
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='private' and has_function_privilege('anon',p.oid,'EXECUTE') \gset
\if :anon_private_execute_total \else \echo 'anonymous gained EXECUTE on an unrelated private function' \quit 1 \endif

do $$
declare proc regprocedure; result_signature text; config text[];
begin
  foreach proc in array array[
    'public.get_public_scholar_profile(text)'::regprocedure,
    'public.get_public_scholar_identities(uuid[])'::regprocedure,
    'private.get_public_scholar_profile(text)'::regprocedure,
    'private.get_public_scholar_identities(uuid[])'::regprocedure
  ] loop
    select p.proconfig,pg_get_function_result(p.oid) into config,result_signature from pg_proc p where p.oid=proc;
    if config is null or not exists(select 1 from unnest(config) setting where setting='search_path=' or setting='search_path=""') then
      raise exception '% must use an empty search_path',proc::text;
    end if;
    if result_signature ~* '\m(onboarding_completed|verification_status|requested_role|profile_mode|is_admin|email|phone|household|guardian|safety)\M' then
      raise exception '% exposes an authority/private field in its return signature: %',proc::text,result_signature;
    end if;
  end loop;
end $$;

select count(*)=0 as broad_profile_select_policy_absent
from pg_policies
where schemaname='public' and tablename='profiles' and cmd='SELECT'
  and (qual='true' or qual ilike '%profile_visibility%public%') \gset
\if :broad_profile_select_policy_absent \else \echo 'public.profiles gained a broad public SELECT policy' \quit 1 \endif

do $$
begin
  if to_regclass('public.feed_posts') is not null then
    if exists(select 1 from pg_policies where schemaname='public' and tablename='feed_posts' and cmd='SELECT' and coalesce(qual,'') in ('true','(true)')) then
      raise exception 'feed_posts still has an unconditional SELECT policy';
    end if;
    if not exists(select 1 from pg_policies where schemaname='public' and tablename='feed_posts' and policyname='Public can view public feed posts' and qual ilike '%visibility%public%') then
      raise exception 'feed_posts public visibility policy is missing';
    end if;
  end if;
end $$;

do $$
begin
  if exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and cmd='INSERT' and ('anon'=any(roles) or 'public'=any(roles)) and coalesce(with_check,'') ilike '%photos%') then
    raise exception 'photos bucket still permits anonymous/public uploads';
  end if;
  if not exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Authenticated users upload own public photos' and 'authenticated'=any(roles) and coalesce(with_check,'') ilike '%auth.uid()%' and coalesce(with_check,'') ilike '%foldername%') then
    raise exception 'owner-namespaced authenticated photo upload policy is missing';
  end if;
end $$;

rollback;
