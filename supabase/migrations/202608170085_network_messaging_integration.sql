-- Phase 5 Network -> Messaging integration.
-- Reuses the canonical PBOS conversation/message service and preserves support messaging.

alter table public.pbos_conversations
  add column if not exists conversation_kind text not null default 'support',
  add column if not exists network_peer_a_id uuid,
  add column if not exists network_peer_b_id uuid;

alter table public.pbos_conversations alter column scholar_id drop not null;
alter table public.pbos_conversations alter column relationship_id drop not null;
alter table public.pbos_messages alter column scholar_id drop not null;

alter table public.pbos_conversations drop constraint if exists pbos_conversations_context_shape_check;
alter table public.pbos_conversations add constraint pbos_conversations_context_shape_check check (
  (
    conversation_kind='support'
    and relationship_id is not null
    and scholar_id is not null
    and network_peer_a_id is null
    and network_peer_b_id is null
  )
  or
  (
    conversation_kind='network'
    and relationship_id is null
    and scholar_id is null
    and network_peer_a_id is not null
    and network_peer_b_id is not null
    and network_peer_a_id <> network_peer_b_id
    and network_peer_a_id::text < network_peer_b_id::text
  )
);

create unique index if not exists pbos_conversations_network_pair_key
  on public.pbos_conversations(network_peer_a_id,network_peer_b_id)
  where conversation_kind='network';

create or replace function private.pbos_user_has_active_conversation_access(
  p_conversation_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.pbos_conversations c
    left join public.support_relationships r
      on c.conversation_kind='support' and r.id=c.relationship_id
    where c.id=p_conversation_id
      and c.status='ACTIVE'
      and (
        (
          c.conversation_kind='support'
          and r.status='active'
          and (
            c.scholar_id=p_user_id
            or r.supporter_id=p_user_id
            or (
              r.supporter_email is not null
              and lower(r.supporter_email)=lower(coalesce((select auth.jwt()) ->> 'email',''))
            )
          )
        )
        or
        (
          c.conversation_kind='network'
          and p_user_id in (c.network_peer_a_id,c.network_peer_b_id)
          and exists (
            select 1 from public.user_connections uc
            where (uc.user_id=c.network_peer_a_id and uc.connected_user_id=c.network_peer_b_id)
               or (uc.user_id=c.network_peer_b_id and uc.connected_user_id=c.network_peer_a_id)
          )
        )
      )
  );
$$;

revoke all on function private.pbos_user_has_active_conversation_access(uuid,uuid) from public,anon,authenticated;
grant execute on function private.pbos_user_has_active_conversation_access(uuid,uuid) to authenticated;

create or replace function private.ensure_network_conversation(requested_peer_id uuid)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  peer_a uuid;
  peer_b uuid;
  resolved_conversation_id uuid;
begin
  if actor_id is null then raise exception 'Authentication required.' using errcode='42501'; end if;
  if requested_peer_id is null or requested_peer_id=actor_id then raise exception 'A different connected peer is required.' using errcode='22023'; end if;

  if not exists (
    select 1 from public.user_connections uc
    where (uc.user_id=actor_id and uc.connected_user_id=requested_peer_id)
       or (uc.user_id=requested_peer_id and uc.connected_user_id=actor_id)
  ) then
    raise exception 'An active Network connection is required.' using errcode='42501';
  end if;

  if actor_id::text < requested_peer_id::text then peer_a:=actor_id; peer_b:=requested_peer_id;
  else peer_a:=requested_peer_id; peer_b:=actor_id; end if;

  select c.id into resolved_conversation_id
  from public.pbos_conversations c
  where c.conversation_kind='network'
    and c.network_peer_a_id=peer_a and c.network_peer_b_id=peer_b;

  if resolved_conversation_id is null then
    begin
      insert into public.pbos_conversations(
        conversation_kind,relationship_id,scholar_id,network_peer_a_id,network_peer_b_id,status,created_by
      ) values ('network',null,null,peer_a,peer_b,'ACTIVE',actor_id)
      returning id into resolved_conversation_id;
    exception when unique_violation then
      select c.id into resolved_conversation_id from public.pbos_conversations c
      where c.conversation_kind='network' and c.network_peer_a_id=peer_a and c.network_peer_b_id=peer_b;
    end;
  end if;

  insert into public.pbos_conversation_participants(conversation_id,user_id,role)
  values (resolved_conversation_id,peer_a,'network_peer'),(resolved_conversation_id,peer_b,'network_peer')
  on conflict (conversation_id,user_id) do nothing;

  return resolved_conversation_id;
end;
$$;

revoke all on function private.ensure_network_conversation(uuid) from public,anon,authenticated;
grant execute on function private.ensure_network_conversation(uuid) to authenticated;

create or replace function public.ensure_network_conversation(requested_peer_id uuid)
returns uuid
language sql
volatile
security invoker
set search_path=''
as $$ select private.ensure_network_conversation(requested_peer_id); $$;
revoke all on function public.ensure_network_conversation(uuid) from public,anon;
grant execute on function public.ensure_network_conversation(uuid) to authenticated;

