-- Phase 7 Direct Messages authority hardening.
-- Preserve shared Messaging ownership while removing generic message-row UPDATE authority.

-- Message rows are immutable to normal clients after insert. Governed state transitions
-- occur only through narrow functions below.
drop policy if exists "Governed participants update messages" on public.pbos_messages;

create or replace function public.finalize_governed_message_delivery(
  p_message_id uuid,
  p_provenance jsonb
)
returns public.pbos_messages
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  target public.pbos_messages;
begin
  if actor_id is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;
  if p_message_id is null then
    raise exception 'Message ID is required.' using errcode='22023';
  end if;
  if p_provenance is null or jsonb_typeof(p_provenance) <> 'array' then
    raise exception 'Message provenance must be a JSON array.' using errcode='22023';
  end if;

  select * into target
  from public.pbos_messages
  where id = p_message_id;

  if not found then
    raise exception 'Message not found.' using errcode='P0002';
  end if;
  if target.sender_id <> actor_id then
    raise exception 'Only the original sender may finalize delivery.' using errcode='42501';
  end if;
  if not private.pbos_user_has_active_conversation_access(target.conversation_id, actor_id) then
    raise exception 'Current conversation authority required.' using errcode='42501';
  end if;
  if target.delivery_state not in ('PENDING','DELIVERED') then
    raise exception 'Message is not eligible for delivery finalization.' using errcode='22023';
  end if;

  update public.pbos_messages
  set delivery_state = 'DELIVERED',
      provenance = p_provenance
  where id = p_message_id
  returning * into target;

  return target;
end;
$$;

create or replace function public.report_governed_message(
  p_message_id uuid,
  p_conversation_id uuid
)
returns public.pbos_messages
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  target public.pbos_messages;
begin
  if actor_id is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;
  if p_message_id is null or p_conversation_id is null then
    raise exception 'Message and conversation IDs are required.' using errcode='22023';
  end if;
  if not private.pbos_user_has_active_conversation_access(p_conversation_id, actor_id) then
    raise exception 'Current conversation authority required.' using errcode='42501';
  end if;

  select * into target
  from public.pbos_messages
  where id = p_message_id
    and conversation_id = p_conversation_id;

  if not found then
    raise exception 'Message not found in conversation.' using errcode='P0002';
  end if;

  update public.pbos_messages
  set moderation_state = 'REPORTED',
      reported_at = coalesce(reported_at, now())
  where id = p_message_id
  returning * into target;

  return target;
end;
$$;

revoke all on function public.finalize_governed_message_delivery(uuid,jsonb) from public, anon, authenticated;
grant execute on function public.finalize_governed_message_delivery(uuid,jsonb) to authenticated;
revoke all on function public.report_governed_message(uuid,uuid) from public, anon, authenticated;
grant execute on function public.report_governed_message(uuid,uuid) to authenticated;

-- Remove legacy broad grants and expose only the normal client operations required
-- for Messaging. SECURITY DEFINER functions retain server-side mutation authority.
revoke all on table public.pbos_messages from public, anon, authenticated;
grant select, insert on table public.pbos_messages to authenticated;

comment on function public.finalize_governed_message_delivery(uuid,jsonb) is
  'Original-sender-only governed delivery finalization for shared Playbook Messaging.';
comment on function public.report_governed_message(uuid,uuid) is
  'Current-participant-only message reporting without generic message UPDATE authority.';