-- Phase 7 Messaging Report User authority.
-- Reuses canonical moderation_reports, profiles, conversations, and messages.
-- Message content remains canonical in pbos_messages and is never copied into a report row.

alter table public.moderation_reports
  add column if not exists source_conversation_id uuid,
  add column if not exists source_message_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid='public.moderation_reports'::regclass
      and conname='moderation_reports_source_conversation_fkey'
  ) then
    alter table public.moderation_reports
      add constraint moderation_reports_source_conversation_fkey
      foreign key (source_conversation_id)
      references public.pbos_conversations(id)
      on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid='public.moderation_reports'::regclass
      and conname='moderation_reports_source_message_fkey'
  ) then
    alter table public.moderation_reports
      add constraint moderation_reports_source_message_fkey
      foreign key (source_message_id)
      references public.pbos_messages(id)
      on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid='public.moderation_reports'::regclass
      and conname='moderation_reports_reason_length_check'
  ) then
    alter table public.moderation_reports
      add constraint moderation_reports_reason_length_check
      check (length(trim(reason)) between 1 and 160);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid='public.moderation_reports'::regclass
      and conname='moderation_reports_detail_length_check'
  ) then
    alter table public.moderation_reports
      add constraint moderation_reports_detail_length_check
      check (detail is null or length(detail)<=2000);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid='public.moderation_reports'::regclass
      and conname='moderation_reports_source_message_context_check'
  ) then
    alter table public.moderation_reports
      add constraint moderation_reports_source_message_context_check
      check (source_message_id is null or source_conversation_id is not null);
  end if;
end $$;

create index if not exists moderation_reports_profile_context_idx
  on public.moderation_reports(target_id,source_conversation_id,created_at desc)
  where target_type='profile';

-- Remove inherited broad table grants. Report cases are append-only for users;
-- moderators may update only human-review fields.
revoke all on table public.moderation_reports from public,anon,authenticated;
grant select,insert on table public.moderation_reports to authenticated;
grant update(status,resolution_note,reviewed_by,reviewed_at)
  on table public.moderation_reports to authenticated;

-- Ordinary report creation remains available for existing non-profile targets.
-- Messaging profile reports require the governed function below so conversation
-- and evidence lineage cannot be forged by a direct table insert.
drop policy if exists "Users create own reports" on public.moderation_reports;
create policy "Users create own reports"
on public.moderation_reports
for insert
to authenticated
with check (
  reporter_id=(select auth.uid())
  and target_type<>'profile'
  and source_conversation_id is null
  and source_message_id is null
  and status='open'
  and resolution_note is null
  and reviewed_by is null
  and reviewed_at is null
);

create or replace function private.report_governed_messaging_user(
  requested_conversation_id uuid,
  requested_user_id uuid,
  requested_reason text,
  requested_detail text default null,
  requested_message_id uuid default null
)
returns public.moderation_reports
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid:=auth.uid();
  target_conversation public.pbos_conversations%rowtype;
  source_message public.pbos_messages%rowtype;
  peer_id uuid;
  normalized_reason text:=trim(coalesce(requested_reason,''));
  normalized_detail text:=nullif(trim(coalesce(requested_detail,'')),'');
  saved public.moderation_reports%rowtype;
begin
  if actor_id is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;
  if requested_conversation_id is null or requested_user_id is null then
    raise exception 'Conversation and reported user are required.' using errcode='22023';
  end if;
  if requested_user_id=actor_id then
    raise exception 'You cannot report your own profile.' using errcode='22023';
  end if;
  if normalized_reason not in (
    'Harassment or bullying',
    'Spam or scam',
    'Impersonation',
    'Threats or unsafe behavior',
    'Other'
  ) then
    raise exception 'Choose a supported report reason.' using errcode='22023';
  end if;
  if length(normalized_reason)>160 or length(coalesce(normalized_detail,''))>2000 then
    raise exception 'Report detail is too long.' using errcode='22023';
  end if;
  if not exists(select 1 from public.profiles p where p.id=requested_user_id) then
    raise exception 'Reported Playbook user not found.' using errcode='P0002';
  end if;
  if not private.pbos_user_has_active_conversation_access(requested_conversation_id,actor_id) then
    raise exception 'Current conversation authority required.' using errcode='42501';
  end if;

  select * into target_conversation
  from public.pbos_conversations c
  where c.id=requested_conversation_id
    and c.status='ACTIVE';
  if not found then
    raise exception 'Conversation not found.' using errcode='P0002';
  end if;

  if target_conversation.conversation_kind in ('support','network') then
    peer_id:=private.pbos_conversation_peer_id(requested_conversation_id,actor_id);
    if peer_id is null or peer_id<>requested_user_id then
      raise exception 'Only the other participant in this conversation may be reported.' using errcode='42501';
    end if;
  elsif target_conversation.conversation_kind='group' then
    if requested_message_id is null then
      raise exception 'A source message is required for a group user report.' using errcode='22023';
    end if;
  else
    raise exception 'This conversation type does not support user reports.' using errcode='22023';
  end if;

  if requested_message_id is not null then
    select * into source_message
    from public.pbos_messages m
    where m.id=requested_message_id
      and m.conversation_id=requested_conversation_id
      and m.sender_id=requested_user_id;
    if not found then
      raise exception 'Source message does not belong to the reported user in this conversation.' using errcode='42501';
    end if;
  end if;

  insert into public.moderation_reports(
    reporter_id,
    target_type,
    target_id,
    reason,
    detail,
    status,
    source_conversation_id,
    source_message_id
  ) values (
    actor_id,
    'profile',
    requested_user_id::text,
    normalized_reason,
    normalized_detail,
    'open',
    requested_conversation_id,
    requested_message_id
  )
  returning * into saved;

  return saved;
