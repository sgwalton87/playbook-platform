-- Reconcile follow-on hardening for service-route policies that were relaxed in
-- the previous batch and retain least-privilege operation boundaries.

-- Notifications: replace broad all-policy with explicit operation-scoped rules.
drop policy if exists "Users can manage own notifications" on public.notifications;
drop policy if exists "Users can read own notifications" on public.notifications;
drop policy if exists "Users can insert own notifications" on public.notifications;
drop policy if exists "Users can update own notifications" on public.notifications;
drop policy if exists "Users can delete own notifications" on public.notifications;

create policy "Users can read own notifications"
on public.notifications
for select
to authenticated
using (
  auth.uid()::text = user_id
  OR EXISTS (
    SELECT 1
    FROM public.support_relationships sr
    WHERE sr.status = 'active'
      AND (
        (sr.scholar_id = auth.uid() AND sr.supporter_id::text = user_id)
        OR (sr.supporter_id = auth.uid() AND sr.scholar_id::text = user_id)
      )
  )
);

create policy "Users can insert own notifications"
on public.notifications
for insert
to authenticated
with check (
  auth.uid()::text = user_id
  OR EXISTS (
    SELECT 1
    FROM public.support_relationships sr
    WHERE sr.status = 'active'
      AND (
        (sr.scholar_id = auth.uid() AND sr.supporter_id::text = user_id)
        OR (sr.supporter_id = auth.uid() AND sr.scholar_id::text = user_id)
      )
  )
);

create policy "Users can update own notifications"
on public.notifications
for update
to authenticated
using (
  auth.uid()::text = user_id
  OR EXISTS (
    SELECT 1
    FROM public.support_relationships sr
    WHERE sr.status = 'active'
      AND (
        (sr.scholar_id = auth.uid() AND sr.supporter_id::text = user_id)
        OR (sr.supporter_id = auth.uid() AND sr.scholar_id::text = user_id)
      )
  )
)
with check (
  auth.uid()::text = user_id
  OR EXISTS (
    SELECT 1
    FROM public.support_relationships sr
    WHERE sr.status = 'active'
      AND (
        (sr.scholar_id = auth.uid() AND sr.supporter_id::text = user_id)
        OR (sr.supporter_id = auth.uid() AND sr.scholar_id::text = user_id)
      )
  )
);

create policy "Users can delete own notifications"
on public.notifications
for delete
to authenticated
using (
  auth.uid()::text = user_id
  OR EXISTS (
    SELECT 1
    FROM public.support_relationships sr
    WHERE sr.status = 'active'
      AND (
        (sr.scholar_id = auth.uid() AND sr.supporter_id::text = user_id)
        OR (sr.supporter_id = auth.uid() AND sr.scholar_id::text = user_id)
      )
  )
);

-- Playbook events: split broad service-route policy into explicit operations.
drop policy if exists "Users can manage own playbook events" on public.playbook_events;
drop policy if exists "Users can read own playbook events" on public.playbook_events;
drop policy if exists "Users can create own playbook events" on public.playbook_events;
drop policy if exists "Users can insert own playbook events" on public.playbook_events;
drop policy if exists "Users can update own playbook events" on public.playbook_events;
drop policy if exists "Users can delete own playbook events" on public.playbook_events;

create policy "Users can read own playbook events"
on public.playbook_events
for select
to authenticated
using (
  auth.uid()::text = scholar_id
  OR auth.uid() = actor_id
  OR EXISTS (
    SELECT 1
    FROM public.support_relationships sr
      WHERE sr.scholar_id::text = playbook_events.scholar_id
      AND sr.status = 'active'
      AND sr.supporter_id = auth.uid()
  )
);

create policy "Users can insert own playbook events"
on public.playbook_events
for insert
to authenticated
with check (
  auth.uid()::text = scholar_id
  OR auth.uid() = actor_id
  OR EXISTS (
    SELECT 1
    FROM public.support_relationships sr
      WHERE sr.scholar_id::text = playbook_events.scholar_id
      AND sr.status = 'active'
      AND sr.supporter_id = auth.uid()
  )
);

create policy "Users can update own playbook events"
on public.playbook_events
for update
to authenticated
using (
  auth.uid()::text = scholar_id
  OR auth.uid() = actor_id
  OR EXISTS (
    SELECT 1
    FROM public.support_relationships sr
      WHERE sr.scholar_id::text = playbook_events.scholar_id
      AND sr.status = 'active'
      AND sr.supporter_id = auth.uid()
  )
)
with check (
  auth.uid()::text = scholar_id
  OR auth.uid() = actor_id
  OR EXISTS (
    SELECT 1
    FROM public.support_relationships sr
      WHERE sr.scholar_id::text = playbook_events.scholar_id
      AND sr.status = 'active'
      AND sr.supporter_id = auth.uid()
  )
);

create policy "Users can delete own playbook events"
on public.playbook_events
for delete
to authenticated
using (
  auth.uid()::text = scholar_id
  OR auth.uid() = actor_id
  OR EXISTS (
    SELECT 1
    FROM public.support_relationships sr
    WHERE sr.scholar_id = playbook_events.scholar_id::uuid
      AND sr.status = 'active'
      AND sr.supporter_id = auth.uid()
  )
);
