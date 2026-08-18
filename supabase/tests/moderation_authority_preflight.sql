begin;

do $$
begin
  if to_regprocedure('private.current_user_is_platform_moderator()') is null then
    raise exception 'Missing private platform moderator authority helper.';
  end if;

  if has_function_privilege('anon','private.current_user_is_platform_moderator()','EXECUTE')
     or not has_function_privilege('authenticated','private.current_user_is_platform_moderator()','EXECUTE') then
    raise exception 'Moderator RLS helper must be executable only by authenticated API users, never anonymous callers.';
  end if;

  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'moderation_reports'
       and policyname = 'Platform moderators can review reports' and cmd = 'SELECT'
       and qual like '%current_user_is_platform_moderator%'
  ) then
    raise exception 'Missing moderator report SELECT policy or moderator authority guard.';
  end if;

  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'moderation_reports'
       and policyname = 'Platform moderators can update reports' and cmd = 'UPDATE'
       and qual like '%current_user_is_platform_moderator%'
       and with_check like '%reviewed_by%'
       and with_check ilike '%select auth.uid()%'
  ) then
    raise exception 'Moderator report UPDATE policy must preserve authority and reviewer binding.';
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

-- User-owned safety controls stay owner-only while caching auth.uid() once per statement.
with expected(tablename,policyname,cmd,owner_column) as (
  values
    ('user_mutes','Users manage own mutes','ALL','user_id'),
    ('content_mutes','Users manage own content mutes','ALL','user_id'),
    ('user_blocks','Users manage own blocks','ALL','blocker_id'),
    ('moderation_reports','Users create own reports','INSERT','reporter_id'),
    ('moderation_reports','Users view own reports','SELECT','reporter_id')
), target as (
  select e.*, p.roles, p.qual, p.with_check
  from expected e
  join pg_policies p
    on p.schemaname='public'
   and p.tablename=e.tablename
   and p.policyname=e.policyname
   and p.cmd=e.cmd
)
select count(*)=5
   and bool_and('authenticated'=any(roles))
   and bool_and((coalesce(qual,'') || ' ' || coalesce(with_check,'')) ilike '%select auth.uid()%')
   and bool_and((coalesce(qual,'') || ' ' || coalesce(with_check,'')) ilike '%' || owner_column || '%')
as social_safety_owner_policies_cached
from target \gset
\if :social_safety_owner_policies_cached \else \echo 'social safety owner policies must remain authenticated, owner-scoped, and statement-cached' \quit 1 \endif

rollback;
