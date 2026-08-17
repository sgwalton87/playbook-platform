-- Canonical Network connection lifecycle authority.
-- Reconciles the legacy production relationship tables into committed migration
-- history, then removes direct client mutation authority in favor of narrow,
-- actor-checked RPCs. Existing production rows are preserved.

create table if not exists public.connection_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
  message text,
  created_at timestamptz default now(),
  responded_at timestamptz,
  constraint connection_requests_check check (requester_id <> recipient_id),
  constraint connection_requests_requester_id_recipient_id_key unique (requester_id,recipient_id)
);

create table if not exists public.user_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  connected_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  constraint user_connections_check check (user_id <> connected_user_id),
  constraint user_connections_user_id_connected_user_id_key unique (user_id,connected_user_id)
);

alter table public.connection_requests enable row level security;
alter table public.user_connections enable row level security;

-- Reads remain participant-scoped. All client mutations are revoked and routed
-- through the governed RPCs below.
drop policy if exists connection_requests_select_participants on public.connection_requests;
drop policy if exists connection_requests_insert_requester on public.connection_requests;
drop policy if exists connection_requests_update_participants on public.connection_requests;
drop policy if exists connection_requests_delete_participants on public.connection_requests;
create policy connection_requests_select_participants
on public.connection_requests for select to authenticated
using (auth.uid() = requester_id or auth.uid() = recipient_id);

drop policy if exists user_connections_select_owner on public.user_connections;
drop policy if exists user_connections_insert_owner on public.user_connections;
drop policy if exists user_connections_delete_owner on public.user_connections;
drop policy if exists user_connections_update_owner on public.user_connections;
create policy user_connections_select_owner
on public.user_connections for select to authenticated
using (auth.uid() = user_id);

revoke insert,update,delete on public.connection_requests from anon,authenticated;
revoke insert,update,delete on public.user_connections from anon,authenticated;
grant select on public.connection_requests to authenticated;
grant select on public.user_connections to authenticated;

create or replace function private.send_connection_request(
  requested_recipient_id uuid,
  requested_message text default null
)
returns table(request_id uuid,request_status text)
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  existing public.connection_requests%rowtype;
  saved public.connection_requests%rowtype;
begin
  if actor_id is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;
  if requested_recipient_id is null or requested_recipient_id = actor_id then
    raise exception 'A different recipient is required.' using errcode='22023';
  end if;
  if not exists (
    select 1 from public.profiles p
    where p.id=requested_recipient_id and p.profile_visibility='public'
  ) then
    raise exception 'Recipient is not available for Network discovery.' using errcode='42501';
  end if;
  if exists (
    select 1 from public.user_connections c
    where (c.user_id=actor_id and c.connected_user_id=requested_recipient_id)
       or (c.user_id=requested_recipient_id and c.connected_user_id=actor_id)
  ) then
    raise exception 'You are already connected.' using errcode='23505';
  end if;
  if exists (
    select 1 from public.connection_requests r
    where r.requester_id=requested_recipient_id
      and r.recipient_id=actor_id
      and r.status='pending'
  ) then
    raise exception 'This person already sent you a connection request. Respond to the incoming request instead.' using errcode='23505';
  end if;

  select * into existing
  from public.connection_requests r
  where r.requester_id=actor_id and r.recipient_id=requested_recipient_id
  for update;

  if existing.id is not null then
    if existing.status='pending' then
      return query select existing.id,existing.status;
      return;
    end if;
    if existing.status='accepted' then
      raise exception 'This request is already accepted.' using errcode='23505';
    end if;
    update public.connection_requests
       set status='pending',
           message=nullif(left(trim(coalesce(requested_message,'')),1000),''),
           created_at=now(),
           responded_at=null
     where id=existing.id
     returning * into saved;
  else
    insert into public.connection_requests(requester_id,recipient_id,status,message,created_at,responded_at)
    values(actor_id,requested_recipient_id,'pending',nullif(left(trim(coalesce(requested_message,'')),1000),''),now(),null)
    returning * into saved;
  end if;

  return query select saved.id,saved.status;
end;
$$;

create or replace function private.respond_to_connection_request(
  requested_request_id uuid,
  requested_decision text
)
returns table(request_id uuid,request_status text)
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  target public.connection_requests%rowtype;
  normalized_decision text := lower(trim(coalesce(requested_decision,'')));
