begin;

do $$
begin
  if to_regprocedure('private.current_user_is_platform_moderator()') is null then
    raise exception 'Missing private platform moderator authority helper.';
  end if;

  if exists (
    select 1 from information_schema.routine_privileges
     where specific_schema = 'private'
       and routine_name = 'current_user_is_platform_moderator'
       and grantee in ('PUBLIC', 'anon', 'authenticated')
       and privilege_type = 'EXECUTE'
  ) then
    raise exception 'Private moderator helper must not be directly executable by API roles.';
  end if;

  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'moderation_reports'
       and policyname = 'Platform moderators can review reports' and cmd = 'SELECT'
  ) then
    raise exception 'Missing moderator report SELECT policy.';
  end if;

  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'moderation_reports'
       and policyname = 'Platform moderators can update reports' and cmd = 'UPDATE'
  ) then
    raise exception 'Missing moderator report UPDATE policy.';
  end if;

  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'moderation_actions'
       and policyname = 'Platform moderators can record moderation actions' and cmd = 'INSERT'
  ) then
    raise exception 'Missing moderator action INSERT policy.';
  end if;

  if exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'moderation_reports'
       and cmd in ('UPDATE', 'ALL')
       and coalesce(with_check, '') not like '%reviewed_by%'
  ) then
    raise exception 'Moderation report mutation policy must bind reviewed_by to the moderator.';
  end if;
end $$;

rollback;
