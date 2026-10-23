-- Atomic notification outbox: each new Brand Partner request records one pending event.
-- No delivery credentials or recipient personal data are stored in the outbox.
create table if not exists public.brand_partner_notification_outbox (
  request_id uuid primary key references public.brand_partner_verification_requests(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','sending','sent','failed')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  next_attempt_at timestamptz not null default now(),
  claimed_at timestamptz,
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);
alter table public.brand_partner_notification_outbox enable row level security;
revoke all on public.brand_partner_notification_outbox from PUBLIC, anon, authenticated;

create or replace function public.enqueue_brand_partner_notification()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.brand_partner_notification_outbox(request_id) values (new.id)
  on conflict (request_id) do nothing;
  return new;
end
$$;
revoke all on function public.enqueue_brand_partner_notification() from PUBLIC, anon, authenticated;
drop trigger if exists brand_partner_request_notify on public.brand_partner_verification_requests;
create trigger brand_partner_request_notify after insert on public.brand_partner_verification_requests
for each row execute function public.enqueue_brand_partner_notification();

-- Called only by the privileged notification worker. Lease reclamation allows retry after crashes.
create or replace function public.claim_brand_partner_notification()
returns table(request_id uuid, organization_name text, attempt_count integer)
language plpgsql security definer set search_path = ''
as $$
begin
  return query
  with candidate as (
    select o.request_id from public.brand_partner_notification_outbox o
    where ((o.status in ('pending','failed') and o.next_attempt_at <= now())
      or (o.status = 'sending' and o.claimed_at < now() - interval '10 minutes'))
      and o.attempt_count < 8
    order by o.created_at for update skip locked limit 1
  ), claimed as (
    update public.brand_partner_notification_outbox o
    set status = 'sending', claimed_at = now(), attempt_count = o.attempt_count + 1
    from candidate c where o.request_id = c.request_id
    returning o.request_id, o.attempt_count
  )
  select c.request_id, r.organization_name, c.attempt_count
  from claimed c join public.brand_partner_verification_requests r on r.id = c.request_id;
end
$$;
revoke all on function public.claim_brand_partner_notification() from PUBLIC, anon, authenticated;
grant execute on function public.claim_brand_partner_notification() to service_role;

create or replace function public.finish_brand_partner_notification(
  p_request_id uuid, p_sent boolean, p_error text default null
) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  update public.brand_partner_notification_outbox
  set status = case when p_sent then 'sent' else 'failed' end,
      sent_at = case when p_sent then now() else sent_at end,
      last_error = case when p_sent then null else left(coalesce(p_error,'delivery failure'),400) end,
      next_attempt_at = case when p_sent then next_attempt_at
        else now() + make_interval(mins => least(240, power(2,least(attempt_count,7))::integer)) end,
      claimed_at = null
  where request_id = p_request_id and status = 'sending';
end
$$;
revoke all on function public.finish_brand_partner_notification(uuid,boolean,text) from PUBLIC, anon, authenticated;
grant execute on function public.finish_brand_partner_notification(uuid,boolean,text) to service_role;