-- Conversation creation remains support-only through direct table DML.
-- Network conversations are created only through ensure_network_conversation().
drop policy if exists "Governed participants view conversations" on public.pbos_conversations;
create policy "Governed participants view conversations" on public.pbos_conversations
for select to authenticated
using (private.pbos_user_has_active_conversation_access(id,(select auth.uid())));

drop policy if exists "Governed actors create conversations" on public.pbos_conversations;
create policy "Governed actors create conversations" on public.pbos_conversations
for insert to authenticated
with check (
  conversation_kind='support'
  and created_by=(select auth.uid())
  and exists (
    select 1 from public.support_relationships r
    where r.id=relationship_id and r.status='active'
      and (
        scholar_id=(select auth.uid())
        or r.supporter_id=(select auth.uid())
        or (
          r.supporter_email is not null
          and lower(r.supporter_email)=lower(coalesce((select auth.jwt()) ->> 'email',''))
        )
      )
  )
);

drop policy if exists "Participants view their state" on public.pbos_conversation_participants;
create policy "Participants view their state" on public.pbos_conversation_participants
for select to authenticated
using (user_id=(select auth.uid()) and private.pbos_user_has_active_conversation_access(conversation_id,(select auth.uid())));

drop policy if exists "Authorized actors join conversations" on public.pbos_conversation_participants;
create policy "Authorized actors join conversations" on public.pbos_conversation_participants
for insert to authenticated
with check (user_id=(select auth.uid()) and private.pbos_user_has_active_conversation_access(conversation_id,(select auth.uid())));

drop policy if exists "Participants update their state" on public.pbos_conversation_participants;
create policy "Participants update their state" on public.pbos_conversation_participants
for update to authenticated
using (user_id=(select auth.uid()) and private.pbos_user_has_active_conversation_access(conversation_id,(select auth.uid())))
with check (user_id=(select auth.uid()) and private.pbos_user_has_active_conversation_access(conversation_id,(select auth.uid())));

drop policy if exists "Governed participants view messages" on public.pbos_messages;
create policy "Governed participants view messages" on public.pbos_messages
for select to authenticated
using (private.pbos_user_has_active_conversation_access(conversation_id,(select auth.uid())));

drop policy if exists "Governed participants send messages" on public.pbos_messages;
create policy "Governed participants send messages" on public.pbos_messages
for insert to authenticated
with check (
  sender_id=(select auth.uid())
  and private.pbos_user_has_active_conversation_access(conversation_id,(select auth.uid()))
  and exists (
    select 1 from public.pbos_conversations c
    where c.id=pbos_messages.conversation_id
      and (
        (c.conversation_kind='support' and pbos_messages.scholar_id=c.scholar_id)
        or (c.conversation_kind='network' and pbos_messages.scholar_id is null)
      )
  )
  and exists (
    select 1 from public.pbos_conversation_participants p
    where p.conversation_id=pbos_messages.conversation_id
      and p.user_id=(select auth.uid()) and p.blocked_at is null
  )
);

drop policy if exists "Governed participants update messages" on public.pbos_messages;
create policy "Governed participants update messages" on public.pbos_messages
for update to authenticated
using (
  private.pbos_user_has_active_conversation_access(conversation_id,(select auth.uid()))
  and (sender_id=(select auth.uid()) or exists (
    select 1 from public.pbos_conversation_participants p
    where p.conversation_id=pbos_messages.conversation_id and p.user_id=(select auth.uid())
  ))
)
with check (
  private.pbos_user_has_active_conversation_access(conversation_id,(select auth.uid()))
  and (sender_id=(select auth.uid()) or exists (
    select 1 from public.pbos_conversation_participants p
    where p.conversation_id=pbos_messages.conversation_id and p.user_id=(select auth.uid())
  ))
);

-- Storage upload is context-aware while preserving support email authorization evidence.
drop policy if exists "Current participants upload message attachments" on storage.objects;
create policy "Current participants upload message attachments" on storage.objects
for insert to authenticated
with check (
  bucket_id='pbos-message-attachments'
  and split_part(name,'/',2)=(select auth.uid())::text
  and exists (
    select 1
    from public.pbos_conversations c
    left join public.support_relationships r
      on c.conversation_kind='support' and r.id=c.relationship_id
    where c.id::text=split_part(name,'/',1)
      and c.status='ACTIVE'
      and (
        (
          c.conversation_kind='support' and r.status='active'
          and (
            c.scholar_id=(select auth.uid())
            or r.supporter_id=(select auth.uid())
            or (r.supporter_email is not null and lower(r.supporter_email)=lower(coalesce((select auth.jwt()) ->> 'email','')))
          )
        )
        or (
          c.conversation_kind='network'
          and private.pbos_user_has_active_conversation_access(c.id,(select auth.uid()))
        )
      )
  )
);

comment on function public.ensure_network_conversation(uuid) is
  'Returns or atomically creates the canonical Network peer conversation for the authenticated actor and an actively connected peer.';
