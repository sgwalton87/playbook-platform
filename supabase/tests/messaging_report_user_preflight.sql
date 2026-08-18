\set ON_ERROR_STOP on

begin;

do $$
declare
  public_report_oid oid:=to_regprocedure('public.report_governed_messaging_user(uuid,uuid,text,text,uuid)');
  private_report_oid oid:=to_regprocedure('private.report_governed_messaging_user(uuid,uuid,text,text,uuid)');
  public_projection_oid oid:=to_regprocedure('public.get_moderation_profile_report_context(uuid[])');
  private_projection_oid oid:=to_regprocedure('private.get_moderation_profile_report_context(uuid[])');
begin
  if public_report_oid is null or private_report_oid is null then
    raise exception 'Governed Messaging user report authority is incomplete';
  end if;
  if public_projection_oid is null or private_projection_oid is null then
    raise exception 'Moderator profile-report projection is incomplete';
  end if;
  if (select prosecdef from pg_proc where oid=public_report_oid)
     or (select prosecdef from pg_proc where oid=public_projection_oid) then
    raise exception 'Public Report User entrypoints must remain SECURITY INVOKER wrappers';
  end if;
  if not (select prosecdef from pg_proc where oid=private_report_oid)
     or not (select prosecdef from pg_proc where oid=private_projection_oid) then
    raise exception 'Private Report User authorities must remain SECURITY DEFINER';
  end if;
  if has_function_privilege('anon',public_report_oid,'EXECUTE')
     or has_function_privilege('anon',public_projection_oid,'EXECUTE') then
    raise exception 'Anonymous callers must not reach Report User entrypoints';
  end if;
  if not has_function_privilege('authenticated',public_report_oid,'EXECUTE')
     or not has_function_privilege('authenticated',public_projection_oid,'EXECUTE') then
    raise exception 'Authenticated API role requires governed Report User entrypoints';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='moderation_reports'
      and column_name='source_conversation_id' and data_type='uuid'
  ) then raise exception 'source_conversation_id lineage is missing'; end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='moderation_reports'
      and column_name='source_message_id' and data_type='uuid'
  ) then raise exception 'source_message_id lineage is missing'; end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid='public.moderation_reports'::regclass
      and conname='moderation_reports_source_conversation_fkey'
      and contype='f'
  ) then raise exception 'Conversation lineage FK is missing'; end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid='public.moderation_reports'::regclass
      and conname='moderation_reports_source_message_fkey'
      and contype='f'
  ) then raise exception 'Message lineage FK is missing'; end if;
  if not exists (
    select 1 from pg_indexes
    where schemaname='public' and tablename='moderation_reports'
      and indexname='moderation_reports_profile_context_idx'
  ) then raise exception 'Profile report context index is missing'; end if;
end $$;

do $$
begin
  if has_table_privilege('anon','public.moderation_reports','SELECT')
     or has_table_privilege('anon','public.moderation_reports','INSERT')
     or has_table_privilege('anon','public.moderation_reports','UPDATE')
     or has_table_privilege('anon','public.moderation_reports','DELETE') then
    raise exception 'Anonymous moderation report grants must be absent';
  end if;
  if not has_table_privilege('authenticated','public.moderation_reports','SELECT')
     or not has_table_privilege('authenticated','public.moderation_reports','INSERT') then
    raise exception 'Authenticated users require report SELECT and INSERT under RLS';
  end if;
  if has_table_privilege('authenticated','public.moderation_reports','DELETE')
     or has_table_privilege('authenticated','public.moderation_reports','UPDATE') then
    raise exception 'Authenticated users must not have generic report UPDATE or DELETE';
  end if;
  if not has_column_privilege('authenticated','public.moderation_reports','status','UPDATE')
     or not has_column_privilege('authenticated','public.moderation_reports','resolution_note','UPDATE')
     or not has_column_privilege('authenticated','public.moderation_reports','reviewed_by','UPDATE')
     or not has_column_privilege('authenticated','public.moderation_reports','reviewed_at','UPDATE') then
    raise exception 'Moderator review columns require bounded UPDATE grants';
  end if;
  if has_column_privilege('authenticated','public.moderation_reports','target_id','UPDATE')
     or has_column_privilege('authenticated','public.moderation_reports','target_type','UPDATE')
     or has_column_privilege('authenticated','public.moderation_reports','reporter_id','UPDATE')
     or has_column_privilege('authenticated','public.moderation_reports','source_conversation_id','UPDATE')
     or has_column_privilege('authenticated','public.moderation_reports','source_message_id','UPDATE') then
    raise exception 'Canonical report identity and evidence lineage must be immutable to clients';
  end if;
end $$;

