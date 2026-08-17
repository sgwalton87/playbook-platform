\set ON_ERROR_STOP on
begin;

do $$
declare
  trigger_count integer;
  body text;
begin
  select count(*) into trigger_count
  from pg_trigger
  where tgrelid='public.connection_requests'::regclass
    and tgname='network_connection_lifecycle_notification'
    and not tgisinternal;
  if trigger_count <> 1 then
    raise exception 'Expected exactly one governed Network notification trigger.';
  end if;

  if to_regprocedure('private.notify_network_connection_lifecycle()') is null then
    raise exception 'Network notification producer function is missing.';
  end if;

  select pg_get_functiondef('private.notify_network_connection_lifecycle()'::regprocedure) into body;
  if body !~ 'private.enqueue_notification_event'
     or body !~ 'network:connection-request:'
     or body !~ '''invitation'''
     or body !~ '''shared_action'''
     or body !~ '''/connections''' then
    raise exception 'Network notification producer must inherit the shared notification outbox and deep-link to Network.';
  end if;

  if has_function_privilege('authenticated','private.notify_network_connection_lifecycle()','EXECUTE')
     or has_function_privilege('anon','private.notify_network_connection_lifecycle()','EXECUTE') then
    raise exception 'Clients must not execute the trusted Network notification producer directly.';
  end if;
end;
$$;

insert into auth.users(id,email)
values
  ('00000000-0000-0000-0000-00000000f101','notify-requester@example.invalid'),
  ('00000000-0000-0000-0000-00000000f102','notify-recipient@example.invalid')
on conflict(id) do nothing;

insert into public.profiles(id,username,full_name,profile_visibility)
values
  ('00000000-0000-0000-0000-00000000f101','notify-requester','Notify Requester','public'),
  ('00000000-0000-0000-0000-00000000f102','notify-recipient','Notify Recipient','public')
on conflict(id) do update set username=excluded.username,full_name=excluded.full_name,profile_visibility=excluded.profile_visibility;

insert into public.connection_requests(id,requester_id,recipient_id,status)
values(
  '00000000-0000-0000-0000-00000000f103',
  '00000000-0000-0000-0000-00000000f101',
  '00000000-0000-0000-0000-00000000f102',
  'pending'
)
on conflict(id) do update set status='pending';

do $$
declare
  pending_count integer;
begin
  select count(*) into pending_count
  from public.pbos_notification_outbox
  where owner_id='00000000-0000-0000-0000-00000000f102'
    and event_key='network:connection-request:00000000-0000-0000-0000-00000000f103:pending'
    and event_type='invitation'
    and state='PENDING'
    and event_payload->>'href'='/connections';
  if pending_count <> 1 then
    raise exception 'Pending Network request must enqueue exactly one recipient invitation.';
  end if;
end;
$$;

update public.connection_requests
set status='accepted',responded_at=now()
where id='00000000-0000-0000-0000-00000000f103';

do $$
declare
  accepted_count integer;
begin
  select count(*) into accepted_count
  from public.pbos_notification_outbox
  where owner_id='00000000-0000-0000-0000-00000000f101'
    and event_key='network:connection-request:00000000-0000-0000-0000-00000000f103:accepted'
    and event_type='shared_action'
    and state='PENDING'
    and event_payload->>'href'='/connections';
  if accepted_count <> 1 then
    raise exception 'Accepted Network request must enqueue exactly one requester action notification.';
  end if;
end;
$$;

rollback;