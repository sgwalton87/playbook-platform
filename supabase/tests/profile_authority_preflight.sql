\set ON_ERROR_STOP on
begin;

do $$
declare
  verification_default text;
  wrapper_definer boolean;
  private_definer_count integer;
  private_search_path_count integer;
  unsafe_column_grants integer;
  safe_update_grants integer;
  broad_profile_insert_policies integer;
  owner_update_policies integer;
begin
  select pg_get_expr(d.adbin, d.adrelid)
    into verification_default
    from pg_attribute a
    join pg_class c on c.oid = a.attrelid
    join pg_namespace n on n.oid = c.relnamespace
    left join pg_attrdef d on d.adrelid = c.oid and d.adnum = a.attnum
   where n.nspname = 'public'
     and c.relname = 'profiles'
     and a.attname = 'verification_status'
     and a.attnum > 0
     and not a.attisdropped;

  if verification_default is null or verification_default not like '%email_pending%' then
    raise exception 'profiles.verification_status must default fail-closed to email_pending, got %', verification_default;
  end if;

  if has_table_privilege('authenticated', 'public.profiles', 'UPDATE') then
    raise exception 'authenticated must not retain table-level UPDATE on public.profiles';
  end if;
  if has_table_privilege('authenticated', 'public.profiles', 'INSERT') then
    raise exception 'authenticated must not retain table-level INSERT on public.profiles';
  end if;
  if has_table_privilege('authenticated', 'public.profiles', 'DELETE') then
    raise exception 'authenticated must not retain DELETE on public.profiles';
  end if;

  select count(*)
    into unsafe_column_grants
    from information_schema.column_privileges
   where table_schema = 'public'
     and table_name = 'profiles'
     and grantee = 'authenticated'
     and privilege_type in ('INSERT', 'UPDATE')
     and column_name in (
       'role','profile_mode','requested_role','verification_status',
       'verification_requested_at','verification_expires_at','verified_at','verified_by',
       'onboarding_complete','onboarding_completed','onboarding_completed_at','onboarded',
       'is_admin','coin_balance','xp','level','streak','badges'
     );
  if unsafe_column_grants <> 0 then
    raise exception 'authenticated has % unsafe authority-column grants on profiles', unsafe_column_grants;
  end if;

  select count(*)
    into safe_update_grants
    from information_schema.column_privileges
   where table_schema = 'public'
     and table_name = 'profiles'
     and grantee = 'authenticated'
     and privilege_type = 'UPDATE'
     and column_name in ('full_name','username','bio','onboarding_data','community_safety_agreed');
  if safe_update_grants <> 5 then
    raise exception 'expected safe authenticated profile UPDATE grants, found %/5', safe_update_grants;
  end if;

  select count(*)
    into broad_profile_insert_policies
    from pg_policies
   where schemaname = 'public'
     and tablename = 'profiles'
     and cmd = 'INSERT'
     and policyname = 'Users insert own profile';
  if broad_profile_insert_policies <> 0 then
    raise exception 'broad Users insert own profile policy must be absent';
  end if;

  select count(*)
    into owner_update_policies
    from pg_policies
   where schemaname = 'public'
     and tablename = 'profiles'
     and cmd = 'UPDATE'
     and policyname = 'Users update own profile'
     and 'authenticated' = any(roles)
     and qual like '%auth.uid()%'
     and with_check like '%auth.uid()%';
  if owner_update_policies <> 1 then
    raise exception 'profiles owner UPDATE policy must be authenticated and have USING + WITH CHECK';
  end if;

  select p.prosecdef
    into wrapper_definer
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.proname = 'complete_playbook_onboarding'
     and pg_get_function_identity_arguments(p.oid) = 'expected_role text, mark_verification_pending boolean';
  if wrapper_definer is null or wrapper_definer then
    raise exception 'public complete_playbook_onboarding wrapper must exist and be SECURITY INVOKER';
  end if;

  select count(*)
    into private_definer_count
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'private'
     and p.proname in ('initialize_playbook_profile','select_playbook_role','complete_playbook_onboarding')
     and p.prosecdef;
  if private_definer_count <> 3 then
    raise exception 'expected three private SECURITY DEFINER profile authority functions, found %', private_definer_count;
  end if;

  select count(*)
    into private_search_path_count
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'private'
     and p.proname in ('initialize_playbook_profile','select_playbook_role','complete_playbook_onboarding')
     and coalesce(array_to_string(p.proconfig, ','), '') like '%search_path=%';
  if private_search_path_count <> 3 then
    raise exception 'all private profile authority functions must set an explicit empty search_path';
  end if;
end $$;

-- Canonical Scholar journey tables retain one owner-only ALL policy each, with identical
-- USING/WITH CHECK ownership semantics and statement-cached auth.uid() evaluation.
with expected(tablename,policyname,owner_column) as (
  values
    ('scholar_profiles','scholar-profile-own','id'),
    ('scholar_goals','scholar-goals-own','scholar_id'),
    ('scholar_milestones','scholar-milestones-own','scholar_id'),
    ('scholar_dashboard_projections','scholar-dashboard-own','scholar_id'),
    ('academic_journey_evidence','academic-evidence-own','owner_id'),
    ('pbos_opportunity_recommendations','pbos-opportunities-own','owner_id')
), target as (
  select e.*, p.cmd, p.roles, p.qual, p.with_check
  from expected e
  join pg_policies p
    on p.schemaname='public'
   and p.tablename=e.tablename
   and p.policyname=e.policyname
)
select count(*)=6
   and bool_and(cmd='ALL')
   and bool_and(qual ilike '%select auth.uid()%')
   and bool_and(with_check ilike '%select auth.uid()%')
   and bool_and(qual ilike '%' || owner_column || '%')
   and bool_and(with_check ilike '%' || owner_column || '%')
as scholar_core_owner_policies_cached
from target \gset
\if :scholar_core_owner_policies_cached \else \echo 'canonical Scholar owner policies must remain symmetric and statement-cached' \quit 1 \endif

rollback;