create temporary table report_user_ids(
  support_reporter uuid,
  support_target uuid,
  network_reporter uuid,
  network_target uuid,
  group_reporter uuid,
  group_target uuid,
  outsider uuid,
  moderator uuid,
  support_conversation uuid,
  network_conversation uuid,
  group_conversation uuid,
  support_message uuid,
  network_message uuid,
  group_message uuid,
  group_own_message uuid,
  support_report uuid,
  group_report uuid,
  baseline_conversation_count bigint,
  baseline_message_count bigint
) on commit drop;
grant select,update on report_user_ids to authenticated;

do $$
declare
  sr uuid:=gen_random_uuid(); st uuid:=gen_random_uuid();
  nr uuid:=gen_random_uuid(); nt uuid:=gen_random_uuid();
  gr uuid:=gen_random_uuid(); gt uuid:=gen_random_uuid();
  outsider uuid:=gen_random_uuid(); moderator uuid:=gen_random_uuid();
  relationship_id uuid:=gen_random_uuid();
  support_conversation uuid:=gen_random_uuid();
  network_conversation uuid:=gen_random_uuid();
  group_id uuid:=gen_random_uuid(); group_conversation uuid:=gen_random_uuid();
  support_message uuid:=gen_random_uuid(); network_message uuid:=gen_random_uuid();
  group_message uuid:=gen_random_uuid(); group_own_message uuid:=gen_random_uuid();
begin
  insert into auth.users(id,email) values
    (sr,'report-user-support-reporter@example.invalid'),
    (st,'report-user-support-target@example.invalid'),
    (nr,'report-user-network-reporter@example.invalid'),
    (nt,'report-user-network-target@example.invalid'),
    (gr,'report-user-group-reporter@example.invalid'),
    (gt,'report-user-group-target@example.invalid'),
    (outsider,'report-user-outsider@example.invalid'),
    (moderator,'report-user-moderator@example.invalid');

  insert into public.profiles(id,username,full_name,role) values
    (sr,'report_support_reporter','Support Reporter','scholar'),
    (st,'report_support_target','Support Target','mentor'),
    (nr,'report_network_reporter','Network Reporter','scholar'),
    (nt,'report_network_target','Network Target','scholar'),
    (gr,'report_group_reporter','Group Reporter','scholar'),
    (gt,'report_group_target','Group Target','scholar'),
    (outsider,'report_user_outsider','Unrelated User','scholar'),
    (moderator,'report_user_moderator','Trust Moderator','founder');

  insert into public.support_relationships(
    id,scholar_id,supporter_id,supporter_email,supporter_name,relationship,permissions,status
  ) values (
    relationship_id,sr,st,'report-user-support-target@example.invalid','Support Target','mentor','["messaging"]'::jsonb,'active'
  );
  insert into public.pbos_conversations(
    id,conversation_kind,relationship_id,scholar_id,status,created_by
  ) values(support_conversation,'support',relationship_id,sr,'ACTIVE',sr);
  insert into public.pbos_messages(
    id,conversation_id,scholar_id,sender_id,body,idempotency_key,delivery_state,moderation_state,provenance
  ) values(
    support_message,support_conversation,sr,st,'SUPPORT USER REPORT EVIDENCE SECRET','report-user-support-message','DELIVERED','VISIBLE','[]'::jsonb
  );

  insert into public.user_connections(user_id,connected_user_id) values(nr,nt),(nt,nr);
  insert into public.pbos_conversations(
    id,conversation_kind,network_peer_a_id,network_peer_b_id,status,created_by
  ) values(network_conversation,'network',least(nr,nt),greatest(nr,nt),'ACTIVE',nr);
  insert into public.pbos_messages(
    id,conversation_id,scholar_id,sender_id,body,idempotency_key,delivery_state,moderation_state,provenance
  ) values(
    network_message,network_conversation,null,nt,'NETWORK USER REPORT EVIDENCE SECRET','report-user-network-message','DELIVERED','VISIBLE','[]'::jsonb
  );

  insert into public.groups(id,name,creator_id,is_private) values(group_id,'Report User Certification Group',gr,true);
  insert into public.group_members(group_id,profile_id,role) values
    (group_id,gr,'owner'),(group_id,gt,'member');
  insert into public.pbos_conversations(
    id,conversation_kind,group_id,status,created_by
  ) values(group_conversation,'group',group_id,'ACTIVE',gr);
  insert into public.pbos_messages(
    id,conversation_id,scholar_id,sender_id,body,idempotency_key,delivery_state,moderation_state,provenance
  ) values
    (group_message,group_conversation,null,gt,'GROUP USER REPORT EVIDENCE SECRET','report-user-group-message','DELIVERED','VISIBLE','[]'::jsonb),
    (group_own_message,group_conversation,null,gr,'REPORTER OWN GROUP MESSAGE','report-user-group-own-message','DELIVERED','VISIBLE','[]'::jsonb);

  -- A block is a Messaging barrier, not a barrier to filing a safety report while
  -- authorized history remains visible.
  insert into public.user_blocks(blocker_id,blocked_user_id) values(sr,st);

  insert into report_user_ids(
    support_reporter,support_target,network_reporter,network_target,group_reporter,group_target,
    outsider,moderator,support_conversation,network_conversation,group_conversation,
    support_message,network_message,group_message,group_own_message,
    baseline_conversation_count,baseline_message_count
  ) values(
    sr,st,nr,nt,gr,gt,outsider,moderator,support_conversation,network_conversation,group_conversation,
    support_message,network_message,group_message,group_own_message,
    (select count(*) from public.pbos_conversations),
    (select count(*) from public.pbos_messages)
  );
