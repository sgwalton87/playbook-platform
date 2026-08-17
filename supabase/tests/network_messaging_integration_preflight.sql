\set ON_ERROR_STOP on
begin;

do $$
declare
  public_definer boolean;
  private_definer boolean;
  body text;
begin
  if to_regprocedure('public.ensure_network_conversation(uuid)') is null
     or to_regprocedure('private.ensure_network_conversation(uuid)') is null then
    raise exception 'Network conversation RPC chain is missing.';
  end if;

  select p.prosecdef into public_definer from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='ensure_network_conversation';
  select p.prosecdef into private_definer from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='private' and p.proname='ensure_network_conversation';
  if coalesce(public_definer,false) or not coalesce(private_definer,false) then
    raise exception 'Network conversation RPC must use public invoker/private definer split.';
  end if;
  if not has_function_privilege('authenticated','public.ensure_network_conversation(uuid)','EXECUTE')
     or has_function_privilege('anon','public.ensure_network_conversation(uuid)','EXECUTE') then
    raise exception 'Network conversation public RPC grants are incorrect.';
  end if;

  select pg_get_functiondef('private.pbos_user_has_active_conversation_access(uuid,uuid)'::regprocedure) into body;
  if body !~ 'conversation_kind'
     or body !~ '''network'''
     or body !~ 'user_connections'
     or body !~ 'support_relationships' then
    raise exception 'Conversation access helper is not context-aware for both support and Network.';
  end if;
end;
$$;

insert into auth.users(id,email)
values
 ('00000000-0000-0000-0000-00000000f101','network-message-a@example.invalid'),
 ('00000000-0000-0000-0000-00000000f102','network-message-b@example.invalid'),
 ('00000000-0000-0000-0000-00000000f103','network-message-c@example.invalid')
on conflict(id) do nothing;

insert into public.user_connections(user_id,connected_user_id)
values
 ('00000000-0000-0000-0000-00000000f101','00000000-0000-0000-0000-00000000f102'),
 ('00000000-0000-0000-0000-00000000f102','00000000-0000-0000-0000-00000000f101')
on conflict(user_id,connected_user_id) do nothing;

select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000f101',true);

do $$
declare
  first_id uuid;
  second_id uuid;
  participant_count integer;
begin
  first_id := public.ensure_network_conversation('00000000-0000-0000-0000-00000000f102');
  second_id := public.ensure_network_conversation('00000000-0000-0000-0000-00000000f102');
  if first_id is null or first_id<>second_id then
    raise exception 'Network conversation creation is not idempotent.';
  end if;

  if not exists (
    select 1 from public.pbos_conversations c where c.id=first_id
      and c.conversation_kind='network' and c.relationship_id is null and c.scholar_id is null
      and c.network_peer_a_id is not null and c.network_peer_b_id is not null
  ) then
    raise exception 'Network conversation context shape is incorrect.';
  end if;

  select count(*) into participant_count from public.pbos_conversation_participants p where p.conversation_id=first_id;
  if participant_count<>2 then raise exception 'Network conversation must contain both canonical peers.'; end if;

  if not private.pbos_user_has_active_conversation_access(first_id,'00000000-0000-0000-0000-00000000f101')
     or not private.pbos_user_has_active_conversation_access(first_id,'00000000-0000-0000-0000-00000000f102') then
    raise exception 'Connected peers must have active conversation access.';
  end if;
  if private.pbos_user_has_active_conversation_access(first_id,'00000000-0000-0000-0000-00000000f103') then
    raise exception 'Third parties must not gain Network conversation access.';
  end if;
end;
$$;

-- Disconnect preserves history but revokes access immediately.
delete from public.user_connections
where (user_id='00000000-0000-0000-0000-00000000f101' and connected_user_id='00000000-0000-0000-0000-00000000f102')
   or (user_id='00000000-0000-0000-0000-00000000f102' and connected_user_id='00000000-0000-0000-0000-00000000f101');

do $$
declare network_id uuid;
begin
  select id into network_id from public.pbos_conversations
  where conversation_kind='network'
    and network_peer_a_id in ('00000000-0000-0000-0000-00000000f101','00000000-0000-0000-0000-00000000f102')
    and network_peer_b_id in ('00000000-0000-0000-0000-00000000f101','00000000-0000-0000-0000-00000000f102')
  limit 1;
  if private.pbos_user_has_active_conversation_access(network_id,'00000000-0000-0000-0000-00000000f101') then
    raise exception 'Disconnect must revoke Network conversation access.';
  end if;
  if not exists (select 1 from public.pbos_conversations where id=network_id) then
    raise exception 'Disconnect must preserve historical conversation records.';
  end if;
end;
$$;

rollback;
