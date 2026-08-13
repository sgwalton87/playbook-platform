-- Add user-operable write policies for routes migrated away from service-role access.

-- Notifications: allow recipients for directly related scholar/supporter actors.
drop policy if exists "Users can manage own notifications" on public.notifications;
create policy "Users can manage own notifications"
on public.notifications
for all
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

-- Playbook events: allow insertion for event actor and related scholar network.
drop policy if exists "Users can manage own playbook events" on public.playbook_events;
create policy "Users can manage own playbook events"
on public.playbook_events
for all
to authenticated
using (
  auth.uid()::text = scholar_id
  OR auth.uid() = actor_id
  OR EXISTS (
    SELECT 1
    FROM public.support_relationships sr
    WHERE sr.scholar_id = playbook_events.scholar_id
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
    WHERE sr.scholar_id = playbook_events.scholar_id
      AND sr.status = 'active'
      AND sr.supporter_id = auth.uid()
  )
);

-- Reward events and coin ledger: allow scholars to manage their own reward data.
drop policy if exists "Scholars can view own reward events" on public.reward_events;
drop policy if exists "Scholars can manage own reward events" on public.reward_events;
create policy "Scholars can manage own reward events"
on public.reward_events
for all
to authenticated
using (auth.uid() = scholar_id)
with check (auth.uid() = scholar_id);

drop policy if exists "Scholars can view own coin ledger" on public.coin_ledger;
drop policy if exists "Scholars can manage own coin ledger" on public.coin_ledger;
create policy "Scholars can manage own coin ledger"
on public.coin_ledger
for all
to authenticated
using (auth.uid() = scholar_id)
with check (auth.uid() = scholar_id);

-- Support relationships: allow invitees to create records they are authorized for.
drop policy if exists "Supporters can create relationships" on public.support_relationships;
create policy "Supporters can create relationships"
on public.support_relationships
for insert
to authenticated
with check (
  auth.uid() = scholar_id
  OR (
    supporter_id = auth.uid()
    AND supporter_email = lower(coalesce(auth.jwt() ->> 'email', ''))
    AND EXISTS (
      SELECT 1
      FROM public.support_invitations inv
      WHERE inv.scholar_id = support_relationships.scholar_id
        AND lower(inv.invitee_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        AND inv.status IN ('pending', 'accepted')
    )
  )
);
