-- Phase 7 Messaging Block User authority.
-- Converges the conversation-local blocked_at control on canonical user_blocks,
-- preserves message history, and enforces a bilateral one-to-one Messaging barrier.

alter table public.user_blocks enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid='public.user_blocks'::regclass
      and conname='user_blocks_blocker_profile_fkey'
  ) then
    alter table public.user_blocks
      add constraint user_blocks_blocker_profile_fkey
      foreign key (blocker_id) references public.profiles(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid='public.user_blocks'::regclass
      and conname='user_blocks_blocked_profile_fkey'
  ) then
    alter table public.user_blocks
      add constraint user_blocks_blocked_profile_fkey
      foreign key (blocked_user_id) references public.profiles(id) on delete cascade;
  end if;
end $$;

create index if not exists user_blocks_blocked_user_idx
  on public.user_blocks(blocked_user_id,blocker_id);

-- Preserve historical intent before retiring conversation-local Block User state.
with legacy_direct_blocks as (
  select
    p.user_id as blocker_id,
    case
      when c.conversation_kind='network' and c.network_peer_a_id=p.user_id then c.network_peer_b_id
      when c.conversation_kind='network' and c.network_peer_b_id=p.user_id then c.network_peer_a_id
      when c.conversation_kind='support' and c.scholar_id=p.user_id then coalesce(
        r.supporter_id,
        (
          select u.id from auth.users u
          where r.supporter_email is not null and lower(u.email)=lower(r.supporter_email)
          order by u.created_at,u.id
          limit 1
        )
      )
      when c.conversation_kind='support' then c.scholar_id
      else null
    end as blocked_user_id,
    p.blocked_at as created_at
  from public.pbos_conversation_participants p
  join public.pbos_conversations c on c.id=p.conversation_id
  left join public.support_relationships r
    on c.conversation_kind='support' and r.id=c.relationship_id
  where p.blocked_at is not null
    and c.conversation_kind in ('support','network')
)
insert into public.user_blocks(blocker_id,blocked_user_id,created_at)
select blocker_id,blocked_user_id,created_at
from legacy_direct_blocks
where blocked_user_id is not null
  and blocker_id<>blocked_user_id
  and exists(select 1 from public.profiles p where p.id=blocker_id)
  and exists(select 1 from public.profiles p where p.id=blocked_user_id)
on conflict(blocker_id,blocked_user_id) do nothing;

-- A former whole-group Block action is semantically a mute, not a user block.
update public.pbos_conversation_participants p
set muted_at=coalesce(p.muted_at,p.blocked_at), blocked_at=null
from public.pbos_conversations c
where c.id=p.conversation_id
  and c.conversation_kind='group'
  and p.blocked_at is not null;

update public.pbos_conversation_participants p
set blocked_at=null
from public.pbos_conversations c
where c.id=p.conversation_id
  and c.conversation_kind in ('support','network')
  and p.blocked_at is not null;

revoke all on table public.user_blocks from public,anon,authenticated;
grant select on table public.user_blocks to authenticated;

drop policy if exists "Users manage own blocks" on public.user_blocks;
drop policy if exists "Users view own blocks" on public.user_blocks;
create policy "Users view own blocks"
on public.user_blocks
for select
to authenticated
using (blocker_id=(select auth.uid()));

-- Participant state remains self-owned, but Block User no longer mutates this table.
revoke all on table public.pbos_conversation_participants from anon;
revoke all on table public.pbos_conversation_participants from authenticated;
grant select,insert on table public.pbos_conversation_participants to authenticated;
grant update(last_read_at,muted_at) on table public.pbos_conversation_participants to authenticated;

create or replace function private.user_block_exists(p_user_a uuid,p_user_b uuid)
returns boolean
language sql
stable
security definer
set search_path=''
as $$
  select p_user_a is not null
    and p_user_b is not null
    and p_user_a<>p_user_b
    and exists (
      select 1 from public.user_blocks ub
      where (ub.blocker_id=p_user_a and ub.blocked_user_id=p_user_b)
         or (ub.blocker_id=p_user_b and ub.blocked_user_id=p_user_a)
    );
