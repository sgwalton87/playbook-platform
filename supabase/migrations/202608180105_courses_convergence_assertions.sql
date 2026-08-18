-- Release-blocking assertions for Phase 8 Courses convergence.
-- Canonical authority must pass everywhere; legacy promotion assertions apply only
-- where historical course tables actually exist. This file is the final exact-head
-- database certification sentinel for the Phase 8 release.

do $$
declare
  public_submit oid:=to_regprocedure('public.submit_learning_module_work(text,text,jsonb,jsonb,integer)');
  private_submit oid:=to_regprocedure('private.submit_learning_module_work(text,text,jsonb,jsonb,integer)');
begin
  if to_regclass('public.learning_module_responses') is null then
    raise exception 'Canonical learning_module_responses table is missing';
  end if;
  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relname='learning_module_responses' and c.relrowsecurity
  ) then
    raise exception 'learning_module_responses must have RLS enabled';
  end if;
  if has_table_privilege('authenticated','public.learning_module_responses','INSERT')
     or has_table_privilege('authenticated','public.learning_module_responses','UPDATE')
     or has_table_privilege('authenticated','public.learning_module_responses','DELETE') then
    raise exception 'Learners must not directly mutate canonical learning responses';
  end if;
  if not has_table_privilege('authenticated','public.learning_module_responses','SELECT') then
    raise exception 'Learners require owner-scoped canonical response reads';
  end if;

  if to_regclass('private.learning_module_checkpoint_answers') is null then
    raise exception 'Private checkpoint answer authority is missing';
  end if;
  if has_table_privilege('authenticated','private.learning_module_checkpoint_answers','SELECT')
     or has_table_privilege('anon','private.learning_module_checkpoint_answers','SELECT') then
    raise exception 'Checkpoint answer authority must not be client-readable';
  end if;

  if public_submit is null or private_submit is null then
    raise exception 'Learning module work wrapper/helper chain is incomplete';
  end if;
  if (select prosecdef from pg_proc where oid=public_submit) then
    raise exception 'Public submit_learning_module_work must remain SECURITY INVOKER';
  end if;
  if not (select prosecdef from pg_proc where oid=private_submit) then
    raise exception 'Private submit_learning_module_work must retain SECURITY DEFINER authority';
  end if;
  if has_function_privilege('anon',public_submit,'EXECUTE')
     or has_function_privilege('anon',private_submit,'EXECUTE') then
    raise exception 'Anonymous callers must not submit learning work';
  end if;

  if pg_get_functiondef('private.complete_learning_module(text,text,text)'::regprocedure)
       not like '%checkpoint_passed=true%' then
    raise exception 'Canonical completion is not gated by a passed checkpoint';
  end if;
end $$;

do $$
begin
  -- Static authored prototypes always converge in every environment.
  if (select count(*) from public.learning_modules where course_slug='community-safety-no-bullying' and required)=8 is not true then
    raise exception 'Community Safety canonical module/checkpoint count must be 8';
  end if;
  if (select count(*) from public.learning_modules where course_slug='athletes-abroad-global-hub' and required)=12 is not true then
    raise exception 'Athletes Abroad canonical module/checkpoint count must be 12';
  end if;

  if exists (
    select 1 from public.learning_modules
    where knowledge_checkpoint ? 'correct_index'
  ) then
    raise exception 'Public canonical module payload contains a checkpoint answer';
  end if;
  if (select count(*) from private.learning_module_checkpoint_answers) < 6 then
    raise exception 'Private checkpoint answer migration is incomplete';
  end if;
end $$;

do $$
begin
  -- Hosted Playbook OS contains the historical rich Leadership/Civic source. When
  -- those tables exist, promotion and retirement are mandatory and exact.
  if to_regclass('public.course_modules') is not null and to_regclass('public.courses') is not null then
    if (select count(*) from public.learning_modules where course_slug='15-week-leadership-program' and required)=15 is not true then
      raise exception '15-Week Leadership canonical module count must be 15';
    end if;
    if (select count(*) from public.learning_modules where course_slug='civic-engagement-for-young-leaders' and required)=10 is not true then
      raise exception 'Civic Engagement canonical module count must be 10';
    end if;

    if exists (
      select 1 from public.course_modules
      where knowledge_checkpoint ? 'correct_index'
    ) then
      raise exception 'Historical course module payload still contains a checkpoint answer';
    end if;
    if exists (
      select 1 from public.courses where coalesce(is_available,false)=true
    ) then
      raise exception 'Legacy course catalog must not remain active after canonical convergence';
    end if;

    if to_regclass('public.course_progress') is not null and (
      has_table_privilege('authenticated','public.course_progress','INSERT')
      or has_table_privilege('authenticated','public.course_progress','UPDATE')
      or has_table_privilege('authenticated','public.course_progress','DELETE')
    ) then
      raise exception 'Legacy course progress mutation authority remains exposed';
    end if;

    if to_regclass('public.course_module_responses') is not null and (
      has_table_privilege('authenticated','public.course_module_responses','INSERT')
      or has_table_privilege('authenticated','public.course_module_responses','UPDATE')
      or has_table_privilege('authenticated','public.course_module_responses','DELETE')
    ) then
      raise exception 'Legacy course response mutation authority remains exposed';
    end if;
  end if;
end $$;
