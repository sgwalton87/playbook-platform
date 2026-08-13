-- add missing row-level security policies for PBOS-RLS-001 gap remediation

drop policy if exists "Scholars can manage own athlete profiles" on public.athlete_profiles;
create policy "Scholars can manage own athlete profiles"
on public.athlete_profiles
for all
to authenticated
using (auth.uid() = scholar_id)
with check (auth.uid() = scholar_id);

drop policy if exists "Scholars can manage own athlete eligibility checks" on public.athlete_eligibility_checks;
create policy "Scholars can manage own athlete eligibility checks"
on public.athlete_eligibility_checks
for all
to authenticated
using (auth.uid() = scholar_id)
with check (auth.uid() = scholar_id);

drop policy if exists "Scholars can manage own recruiting targets" on public.recruiting_targets;
create policy "Scholars can manage own recruiting targets"
on public.recruiting_targets
for all
to authenticated
using (auth.uid() = scholar_id)
with check (auth.uid() = scholar_id);

drop policy if exists "Scholars can manage own NIL deals" on public.nil_deals;
create policy "Scholars can manage own NIL deals"
on public.nil_deals
for all
to authenticated
using (auth.uid() = scholar_id)
with check (auth.uid() = scholar_id);

drop policy if exists "Scholars can manage own athlete financial entries" on public.athlete_financial_entries;
create policy "Scholars can manage own athlete financial entries"
on public.athlete_financial_entries
for all
to authenticated
using (auth.uid() = scholar_id)
with check (auth.uid() = scholar_id);

drop policy if exists "Users can manage own guided tour progress" on public.guided_tour_progress;
create policy "Users can manage own guided tour progress"
on public.guided_tour_progress
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Moderators can manage moderation actions" on public.moderation_actions;
create policy "Moderators can manage moderation actions"
on public.moderation_actions
for all
to authenticated
using (
  auth.uid() = moderator_id
  OR EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('founder', 'admin')
  )
)
with check (
  auth.uid() = moderator_id
  OR EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('founder', 'admin')
  )
);

drop policy if exists "Users can manage own notifications" on public.notifications;
create policy "Users can manage own notifications"
on public.notifications
for all
to authenticated
using (auth.uid()::text = user_id)
with check (auth.uid()::text = user_id);

drop policy if exists "Users can read own playbook events" on public.playbook_events;
create policy "Users can read own playbook events"
on public.playbook_events
for select
to authenticated
using (auth.uid()::text = scholar_id OR auth.uid() = actor_id);

drop policy if exists "Authenticated users can view brand partners" on public.brand_partners;
create policy "Authenticated users can view brand partners"
on public.brand_partners
for select
to authenticated
using (true);

drop policy if exists "Users can manage own shared actions" on public.shared_actions;
create policy "Users can manage own shared actions"
on public.shared_actions
for all
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

drop policy if exists "Authenticated users can view store products" on public.store_products;
create policy "Authenticated users can view store products"
on public.store_products
for select
to authenticated
using (true);

drop policy if exists "Users can manage own store redemptions" on public.store_redemptions;
create policy "Users can manage own store redemptions"
on public.store_redemptions
for all
to authenticated
using (auth.uid() = scholar_id)
with check (auth.uid() = scholar_id);

drop policy if exists "Users can manage own nil store campaigns" on public.nil_store_campaigns;
create policy "Users can manage own nil store campaigns"
on public.nil_store_campaigns
for all
to authenticated
using (auth.uid() = scholar_id)
with check (auth.uid() = scholar_id);

drop policy if exists "Users can manage own support messages" on public.support_messages;
create policy "Users can manage own support messages"
on public.support_messages
for all
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

