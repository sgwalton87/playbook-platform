drop policy if exists "Scholars can manage own portfolio shares" on public.portfolio_shares;
create policy "Scholars can manage own portfolio shares"
on public.portfolio_shares
for all
to authenticated
using (auth.uid() = scholar_id)
with check (auth.uid() = scholar_id);

drop policy if exists "Scholars can manage own recommender requests" on public.recommender_requests;
create policy "Scholars can manage own recommender requests"
on public.recommender_requests
for all
to authenticated
using (auth.uid() = scholar_id)
with check (auth.uid() = scholar_id);

drop policy if exists "Recommenders can view requests by email" on public.recommender_requests;
create policy "Recommenders can view requests by email"
on public.recommender_requests
for select
to authenticated
using (
  lower(recommender_email) =
  lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "Scholars can manage own application workspaces" on public.application_workspaces;
create policy "Scholars can manage own application workspaces"
on public.application_workspaces
for all
to authenticated
using (auth.uid() = scholar_id)
with check (auth.uid() = scholar_id);
