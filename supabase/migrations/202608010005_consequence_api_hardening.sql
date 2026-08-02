-- Atomic, authenticated consequence boundaries for rewards and redemptions.
alter table public.brand_partners add column if not exists owner_profile_id uuid references public.profiles(id) on delete restrict;
create unique index if not exists brand_partners_owner_profile_idx on public.brand_partners(owner_profile_id) where owner_profile_id is not null;
create policy "Brand partner owners read own organization" on public.brand_partners for select to authenticated using(owner_profile_id=auth.uid());
create policy "Brand partner owners govern campaigns" on public.nil_store_campaigns for all to authenticated
using(exists(select 1 from public.brand_partners bp where bp.id=nil_store_campaigns.partner_id and bp.owner_profile_id=auth.uid()))
with check(exists(select 1 from public.brand_partners bp where bp.id=nil_store_campaigns.partner_id and bp.owner_profile_id=auth.uid()));

create policy "Users manage own guided tour" on public.guided_tour_progress for all to authenticated
using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "Users create community events" on public.community_events for insert to authenticated with check(created_by=auth.uid());
create policy "Creators update community events" on public.community_events for update to authenticated using(created_by=auth.uid()) with check(created_by=auth.uid());
create policy "Authenticated users read active store products" on public.store_products for select to authenticated using(active=true);
create policy "Scholars read own redemptions" on public.store_redemptions for select to authenticated using(scholar_id=auth.uid());
create policy "Action participants read shared actions" on public.shared_actions for select to authenticated using(
  scholar_id=auth.uid() or exists(select 1 from public.support_relationships sr where sr.scholar_id=shared_actions.scholar_id and sr.supporter_id=auth.uid() and sr.status='active' and sr.permissions ? 'view_progress')
);
create policy "Authorized supporters read application workspaces" on public.application_workspaces for select to authenticated using(
  exists(select 1 from public.support_relationships sr where sr.scholar_id=application_workspaces.scholar_id and sr.supporter_id=auth.uid() and sr.status='active' and sr.permissions ? 'view_progress')
);

create or replace function public.emit_reward_event(p_event jsonb,p_ledger jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_event_id uuid; v_ledger_id uuid;
begin
  if not public.is_platform_admin(v_actor) then raise exception 'admin_required'; end if;
  insert into public.reward_events(scholar_id,event_type,source_id,payload,processed)
  values((p_event->>'scholar_id')::uuid,p_event->>'event_type',p_event->>'source_id',coalesce(p_event->'payload','{}'::jsonb),false) returning id into v_event_id;
  insert into public.coin_ledger(scholar_id,event_type,source_id,coins,xp,reason)
  values((p_ledger->>'scholar_id')::uuid,p_ledger->>'event_type',p_ledger->>'source_id',(p_ledger->>'coins')::integer,(p_ledger->>'xp')::integer,p_ledger->>'reason') returning id into v_ledger_id;
  update public.reward_events set processed=true where id=v_event_id;
  return jsonb_build_object('eventId',v_event_id,'ledgerId',v_ledger_id);
end; $$;
revoke all on function public.emit_reward_event(jsonb,jsonb) from public,anon;
grant execute on function public.emit_reward_event(jsonb,jsonb) to authenticated;

create or replace function public.redeem_store_reward(p_product_id uuid,p_shipping_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_scholar uuid:=auth.uid(); v_price integer; v_balance integer; v_id uuid;
begin
  if v_scholar is null then raise exception 'authentication_required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_scholar::text,0));
  select coin_price into v_price from public.store_products where id=p_product_id and active=true;
  if v_price is null or v_price<0 then raise exception 'product_unavailable'; end if;
  select coalesce(sum(coins),0)::integer into v_balance from public.coin_ledger where scholar_id=v_scholar;
  if v_balance<v_price then raise exception 'insufficient_balance'; end if;
  insert into public.store_redemptions(scholar_id,product_id,coins_spent,shipping_payload) values(v_scholar,p_product_id,v_price,coalesce(p_shipping_payload,'{}'::jsonb)) returning id into v_id;
  insert into public.coin_ledger(scholar_id,event_type,source_id,coins,xp,reason) values(v_scholar,'store.redemption',v_id::text,-v_price,25,'Redeemed a store reward');
  return jsonb_build_object('redemptionId',v_id,'coinsSpent',v_price,'remainingBalance',v_balance-v_price);
end; $$;
revoke all on function public.redeem_store_reward(uuid,jsonb) from public,anon;
grant execute on function public.redeem_store_reward(uuid,jsonb) to authenticated;
