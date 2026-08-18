\set ON_ERROR_STOP on

begin;

do $$
declare
  set_block_oid oid:=to_regprocedure('public.set_user_block(uuid,boolean)');
  block_state_oid oid:=to_regprocedure('public.get_governed_conversation_block_states(uuid[])');
  private_set_oid oid:=to_regprocedure('private.set_user_block(uuid,boolean)');
  private_state_oid oid:=to_regprocedure('private.get_governed_conversation_block_states(uuid[])');
begin
  if set_block_oid is null or block_state_oid is null or private_set_oid is null or private_state_oid is null then
    raise exception 'Canonical Block User RPC surface is incomplete';
  end if;
  if (select prosecdef from pg_proc where oid=set_block_oid)
     or (select prosecdef from pg_proc where oid=block_state_oid) then
    raise exception 'Public Block User RPCs must remain SECURITY INVOKER wrappers';
  end if;
  if not (select prosecdef from pg_proc where oid=private_set_oid)
     or not (select prosecdef from pg_proc where oid=private_state_oid) then
    raise exception 'Private Block User mutation/projection helpers must be SECURITY DEFINER';
  end if;
  if has_function_privilege('anon',set_block_oid,'EXECUTE')
     or has_function_privilege('anon',block_state_oid,'EXECUTE') then
    raise exception 'Anonymous users must not execute Block User RPCs';
  end if;
  if not has_function_privilege('authenticated',set_block_oid,'EXECUTE')
     or not has_function_privilege('authenticated',block_state_oid,'EXECUTE') then
    raise exception 'Authenticated users require the narrow Block User RPCs';
  end if;
end $$;

do $$
begin
  if has_table_privilege('anon','public.user_blocks','SELECT')
     or has_table_privilege('anon','public.user_blocks','INSERT')
     or has_table_privilege('anon','public.user_blocks','UPDATE')
     or has_table_privilege('anon','public.user_blocks','DELETE') then
    raise exception 'Anonymous user_blocks grants must be absent';
  end if;
  if not has_table_privilege('authenticated','public.user_blocks','SELECT')
     or has_table_privilege('authenticated','public.user_blocks','INSERT')
     or has_table_privilege('authenticated','public.user_blocks','UPDATE')
     or has_table_privilege('authenticated','public.user_blocks','DELETE') then
    raise exception 'Authenticated user_blocks authority must be read-only outside the RPC';
  end if;
  if not exists(
    select 1 from pg_policies
    where schemaname='public' and tablename='user_blocks'
      and policyname='Users view own blocks' and cmd='SELECT'
  ) or exists(
    select 1 from pg_policies
    where schemaname='public' and tablename='user_blocks' and cmd in ('ALL','INSERT','UPDATE','DELETE')
  ) then
    raise exception 'user_blocks RLS must be blocker-private SELECT only';
  end if;
  if not exists(
    select 1 from pg_constraint
    where conrelid='public.user_blocks'::regclass
      and conname='user_blocks_blocker_profile_fkey' and contype='f'
  ) or not exists(
    select 1 from pg_constraint
    where conrelid='public.user_blocks'::regclass
      and conname='user_blocks_blocked_profile_fkey' and contype='f'
  ) then
    raise exception 'Canonical user_blocks profile lineage is incomplete';
  end if;
  if not exists(
    select 1 from pg_indexes
    where schemaname='public' and tablename='user_blocks'
      and indexname='user_blocks_blocked_user_idx'
  ) then
    raise exception 'Reverse Block User lookup index is missing';
  end if;
end $$;

do $$
begin
  if has_table_privilege('anon','public.pbos_conversation_participants','SELECT')
     or has_table_privilege('anon','public.pbos_conversation_participants','INSERT')
     or has_table_privilege('anon','public.pbos_conversation_participants','UPDATE')
     or has_table_privilege('anon','public.pbos_conversation_participants','DELETE') then
    raise exception 'Anonymous participant-state grants must be absent';
  end if;
  if not has_table_privilege('authenticated','public.pbos_conversation_participants','SELECT')
     or not has_table_privilege('authenticated','public.pbos_conversation_participants','INSERT')
     or has_table_privilege('authenticated','public.pbos_conversation_participants','UPDATE')
     or has_table_privilege('authenticated','public.pbos_conversation_participants','DELETE') then
    raise exception 'Participant table must expose SELECT/INSERT without generic UPDATE/DELETE';
  end if;
  if not has_column_privilege('authenticated','public.pbos_conversation_participants','last_read_at','UPDATE')
     or not has_column_privilege('authenticated','public.pbos_conversation_participants','muted_at','UPDATE')
     or has_column_privilege('authenticated','public.pbos_conversation_participants','blocked_at','UPDATE') then
    raise exception 'Participant UPDATE must be limited to read and mute state';
  end if;
end $$;

