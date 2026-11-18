begin;

do $$
begin
  if to_regprocedure('private.current_user_is_onboarded_learner()') is null then
    raise exception 'Missing private learner authority helper.';
  end if;

  -- RLS calls this no-argument boolean helper as the authenticated actor.
  -- Its body is bound to auth.uid(), returns only own onboarding eligibility,
  -- and all six data policies still require scholar_id = auth.uid().
  if not has_function_privilege('authenticated','private.current_user_is_onboarded_learner()','EXECUTE')
     or has_function_privilege('anon','private.current_user_is_onboarded_learner()','EXECUTE')
  then
    raise exception 'Authenticated learner predicate must be callable, anonymous denied.';
  end if;

  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'application_workspaces'
       and policyname = 'application-workspaces-own'
       and coalesce(with_check, '') like '%current_user_is_onboarded_learner%'
  ) then
    raise exception 'Application workspace policy is not learner-gated.';
  end if;

  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'application_workspace_tasks'
       and policyname = 'application-tasks-own'
       and coalesce(with_check, '') like '%application_workspaces%'
  ) then
    raise exception 'Application task policy does not preserve parent workspace lineage.';
  end if;

  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'application_workspace_documents'
       and policyname = 'application-documents-own'
       and coalesce(with_check, '') like '%application_workspaces%'
  ) then
    raise exception 'Application document policy does not preserve parent workspace lineage.';
  end if;

  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.proname='is_owned_application_document_path'
        and p.prosecdef
        and pg_get_functiondef(p.oid) like '%application_workspaces%'
        and pg_get_functiondef(p.oid) like '%onboarding_completed%'
        and pg_get_functiondef(p.oid) like '%auth.uid%'
  ) then raise exception 'Guarded application storage ownership helper missing.'; end if;

  if not exists (
    select 1 from pg_policies
     where schemaname = 'storage' and tablename = 'objects'
       and policyname = 'application-document-storage-own'
       and coalesce(with_check, '') like '%is_owned_application_document_path%'
  ) then
    raise exception 'Application document storage policy is not learner and workspace gated.';
  end if;
end $$;

rollback;
