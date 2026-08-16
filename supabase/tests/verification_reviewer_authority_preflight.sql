\set ON_ERROR_STOP on
begin;

-- Reviewer authority must exist independently from moderation authority.
do $$
begin
  if to_regprocedure('private.current_user_is_verification_reviewer()') is null then
    raise exception 'verification reviewer authority function is missing';
  end if;
  if to_regprocedure('private.get_verification_review_queue()') is null
     or to_regprocedure('public.get_verification_review_queue()') is null then
    raise exception 'verification review queue wrapper/helper pair is missing';
  end if;
  if to_regprocedure('private.review_verification_request(text,uuid,text,text)') is null
     or to_regprocedure('public.review_verification_request(text,uuid,text,text)') is null then
    raise exception 'verification review transition wrapper/helper pair is missing';
  end if;
end $$;

-- Privileged bodies stay private; exposed RPCs are invoker wrappers.
do $$
declare
  public_proc regprocedure;
  private_proc regprocedure;
begin
  foreach public_proc in array array[
    'public.get_verification_review_queue()'::regprocedure,
    'public.review_verification_request(text,uuid,text,text)'::regprocedure
  ] loop
    if (select p.prosecdef from pg_proc p where p.oid=public_proc) then
      raise exception '% must be SECURITY INVOKER', public_proc::text;
    end if;
    if has_function_privilege('anon',public_proc,'EXECUTE') then
      raise exception 'anon must not execute %', public_proc::text;
    end if;
    if not has_function_privilege('authenticated',public_proc,'EXECUTE') then
      raise exception 'authenticated reviewer wrapper execute missing for %', public_proc::text;
    end if;
  end loop;

  foreach private_proc in array array[
    'private.get_verification_review_queue()'::regprocedure,
    'private.review_verification_request(text,uuid,text,text)'::regprocedure
  ] loop
    if not (select p.prosecdef from pg_proc p where p.oid=private_proc) then
      raise exception '% must retain private SECURITY DEFINER authority', private_proc::text;
    end if;
    if has_function_privilege('anon',private_proc,'EXECUTE') then
      raise exception 'anon must not execute %', private_proc::text;
    end if;
    if not has_function_privilege('authenticated',private_proc,'EXECUTE') then
      raise exception 'authenticated wrapper path requires private execute on %', private_proc::text;
    end if;
  end loop;
end $$;

-- Security-definer/invoker reviewer functions must all use an empty search_path.
do $$
declare
  proc regprocedure;
  config text[];
begin
  foreach proc in array array[
    'private.current_user_is_verification_reviewer()'::regprocedure,
    'private.get_verification_review_queue()'::regprocedure,
    'private.review_verification_request(text,uuid,text,text)'::regprocedure,
    'public.get_verification_review_queue()'::regprocedure,
    'public.review_verification_request(text,uuid,text,text)'::regprocedure
  ] loop
    select p.proconfig into config from pg_proc p where p.oid=proc;
    if config is null or not exists (
      select 1 from unnest(config) setting
       where setting='search_path=' or setting='search_path=""'
    ) then
      raise exception '% must use an empty search_path',proc::text;
    end if;
  end loop;
end $$;

-- Anonymous private execute must remain limited to the three intentional public profile projections.
do $$
declare count_exec integer;
begin
  select count(*) into count_exec
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='private' and has_function_privilege('anon',p.oid,'EXECUTE');
  if count_exec <> 3 then
    raise exception 'anonymous private EXECUTE boundary changed: expected 3 projection helpers, got %',count_exec;
  end if;
end $$;

-- Review evidence is append-only to normal authenticated clients.
do $$
begin
  if to_regclass('public.verification_review_events') is null then
    raise exception 'verification_review_events is missing';
  end if;
  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relname='verification_review_events' and c.relrowsecurity
  ) then
    raise exception 'verification_review_events must have RLS enabled';
  end if;
  if has_table_privilege('authenticated','public.verification_review_events','INSERT')
     or has_table_privilege('authenticated','public.verification_review_events','UPDATE')
     or has_table_privilege('authenticated','public.verification_review_events','DELETE') then
    raise exception 'authenticated clients must not mutate verification review events directly';
  end if;
end $$;

-- The private transition body must be explicitly allowlisted and retain self-review denial,
-- mandatory final-decision reason, row locks, and special scope transitions.
do $$
declare body text;
begin
  select pg_get_functiondef('private.review_verification_request(text,uuid,text,text)'::regprocedure) into body;

  if body !~ 'current_user_is_verification_reviewer' then
    raise exception 'verification reviewer guard is missing';
  end if;
  if body !~ 'for update' then
    raise exception 'verification request row lock is missing';
  end if;
  if body !~ 'a decision reason is required for approval or rejection' then
    raise exception 'mandatory final decision reason is missing';
  end if;
  if body !~ 'reviewers cannot approve their own verification request' then
    raise exception 'reviewer self-approval denial is missing';
  end if;
  if body !~ 'verification_review_events' then
    raise exception 'immutable verification review event write is missing';
  end if;
  if body !~ 'campaign_scope_approved' or body !~ 'compliance_scope_approved' then
    raise exception 'Brand Partner scope approval is missing';
  end if;
  if body !~ 'service_scope_status' then
    raise exception 'Community Partner service-scope approval is missing';
  end if;
  if body !~ 'jurisdiction_scope_status' then
    raise exception 'Athlete Abroad jurisdiction-scope approval is missing';
  end if;
  if body ~ 'execute format' then
    raise exception 'dynamic SQL is prohibited in verification review authority';
  end if;
end $$;

-- Public wrappers must contain no privileged table mutation SQL.
do $$
declare body text;
begin
  select pg_get_functiondef('public.review_verification_request(text,uuid,text,text)'::regprocedure) into body;
  if body !~ 'private.review_verification_request' then
    raise exception 'public review wrapper does not delegate to private authority';
  end if;
  if body ~* '\m(update|insert|delete)\M' then
    raise exception 'public review wrapper contains direct mutation SQL';
  end if;

  select pg_get_functiondef('public.get_verification_review_queue()'::regprocedure) into body;
  if body !~ 'private.get_verification_review_queue' then
    raise exception 'public queue wrapper does not delegate to private authority';
  end if;
end $$;

-- Canonical profile visibility must not be broadened by reviewer authority.
do $$
begin
  if exists (
    select 1 from pg_policies
     where schemaname='public' and tablename='profiles' and cmd='SELECT'
       and (qual='true' or qual ilike '%profile_visibility%public%')
  ) then
    raise exception 'verification authority introduced a broad profiles SELECT policy';
  end if;
end $$;

rollback;
