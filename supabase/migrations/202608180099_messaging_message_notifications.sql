-- Phase 7 Messaging Message Notifications.
-- Enqueue trusted PBOS notification events only when a governed message becomes DELIVERED.
-- Delivery preferences and PBOS publication remain owned by the canonical Notifications service.

create or replace function private.notify_delivered_message()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
  c public.pbos_conversations%rowtype;
  r public.support_relationships%rowtype;
  recipient_id uuid;
  notification_title text;
  notification_body text := 'You have a new message in Playbook.';
  notification_href text := '/messages';
begin
  if new.delivery_state <> 'DELIVERED' or old.delivery_state = 'DELIVERED' then
    return new;
  end if;

  select * into c from public.pbos_conversations where id=new.conversation_id and status='ACTIVE';
  if not found then return new; end if;

  notification_title := case c.conversation_kind
    when 'network' then 'New Network message'
    when 'group' then 'New group message'
    else 'New support message'
  end;

  if c.conversation_kind='network' then
    if not exists (
      select 1 from public.user_connections uc
      where (uc.user_id=c.network_peer_a_id and uc.connected_user_id=c.network_peer_b_id)
         or (uc.user_id=c.network_peer_b_id and uc.connected_user_id=c.network_peer_a_id)
    ) then return new; end if;

    recipient_id := case when new.sender_id=c.network_peer_a_id then c.network_peer_b_id else c.network_peer_a_id end;
    if recipient_id is not null and recipient_id <> new.sender_id then
      perform private.enqueue_notification_event(
        recipient_id,
        'message:'||new.id::text,
        'message',
        notification_title,
        notification_body,
        '/messages?peer='||new.sender_id::text,
        'medium'
      );
    end if;
    return new;
  end if;

  if c.conversation_kind='group' then
    for recipient_id in
      select gm.profile_id from public.group_members gm
      where gm.group_id=c.group_id and gm.profile_id<>new.sender_id
    loop
      perform private.enqueue_notification_event(
        recipient_id,
        'message:'||new.id::text,
        'message',
        notification_title,
        notification_body,
        '/messages?group='||c.group_id::text,
        'medium'
      );
    end loop;
    return new;
  end if;

  -- Support conversations use the active support relationship as recipient authority.
  select * into r from public.support_relationships where id=c.relationship_id and status='active';
  if not found then return new; end if;

  if c.scholar_id is not null and c.scholar_id<>new.sender_id then
    perform private.enqueue_notification_event(
      c.scholar_id,'message:'||new.id::text,'message',notification_title,notification_body,'/messages','medium'
    );
  end if;

  if r.supporter_id is not null and r.supporter_id<>new.sender_id then
    perform private.enqueue_notification_event(
      r.supporter_id,'message:'||new.id::text,'message',notification_title,notification_body,'/messages','medium'
    );
  elsif r.supporter_email is not null then
    select u.id into recipient_id
    from auth.users u
    where lower(u.email)=lower(r.supporter_email)
      and u.id<>new.sender_id
    order by u.created_at asc
    limit 1;
    if recipient_id is not null then
      perform private.enqueue_notification_event(
        recipient_id,'message:'||new.id::text,'message',notification_title,notification_body,'/messages','medium'
      );
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.notify_delivered_message() from public,anon,authenticated;

drop trigger if exists governed_message_notification on public.pbos_messages;
create trigger governed_message_notification
after update of delivery_state on public.pbos_messages
for each row
when (new.delivery_state='DELIVERED' and old.delivery_state is distinct from new.delivery_state)
execute function private.notify_delivered_message();

comment on function private.notify_delivered_message() is
  'Trusted Messaging producer: enqueues one canonical PBOS message notification per current recipient after delivery finalization.';
