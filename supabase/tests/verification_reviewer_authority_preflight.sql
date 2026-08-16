begin;

-- Reviewer authority must exist independently from moderation authority.
do $$
begin
  if to_regprocedure('private.current_user_is_verification_reviewer()') is null then
    raise exception 'verification reviewer authority function is missing';
  end if;
  if to_regprocedure('public.get_verification_review_queue()') is null then
    raise exception 'verification review queue function is missing';
  end if;
  if to_regprocedure('public.review_verification_request(text,uuid,text,text)') is null then
    raise exception 'verification review transition function is missing';
  end if;
end $$;

-- Security-definer reviewer functions must use an empty search_path.
do $$
declare
  proc regprocedure;
  config text[];
begin
  foreach proc in array array[
    'private.current_user_is_verification_reviewer()'::regprocedure,
    'public.get_verification_review_queue()'::regprocedure,
    'public.review_verification_request(text,uuid,text,text)'::regprocedure
  ] loop
    select p.proconfig into config from pg_proc p where p.oid = proc;
    if config is null or not exists (
      select 1 from unnest(config) setting
       where setting = 'search_path=' or setting = 'search_path=""'
    ) then
      raise exception '% must use an empty search_path', proc::text;
    end if;
  end loop;
end $$;

-- Review evidence is append-only to normal authenticated clients.
do $$
begin
  if to_regclass('public.verification_review_events') is null then
    raise exception 'verification_review_events is missing';
  end if;
  if not exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid=c.relnamespace
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

-- The review transition must be explicitly allowlisted and must retain the
-- self-review denial and special scope transitions required by role gates.
do $$
declare
  body text;
begin
  select pg_get_functiondef('public.review_verification_request(text,uuid,text,text)'::regprocedure) into body;

  if body !~ 'reviewers cannot approve their own verification request' then
    raise exception 'reviewer self-approval denial is missing';
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

rollback;
