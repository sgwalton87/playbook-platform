\set ON_ERROR_STOP on

begin;

do $$
begin
  if to_regclass('public.groups') is null or to_regclass('public.group_members') is null then
    raise exception 'Canonical group foundation is missing from committed migration history';
  end if;
  if to_regprocedure('public.ensure_group_conversation(uuid)') is null
     or to_regprocedure('private.ensure_group_conversation(uuid)') is null then
    raise exception 'Group conversation RPC chain is missing';
  end if;
  if not has_function_privilege('authenticated','public.ensure_group_conversation(uuid)','EXECUTE')
     or has_function_privilege('anon','public.ensure_group_conversation(uuid)','EXECUTE') then
    raise exception 'Group conversation public RPC grants are incorrect';
  end if;
  if has_table_privilege('anon','public.group_members','SELECT') then
    raise exception 'Anonymous users must not read group membership';
  end if;
  if not has_table_privilege('authenticated','public.group_members','SELECT') then
    raise exception 'Authenticated members require group membership read access';
  end if;
  if exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='groups' and cmd in ('INSERT','UPDATE','DELETE','ALL')
  ) or exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='group_members' and cmd in ('INSERT','UPDATE','DELETE','ALL')
  ) then
    raise exception 'Group Messaging must not create group-management mutation RLS';
  end if;
end $$;

create temporary table group_message_ids(
  member_a uuid,
  member_b uuid,
  outsider uuid,
  group_id uuid,
  conversation_id uuid,
  message_id uuid
) on commit drop;
grant select,update on group_message_ids to authenticated;

do $$
declare
  a uuid:=gen_random_uuid();
  b uuid:=gen_random_uuid();
  outsider uuid:=gen_random_uuid();
  gid uuid:=gen_random_uuid();
begin
  insert into auth.users(id,email) values
    (a,'group-message-a@example.invalid'),
    (b,'group-message-b@example.invalid'),
    (outsider,'group-message-outsider@example.invalid');
  insert into public.profiles(id,username,role) values
    (a,'group_message_a','scholar'),
    (b,'group_message_b','scholar'),
    (outsider,'group_message_outsider','scholar');
  insert into public.groups(id,name,creator_id,is_private) values(gid,'Group Message Preflight',a,true);
  insert into public.group_members(group_id,profile_id,role) values(gid,a,'owner'),(gid,b,'member');
  insert into group_message_ids(member_a,member_b,outsider,group_id) values(a,b,outsider,gid);
end $$;

-- Member A opens the canonical conversation and sends one immutable group message.
set local role authenticated;
do $$
declare
  ids group_message_ids%rowtype;
  cid uuid;
  mid uuid;
begin
  select * into ids from group_message_ids;
  perform set_config('request.jwt.claim.sub',ids.member_a::text,true);
  select public.ensure_group_conversation(ids.group_id) into cid;
  if cid is null then raise exception 'Group conversation was not created'; end if;

  insert into public.pbos_messages(
    conversation_id,scholar_id,sender_id,body,idempotency_key,delivery_state,moderation_state,provenance
  ) values (
    cid,null,ids.member_a,'Canonical group message','group-message-preflight','PENDING','VISIBLE','[]'::jsonb
  ) returning id into mid;

  update group_message_ids set conversation_id=cid,message_id=mid;
  perform public.finalize_governed_message_delivery(mid,'[{"source":"group-message-preflight"}]'::jsonb);
end $$;
reset role;

-- Member B converges on the same conversation; outsider cannot open it.
set local role authenticated;
do $$
declare
  ids group_message_ids%rowtype;
  second_cid uuid;
  denied boolean:=false;
begin
  select * into ids from group_message_ids;
  perform set_config('request.jwt.claim.sub',ids.member_b::text,true);
  select public.ensure_group_conversation(ids.group_id) into second_cid;
  if second_cid <> ids.conversation_id then raise exception 'Members did not converge on one group conversation'; end if;
  if not private.pbos_user_has_active_conversation_access(ids.conversation_id,ids.member_b) then
    raise exception 'Current member lacks group conversation access';
  end if;

  perform set_config('request.jwt.claim.sub',ids.outsider::text,true);
  begin
    perform public.ensure_group_conversation(ids.group_id);
  exception when sqlstate '42501' then denied:=true;
  end;
  if not denied then raise exception 'Non-member opened a group conversation'; end if;
end $$;
reset role;

-- Confirm one stable group conversation and PBOS message lineage as test owner.
do $$
declare
  ids group_message_ids%rowtype;
  group_conversations int;
  saved public.pbos_messages;
begin
  select * into ids from group_message_ids;
  select count(*) into group_conversations
  from public.pbos_conversations where conversation_kind='group' and group_id=ids.group_id;
  if group_conversations <> 1 then raise exception 'Group must map to exactly one canonical conversation'; end if;
  select * into saved from public.pbos_messages where id=ids.message_id;
  if saved.body <> 'Canonical group message' or saved.scholar_id is not null then
    raise exception 'Group message canonical lineage is incorrect';
  end if;
  if saved.delivery_state <> 'DELIVERED' then raise exception 'Group message was not finalized'; end if;
end $$;

-- Removing B's canonical membership revokes access immediately but preserves history.
do $$
declare ids group_message_ids%rowtype;
begin
  select * into ids from group_message_ids;
  delete from public.group_members where group_id=ids.group_id and profile_id=ids.member_b;
end $$;

set local role authenticated;
do $$
declare
  ids group_message_ids%rowtype;
  denied_open boolean:=false;
  denied_report boolean:=false;
begin
  select * into ids from group_message_ids;
  perform set_config('request.jwt.claim.sub',ids.member_b::text,true);
  if private.pbos_user_has_active_conversation_access(ids.conversation_id,ids.member_b) then
    raise exception 'Removed group member retained conversation access';
  end if;
  begin
    perform public.ensure_group_conversation(ids.group_id);
  exception when sqlstate '42501' then denied_open:=true;
  end;
  begin
    perform public.report_governed_message(ids.message_id,ids.conversation_id);
  exception when sqlstate '42501' then denied_report:=true;
  end;
  if not denied_open or not denied_report then
    raise exception 'Membership removal did not revoke Group Messaging mutation authority';
  end if;
end $$;
reset role;

do $$
declare ids group_message_ids%rowtype;
begin
  select * into ids from group_message_ids;
  if not exists(select 1 from public.pbos_conversations where id=ids.conversation_id) then
    raise exception 'Membership removal deleted conversation history';
  end if;
  if not exists(select 1 from public.pbos_messages where id=ids.message_id) then
    raise exception 'Membership removal deleted message history';
  end if;
end $$;

rollback;
