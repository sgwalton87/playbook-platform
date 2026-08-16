-- Cache stable auth.uid() inputs once per statement for high-traffic social/attention RLS policies.
-- Authorization semantics, target roles, commands, visibility rules, and table grants remain unchanged.

alter policy "Authenticated users can create posts"
on public.posts
with check ((select auth.uid()) = author_id);

alter policy "Users can update own posts"
on public.posts
using ((select auth.uid()) = author_id);

alter policy "Users can delete own posts"
on public.posts
using ((select auth.uid()) = author_id);

alter policy "Users can view own notifications"
on public.notifications
using ((select auth.uid()) = profile_id);

alter policy "Users can update own notifications"
on public.notifications
using ((select auth.uid()) = profile_id);

alter policy "Users can view own connections"
on public.connections
using (((select auth.uid()) = requester_id) or ((select auth.uid()) = addressee_id));

alter policy "Users can create connection requests"
on public.connections
with check ((select auth.uid()) = requester_id);

alter policy "Users can view own connection requests"
on public.connection_requests
using (((select auth.uid()) = requester_id) or ((select auth.uid()) = recipient_id));

alter policy "Users can create connection requests"
on public.connection_requests
with check ((select auth.uid()) = requester_id);

alter policy "Recipients can respond to connection requests"
on public.connection_requests
using (((select auth.uid()) = recipient_id) or ((select auth.uid()) = requester_id))
with check (((select auth.uid()) = recipient_id) or ((select auth.uid()) = requester_id));

alter policy "Users can view own connections"
on public.user_connections
using (((select auth.uid()) = user_id) or ((select auth.uid()) = connected_user_id));

alter policy "Users can create own connections"
on public.user_connections
with check ((select auth.uid()) = user_id);

alter policy "Users can remove own connections"
on public.user_connections
using (((select auth.uid()) = user_id) or ((select auth.uid()) = connected_user_id));
