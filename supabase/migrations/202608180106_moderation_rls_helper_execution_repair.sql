-- RLS policies on moderation_reports and moderation_actions call this boolean helper.
-- PostgreSQL evaluates policy expressions as the querying role, so authenticated
-- callers need EXECUTE on the helper even when another permissive owner policy is
-- sufficient for the row. The helper returns only whether auth.uid() currently has
-- a founder/admin profile role; it does not expose moderation data.

revoke all on function private.current_user_is_platform_moderator() from public,anon;
grant execute on function private.current_user_is_platform_moderator() to authenticated;

comment on function private.current_user_is_platform_moderator() is
  'Narrow RLS predicate callable by authenticated users; returns only whether auth.uid() is a platform moderator. Anonymous execution remains denied.';
