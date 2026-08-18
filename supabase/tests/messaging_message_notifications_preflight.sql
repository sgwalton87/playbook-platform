\set ON_ERROR_STOP on

begin;

do $$
begin
  if to_regprocedure('private.notify_delivered_message()') is null then
    raise exception 'Message notification producer missing';
  end if;
  if has_function_privilege('anon','private.notify_delivered_message()','EXECUTE')
     or has_function_privilege('authenticated','private.notify_delivered_message()','EXECUTE') then
    raise exception 'Message notification trigger function must not be client callable';
  end if;
  if not exists (
    select 1 from pg_trigger t
    join pg_class c on c.oid=t.tgrelid
    join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relname='pbos_messages'
      and t.tgname='governed_message_notification' and not t.tgisinternal
  ) then
    raise exception 'Message notification trigger missing';
  end if;
end $$;

create temporary table notification_ids(
  support_sender uuid,
  support_recipient uuid,
  support_conversation uuid,
  support_message uuid,
  network_sender uuid,
  network_recipient uuid,
  network_conversation uuid,
  network_message uuid,
  group_sender uuid,
  group_recipient uuid,
  group_revoked uuid,
  group_id uuid,
  group_conversation uuid,
  group_message uuid
) on commit drop;

do $$
declare
  ss uuid:=gen_random_uuid(); sr uuid:=gen_random_uuid();
  ns uuid:=gen_random_uuid(); nr uuid:=gen_random_uuid();
  gs uuid:=gen_random_uuid(); gr uuid:=gen_random_uuid(); gx uuid:=gen_random_uuid();
  rel uuid:=gen_random_uuid(); sc uuid:=gen_random_uuid(); sm uuid:=gen_random_uuid();
  nc uuid:=gen_random_uuid(); nm uuid:=gen_random_uuid();
  gid uuid:=gen_random_uuid(); gc uuid:=gen_random_uuid(); gm uuid:=gen_random_uuid();
begin
  insert into auth.users(id,email,created_at) values
    (ss,'message-notify-support-sender@example.invalid',now()),
    (sr,'message-notify-support-recipient@example.invalid',now()),
    (ns,'message-notify-network-sender@example.invalid',now()),
    (nr,'message-notify-network-recipient@example.invalid',now()),
    (gs,'message-notify-group-sender@example.invalid',now()),
    (gr,'message-notify-group-recipient@example.invalid',now()),
    (gx,'message-notify-group-revoked@example.invalid',now());
  insert into public.profiles(id,username,role) values
    (ss,'notify_support_sender','scholar'),(sr,'notify_support_recipient','mentor'),
    (ns,'notify_network_sender','scholar'),(nr,'notify_network_recipient','scholar'),
    (gs,'notify_group_sender','scholar'),(gr,'notify_group_recipient','scholar'),
    (gx,'notify_group_revoked','scholar');

  insert into public.support_relationships(
    id,scholar_id,supporter_id,supporter_email,supporter_name,relationship,permissions,status
  ) values(rel,ss,sr,'message-notify-support-recipient@example.invalid','Support Recipient','mentor','["messaging"]'::jsonb,'active');
  insert into public.pbos_conversations(
    id,conversation_kind,relationship_id,scholar_id,network_peer_a_id,network_peer_b_id,group_id,status,created_by
  ) values(sc,'support',rel,ss,null,null,null,'ACTIVE',ss);
  insert into public.pbos_messages(
    id,conversation_id,scholar_id,sender_id,body,idempotency_key,delivery_state,moderation_state,provenance
  ) values(sm,sc,ss,ss,'TOP SECRET SUPPORT BODY','notify-support-message','PENDING','VISIBLE','[]'::jsonb);

  insert into public.user_connections(user_id,connected_user_id) values(ns,nr),(nr,ns);
  insert into public.pbos_conversations(
    id,conversation_kind,relationship_id,scholar_id,network_peer_a_id,network_peer_b_id,group_id,status,created_by
  ) values(nc,'network',null,null,least(ns,nr),greatest(ns,nr),null,'ACTIVE',ns);
  insert into public.pbos_messages(
    id,conversation_id,scholar_id,sender_id,body,idempotency_key,delivery_state,moderation_state,provenance
  ) values(nm,nc,null,ns,'TOP SECRET NETWORK BODY','notify-network-message','PENDING','VISIBLE','[]'::jsonb);

  insert into public.groups(id,name,creator_id,is_private) values(gid,'Notification Group',gs,true);
  insert into public.group_members(group_id,profile_id,role) values
    (gid,gs,'owner'),(gid,gr,'member'),(gid,gx,'member');
  insert into public.pbos_conversations(
    id,conversation_kind,relationship_id,scholar_id,network_peer_a_id,network_peer_b_id,group_id,status,created_by
  ) values(gc,'group',null,null,null,null,gid,'ACTIVE',gs);
  insert into public.pbos_messages(
    id,conversation_id,scholar_id,sender_id,body,idempotency_key,delivery_state,moderation_state,provenance
  ) values(gm,gc,null,gs,'TOP SECRET GROUP BODY','notify-group-message','PENDING','VISIBLE','[]'::jsonb);

  -- Revoke one group member before delivery; they must not become a notification recipient.
  delete from public.group_members where group_id=gid and profile_id=gx;

  insert into notification_ids values(ss,sr,sc,sm,ns,nr,nc,nm,gs,gr,gx,gid,gc,gm);
