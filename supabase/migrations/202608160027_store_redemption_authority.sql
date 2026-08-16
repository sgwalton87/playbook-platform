-- Governed Store redemption transaction.
-- Product price, inventory, learner identity, balance, redemption, and ledger
-- debit are resolved atomically inside Postgres. Browser callers never supply
-- Scholar identity or coin price.

alter table public.store_redemptions
  add column if not exists request_id text;

create unique index if not exists store_redemptions_request_idx
  on public.store_redemptions(scholar_id, request_id)
  where request_id is not null;

create or replace function private.redeem_store_product(
  product_id_input uuid,
  shipping_payload_input jsonb,
  request_id_input text
)
returns table (
  redemption_id uuid,
  coins_spent integer,
  remaining_balance bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  authenticated_user_id uuid := auth.uid();
  product_row public.store_products%rowtype;
  existing_row public.store_redemptions%rowtype;
  current_balance bigint;
  created_redemption_id uuid;
begin
  if authenticated_user_id is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  if not private.current_user_is_onboarded_learner() then
    raise exception 'Store redemption is restricted to onboarded learner accounts.' using errcode = '42501';
  end if;

  if request_id_input is null or trim(request_id_input) = '' then
    raise exception 'Redemption request ID is required.' using errcode = '22023';
  end if;

  select redemption.*
    into existing_row
    from public.store_redemptions redemption
   where redemption.scholar_id = authenticated_user_id
     and redemption.request_id = request_id_input;

  if found then
    select coalesce(sum(ledger.coins), 0)
      into current_balance
      from public.coin_ledger ledger
     where ledger.scholar_id = authenticated_user_id;

    return query select existing_row.id, existing_row.coins_spent, current_balance;
    return;
  end if;

  select product.*
    into product_row
    from public.store_products product
   where product.id = product_id_input
     and product.active is true
   for update;

  if not found then
    raise exception 'Store product is not available.' using errcode = 'P0002';
  end if;

  if product_row.inventory <= 0 then
    raise exception 'Store product is out of stock.' using errcode = 'P0001';
  end if;

  if product_row.coin_price < 0 then
    raise exception 'Store product price is invalid.' using errcode = '22023';
  end if;

  select coalesce(sum(ledger.coins), 0)
    into current_balance
    from public.coin_ledger ledger
   where ledger.scholar_id = authenticated_user_id;

  if current_balance < product_row.coin_price then
    raise exception 'Insufficient coin balance.' using errcode = 'P0001';
  end if;

  insert into public.store_redemptions (
    scholar_id,
    product_id,
    coins_spent,
    shipping_payload,
    fulfillment_status,
    request_id
  ) values (
    authenticated_user_id,
    product_row.id,
    product_row.coin_price,
    coalesce(shipping_payload_input, '{}'::jsonb),
    'pending',
    request_id_input
  )
  returning id into created_redemption_id;

  update public.store_products
     set inventory = inventory - 1
   where id = product_row.id;

  insert into public.coin_ledger (
    scholar_id,
    event_type,
    source_id,
    coins,
    xp,
    reason
  ) values (
    authenticated_user_id,
    'store.redemption',
    created_redemption_id::text,
    -product_row.coin_price,
    25,
    'Redeemed a store reward'
  );

  return query select created_redemption_id, product_row.coin_price, current_balance - product_row.coin_price;
end;
$$;

revoke all on function private.redeem_store_product(uuid, jsonb, text) from public;
revoke all on function private.redeem_store_product(uuid, jsonb, text) from anon;
revoke all on function private.redeem_store_product(uuid, jsonb, text) from authenticated;

create or replace function public.redeem_store_product(
  product_id_input uuid,
  shipping_payload_input jsonb default '{}'::jsonb,
  request_id_input text default null
)
returns table (
  redemption_id uuid,
  coins_spent integer,
  remaining_balance bigint
)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  return query
    select * from private.redeem_store_product(
      product_id_input,
      shipping_payload_input,
      request_id_input
    );
end;
$$;

revoke all on function public.redeem_store_product(uuid, jsonb, text) from public;
revoke all on function public.redeem_store_product(uuid, jsonb, text) from anon;
grant execute on function public.redeem_store_product(uuid, jsonb, text) to authenticated;
