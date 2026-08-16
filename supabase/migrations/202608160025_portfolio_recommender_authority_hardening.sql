-- Portfolio Share and Recommendation Request authority hardening.
-- Creation/management is reserved for the authenticated, onboarded learner.
-- Recommender visibility remains a separate email-bound read path.

-- Reuse the private learner authority helper introduced by application workspace hardening.

drop policy if exists "Scholars can manage own portfolio shares" on public.portfolio_shares;
create policy "Learners can manage own portfolio shares"
on public.portfolio_shares
for all
to authenticated
using (
  scholar_id = (select auth.uid())
  and (select private.current_user_is_onboarded_learner())
)
with check (
  scholar_id = (select auth.uid())
  and (select private.current_user_is_onboarded_learner())
);

drop policy if exists "Scholars can manage own recommender requests" on public.recommender_requests;
create policy "Learners can manage own recommender requests"
on public.recommender_requests
for all
to authenticated
using (
  scholar_id = (select auth.uid())
  and (select private.current_user_is_onboarded_learner())
)
with check (
  scholar_id = (select auth.uid())
  and (select private.current_user_is_onboarded_learner())
);

-- Keep the existing recommender email-bound SELECT policy. It does not confer
-- mutation authority and is subordinate to authenticated JWT email identity.
