\set ON_ERROR_STOP on

begin;

do $$
declare
  finalize_oid oid;
  report_oid oid;
begin
  select to_regprocedure('public.finalize_governed_message_delivery(uuid,jsonb)') into finalize_oid;
  select to_regprocedure('public.report_governed_message(uuid,uuid)') into report_oid;
  if finalize_oid is null then raise exception 'Missing finalize_governed_message_delivery'; end if;
  if report_oid is null then raise exception 'Missing report_governed_message'; end if;
  if not (select prosecdef from pg_proc where oid=finalize_oid) then raise exception 'Delivery finalizer must be SECURITY DEFINER'; end if;
  if not (select prosecdef from pg_proc where oid=report_oid) then raise exception 'Report mutation must be SECURITY DEFINER'; end if;
  if has_function_privilege('anon',finalize_oid,'EXECUTE') or has_function_privilege('anon',report_oid,'EXECUTE') then
    raise exception 'Anonymous users must not execute governed message mutations';
  end if;
  if not has_function_privilege('authenticated',finalize_oid,'EXECUTE') or not has_function_privilege('authenticated',report_oid,'EXECUTE') then
    raise exception 'Authenticated API role must reach governed message mutation entrypoints';
  end if;
end $$;

do $$
begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='pbos_messages' and cmd in ('UPDATE','ALL')) then
    raise exception 'Generic pbos_messages UPDATE RLS must be absent';
  end if;
  if has_table_privilege('authenticated','public.pbos_messages','UPDATE') then
    raise exception 'Authenticated role must not have generic message UPDATE';
  end if;
  if not has_table_privilege('authenticated','public.pbos_messages','SELECT')
     or not has_table_privilege('authenticated','public.pbos_messages','INSERT') then
    raise exception 'Authenticated message SELECT/INSERT grants are required';
  end if;
  if has_table_privilege('anon','public.pbos_messages','SELECT')
     or has_table_privilege('anon','public.pbos_messages','INSERT')
     or has_table_privilege('anon','public.pbos_messages','UPDATE')
     or has_table_privilege('anon','public.pbos_messages','DELETE') then
    raise exception 'Anonymous governed message grants must be absent';
  end if;
end $$;

create temporary table direct_message_ids(
  peer_a uuid,
  peer_b uuid,
  conversation_id uuid,
  message_id uuid
) on commit drop;
grant select,update on direct_message_ids to authenticated;

do $$
declare
  a uuid:=gen_random_uuid();
  b uuid:=gen_random_uuid();
begin
  insert into auth.users(id,email) values
    (a,'direct-message-a@example.invalid'),
    (b,'direct-message-b@example.invalid');
  insert into public.profiles(id,username,role) values
    (a,'direct_message_a','scholar'),
    (b,'direct_message_b','scholar');
  insert into public.user_connections(user_id,connected_user_id) values
    (a,b),(b,a);
  insert into direct_message_ids(peer_a,peer_b) values(a,b);
end $$;

-- Connected peer A can open the canonical Network conversation and insert a message.
set local role authenticated;
do $$
declare
  ids direct_message_ids%rowtype;
  cid uuid;
  mid uuid;
begin
  select * into ids from direct_message_ids;
  perform set_config('request.jwt.claim.sub',ids.peer_a::text,true);
  select public.ensure_network_conversation(ids.peer_b) into cid;
  if cid is null then raise exception 'Connected peer conversation was not created'; end if;

  insert into public.pbos_messages(
    conversation_id,scholar_id,sender_id,body,idempotency_key,delivery_state,moderation_state,provenance
  ) values (
    cid,null,ids.peer_a,'Canonical direct message','direct-message-preflight','PENDING','VISIBLE','[]'::jsonb
  ) returning id into mid;

  update direct_message_ids set conversation_id=cid,message_id=mid;

  begin
    update public.pbos_messages set body='recipient rewrite should fail' where id=mid;
    raise exception 'Direct client message UPDATE unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;

  perform public.finalize_governed_message_delivery(mid,'[{"source":"direct-message-preflight"}]'::jsonb);
  -- Idempotent retry is allowed for the original sender.
  perform public.finalize_governed_message_delivery(mid,'[{"source":"direct-message-preflight"}]'::jsonb);
end $$;
reset role;

-- Inspect finalization as the database test owner without widening API grants.
do $$
declare
  ids direct_message_ids%rowtype;
  saved public.pbos_messages;
begin
  select * into ids from direct_message_ids;
  select * into saved from public.pbos_messages where id=ids.message_id;
  if saved.body <> 'Canonical direct message' then raise exception 'Message body changed during delivery finalization'; end if;
  if saved.sender_id <> ids.peer_a then raise exception 'Message sender changed during delivery finalization'; end if;
  if saved.conversation_id <> ids.conversation_id then raise exception 'Message conversation changed during delivery finalization'; end if;
  if saved.delivery_state <> 'DELIVERED' then raise exception 'Message was not finalized as DELIVERED'; end if;
  if saved.provenance <> '[{"source":"direct-message-preflight"}]'::jsonb then raise exception 'Delivery provenance was not persisted'; end if;
  if saved.moderation_state <> 'VISIBLE' or saved.reported_at is not null then raise exception 'Delivery finalization changed moderation state'; end if;
end $$;

-- Connected peer B may report the message but cannot rewrite it.
set local role authenticated;
do $$
declare ids direct_message_ids%rowtype;
begin
  select * into ids from direct_message_ids;
  perform set_config('request.jwt.claim.sub',ids.peer_b::text,true);
  perform public.report_governed_message(ids.message_id,ids.conversation_id);
  perform public.report_governed_message(ids.message_id,ids.conversation_id);

  begin
    update public.pbos_messages set body='recipient rewrite should fail' where id=ids.message_id;
    raise exception 'Recipient rewrote another sender message';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

do $$
declare
  ids direct_message_ids%rowtype;
  saved public.pbos_messages;
begin
  select * into ids from direct_message_ids;
  select * into saved from public.pbos_messages where id=ids.message_id;
  if saved.body <> 'Canonical direct message' then raise exception 'Reporting changed message body'; end if;
  if saved.sender_id <> ids.peer_a then raise exception 'Reporting changed sender identity'; end if;
  if saved.delivery_state <> 'DELIVERED' then raise exception 'Reporting changed delivery state'; end if;
  if saved.moderation_state <> 'REPORTED' or saved.reported_at is null then raise exception 'Reporting state was not persisted'; end if;
end $$;

-- Removing the Network relationship immediately revokes conversation mutation authority.
do $$
declare ids direct_message_ids%rowtype;
begin
  select * into ids from direct_message_ids;
  delete from public.user_connections
  where (user_id=ids.peer_a and connected_user_id=ids.peer_b)
     or (user_id=ids.peer_b and connected_user_id=ids.peer_a);
end $$;

set local role authenticated;
do $$
declare ids direct_message_ids%rowtype; denied boolean:=false;
begin
  select * into ids from direct_message_ids;
  perform set_config('request.jwt.claim.sub',ids.peer_b::text,true);
  begin
    perform public.report_governed_message(ids.message_id,ids.conversation_id);
  exception when sqlstate '42501' then denied:=true;
  end;
  if not denied then raise exception 'Removed Network connection retained message mutation authority'; end if;
end $$;
reset role;

rollback;