$$;

create or replace function private.pbos_conversation_peer_id(
  p_conversation_id uuid,
  p_actor_id uuid default auth.uid()
)
returns uuid
language plpgsql
stable
security definer
set search_path=''
as $$
declare
  target public.pbos_conversations%rowtype;
  relationship public.support_relationships%rowtype;
  peer_id uuid;
begin
  if p_conversation_id is null or p_actor_id is null then return null; end if;
  if not private.pbos_user_has_active_conversation_access(p_conversation_id,p_actor_id) then return null; end if;

  select * into target from public.pbos_conversations where id=p_conversation_id and status='ACTIVE';
  if not found then return null; end if;

  if target.conversation_kind='network' then
    if target.network_peer_a_id=p_actor_id then return target.network_peer_b_id; end if;
    if target.network_peer_b_id=p_actor_id then return target.network_peer_a_id; end if;
    return null;
  end if;

  if target.conversation_kind='support' then
    select * into relationship from public.support_relationships where id=target.relationship_id and status='active';
    if not found then return null; end if;
    if target.scholar_id=p_actor_id then
      peer_id := relationship.supporter_id;
      if peer_id is null and relationship.supporter_email is not null then
        select u.id into peer_id
        from auth.users u
        where lower(u.email)=lower(relationship.supporter_email)
        order by u.created_at,u.id
        limit 1;
      end if;
      return peer_id;
    end if;
    return target.scholar_id;
  end if;

  -- Group conversations are multi-party and do not have one Block User peer.
  return null;
end;
$$;

create or replace function private.pbos_conversation_has_active_user_block(
  p_conversation_id uuid,
  p_actor_id uuid default auth.uid()
)
returns boolean
language plpgsql
stable
security definer
set search_path=''
as $$
declare peer_id uuid;
begin
  peer_id := private.pbos_conversation_peer_id(p_conversation_id,p_actor_id);
  if peer_id is null then return false; end if;
  return private.user_block_exists(p_actor_id,peer_id);
end;
$$;

create or replace function private.set_user_block(
  requested_user_id uuid,
  requested_blocked boolean
)
returns boolean
language plpgsql
security definer
set search_path=''
as $$
declare actor_id uuid:=auth.uid();
begin
  if actor_id is null then raise exception 'Authentication required.' using errcode='42501'; end if;
  if requested_user_id is null or requested_user_id=actor_id then
    raise exception 'A different Playbook user is required.' using errcode='22023';
  end if;
  if requested_blocked is null then raise exception 'Block state is required.' using errcode='22023'; end if;
  if not exists(select 1 from public.profiles p where p.id=requested_user_id) then
    raise exception 'Playbook user not found.' using errcode='P0002';
  end if;

  if requested_blocked then
    insert into public.user_blocks(blocker_id,blocked_user_id)
    values(actor_id,requested_user_id)
    on conflict(blocker_id,blocked_user_id) do nothing;
  else
    delete from public.user_blocks
    where blocker_id=actor_id and blocked_user_id=requested_user_id;
  end if;

  -- Remove any stale rollout-era local state; canonical user_blocks now owns the decision.
  update public.pbos_conversation_participants p
  set blocked_at=null
  from public.pbos_conversations c
  where c.id=p.conversation_id
    and p.user_id=actor_id
    and c.conversation_kind in ('support','network')
    and p.blocked_at is not null;

  return requested_blocked;
end;
$$;