create temporary table block_user_ids(
  user_a uuid,
  user_b uuid,
  user_c uuid,
  network_conversation uuid,
  history_message uuid,
  group_id uuid,
  group_conversation uuid,
  group_message uuid
) on commit drop;
grant select,update on block_user_ids to authenticated;

do $$
declare
  a uuid:=gen_random_uuid();
  b uuid:=gen_random_uuid();
  c uuid:=gen_random_uuid();
  gid uuid:=gen_random_uuid();
begin
  insert into auth.users(id,email,created_at) values
    (a,'block-user-a@example.invalid',now()),
    (b,'block-user-b@example.invalid',now()),
    (c,'block-user-c@example.invalid',now());
  insert into public.profiles(id,username,role) values
    (a,'block_user_a','scholar'),
    (b,'block_user_b','scholar'),
    (c,'block_user_c','scholar');
  insert into public.user_connections(user_id,connected_user_id) values
    (a,b),(b,a),(a,c),(c,a);
  insert into public.groups(id,name,creator_id,is_private)
  values(gid,'Block User Certification Group',a,true);
  insert into public.group_members(group_id,profile_id,role) values
    (gid,a,'owner'),(gid,b,'member');
  insert into block_user_ids(user_a,user_b,user_c,group_id) values(a,b,c,gid);
end $$;

-- Establish one-to-one history and one group conversation before blocking.
set local role authenticated;
do $$
declare
  ids block_user_ids%rowtype;
  cid uuid;
  mid uuid;
  gcid uuid;
begin
  select * into ids from block_user_ids;
  perform set_config('request.jwt.claim.sub',ids.user_a::text,true);

  select public.ensure_network_conversation(ids.user_b) into cid;
  insert into public.pbos_messages(
    conversation_id,scholar_id,sender_id,body,idempotency_key,delivery_state,moderation_state,provenance
  ) values(
    cid,null,ids.user_a,'History remains after a block','block-user-history','PENDING','VISIBLE','[]'::jsonb
  ) returning id into mid;
  perform public.finalize_governed_message_delivery(mid,'[{"source":"block-user-preflight"}]'::jsonb);

  select public.ensure_group_conversation(ids.group_id) into gcid;
  update block_user_ids
     set network_conversation=cid,history_message=mid,group_conversation=gcid;
end $$;
reset role;

-- A creates the canonical directional block against B.
set local role authenticated;
do $$
declare
  ids block_user_ids%rowtype;
  state record;
  denied boolean:=false;
begin
  select * into ids from block_user_ids;
  perform set_config('request.jwt.claim.sub',ids.user_a::text,true);
  if public.set_user_block(ids.user_b,true) is not true then
    raise exception 'Block mutation did not persist the requested state';
  end if;
  if (select count(*) from public.user_blocks where blocker_id=ids.user_a and blocked_user_id=ids.user_b)<>1 then
    raise exception 'Canonical blocker-owned row is missing';
  end if;

  select * into state
  from public.get_governed_conversation_block_states(array[ids.network_conversation])
  where conversation_id=ids.network_conversation;
  if state.peer_id<>ids.user_b or not state.blocked_by_me or state.blocked_by_peer or not state.messaging_blocked then
    raise exception 'Blocker projection is incorrect';
  end if;

  begin
    insert into public.user_blocks(blocker_id,blocked_user_id) values(ids.user_a,ids.user_c);
  exception when insufficient_privilege then denied:=true;
  end;
  if not denied then raise exception 'Direct client user_blocks INSERT unexpectedly succeeded'; end if;

  denied:=false;
  begin
    update public.pbos_conversation_participants
       set blocked_at=now()
     where conversation_id=ids.network_conversation and user_id=ids.user_a;
  exception when insufficient_privilege then denied:=true;
  end;
  if not denied then raise exception 'Legacy participant blocked_at remained client writable'; end if;
end $$;
reset role;

-- B cannot inspect A's private block row, but receives the minimal blocked boolean.
set local role authenticated;
do $$
declare
  ids block_user_ids%rowtype;
  state record;
begin
  select * into ids from block_user_ids;
  perform set_config('request.jwt.claim.sub',ids.user_b::text,true);
  if (select count(*) from public.user_blocks)<>0 then
    raise exception 'Blocked user can inspect another user block row';
  end if;
  select * into state
  from public.get_governed_conversation_block_states(array[ids.network_conversation])
  where conversation_id=ids.network_conversation;
  if state.peer_id<>ids.user_a or state.blocked_by_me or not state.blocked_by_peer or not state.messaging_blocked then
    raise exception 'Blocked-user privacy projection is incorrect';
  end if;
end $$;
reset role;

-- Either direction of the canonical block prevents new direct messages and attachments.
set local role authenticated;
do $$
declare
  ids block_user_ids%rowtype;
  denied_a boolean:=false;
  denied_b boolean:=false;
  denied_attachment boolean:=false;