end $$;

-- Direct profile-report insertion is denied; existing non-profile report creation remains.
set local role authenticated;
do $$
declare ids report_user_ids%rowtype; profile_denied boolean:=false; non_profile_count integer;
begin
  select * into ids from report_user_ids;
  perform set_config('request.jwt.claim.sub',ids.support_reporter::text,true);
  begin
    insert into public.moderation_reports(reporter_id,target_type,target_id,reason)
    values(ids.support_reporter,'profile',ids.support_target::text,'Other');
  exception when sqlstate '42501' then profile_denied:=true;
  end;
  if not profile_denied then raise exception 'Direct profile report insertion bypassed governed Messaging authority'; end if;

  insert into public.moderation_reports(reporter_id,target_type,target_id,reason)
  values(ids.support_reporter,'comment','report-user-comment-target','Other');
  select count(*) into non_profile_count
  from public.moderation_reports
  where reporter_id=ids.support_reporter and target_type='comment' and target_id='report-user-comment-target';
  if non_profile_count<>1 then raise exception 'Existing non-profile report creation regressed'; end if;
end $$;
reset role;

-- Support peer report succeeds even when the reporter has blocked the peer.
set local role authenticated;
do $$
declare ids report_user_ids%rowtype; saved_id uuid; unrelated_denied boolean:=false; self_denied boolean:=false;
begin
  select * into ids from report_user_ids;
  perform set_config('request.jwt.claim.sub',ids.support_reporter::text,true);

  select id into saved_id
  from public.report_governed_messaging_user(
    ids.support_conversation,
    ids.support_target,
    'Harassment or bullying',
    'Repeated unwanted contact in this conversation.',
    ids.support_message
  );
  if saved_id is null then raise exception 'Support user report was not created'; end if;
  update report_user_ids set support_report=saved_id;

  begin
    perform public.report_governed_messaging_user(
      ids.support_conversation,ids.outsider,'Other',null,null
    );
  exception when sqlstate '42501' then unrelated_denied:=true;
  end;
  if not unrelated_denied then raise exception 'Unrelated profile was reportable through support context'; end if;

  begin
    perform public.report_governed_messaging_user(
      ids.support_conversation,ids.support_reporter,'Other',null,null
    );
  exception when sqlstate '22023' then self_denied:=true;
  end;
  if not self_denied then raise exception 'Reporter was able to report themself'; end if;
end $$;
reset role;

-- A Network participant may report only the connected peer in the active thread.
set local role authenticated;
do $$
declare ids report_user_ids%rowtype; saved_id uuid; forged_message_denied boolean:=false;
begin
  select * into ids from report_user_ids;
  perform set_config('request.jwt.claim.sub',ids.network_reporter::text,true);
  select id into saved_id
  from public.report_governed_messaging_user(
    ids.network_conversation,
    ids.network_target,
    'Spam or scam',
    null,
    ids.network_message
  );
  if saved_id is null then raise exception 'Network user report was not created'; end if;

  begin
    perform public.report_governed_messaging_user(
      ids.network_conversation,ids.network_target,'Other',null,ids.support_message
    );
  exception when sqlstate '42501' then forged_message_denied:=true;
  end;
  if not forged_message_denied then raise exception 'Cross-conversation source message was accepted'; end if;
end $$;
reset role;