create or replace function private.get_governed_conversation_block_states(
  requested_conversation_ids uuid[]
)
returns table(
  conversation_id uuid,
  peer_id uuid,
  blocked_by_me boolean,
  blocked_by_peer boolean,
  messaging_blocked boolean
)
language plpgsql
stable
security definer
set search_path=''
as $$
declare actor_id uuid:=auth.uid();
begin
  if actor_id is null then raise exception 'Authentication required.' using errcode='42501'; end if;
  if requested_conversation_ids is null or coalesce(cardinality(requested_conversation_ids),0)=0 then return; end if;
  if cardinality(requested_conversation_ids)>100 then
    raise exception 'At most 100 conversation IDs may be inspected.' using errcode='22023';
  end if;

  return query
  with requested as (
    select distinct unnest(requested_conversation_ids) as id
  ), resolved as (
    select r.id as conversation_id,
      private.pbos_conversation_peer_id(r.id,actor_id) as peer_id
    from requested r
  )
  select resolved.conversation_id,
    resolved.peer_id,
    exists(
      select 1 from public.user_blocks ub
      where ub.blocker_id=actor_id and ub.blocked_user_id=resolved.peer_id
    ) as blocked_by_me,
    exists(
      select 1 from public.user_blocks ub
      where ub.blocker_id=resolved.peer_id and ub.blocked_user_id=actor_id
    ) as blocked_by_peer,
    private.user_block_exists(actor_id,resolved.peer_id) as messaging_blocked
  from resolved
  where resolved.peer_id is not null;
end;
$$;

revoke all on function private.user_block_exists(uuid,uuid) from public,anon,authenticated;
revoke all on function private.pbos_conversation_peer_id(uuid,uuid) from public,anon,authenticated;
revoke all on function private.pbos_conversation_has_active_user_block(uuid,uuid) from public,anon,authenticated;
revoke all on function private.set_user_block(uuid,boolean) from public,anon,authenticated;
revoke all on function private.get_governed_conversation_block_states(uuid[]) from public,anon,authenticated;
-- RLS and invoker wrappers need only these private entrypoints.
grant execute on function private.pbos_conversation_has_active_user_block(uuid,uuid) to authenticated;
grant execute on function private.set_user_block(uuid,boolean) to authenticated;
grant execute on function private.get_governed_conversation_block_states(uuid[]) to authenticated;

create or replace function public.set_user_block(
  requested_user_id uuid,
  requested_blocked boolean
)
returns boolean
language sql
security invoker
set search_path=''
as $$ select private.set_user_block(requested_user_id,requested_blocked); $$;

create or replace function public.get_governed_conversation_block_states(
  requested_conversation_ids uuid[]
)
returns table(
  conversation_id uuid,
  peer_id uuid,
  blocked_by_me boolean,
  blocked_by_peer boolean,
  messaging_blocked boolean
)
language sql
stable
security invoker
set search_path=''
as $$
  select * from private.get_governed_conversation_block_states(requested_conversation_ids);
$$;

revoke all on function public.set_user_block(uuid,boolean) from public,anon,authenticated;
revoke all on function public.get_governed_conversation_block_states(uuid[]) from public,anon,authenticated;
grant execute on function public.set_user_block(uuid,boolean) to authenticated;
grant execute on function public.get_governed_conversation_block_states(uuid[]) to authenticated;

