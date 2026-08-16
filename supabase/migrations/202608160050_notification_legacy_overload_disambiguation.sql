-- Remove legacy default arguments so PostgREST can resolve narrow notification RPCs unambiguously.
-- Legacy signatures remain available during rolling deployment, but callers must provide every legacy argument.

drop function if exists public.transition_notification_outbox(uuid,text,text,timestamptz);
create function public.transition_notification_outbox(
  requested_outbox_id uuid,
  requested_state text,
  requested_error text,
  requested_next_attempt_at timestamptz
)
returns void
language sql
security invoker
set search_path=''
as $$
  select private.transition_notification_outbox(requested_outbox_id,requested_state);
$$;

drop function if exists public.finalize_notification_delivery(uuid,text,jsonb);
create function public.finalize_notification_delivery(
  requested_outbox_id uuid,
  requested_priority text,
  requested_provenance jsonb
)
returns public.pbos_notifications
language sql
security invoker
set search_path=''
as $$
  select private.finalize_notification_delivery(requested_outbox_id);
$$;

revoke all on function public.transition_notification_outbox(uuid,text,text,timestamptz) from public,anon,authenticated;
revoke all on function public.finalize_notification_delivery(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.transition_notification_outbox(uuid,text,text,timestamptz) to authenticated;
grant execute on function public.finalize_notification_delivery(uuid,text,jsonb) to authenticated;