-- Group reports require another member's source message and bind target to its sender.
set local role authenticated;
do $$
declare ids report_user_ids%rowtype; saved_id uuid; missing_message_denied boolean:=false; wrong_sender_denied boolean:=false; own_message_denied boolean:=false;
begin
  select * into ids from report_user_ids;
  perform set_config('request.jwt.claim.sub',ids.group_reporter::text,true);

  begin
    perform public.report_governed_messaging_user(
      ids.group_conversation,ids.group_target,'Other',null,null
    );
  exception when sqlstate '22023' then missing_message_denied:=true;
  end;
  if not missing_message_denied then raise exception 'Group profile report did not require a source message'; end if;

  begin
    perform public.report_governed_messaging_user(
      ids.group_conversation,ids.outsider,'Other',null,ids.group_message
    );
  exception when sqlstate '42501' then wrong_sender_denied:=true;
  end;
  if not wrong_sender_denied then raise exception 'Group source message could target a different user'; end if;

  begin
    perform public.report_governed_messaging_user(
      ids.group_conversation,ids.group_reporter,'Other',null,ids.group_own_message
    );
  exception when sqlstate '22023' then own_message_denied:=true;
  end;
  if not own_message_denied then raise exception 'A group participant could report their own profile/message'; end if;

  select id into saved_id
  from public.report_governed_messaging_user(
    ids.group_conversation,
    ids.group_target,
    'Threats or unsafe behavior',
    'Please review the attached source message.',
    ids.group_message
  );
  if saved_id is null then raise exception 'Group user report was not created'; end if;
  update report_user_ids set group_report=saved_id;
end $$;
reset role;

-- Cases preserve lineage without copying canonical message content, and reporters
-- cannot rewrite human-review state.
do $$
declare ids report_user_ids%rowtype; saved public.moderation_reports; leaked boolean;
begin
  select * into ids from report_user_ids;
  select * into saved from public.moderation_reports where id=ids.support_report;
  if saved.reporter_id<>ids.support_reporter
     or saved.target_type<>'profile'
     or saved.target_id<>ids.support_target::text
     or saved.source_conversation_id<>ids.support_conversation
     or saved.source_message_id<>ids.support_message
     or saved.status<>'open' then
    raise exception 'Support report canonical lineage is incorrect';
  end if;

  select exists(
    select 1 from public.moderation_reports r
    where r.id in (ids.support_report,ids.group_report)
      and row_to_json(r)::text ilike '%USER REPORT EVIDENCE SECRET%'
  ) into leaked;
  if leaked then raise exception 'Canonical message body was copied into moderation report data'; end if;

  if (select count(*) from public.pbos_conversations)<>ids.baseline_conversation_count
     or (select count(*) from public.pbos_messages)<>ids.baseline_message_count then
    raise exception 'Report User mutated canonical conversation or message history';
  end if;
end $$;

set local role authenticated;
do $$
declare ids report_user_ids%rowtype; visible_count integer; affected integer; saved_status text;
begin
  select * into ids from report_user_ids;
  perform set_config('request.jwt.claim.sub',ids.support_reporter::text,true);
  select count(*) into visible_count from public.moderation_reports where id=ids.support_report;
  if visible_count<>1 then raise exception 'Reporter cannot view their own case'; end if;
  update public.moderation_reports
  set status='resolved',reviewed_by=ids.support_reporter,reviewed_at=now()
  where id=ids.support_report;
  get diagnostics affected=row_count;
  select status into saved_status from public.moderation_reports where id=ids.support_report;
  if affected<>0 or saved_status<>'open' then raise exception 'Reporter was able to resolve their own report'; end if;
end $$;
reset role;

-- Normal members cannot access the private evidence projection.
set local role authenticated;
do $$
declare ids report_user_ids%rowtype; denied boolean:=false;
begin
  select * into ids from report_user_ids;
  perform set_config('request.jwt.claim.sub',ids.support_reporter::text,true);
  begin
    perform * from public.get_moderation_profile_report_context(array[ids.support_report]);
  exception when sqlstate '42501' then denied:=true;
  end;
  if not denied then raise exception 'Non-moderator accessed private Report User evidence'; end if;
end $$;
reset role;

-- Founder/Admin receives only the bounded report target and source evidence projection.
set local role authenticated;
do $$
declare ids report_user_ids%rowtype; projected record;
begin
  select * into ids from report_user_ids;
  perform set_config('request.jwt.claim.sub',ids.moderator::text,true);
  select * into projected
  from public.get_moderation_profile_report_context(array[ids.support_report])
  where report_id=ids.support_report;

  if projected.target_user_id<>ids.support_target
     or projected.username<>'report_support_target'
     or projected.source_conversation_id<>ids.support_conversation
     or projected.conversation_kind<>'support'
     or projected.source_message_id<>ids.support_message
     or projected.source_message_sender_id<>ids.support_target
     or projected.source_message_body<>'SUPPORT USER REPORT EVIDENCE SECRET' then
    raise exception 'Moderator Report User projection is incomplete or incorrect';
  end if;
end $$;
reset role;

rollback;