begin
  select * into ids from block_user_ids;
  perform set_config('request.jwt.claim.sub',ids.user_a::text,true);
  begin
    insert into public.pbos_messages(
      conversation_id,scholar_id,sender_id,body,idempotency_key,delivery_state,moderation_state,provenance
    ) values(
      ids.network_conversation,null,ids.user_a,'Blocked A send','block-user-denied-a','PENDING','VISIBLE','[]'::jsonb
    );
  exception when insufficient_privilege then denied_a:=true;
  end;
  begin
    insert into public.pbos_message_attachments(
      conversation_id,uploader_id,storage_path,original_name,mime_type,byte_size
    ) values(
      ids.network_conversation,ids.user_a,
      ids.network_conversation::text||'/'||ids.user_a::text||'/blocked.txt',
      'blocked.txt','text/plain',7
    );
  exception when insufficient_privilege then denied_attachment:=true;
  end;

  perform set_config('request.jwt.claim.sub',ids.user_b::text,true);
  begin
    insert into public.pbos_messages(
      conversation_id,scholar_id,sender_id,body,idempotency_key,delivery_state,moderation_state,provenance
    ) values(
      ids.network_conversation,null,ids.user_b,'Blocked B send','block-user-denied-b','PENDING','VISIBLE','[]'::jsonb
    );
  exception when insufficient_privilege then denied_b:=true;
  end;

  if not denied_a or not denied_b or not denied_attachment then
    raise exception 'Canonical bilateral block did not fail closed for new direct content';
  end if;
end $$;
reset role;

-- The block preserves authorized history and the existing conversation identity.
set local role authenticated;
do $$
declare
  ids block_user_ids%rowtype;
  reopened uuid;
begin
  select * into ids from block_user_ids;
  perform set_config('request.jwt.claim.sub',ids.user_a::text,true);
  if (select count(*) from public.pbos_messages where id=ids.history_message)<>1 then
    raise exception 'Block erased canonical message history for the blocker';
  end if;
  select public.ensure_network_conversation(ids.user_b) into reopened;
  if reopened<>ids.network_conversation then raise exception 'Existing blocked conversation identity changed'; end if;

  perform set_config('request.jwt.claim.sub',ids.user_b::text,true);
  if (select count(*) from public.pbos_messages where id=ids.history_message)<>1 then
    raise exception 'Block erased canonical message history for the blocked user';
  end if;
end $$;
reset role;

-- A block prevents creating a brand-new Network thread with C.
set local role authenticated;
do $$
declare
  ids block_user_ids%rowtype;
  denied boolean:=false;
begin
  select * into ids from block_user_ids;
  perform set_config('request.jwt.claim.sub',ids.user_a::text,true);
  perform public.set_user_block(ids.user_c,true);
  begin
    perform public.ensure_network_conversation(ids.user_c);
  exception when insufficient_privilege then denied:=true;
  end;
  if not denied then raise exception 'A blocked peer received a new Network conversation'; end if;
  perform public.set_user_block(ids.user_c,false);
end $$;
reset role;

-- Group Messaging remains available; group controls use Mute rather than Block User.
set local role authenticated;
do $$
declare
  ids block_user_ids%rowtype;
  mid uuid;
begin
  select * into ids from block_user_ids;
  perform set_config('request.jwt.claim.sub',ids.user_a::text,true);
  insert into public.pbos_messages(
    conversation_id,scholar_id,sender_id,body,idempotency_key,delivery_state,moderation_state,provenance
  ) values(
    ids.group_conversation,null,ids.user_a,'Group message survives a peer block','block-user-group-send','PENDING','VISIBLE','[]'::jsonb
  ) returning id into mid;
  perform public.finalize_governed_message_delivery(mid,'[{"source":"block-user-group-preflight"}]'::jsonb);
  update block_user_ids set group_message=mid;
end $$;
reset role;

-- Self-blocking is rejected, then unblocking restores direct send authority.
set local role authenticated;
do $$
declare
  ids block_user_ids%rowtype;
  self_denied boolean:=false;
  restored_message uuid;
begin
  select * into ids from block_user_ids;
  perform set_config('request.jwt.claim.sub',ids.user_a::text,true);
  begin
    perform public.set_user_block(ids.user_a,true);
  exception when invalid_parameter_value then self_denied:=true;
  end;
  if not self_denied then raise exception 'Self-blocking unexpectedly succeeded'; end if;

  perform public.set_user_block(ids.user_b,false);
  if exists(select 1 from public.user_blocks where blocker_id=ids.user_a and blocked_user_id=ids.user_b) then
    raise exception 'Unblock did not remove the canonical row';
  end if;
  insert into public.pbos_messages(
    conversation_id,scholar_id,sender_id,body,idempotency_key,delivery_state,moderation_state,provenance
  ) values(
    ids.network_conversation,null,ids.user_a,'Messaging restored after unblock','block-user-restored','PENDING','VISIBLE','[]'::jsonb
  ) returning id into restored_message;
  perform public.finalize_governed_message_delivery(restored_message,'[{"source":"block-user-restored"}]'::jsonb);
end $$;
reset role;

rollback;
