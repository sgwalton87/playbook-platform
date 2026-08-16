begin;

do $$
begin
  if to_regprocedure('private.current_user_is_onboarded_learner()') is null then
    raise exception 'Missing private learner authority helper.';
  end if;

  if exists (
    select 1 from information_schema.routine_privileges
     where specific_schema = 'private'
       and routine_name = 'current_user_is_onboarded_learner'
       and grantee in ('PUBLIC', 'anon', 'authenticated')
       and privilege_type = 'EXECUTE'
  ) then
    raise exception 'Private learner helper must not be directly executable by API roles.';
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
    select 1 from pg_policies
     where schemaname = 'storage' and tablename = 'objects'
       and policyname = 'application-document-storage-own'
       and coalesce(with_check, '') like '%current_user_is_onboarded_learner%'
       and coalesce(with_check, '') like '%application_workspaces%'
  ) then
    raise exception 'Application document storage policy is not learner and workspace gated.';
  end if;
end $$;

rollback;
