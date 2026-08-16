-- Cache auth.uid() once per statement for user-owned social safety policies.
-- Moderator authority policies are intentionally unchanged.

alter policy "Users manage own mutes"
on public.user_mutes
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

alter policy "Users manage own content mutes"
on public.content_mutes
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

alter policy "Users manage own blocks"
on public.user_blocks
using ((select auth.uid()) = blocker_id)
with check ((select auth.uid()) = blocker_id);

alter policy "Users create own reports"
on public.moderation_reports
with check ((select auth.uid()) = reporter_id);

alter policy "Users view own reports"
on public.moderation_reports
using ((select auth.uid()) = reporter_id);
