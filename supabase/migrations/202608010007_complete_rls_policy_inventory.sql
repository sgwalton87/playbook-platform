-- Complete explicit policy dispositions for every previously policy-less table.
-- Service-role-only tables use explicit deny-all policies so intent is reviewable.

create policy "Scholars manage own athlete profile"
on public.athlete_profiles for all to authenticated
using (scholar_id = auth.uid())
with check (scholar_id = auth.uid());

create policy "Scholars read own eligibility checks"
on public.athlete_eligibility_checks for select to authenticated
using (scholar_id = auth.uid());

create policy "Scholars manage own recruiting targets"
on public.recruiting_targets for all to authenticated
using (scholar_id = auth.uid())
with check (scholar_id = auth.uid());

create policy "Scholars manage own NIL deals"
on public.nil_deals for all to authenticated
using (scholar_id = auth.uid())
with check (scholar_id = auth.uid());

create policy "Scholars manage own athlete financial entries"
on public.athlete_financial_entries for all to authenticated
using (scholar_id = auth.uid())
with check (scholar_id = auth.uid());

create policy "Admins read moderation actions"
on public.moderation_actions for select to authenticated
using (public.is_platform_admin());

create policy "Admins read governed launch analytics"
on public.launch_analytics_events for select to authenticated
using (public.is_platform_admin());

create policy "Inbound mail receipts deny direct authenticated access"
on public.inbound_mail_receipts for all to authenticated
using (false)
with check (false);
