-- Phase 7 Messaging Read Receipts.
-- Reuses participant.last_read_at as canonical state and exposes only aggregate
-- receipt counts; participant identities remain private.

create or replace function public.mark_governed_conversation_read(p_conversation_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = pg_catalog, public, private, auth
as $$
declare
  actor_id uuid := auth.uid();
  target public.pbos_conversations;
  read_at timestamptz := now();
  participant_role text;
begin
  if actor_id is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;
  if p_conversation_id is null then
    raise exception 'Conversation ID is required.' using errcode='22023';
  end if;
  if not private.pbos_user_has_active_conversation_access(p_conversation_id, actor_id) then
    raise exception 'Current conversation authority required.' using errcode='42501';
  end if;

  select * into target
  from public.pbos_conversations
  where id=p_conversation_id and status='ACTIVE';
  if not found then
    raise exception 'Conversation not found.' using errcode='P0002';
  end if;

  participant_role := case
    when target.conversation_kind='network' then 'network_peer'
    when target.conversation_kind='group' then 'group_member'
    when target.scholar_id=actor_id then 'scholar'
    else 'supporter'
  end;

  insert into public.pbos_conversation_participants(
    conversation_id,user_id,role,last_read_at
  ) values (
    p_conversation_id,actor_id,participant_role,read_at
  )
  on conflict(conversation_id,user_id) do update
    set last_read_at=excluded.last_read_at;

  return read_at;
end;
$$;

create or replace function public.get_governed_message_read_receipts(p_conversation_id uuid)
returns table(message_id uuid, read_count bigint)
language plpgsql
stable
security definer
set search_path = pg_catalog, public, private, auth
as $$
declare
  actor_id uuid := auth.uid();
begin
  if actor_id is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;
  if p_conversation_id is null then
    raise exception 'Conversation ID is required.' using errcode='22023';
  end if;
  if not private.pbos_user_has_active_conversation_access(p_conversation_id, actor_id) then
    raise exception 'Current conversation authority required.' using errcode='42501';
  end if;

  return query
  select m.id,
    count(p.user_id) filter (
      where p.user_id <> m.sender_id
        and p.last_read_at is not null
        and p.last_read_at >= m.created_at
        and (
          (
            c.conversation_kind='support'
            and r.status='active'
            and (
              p.user_id=c.scholar_id
              or p.user_id=r.supporter_id
              or exists (
                select 1 from auth.users u
                where u.id=p.user_id
                  and r.supporter_email is not null
                  and lower(u.email)=lower(r.supporter_email)
              )
            )
          )
          or
          (
            c.conversation_kind='network'
            and p.user_id in (c.network_peer_a_id,c.network_peer_b_id)
            and exists (
              select 1 from public.user_connections uc
              where (uc.user_id=c.network_peer_a_id and uc.connected_user_id=c.network_peer_b_id)
                 or (uc.user_id=c.network_peer_b_id and uc.connected_user_id=c.network_peer_a_id)
            )
          )
          or
          (
            c.conversation_kind='group'
            and exists (
              select 1 from public.group_members gm
              where gm.group_id=c.group_id and gm.profile_id=p.user_id
            )
          )
        )
    )::bigint as read_count
  from public.pbos_messages m
  join public.pbos_conversations c on c.id=m.conversation_id
  left join public.support_relationships r
    on c.conversation_kind='support' and r.id=c.relationship_id
  left join public.pbos_conversation_participants p
    on p.conversation_id=m.conversation_id
  where m.conversation_id=p_conversation_id
  group by m.id,m.created_at,m.sender_id
  order by m.created_at,m.id;
end;
$$;

revoke all on function public.mark_governed_conversation_read(uuid) from public,anon,authenticated;
grant execute on function public.mark_governed_conversation_read(uuid) to authenticated;
revoke all on function public.get_governed_message_read_receipts(uuid) from public,anon,authenticated;
grant execute on function public.get_governed_message_read_receipts(uuid) to authenticated;

comment on function public.mark_governed_conversation_read(uuid) is
  'Current-participant-only read-position update. Materializes the caller participant row when necessary.';
comment on function public.get_governed_message_read_receipts(uuid) is
  'Privacy-preserving aggregate read counts for messages in a currently authorized conversation.';