-- PBOS-RLS follow-on hardening patch set.
--
-- This migration captures the next reviewable patch boundary after coverage repair.
-- It makes no schema changes and only reconciles policy scope at migration precedence
-- so runtime policy shape is deterministic after rollout.

-- Ensure active filtering remains enforced for catalog-like public reads.
DROP POLICY IF EXISTS "Authenticated users can view brand partners" ON public.brand_partners;
DROP POLICY IF EXISTS "Authenticated users can view active brand partners" ON public.brand_partners;

CREATE POLICY "Authenticated users can view active brand partners"
ON public.brand_partners
FOR SELECT
TO authenticated
USING (active = true);

DROP POLICY IF EXISTS "Authenticated users can view store products" ON public.store_products;
DROP POLICY IF EXISTS "Authenticated users can view active store products" ON public.store_products;

CREATE POLICY "Authenticated users can view active store products"
ON public.store_products
FOR SELECT
TO authenticated
USING (active = true);

-- Preserve explicit moderation ownership and remove broader write ambiguity.
DROP POLICY IF EXISTS "Moderators can manage moderation actions" ON public.moderation_actions;
DROP POLICY IF EXISTS "Moderators can view moderation actions" ON public.moderation_actions;
DROP POLICY IF EXISTS "Moderators can insert moderation actions" ON public.moderation_actions;
DROP POLICY IF EXISTS "Moderators can update moderation actions" ON public.moderation_actions;

CREATE POLICY "Moderators can view moderation actions"
ON public.moderation_actions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('founder', 'admin')
  )
);

CREATE POLICY "Moderators can insert moderation actions"
ON public.moderation_actions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('founder', 'admin')
  )
);

CREATE POLICY "Moderators can update moderation actions"
ON public.moderation_actions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('founder', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('founder', 'admin')
  )
);

-- Ensure service-route adjacent tables use explicit operation policies.
DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;

CREATE POLICY "Users can read own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (
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

CREATE POLICY "Users can insert own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
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

CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (
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
WITH CHECK (
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

CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (
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

DROP POLICY IF EXISTS "Users can manage own playbook events" ON public.playbook_events;
DROP POLICY IF EXISTS "Users can read own playbook events" ON public.playbook_events;
DROP POLICY IF EXISTS "Users can create own playbook events" ON public.playbook_events;
DROP POLICY IF EXISTS "Users can insert own playbook events" ON public.playbook_events;
DROP POLICY IF EXISTS "Users can update own playbook events" ON public.playbook_events;
DROP POLICY IF EXISTS "Users can delete own playbook events" ON public.playbook_events;

CREATE POLICY "Users can read own playbook events"
ON public.playbook_events
FOR SELECT
TO authenticated
USING (
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

CREATE POLICY "Users can insert own playbook events"
ON public.playbook_events
FOR INSERT
TO authenticated
WITH CHECK (
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

CREATE POLICY "Users can update own playbook events"
ON public.playbook_events
FOR UPDATE
TO authenticated
USING (
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
WITH CHECK (
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

CREATE POLICY "Users can delete own playbook events"
ON public.playbook_events
FOR DELETE
TO authenticated
USING (
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