begin
  if actor_id is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;
  if normalized_decision not in ('accepted','declined') then
    raise exception 'Decision must be accepted or declined.' using errcode='22023';
  end if;

  select * into target
  from public.connection_requests r
  where r.id=requested_request_id
  for update;

  if target.id is null then
    raise exception 'Connection request not found.' using errcode='P0002';
  end if;
  if target.recipient_id <> actor_id then
    raise exception 'Only the recipient may respond to this request.' using errcode='42501';
  end if;
  if target.status <> 'pending' then
    raise exception 'Only a pending request may be answered.' using errcode='22023';
  end if;

  update public.connection_requests
     set status=normalized_decision,
         responded_at=now()
   where id=target.id;

  if normalized_decision='accepted' then
    insert into public.user_connections(user_id,connected_user_id,created_at)
    values(target.requester_id,target.recipient_id,now())
    on conflict(user_id,connected_user_id) do nothing;

    insert into public.user_connections(user_id,connected_user_id,created_at)
    values(target.recipient_id,target.requester_id,now())
    on conflict(user_id,connected_user_id) do nothing;
  end if;

  return query select target.id,normalized_decision;
end;
$$;

create or replace function private.cancel_connection_request(requested_request_id uuid)
returns table(request_id uuid,request_status text)
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  target public.connection_requests%rowtype;
begin
  if actor_id is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;

  select * into target
  from public.connection_requests r
  where r.id=requested_request_id
  for update;

  if target.id is null then
    raise exception 'Connection request not found.' using errcode='P0002';
  end if;
  if target.requester_id <> actor_id then
    raise exception 'Only the requester may cancel this request.' using errcode='42501';
  end if;
  if target.status <> 'pending' then
    raise exception 'Only a pending request may be cancelled.' using errcode='22023';
  end if;

  update public.connection_requests
     set status='cancelled',responded_at=now()
   where id=target.id;

  return query select target.id,'cancelled'::text;
end;
$$;

create or replace function private.remove_connection(requested_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  removed integer := 0;
begin
  if actor_id is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;
  if requested_user_id is null or requested_user_id=actor_id then
    raise exception 'A different connected user is required.' using errcode='22023';
  end if;
  if not exists (
    select 1 from public.user_connections c
    where (c.user_id=actor_id and c.connected_user_id=requested_user_id)
       or (c.user_id=requested_user_id and c.connected_user_id=actor_id)
  ) then
    raise exception 'Connection not found.' using errcode='P0002';
  end if;

  delete from public.user_connections c
   where (c.user_id=actor_id and c.connected_user_id=requested_user_id)
      or (c.user_id=requested_user_id and c.connected_user_id=actor_id);
  get diagnostics removed = row_count;
  return removed > 0;
end;
$$;

revoke all on function private.send_connection_request(uuid,text) from public,anon,authenticated;
revoke all on function private.respond_to_connection_request(uuid,text) from public,anon,authenticated;
revoke all on function private.cancel_connection_request(uuid) from public,anon,authenticated;
revoke all on function private.remove_connection(uuid) from public,anon,authenticated;
grant execute on function private.send_connection_request(uuid,text) to authenticated;
grant execute on function private.respond_to_connection_request(uuid,text) to authenticated;
grant execute on function private.cancel_connection_request(uuid) to authenticated;
grant execute on function private.remove_connection(uuid) to authenticated;

create or replace function public.send_connection_request(requested_recipient_id uuid,requested_message text default null)
returns table(request_id uuid,request_status text)
language sql security invoker set search_path=''
as $$ select * from private.send_connection_request(requested_recipient_id,requested_message); $$;

create or replace function public.respond_to_connection_request(requested_request_id uuid,requested_decision text)
returns table(request_id uuid,request_status text)
language sql security invoker set search_path=''
as $$ select * from private.respond_to_connection_request(requested_request_id,requested_decision); $$;

create or replace function public.cancel_connection_request(requested_request_id uuid)
returns table(request_id uuid,request_status text)
language sql security invoker set search_path=''
as $$ select * from private.cancel_connection_request(requested_request_id); $$;

create or replace function public.remove_connection(requested_user_id uuid)
returns boolean
language sql security invoker set search_path=''
as $$ select private.remove_connection(requested_user_id); $$;

revoke all on function public.send_connection_request(uuid,text) from public,anon;
revoke all on function public.respond_to_connection_request(uuid,text) from public,anon;
revoke all on function public.cancel_connection_request(uuid) from public,anon;
revoke all on function public.remove_connection(uuid) from public,anon;
grant execute on function public.send_connection_request(uuid,text) to authenticated;
grant execute on function public.respond_to_connection_request(uuid,text) to authenticated;
grant execute on function public.cancel_connection_request(uuid) to authenticated;
grant execute on function public.remove_connection(uuid) to authenticated;

comment on table public.connection_requests is
  'Canonical Network request lifecycle. Relationship mutations are governed by Network RPCs; authenticated clients receive participant-scoped reads only.';
comment on table public.user_connections is
  'Canonical reciprocal Network connection edges. Accepted requests create both directions atomically through governed Network authority.';
comment on function public.respond_to_connection_request(uuid,text) is
  'Recipient-only Network response boundary. Accept atomically records the request decision and both reciprocal connection edges.';
