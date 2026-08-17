\set ON_ERROR_STOP on
begin;

do $$
declare body text;
begin
  if to_regclass('public.recruiting_visits') is null or to_regclass('public.recruiting_offers') is null then
    raise exception 'canonical recruiting visit/offer tables are incomplete';
  end if;

  if not (select relrowsecurity from pg_class where oid='public.recruiting_visits'::regclass)
     or not (select relrowsecurity from pg_class where oid='public.recruiting_offers'::regclass) then
    raise exception 'recruiting visits and offers must enforce RLS';
  end if;

  if not has_table_privilege('authenticated','public.recruiting_visits','SELECT')
     or not has_table_privilege('authenticated','public.recruiting_visits','INSERT')
     or not has_table_privilege('authenticated','public.recruiting_visits','UPDATE')
     or has_table_privilege('authenticated','public.recruiting_visits','DELETE') then
    raise exception 'visit privileges must support owner read/create/update without destructive delete';
  end if;

  if not has_table_privilege('authenticated','public.recruiting_offers','SELECT')
     or not has_table_privilege('authenticated','public.recruiting_offers','INSERT')
     or has_table_privilege('authenticated','public.recruiting_offers','UPDATE')
     or has_table_privilege('authenticated','public.recruiting_offers','DELETE') then
    raise exception 'offer evidence must remain append-only to authenticated clients';
  end if;

  if has_table_privilege('anon','public.recruiting_visits','SELECT')
     or has_table_privilege('anon','public.recruiting_offers','SELECT') then
    raise exception 'anonymous users must not read private recruiting visits or offers';
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='recruiting_visits' and policyname='recruiting_visits_owner_select' and qual ilike '%auth.uid()%')
     or not exists (select 1 from pg_policies where schemaname='public' and tablename='recruiting_offers' and policyname='recruiting_offers_owner_select' and qual ilike '%auth.uid()%') then
    raise exception 'owner-scoped recruiting visit/offer read policies are missing';
  end if;

  if to_regprocedure('private.validate_recruiting_visit()') is null
     or to_regprocedure('private.validate_recruiting_offer()') is null
     or to_regprocedure('private.project_recruiting_visit_timeline()') is null
     or to_regprocedure('private.project_recruiting_offer_timeline()') is null then
    raise exception 'recruiting visit/offer guard or timeline functions are missing';
  end if;

  select pg_get_functiondef('private.validate_recruiting_offer()'::regprocedure) into body;
  if body !~ 'target.scholar_id = new.scholar_id'
     or body !~ 'evidence_row.scholar_id <> new.scholar_id'
     or body !~ 'prior_row.scholar_id <> new.scholar_id'
     or body !~ 'prior_row.recruiting_target_id <> new.recruiting_target_id' then
    raise exception 'offer guard must enforce same-Scholar target, evidence, and supersession ownership';
  end if;
  if body !~ 'new.verification_state := ''self_reported'''
     or body !~ 'new.verified_by := null'
     or body !~ 'new.verified_at := null'
     or body !~ 'new.verification_note := null' then
    raise exception 'direct Scholar offer insertion can bypass self-reported verification boundary';
  end if;

  select pg_get_functiondef('private.validate_recruiting_visit()'::regprocedure) into body;
  if body !~ 'target.scholar_id = new.scholar_id' or body !~ 'new.updated_at := now\(\)' then
    raise exception 'visit guard must preserve same-Scholar target ownership and update timestamp';
  end if;

  select pg_get_functiondef('private.project_recruiting_offer_timeline()'::regprocedure) into body;
  if body !~ '''offer_recorded''' or body ~* 'terms_summary|source_url' then
    raise exception 'offer timeline projection must remain non-terms historical summary only';
  end if;

  select pg_get_functiondef('private.project_recruiting_visit_timeline()'::regprocedure) into body;
  if body !~ '''visit_scheduled''' or body !~ '''visit_updated''' then
    raise exception 'visit timeline lifecycle projection is incomplete';
  end if;

  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='private'
      and p.proname in ('validate_recruiting_visit','validate_recruiting_offer','project_recruiting_visit_timeline','project_recruiting_offer_timeline')
      and (has_function_privilege('anon',p.oid,'EXECUTE') or has_function_privilege('authenticated',p.oid,'EXECUTE'))
  ) then
    raise exception 'recruiting trigger helpers must not be directly executable by clients';
  end if;
end $$;

rollback;
