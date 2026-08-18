\set ON_ERROR_STOP on

begin;

do $$
begin
  if to_regprocedure('public.mark_governed_conversation_read(uuid)') is null
     or to_regprocedure('public.get_governed_message_read_receipts(uuid)') is null then
    raise exception 'Read Receipts RPCs are missing';
  end if;
  if not has_function_privilege('authenticated','public.mark_governed_conversation_read(uuid)','EXECUTE')
     or has_function_privilege('anon','public.mark_governed_conversation_read(uuid)','EXECUTE') then
    raise exception 'mark_governed_conversation_read grants are incorrect';
  end if;
  if not has_function_privilege('authenticated','public.get_governed_message_read_receipts(uuid)','EXECUTE')
     or has_function_privilege('anon','public.get_governed_message_read_receipts(uuid)','EXECUTE') then
    raise exception 'get_governed_message_read_receipts grants are incorrect';
  end if;
  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='mark_governed_conversation_read' and p.prosecdef
  ) or not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='get_governed_message_read_receipts' and p.prosecdef
  ) then
    raise exception 'Read Receipts RPCs must be SECURITY DEFINER boundaries';
  end if;
end $$;

create temporary table receipt_ids(
  sender_id uuid,
  reader_id uuid,
  outsider_id uuid,
  group_id uuid,
  conversation_id uuid,
  message_id uuid
) on commit drop;
grant select,update on receipt_ids to authenticated;

do $$
declare
  sender uuid:=gen_random_uuid();
  reader uuid:=gen_random_uuid();
  outsider uuid:=gen_random_uuid();
  gid uuid:=gen_random_uuid();
begin
  insert into auth.users(id,email) values
    (sender,'receipt-sender@example.invalid'),
    (reader,'receipt-reader@example.invalid'),
    (outsider,'receipt-outsider@example.invalid');
  insert into public.profiles(id,username,role) values
    (sender,'receipt_sender','scholar'),
    (reader,'receipt_reader','scholar'),
    (outsider,'receipt_outsider','scholar');
  insert into public.groups(id,name,creator_id,is_private) values(gid,'Receipt Preflight',sender,true);
  insert into public.group_members(group_id,profile_id,role) values(gid,sender,'owner'),(gid,reader,'member');
  insert into receipt_ids(sender_id,reader_id,outsider_id,group_id) values(sender,reader,outsider,gid);
end $$;

-- Sender creates one canonical group conversation and message.
set local role authenticated;
do $$
declare
  ids receipt_ids%rowtype;
  cid uuid;
  mid uuid;
begin
  select * into ids from receipt_ids;
  perform set_config('request.jwt.claim.sub',ids.sender_id::text,true);
  select public.ensure_group_conversation(ids.group_id) into cid;
  insert into public.pbos_messages(
    conversation_id,scholar_id,sender_id,body,idempotency_key,delivery_state,moderation_state,provenance
  ) values (
    cid,null,ids.sender_id,'Receipt preflight message','receipt-preflight-message','PENDING','VISIBLE','[]'::jsonb
  ) returning id into mid;
  update receipt_ids set conversation_id=cid,message_id=mid;
  perform public.finalize_governed_message_delivery(mid,'[{"source":"receipt-preflight"}]'::jsonb);
end $$;
reset role;

-- Reader has canonical group authority but no participant row. Mark-read must safely materialize it.
do $$
declare ids receipt_ids%rowtype;
begin
  select * into ids from receipt_ids;
  delete from public.pbos_conversation_participants
  where conversation_id=ids.conversation_id and user_id=ids.reader_id;
end $$;

set local role authenticated;
do $$
declare
  ids receipt_ids%rowtype;
  marked_at timestamptz;
  count_seen bigint;
  denied boolean:=false;
begin
  select * into ids from receipt_ids;
  perform set_config('request.jwt.claim.sub',ids.reader_id::text,true);
  select public.mark_governed_conversation_read(ids.conversation_id) into marked_at;
  if marked_at is null then raise exception 'Reader mark-read returned no timestamp'; end if;
  if not exists (
    select 1 from public.pbos_conversation_participants p
    where p.conversation_id=ids.conversation_id and p.user_id=ids.reader_id
      and p.last_read_at is not null
  ) then
    raise exception 'Authorized reader participant state was not materialized';
  end if;

  perform set_config('request.jwt.claim.sub',ids.outsider_id::text,true);
  begin
    perform public.mark_governed_conversation_read(ids.conversation_id);
  exception when sqlstate '42501' then denied:=true;
  end;
  if not denied then raise exception 'Unauthorized user marked conversation read'; end if;

  perform set_config('request.jwt.claim.sub',ids.sender_id::text,true);
  select r.read_count into count_seen
  from public.get_governed_message_read_receipts(ids.conversation_id) r
  where r.message_id=ids.message_id;
  if count_seen <> 1 then raise exception 'Expected one current reader, got %',coalesce(count_seen,-1); end if;
end $$;
reset role;

-- Revoking canonical group membership must remove the stale receipt contribution without deleting history.
do $$
declare ids receipt_ids%rowtype;
begin
  select * into ids from receipt_ids;
  delete from public.group_members where group_id=ids.group_id and profile_id=ids.reader_id;
end $$;

set local role authenticated;
do $$
declare
  ids receipt_ids%rowtype;
  count_seen bigint;
begin
  select * into ids from receipt_ids;
  perform set_config('request.jwt.claim.sub',ids.sender_id::text,true);
  select r.read_count into count_seen
  from public.get_governed_message_read_receipts(ids.conversation_id) r
  where r.message_id=ids.message_id;
  if count_seen <> 0 then raise exception 'Revoked member still contributes to read receipt count'; end if;
end $$;
reset role;

do $$
declare ids receipt_ids%rowtype;
begin
  select * into ids from receipt_ids;
  if not exists(select 1 from public.pbos_messages where id=ids.message_id) then
    raise exception 'Receipt revocation deleted canonical message history';
  end if;
end $$;

rollback;
