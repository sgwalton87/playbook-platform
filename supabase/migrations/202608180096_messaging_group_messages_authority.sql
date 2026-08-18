-- Phase 7 Group Messages authority.
-- Groups remain canonical in public.groups/group_members; PBOS Messaging gains a
-- group conversation context without creating a parallel group-message store.

alter table public.pbos_conversations
  add column if not exists group_id uuid references public.groups(id) on delete cascade;

alter table public.pbos_conversations
  drop constraint if exists pbos_conversations_context_shape_check;
alter table public.pbos_conversations
  add constraint pbos_conversations_context_shape_check check (
    (
      conversation_kind='support'
      and relationship_id is not null
      and scholar_id is not null
      and network_peer_a_id is null
      and network_peer_b_id is null
      and group_id is null
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
      and group_id is null
    )
    or
    (
      conversation_kind='group'
      and relationship_id is null
      and scholar_id is null
      and network_peer_a_id is null
      and network_peer_b_id is null
      and group_id is not null
    )
  );

create unique index if not exists pbos_conversations_group_key
  on public.pbos_conversations(group_id)
  where conversation_kind='group';

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
        or
        (
          c.conversation_kind='group'
          and exists (
            select 1 from public.group_members gm
            where gm.group_id=c.group_id and gm.profile_id=p_user_id
          )
        )
      )
  );
$$;

-- Existing RLS evaluation uses this helper.
revoke all on function private.pbos_user_has_active_conversation_access(uuid,uuid) from public,anon,authenticated;
grant execute on function private.pbos_user_has_active_conversation_access(uuid,uuid) to authenticated;

create or replace function private.ensure_group_conversation(requested_group_id uuid)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  resolved_conversation_id uuid;
begin
  if actor_id is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;
  if requested_group_id is null then
    raise exception 'Group ID is required.' using errcode='22023';
  end if;
  if not exists (
    select 1 from public.groups g where g.id=requested_group_id
  ) then
    raise exception 'Group not found.' using errcode='P0002';
  end if;
  if not exists (
    select 1 from public.group_members gm
    where gm.group_id=requested_group_id and gm.profile_id=actor_id
  ) then
    raise exception 'Current group membership is required.' using errcode='42501';
  end if;

  select c.id into resolved_conversation_id
  from public.pbos_conversations c
  where c.conversation_kind='group' and c.group_id=requested_group_id;

  if resolved_conversation_id is null then
    begin
      insert into public.pbos_conversations(
        conversation_kind,relationship_id,scholar_id,network_peer_a_id,network_peer_b_id,group_id,status,created_by
      ) values ('group',null,null,null,null,requested_group_id,'ACTIVE',actor_id)
      returning id into resolved_conversation_id;
    exception when unique_violation then
      select c.id into resolved_conversation_id
      from public.pbos_conversations c
      where c.conversation_kind='group' and c.group_id=requested_group_id;
    end;
  end if;

  insert into public.pbos_conversation_participants(conversation_id,user_id,role)
  values(resolved_conversation_id,actor_id,'group_member')
  on conflict(conversation_id,user_id) do nothing;

  return resolved_conversation_id;
end;
$$;

revoke all on function private.ensure_group_conversation(uuid) from public,anon,authenticated;
grant execute on function private.ensure_group_conversation(uuid) to authenticated;

create or replace function public.ensure_group_conversation(requested_group_id uuid)
returns uuid
language sql
volatile
security invoker
set search_path=''
as $$ select private.ensure_group_conversation(requested_group_id); $$;

revoke all on function public.ensure_group_conversation(uuid) from public,anon;
grant execute on function public.ensure_group_conversation(uuid) to authenticated;

-- Group messages use the same immutable message INSERT authority. Extend only the
-- conversation-context shape predicate; all other sender/blocked checks remain.
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
        or (c.conversation_kind in ('network','group') and pbos_messages.scholar_id is null)
      )
  )
  and exists (
    select 1 from public.pbos_conversation_participants p
    where p.conversation_id=pbos_messages.conversation_id
      and p.user_id=(select auth.uid()) and p.blocked_at is null
  )
);

-- Storage upload happens before attachment metadata exists. Add the group context
-- to the pre-metadata authority check while preserving support/network behavior.
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
          c.conversation_kind in ('network','group')
          and private.pbos_user_has_active_conversation_access(c.id,(select auth.uid()))
        )
      )
  )
);

comment on function public.ensure_group_conversation(uuid) is
  'Returns or atomically creates the canonical PBOS Messaging conversation for an existing group member.';