-- Governed Network notification producers.
-- connection_requests is already non-client-mutable; this trigger translates
-- canonical lifecycle changes into the shared PBOS notification outbox.

create or replace function private.notify_network_connection_lifecycle()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if tg_op='INSERT' and new.status='pending' then
    perform private.enqueue_notification_event(
      new.recipient_id,
      'network:connection-request:'||new.id::text||':pending',
      'invitation',
      'New connection request',
      'A Playbook member wants to connect with you.',
      '/connections',
      'medium'
    );
    return new;
  end if;

  if tg_op='UPDATE' and old.status is distinct from new.status then
    if new.status='accepted' then
      perform private.enqueue_notification_event(
        new.requester_id,
        'network:connection-request:'||new.id::text||':accepted',
        'shared_action',
        'Connection request accepted',
        'Your Playbook connection request was accepted.',
        '/connections',
        'medium'
      );
    elsif new.status='declined' then
      perform private.enqueue_notification_event(
        new.requester_id,
        'network:connection-request:'||new.id::text||':declined',
        'shared_action',
        'Connection request update',
        'Your Playbook connection request was declined.',
        '/connections',
        'low'
      );
    end if;
  end if;
  return new;
end;
$$;

revoke all on function private.notify_network_connection_lifecycle() from public,anon,authenticated;

drop trigger if exists network_connection_lifecycle_notification on public.connection_requests;
create trigger network_connection_lifecycle_notification
after insert or update of status on public.connection_requests
for each row execute function private.notify_network_connection_lifecycle();

comment on function private.notify_network_connection_lifecycle() is
  'Trusted producer translating governed Network request lifecycle changes into idempotent shared notification outbox events.';