end;
$$;

create or replace function private.get_moderation_profile_report_context(
  requested_report_ids uuid[]
)
returns table(
  report_id uuid,
  target_user_id uuid,
  username text,
  full_name text,
  source_conversation_id uuid,
  conversation_kind text,
  source_message_id uuid,
  source_message_body text,
  source_message_sender_id uuid,
  source_message_created_at timestamptz
)
language plpgsql
stable
security definer
set search_path=''
as $$
declare actor_id uuid:=auth.uid();
begin
  if actor_id is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;
  if not private.current_user_is_platform_moderator() then
    raise exception 'Platform moderator authority required.' using errcode='42501';
  end if;
  if requested_report_ids is null or coalesce(cardinality(requested_report_ids),0)=0 then
    return;
  end if;
  if cardinality(requested_report_ids)>100 then
    raise exception 'At most 100 report IDs may be inspected.' using errcode='22023';
  end if;

  return query
  with requested as (
    select distinct unnest(requested_report_ids) as id
  ), profile_reports as (
    select r.*,
      case
        when r.target_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
          then r.target_id::uuid
        else null
      end as target_uuid
    from requested q
    join public.moderation_reports r on r.id=q.id
    where r.target_type='profile'
  )
  select r.id,
    p.id,
    p.username,
    coalesce(
      nullif(trim(p.full_name),''),
      nullif(trim(concat_ws(' ',p.first_name,p.last_name)),''),
      p.username,
      'Playbook member'
    )::text,
    r.source_conversation_id,
    c.conversation_kind,
    r.source_message_id,
    m.body,
    m.sender_id,
    m.created_at
  from profile_reports r
  left join public.profiles p on p.id=r.target_uuid
  left join public.pbos_conversations c on c.id=r.source_conversation_id
  left join public.pbos_messages m
    on m.id=r.source_message_id
   and m.conversation_id=r.source_conversation_id
   and m.sender_id=r.target_uuid
  order by r.created_at desc,r.id;
end;
$$;

revoke all on function private.report_governed_messaging_user(uuid,uuid,text,text,uuid)
  from public,anon,authenticated;
revoke all on function private.get_moderation_profile_report_context(uuid[])
  from public,anon,authenticated;
-- SECURITY INVOKER public wrappers need these guarded private entrypoints.
grant execute on function private.report_governed_messaging_user(uuid,uuid,text,text,uuid)
  to authenticated;
grant execute on function private.get_moderation_profile_report_context(uuid[])
  to authenticated;

create or replace function public.report_governed_messaging_user(
  requested_conversation_id uuid,
  requested_user_id uuid,
  requested_reason text,
  requested_detail text default null,
  requested_message_id uuid default null
)
returns public.moderation_reports
language sql
security invoker
set search_path=''
as $$
  select private.report_governed_messaging_user(
    requested_conversation_id,
    requested_user_id,
    requested_reason,
    requested_detail,
    requested_message_id
  );
$$;

create or replace function public.get_moderation_profile_report_context(
  requested_report_ids uuid[]
)
returns table(
  report_id uuid,
  target_user_id uuid,
  username text,
  full_name text,
  source_conversation_id uuid,
  conversation_kind text,
  source_message_id uuid,
  source_message_body text,
  source_message_sender_id uuid,
  source_message_created_at timestamptz
)
language sql
stable
security invoker
set search_path=''
as $$
  select * from private.get_moderation_profile_report_context(requested_report_ids);
$$;

revoke all on function public.report_governed_messaging_user(uuid,uuid,text,text,uuid)
  from public,anon,authenticated;
revoke all on function public.get_moderation_profile_report_context(uuid[])
  from public,anon,authenticated;
grant execute on function public.report_governed_messaging_user(uuid,uuid,text,text,uuid)
  to authenticated;
grant execute on function public.get_moderation_profile_report_context(uuid[])
  to authenticated;

comment on function public.report_governed_messaging_user(uuid,uuid,text,text,uuid) is
  'Current-conversation-only profile report creation with canonical Messaging evidence lineage.';
comment on function public.get_moderation_profile_report_context(uuid[]) is
  'Moderator-only profile identity and source-message context for canonical moderation reports.';
