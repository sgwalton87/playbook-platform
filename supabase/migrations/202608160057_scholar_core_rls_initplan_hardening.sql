-- Cache auth.uid() once per statement for canonical Scholar journey owner policies.
-- Policy names, commands, roles, ownership columns, and USING/WITH CHECK semantics remain unchanged.

alter policy "scholar-profile-own"
on public.scholar_profiles
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

alter policy "scholar-goals-own"
on public.scholar_goals
using ((select auth.uid()) = scholar_id)
with check ((select auth.uid()) = scholar_id);

alter policy "scholar-milestones-own"
on public.scholar_milestones
using ((select auth.uid()) = scholar_id)
with check ((select auth.uid()) = scholar_id);

alter policy "scholar-dashboard-own"
on public.scholar_dashboard_projections
using ((select auth.uid()) = scholar_id)
with check ((select auth.uid()) = scholar_id);

alter policy "academic-evidence-own"
on public.academic_journey_evidence
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

alter policy "pbos-opportunities-own"
on public.pbos_opportunity_recommendations
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);