end $$;

-- Only the trusted delivery transition produces notification outbox rows.
do $$
declare ids notification_ids%rowtype;
begin
  select * into ids from notification_ids;
  if exists(select 1 from public.pbos_notification_outbox where event_key in (
    'message:'||ids.support_message::text,'message:'||ids.network_message::text,'message:'||ids.group_message::text
  )) then raise exception 'Pending messages produced notifications before delivery'; end if;

  update public.pbos_messages set delivery_state='DELIVERED' where id in (ids.support_message,ids.network_message,ids.group_message);
end $$;

do $$
declare ids notification_ids%rowtype;
begin
  select * into ids from notification_ids;

  if (select count(*) from public.pbos_notification_outbox where owner_id=ids.support_recipient and event_key='message:'||ids.support_message::text) <> 1 then
    raise exception 'Support recipient notification missing or duplicated';
  end if;
  if (select count(*) from public.pbos_notification_outbox where owner_id=ids.network_recipient and event_key='message:'||ids.network_message::text) <> 1 then
    raise exception 'Network recipient notification missing or duplicated';
  end if;
  if (select count(*) from public.pbos_notification_outbox where owner_id=ids.group_recipient and event_key='message:'||ids.group_message::text) <> 1 then
    raise exception 'Current group recipient notification missing or duplicated';
  end if;
  if exists(select 1 from public.pbos_notification_outbox where owner_id in (ids.support_sender,ids.network_sender,ids.group_sender)) then
    raise exception 'A message sender received their own notification';
  end if;
  if exists(select 1 from public.pbos_notification_outbox where owner_id=ids.group_revoked and event_key='message:'||ids.group_message::text) then
    raise exception 'Revoked group member received a message notification';
  end if;

  if exists(
    select 1 from public.pbos_notification_outbox
    where event_key in ('message:'||ids.support_message::text,'message:'||ids.network_message::text,'message:'||ids.group_message::text)
      and (event_type<>'message' or event_payload->>'href' not like '/messages%')
  ) then raise exception 'Message notification event type or destination is incorrect'; end if;

  if exists(
    select 1 from public.pbos_notification_outbox
    where event_key in ('message:'||ids.support_message::text,'message:'||ids.network_message::text,'message:'||ids.group_message::text)
      and (event_payload::text ilike '%TOP SECRET%' or event_payload::text ilike '%BODY%')
  ) then raise exception 'Message body content leaked into notification payload'; end if;

  if exists(
    select 1 from public.notifications
    where reference_id in (ids.support_message,ids.network_message,ids.group_message)
  ) then raise exception 'Legacy notifications table received a Messaging write'; end if;
end $$;

-- Repeating DELIVERED without a state transition must not enqueue duplicates.
do $$
declare ids notification_ids%rowtype;
begin
  select * into ids from notification_ids;
  update public.pbos_messages set delivery_state='DELIVERED' where id in (ids.support_message,ids.network_message,ids.group_message);
  if (select count(*) from public.pbos_notification_outbox where event_key='message:'||ids.support_message::text) <> 1
     or (select count(*) from public.pbos_notification_outbox where event_key='message:'||ids.network_message::text) <> 1
     or (select count(*) from public.pbos_notification_outbox where event_key='message:'||ids.group_message::text) <> 1 then
    raise exception 'Message notification delivery is not idempotent';
  end if;
end $$;

rollback;
