-- Follow-on PBOS-RLS hardening patch set.
--
-- This patch is a security-tightening follow-up to PBOS-RLS-001:
-- - remove broad read allowances where catalog exposure can be narrowed
-- - split broad multi-operation policies into explicit operation-level policies
-- - preserve existing ownership model while making intent explicit

-- Tighten catalog visibility to active records only.
drop policy if exists "Authenticated users can view brand partners" on public.brand_partners;
create policy "Authenticated users can view active brand partners"
on public.brand_partners
for select
to authenticated
using (active = true);

drop policy if exists "Authenticated users can view store products" on public.store_products;
create policy "Authenticated users can view active store products"
on public.store_products
for select
to authenticated
using (active = true);

-- Split notifications policy into explicit operation-level least-privilege rules.
drop policy if exists "Users can manage own notifications" on public.notifications;

create policy "Users can read own notifications"
on public.notifications
for select
to authenticated
using (auth.uid()::text = user_id);

create policy "Users can insert own notifications"
on public.notifications
for insert
to authenticated
with check (auth.uid()::text = user_id);

create policy "Users can update own notifications"
on public.notifications
for update
to authenticated
using (auth.uid()::text = user_id)
with check (auth.uid()::text = user_id);

create policy "Users can delete own notifications"
on public.notifications
for delete
to authenticated
using (auth.uid()::text = user_id);

-- Keep Playbook events readable only in scholar/actor contexts.
drop policy if exists "Users can read own playbook events" on public.playbook_events;
create policy "Users can read own playbook events"
on public.playbook_events
for select
to authenticated
using (auth.uid()::text = scholar_id OR auth.uid() = actor_id);

-- Split moderation policy by operation with explicit moderator role checks.
drop policy if exists "Moderators can manage moderation actions" on public.moderation_actions;
create policy "Moderators can view moderation actions"
on public.moderation_actions
for select
to authenticated
using (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('founder', 'admin')
  )
);

create policy "Moderators can insert moderation actions"
on public.moderation_actions
for insert
to authenticated
with check (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('founder', 'admin')
  )
);

create policy "Moderators can update moderation actions"
on public.moderation_actions
for update
to authenticated
using (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('founder', 'admin')
  )
)
with check (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('founder', 'admin')
  )
);

-- Explicit ownership model for support shared actions.
drop policy if exists "Users can manage own shared actions" on public.shared_actions;
create policy "Users can read own shared actions"
on public.shared_actions
for select
to authenticated
using (
  scholar_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.support_relationships sr
    WHERE sr.scholar_id = shared_actions.scholar_id
      AND sr.status = 'active'
      AND sr.supporter_id = auth.uid()
  )
);

create policy "Users can create own shared actions"
on public.shared_actions
for insert
to authenticated
with check (
  scholar_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.support_relationships sr
    WHERE sr.scholar_id = shared_actions.scholar_id
      AND sr.status = 'active'
      AND sr.supporter_id = auth.uid()
  )
);

create policy "Users can update own shared actions"
on public.shared_actions
for update
to authenticated
using (
  scholar_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.support_relationships sr
    WHERE sr.scholar_id = shared_actions.scholar_id
      AND sr.status = 'active'
      AND sr.supporter_id = auth.uid()
  )
)
with check (
  scholar_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.support_relationships sr
    WHERE sr.scholar_id = shared_actions.scholar_id
      AND sr.status = 'active'
      AND sr.supporter_id = auth.uid()
  )
);

create policy "Users can delete own shared actions"
on public.shared_actions
for delete
to authenticated
using (
  scholar_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.support_relationships sr
    WHERE sr.scholar_id = shared_actions.scholar_id
      AND sr.status = 'active'
      AND sr.supporter_id = auth.uid()
  )
);

-- Explicit ownership model for support messages.
drop policy if exists "Users can manage own support messages" on public.support_messages;
create policy "Users can read own support messages"
on public.support_messages
for select
to authenticated
using (
  scholar_id = auth.uid()
  OR sender_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.support_relationships sr
    WHERE sr.scholar_id = support_messages.scholar_id
      AND sr.status = 'active'
      AND sr.supporter_id = auth.uid()
  )
);

create policy "Users can create own support messages"
on public.support_messages
for insert
to authenticated
with check (
  scholar_id = auth.uid()
  OR sender_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.support_relationships sr
    WHERE sr.scholar_id = support_messages.scholar_id
      AND sr.status = 'active'
      AND sr.supporter_id = auth.uid()
  )
);

create policy "Users can update own support messages"
on public.support_messages
for update
to authenticated
using (
  scholar_id = auth.uid()
  OR sender_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.support_relationships sr
    WHERE sr.scholar_id = support_messages.scholar_id
      AND sr.status = 'active'
      AND sr.supporter_id = auth.uid()
  )
)
with check (
  scholar_id = auth.uid()
  OR sender_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.support_relationships sr
    WHERE sr.scholar_id = support_messages.scholar_id
      AND sr.status = 'active'
      AND sr.supporter_id = auth.uid()
  )
);

create policy "Users can delete own support messages"
on public.support_messages
for delete
to authenticated
using (
  scholar_id = auth.uid()
  OR sender_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.support_relationships sr
    WHERE sr.scholar_id = support_messages.scholar_id
      AND sr.status = 'active'
      AND sr.supporter_id = auth.uid()
  )
);
