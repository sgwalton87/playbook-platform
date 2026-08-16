-- Reconciliation cleanup after exact historical foundation backfills.
-- Removes superseded authority policy names and optimizes remaining canonical
-- Store/reward owner reads without changing access semantics.

drop policy if exists "Scholars can manage own application workspaces"
  on public.application_workspaces;

create index if not exists pbos_notifications_scholar_idx
  on public.pbos_notifications(scholar_id);
create index if not exists nil_store_campaigns_partner_idx
  on public.nil_store_campaigns(partner_id);
create index if not exists nil_store_campaigns_store_product_idx
  on public.nil_store_campaigns(store_product_id);

drop policy if exists "Users view own store redemptions" on public.store_redemptions;
create policy "Users view own store redemptions"
on public.store_redemptions for select to authenticated
using (scholar_id = (select auth.uid()));

drop policy if exists "Scholars can view own coin ledger" on public.coin_ledger;
create policy "Scholars can view own coin ledger"
on public.coin_ledger for select to authenticated
using (scholar_id = (select auth.uid()));

drop policy if exists "Scholars can view own reward events" on public.reward_events;
create policy "Scholars can view own reward events"
on public.reward_events for select to authenticated
using (scholar_id = (select auth.uid()));

drop policy if exists "Recommenders can view requests by email" on public.recommender_requests;
create policy "Recommenders can view requests by email"
on public.recommender_requests for select to authenticated
using (
  lower(recommender_email) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
);