-- Legacy compatibility messaging authority now respects canonical bilateral blocks.
create or replace function private.can_message(p_recipient_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path='pg_catalog,public,private'
as $$
declare
  sender_role public.member_role;
  recipient_role public.member_role;
begin
  if auth.uid() is null or p_recipient_id is null or p_recipient_id=auth.uid() then return false; end if;
  if private.user_block_exists(auth.uid(),p_recipient_id) then return false; end if;

  select role into sender_role from public.profiles where id=auth.uid();
  select role into recipient_role from public.profiles where id=p_recipient_id;
  if sender_role is null or recipient_role is null then return false; end if;
  if sender_role='coach' and recipient_role='scholar_athlete' then return false; end if;
  if sender_role='scholar_athlete' and recipient_role='coach' then return false; end if;
  return true;
end;
$$;
revoke all on function private.can_message(uuid) from public,anon,authenticated;
grant execute on function private.can_message(uuid) to authenticated;

-- Existing Network history remains openable; a block prevents creating a new thread and all new sends.
create or replace function private.ensure_network_conversation(requested_peer_id uuid)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid:=auth.uid();
  peer_a uuid;
  peer_b uuid;
  resolved_conversation_id uuid;
begin
  if actor_id is null then raise exception 'Authentication required.' using errcode='42501'; end if;
  if requested_peer_id is null or requested_peer_id=actor_id then
    raise exception 'A different connected peer is required.' using errcode='22023';
  end if;
  if not exists (
    select 1 from public.user_connections uc
    where (uc.user_id=actor_id and uc.connected_user_id=requested_peer_id)
       or (uc.user_id=requested_peer_id and uc.connected_user_id=actor_id)
  ) then raise exception 'An active Network connection is required.' using errcode='42501'; end if;

  if actor_id::text<requested_peer_id::text then peer_a:=actor_id; peer_b:=requested_peer_id;
  else peer_a:=requested_peer_id; peer_b:=actor_id; end if;

  select c.id into resolved_conversation_id
  from public.pbos_conversations c
  where c.conversation_kind='network'
    and c.network_peer_a_id=peer_a and c.network_peer_b_id=peer_b;

  if resolved_conversation_id is null and private.user_block_exists(actor_id,requested_peer_id) then
    raise exception 'Messaging is unavailable between these users.' using errcode='42501';
  end if;

  if resolved_conversation_id is null then
    begin
      insert into public.pbos_conversations(
        conversation_kind,relationship_id,scholar_id,network_peer_a_id,network_peer_b_id,status,created_by
      ) values('network',null,null,peer_a,peer_b,'ACTIVE',actor_id)
      returning id into resolved_conversation_id;
    exception when unique_violation then
      select c.id into resolved_conversation_id from public.pbos_conversations c
      where c.conversation_kind='network' and c.network_peer_a_id=peer_a and c.network_peer_b_id=peer_b;
    end;
  end if;

  insert into public.pbos_conversation_participants(conversation_id,user_id,role)
  values(resolved_conversation_id,peer_a,'network_peer'),(resolved_conversation_id,peer_b,'network_peer')
  on conflict(conversation_id,user_id) do nothing;
  return resolved_conversation_id;
end;
$$;
revoke all on function private.ensure_network_conversation(uuid) from public,anon,authenticated;
grant execute on function private.ensure_network_conversation(uuid) to authenticated;

-- Message creation is canonical and fails closed whenever either direct participant has blocked the other.
drop policy if exists "Governed participants send messages" on public.pbos_messages;
create policy "Governed participants send messages"
on public.pbos_messages
for insert
to authenticated
with check (
  sender_id=(select auth.uid())
  and private.pbos_user_has_active_conversation_access(conversation_id,(select auth.uid()))
  and not private.pbos_conversation_has_active_user_block(conversation_id,(select auth.uid()))
  and exists (
    select 1 from public.pbos_conversations c
    where c.id=pbos_messages.conversation_id
      and (
        (c.conversation_kind='support' and pbos_messages.scholar_id=c.scholar_id)
        or (c.conversation_kind in ('network','group') and pbos_messages.scholar_id is null)
      )
  )
  and exists (
    select 1 from public.pbos_conversation_participants p
    where p.conversation_id=pbos_messages.conversation_id
      and p.user_id=(select auth.uid())
  )
);

-- Staging and binding new attachments follows the same send barrier; history and cleanup remain available.
drop policy if exists "Current participants stage message attachments" on public.pbos_message_attachments;
create policy "Current participants stage message attachments"
on public.pbos_message_attachments
for insert
to authenticated
with check (
  uploader_id=(select auth.uid())
  and message_id is null
  and private.pbos_user_has_active_conversation_access(conversation_id,(select auth.uid()))
  and not private.pbos_conversation_has_active_user_block(conversation_id,(select auth.uid()))
);

drop policy if exists "Uploaders attach staged message attachments" on public.pbos_message_attachments;
create policy "Uploaders attach staged message attachments"
on public.pbos_message_attachments
for update
to authenticated
using (
  uploader_id=(select auth.uid())
  and message_id is null
  and private.pbos_user_has_active_conversation_access(conversation_id,(select auth.uid()))
  and not private.pbos_conversation_has_active_user_block(conversation_id,(select auth.uid()))
)
with check (
  uploader_id=(select auth.uid())
  and message_id is not null
  and private.pbos_user_has_active_conversation_access(conversation_id,(select auth.uid()))
  and not private.pbos_conversation_has_active_user_block(conversation_id,(select auth.uid()))
  and exists (
    select 1 from public.pbos_messages m
    where m.id=pbos_message_attachments.message_id
      and m.conversation_id=pbos_message_attachments.conversation_id
      and m.sender_id=(select auth.uid())
  )
);

drop policy if exists "Current participants upload message attachments" on storage.objects;
create policy "Current participants upload message attachments"
on storage.objects
for insert
to authenticated
with check (
  bucket_id='pbos-message-attachments'
  and split_part(name,'/',2)=(select auth.uid())::text
  and exists (
    select 1 from public.pbos_conversations c
    where c.id::text=split_part(storage.objects.name,'/',1)
      and private.pbos_user_has_active_conversation_access(c.id,(select auth.uid()))
      and not private.pbos_conversation_has_active_user_block(c.id,(select auth.uid()))
  )
);

-- Recheck block state at finalization so a block created after staging still wins.
create or replace function public.finalize_governed_message_delivery(
  p_message_id uuid,
  p_provenance jsonb
)
returns public.pbos_messages
language plpgsql
security definer
set search_path='public,private,pg_temp'
as $$
declare
  actor_id uuid:=auth.uid();
  target public.pbos_messages;
begin
  if actor_id is null then raise exception 'Authentication required.' using errcode='42501'; end if;
  if p_message_id is null then raise exception 'Message ID is required.' using errcode='22023'; end if;
  if p_provenance is null or jsonb_typeof(p_provenance)<>'array' then
    raise exception 'Message provenance must be a JSON array.' using errcode='22023';
  end if;
  select * into target from public.pbos_messages where id=p_message_id;
  if not found then raise exception 'Message not found.' using errcode='P0002'; end if;
  if target.sender_id<>actor_id then raise exception 'Only the original sender may finalize delivery.' using errcode='42501'; end if;
  if not private.pbos_user_has_active_conversation_access(target.conversation_id,actor_id) then
    raise exception 'Current conversation authority required.' using errcode='42501';
  end if;
  if private.pbos_conversation_has_active_user_block(target.conversation_id,actor_id) then
    raise exception 'Messaging is unavailable between these users.' using errcode='42501';
  end if;
  if target.delivery_state not in ('PENDING','DELIVERED') then
    raise exception 'Message is not eligible for delivery finalization.' using errcode='22023';
  end if;
  update public.pbos_messages
  set delivery_state='DELIVERED',provenance=p_provenance
  where id=p_message_id
  returning * into target;
  return target;
end;
$$;
revoke all on function public.finalize_governed_message_delivery(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.finalize_governed_message_delivery(uuid,jsonb) to authenticated;

comment on table public.user_blocks is
  'Canonical directional user block records. Either direction creates a bilateral one-to-one Messaging barrier.';
comment on function public.set_user_block(uuid,boolean) is
  'Authenticated blocker-owned mutation for the canonical Trust & Safety user block record.';
comment on function public.get_governed_conversation_block_states(uuid[]) is
  'Privacy-minimized direct/support conversation block projection for the current authenticated participant.';
