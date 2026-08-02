-- Launch tranche: institutional relationships, support messaging, action handoffs,
-- governed opportunities, safety moderation, and immutable administrative audit.

create table if not exists public.institutional_relationships (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null references public.profiles(id) on delete cascade,
  institution_member_id uuid not null references public.profiles(id) on delete cascade,
  institution_type text not null check(institution_type in ('school','district','university')),
  institution_name text not null,
  purpose text not null,
  permissions jsonb not null default '[]'::jsonb,
  status text not null default 'invited' check(status in ('invited','active','declined','revoked','expired')),
  invited_by uuid not null references public.profiles(id) on delete restrict,
  consented_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(scholar_id,institution_member_id,institution_type)
);
alter table public.institutional_relationships enable row level security;
create policy "Institutional relationship participants read" on public.institutional_relationships for select to authenticated
using(scholar_id=auth.uid() or institution_member_id=auth.uid());
create policy "Scholars invite institutional relationships" on public.institutional_relationships for insert to authenticated
with check(scholar_id=auth.uid() and invited_by=auth.uid() and status='invited');
-- State transitions are intentionally RPC-only so participants cannot rewrite
-- identities, permission grants, consent timestamps, or institution metadata.

alter table public.support_messages add column if not exists relationship_id uuid references public.support_relationships(id) on delete cascade;
alter table public.support_messages add column if not exists recipient_id uuid references public.profiles(id) on delete restrict;
alter table public.support_messages add column if not exists visibility text not null default 'participants' check(visibility in ('participants','scholar_only'));
alter table public.support_messages add column if not exists edited_at timestamptz;
alter table public.support_messages add column if not exists deleted_at timestamptz;
create index if not exists support_messages_relationship_created_idx on public.support_messages(relationship_id,created_at desc) where deleted_at is null;
drop policy if exists "Participants read permission-safe support messages" on public.support_messages;
create policy "Participants read permission-safe support messages" on public.support_messages for select to authenticated using(
  deleted_at is null and exists(select 1 from public.support_relationships sr where sr.id=support_messages.relationship_id and sr.status='active' and
    (sr.scholar_id=auth.uid() or sr.supporter_id=auth.uid()) and
    (support_messages.visibility='participants' or support_messages.recipient_id=auth.uid() or support_messages.sender_id=auth.uid()))
);

create table if not exists public.role_action_handoffs (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null references public.profiles(id) on delete cascade,
  relationship_id uuid references public.support_relationships(id) on delete restrict,
  created_by uuid not null references public.profiles(id) on delete restrict,
  assigned_to uuid not null references public.profiles(id) on delete restrict,
  action_type text not null check(action_type in ('intervention','recommendation','verification','opportunity_support')),
  title text not null,
  detail text,
  source_type text not null,
  source_id text,
  required_permission text not null,
  status text not null default 'assigned' check(status in ('assigned','accepted','in_progress','completed','declined','cancelled')),
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.role_action_handoffs enable row level security;
create index if not exists role_action_handoffs_assignee_status_idx on public.role_action_handoffs(assigned_to,status,due_at);
create policy "Action handoff participants read" on public.role_action_handoffs for select to authenticated
using(scholar_id=auth.uid() or created_by=auth.uid() or assigned_to=auth.uid());

alter table public.opportunity_matches add column if not exists scholar_id uuid references public.profiles(id) on delete cascade;
alter table public.opportunity_matches add column if not exists source_name text;
alter table public.opportunity_matches add column if not exists source_url text;
alter table public.opportunity_matches add column if not exists source_last_observed_at timestamptz;
alter table public.opportunity_matches add column if not exists expires_at timestamptz;
alter table public.opportunity_matches add column if not exists required_evidence jsonb not null default '[]'::jsonb;
alter table public.opportunity_matches add column if not exists unknowns jsonb not null default '[]'::jsonb;
alter table public.opportunity_matches add column if not exists confidence numeric(4,3);
alter table public.opportunity_matches add column if not exists role_context text not null default 'scholar';
update public.opportunity_matches om set scholar_id=pr.profile_id from public.playbook_records pr where pr.id=om.record_id and om.scholar_id is null;
create index if not exists opportunity_matches_scholar_status_idx on public.opportunity_matches(scholar_id,status,expires_at);
create policy "Active supporters read consented opportunity matches" on public.opportunity_matches for select to authenticated using(
  scholar_id=auth.uid() or exists(select 1 from public.support_relationships sr where sr.scholar_id=opportunity_matches.scholar_id and sr.supporter_id=auth.uid() and sr.status='active' and (sr.permissions ? 'view_progress' or sr.permissions ? 'recommend_actions' or sr.permissions ? 'view_verified_record'))
);

create table if not exists public.content_safety_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete restrict,
  target_type text not null check(target_type in ('post','comment','profile','event','album','message','opportunity')),
  target_id text not null,
  category text not null check(category in ('harassment','bullying','sexual_content','self_harm','violence','fraud','privacy','other')),
  detail text,
  severity text not null default 'medium' check(severity in ('low','medium','high','critical')),
  status text not null default 'open' check(status in ('open','triaged','investigating','resolved','dismissed','escalated')),
  assigned_to uuid references public.profiles(id) on delete set null,
  resolution_note text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.content_safety_reports enable row level security;
create index if not exists content_safety_reports_queue_idx on public.content_safety_reports(status,severity,created_at);
create policy "Users create own safety reports" on public.content_safety_reports for insert to authenticated with check(reporter_id=auth.uid());
create policy "Users read own safety reports" on public.content_safety_reports for select to authenticated using(reporter_id=auth.uid());

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete restrict,
  actor_role text not null,
  action_type text not null,
  target_type text not null,
  target_id text not null,
  before_state jsonb,
  after_state jsonb,
  reason text not null,
  request_id text,
  created_at timestamptz not null default now()
);
alter table public.admin_audit_log enable row level security;
create index if not exists admin_audit_log_target_idx on public.admin_audit_log(target_type,target_id,created_at desc);

create or replace function public.is_platform_admin(p_user uuid default auth.uid()) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles p where p.id=p_user and p.role in ('founder','admin','super_admin'));
$$;
revoke all on function public.is_platform_admin(uuid) from public,anon;
grant execute on function public.is_platform_admin(uuid) to authenticated;
create policy "Admins read safety queue" on public.content_safety_reports for select to authenticated using(public.is_platform_admin());
create policy "Admins read immutable audit" on public.admin_audit_log for select to authenticated using(public.is_platform_admin());

create or replace function public.create_support_message(p_scholar_id uuid,p_recipient_id uuid,p_body text,p_visibility text default 'participants')
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_sender uuid:=auth.uid(); v_relationship public.support_relationships%rowtype; v_message_id uuid; v_role text;
begin
  if v_sender is null then raise exception 'authentication_required'; end if;
  if nullif(trim(p_body),'') is null or length(p_body)>4000 then raise exception 'invalid_message_body'; end if;
  if p_visibility not in ('participants','scholar_only') then raise exception 'invalid_visibility'; end if;
  select * into v_relationship from public.support_relationships sr where sr.scholar_id=p_scholar_id and sr.status='active' and
    ((sr.scholar_id=v_sender and sr.supporter_id=p_recipient_id) or (sr.supporter_id=v_sender and sr.scholar_id=p_recipient_id)) limit 1;
  if not found then raise exception 'active_relationship_required'; end if;
  v_role:=case when v_sender=p_scholar_id then 'scholar' else v_relationship.relationship end;
  insert into public.support_messages(scholar_id,relationship_id,sender_id,sender_role,recipient_id,body,visibility)
  values(p_scholar_id,v_relationship.id,v_sender,v_role,p_recipient_id,trim(p_body),p_visibility) returning id into v_message_id;
  insert into public.playbook_events(type,scholar_id,actor_id,actor_role,payload) values('message.received',p_scholar_id::text,v_sender,v_role,jsonb_build_object('messageId',v_message_id,'title','New support message','detail','A permission-safe support message is available.'));
  return jsonb_build_object('messageId',v_message_id,'relationshipId',v_relationship.id,'createdAt',now());
end; $$;
revoke all on function public.create_support_message(uuid,uuid,text,text) from public,anon;
grant execute on function public.create_support_message(uuid,uuid,text,text) to authenticated;

create or replace function public.create_role_action_handoff(p_scholar_id uuid,p_assigned_to uuid,p_action_type text,p_title text,p_detail text,p_source_type text,p_source_id text,p_due_at timestamptz default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_relationship public.support_relationships%rowtype; v_permission text; v_id uuid;
begin
  if v_actor is null then raise exception 'authentication_required'; end if;
  v_permission:=case p_action_type when 'intervention' then 'recommend_actions' when 'recommendation' then 'recommend_actions' when 'verification' then 'verify_evidence' else 'support_tasks' end;
  select * into v_relationship from public.support_relationships sr where sr.scholar_id=p_scholar_id and sr.status='active' and
    ((sr.supporter_id=v_actor and sr.scholar_id=p_assigned_to) or (sr.scholar_id=v_actor and sr.supporter_id=p_assigned_to)) and
    (v_actor=p_scholar_id or sr.permissions ? v_permission) limit 1;
  if not found then raise exception 'authorized_relationship_required'; end if;
  insert into public.role_action_handoffs(scholar_id,relationship_id,created_by,assigned_to,action_type,title,detail,source_type,source_id,required_permission,due_at)
  values(p_scholar_id,v_relationship.id,v_actor,p_assigned_to,p_action_type,p_title,p_detail,p_source_type,p_source_id,v_permission,p_due_at) returning id into v_id;
  insert into public.playbook_events(type,scholar_id,actor_id,actor_role,payload) values('intervention.assigned',p_scholar_id::text,v_actor,v_relationship.relationship,jsonb_build_object('handoffId',v_id,'title',p_title,'detail',coalesce(p_detail,'A role action was assigned.')));
  return jsonb_build_object('handoffId',v_id,'status','assigned','requiredPermission',v_permission);
end; $$;
revoke all on function public.create_role_action_handoff(uuid,uuid,text,text,text,text,text,timestamptz) from public,anon;
grant execute on function public.create_role_action_handoff(uuid,uuid,text,text,text,text,text,timestamptz) to authenticated;

create or replace function public.update_role_action_handoff(p_handoff_id uuid,p_status text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_handoff public.role_action_handoffs%rowtype;
begin
  if p_status not in ('accepted','in_progress','completed','declined') then raise exception 'invalid_handoff_status'; end if;
  select * into v_handoff from public.role_action_handoffs where id=p_handoff_id for update;
  if not found or v_handoff.assigned_to<>v_actor then raise exception 'assignee_required'; end if;
  if v_handoff.status in ('completed','declined','cancelled') then raise exception 'handoff_closed'; end if;
  update public.role_action_handoffs set status=p_status,completed_at=case when p_status='completed' then now() else null end,updated_at=now() where id=p_handoff_id;
  insert into public.playbook_events(type,scholar_id,actor_id,actor_role,payload)
  values('intervention.'||p_status,v_handoff.scholar_id::text,v_actor,'supporter',jsonb_build_object('handoffId',p_handoff_id,'title',v_handoff.title,'detail','Action handoff status changed to '||p_status||'.'));
  return jsonb_build_object('handoffId',p_handoff_id,'status',p_status,'updatedAt',now());
end; $$;
revoke all on function public.update_role_action_handoff(uuid,text) from public,anon;
grant execute on function public.update_role_action_handoff(uuid,text) to authenticated;

create or replace function public.respond_institutional_relationship(p_relationship_id uuid,p_status text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_row public.institutional_relationships%rowtype;
begin
  if p_status not in ('active','declined','revoked') then raise exception 'invalid_relationship_status'; end if;
  select * into v_row from public.institutional_relationships where id=p_relationship_id for update;
  if not found then raise exception 'relationship_not_found'; end if;
  if p_status in ('active','declined') and (v_actor<>v_row.institution_member_id or v_row.status<>'invited') then raise exception 'invitee_required'; end if;
  if p_status='revoked' and v_actor<>v_row.scholar_id then raise exception 'scholar_required'; end if;
  update public.institutional_relationships set status=p_status,consented_at=case when p_status='active' then now() else consented_at end,updated_at=now() where id=p_relationship_id;
  return jsonb_build_object('relationshipId',p_relationship_id,'status',p_status,'updatedAt',now());
end; $$;
revoke all on function public.respond_institutional_relationship(uuid,text) from public,anon;
grant execute on function public.respond_institutional_relationship(uuid,text) to authenticated;

create or replace function public.moderate_safety_report(p_report_id uuid,p_status text,p_reason text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_before public.content_safety_reports%rowtype; v_after public.content_safety_reports%rowtype; v_role text;
begin
  if not public.is_platform_admin(v_actor) then raise exception 'admin_required'; end if;
  if p_status not in ('triaged','investigating','resolved','dismissed','escalated') or nullif(trim(p_reason),'') is null then raise exception 'invalid_moderation_decision'; end if;
  select * into v_before from public.content_safety_reports where id=p_report_id for update;
  if not found then raise exception 'report_not_found'; end if;
  select role into v_role from public.profiles where id=v_actor;
  update public.content_safety_reports set status=p_status,assigned_to=v_actor,resolution_note=p_reason,resolved_at=case when p_status in ('resolved','dismissed') then now() else null end,updated_at=now() where id=p_report_id returning * into v_after;
  insert into public.admin_audit_log(actor_id,actor_role,action_type,target_type,target_id,before_state,after_state,reason)
  values(v_actor,v_role,'moderation.'||p_status,'content_safety_report',p_report_id::text,to_jsonb(v_before),to_jsonb(v_after),p_reason);
  return jsonb_build_object('reportId',p_report_id,'status',p_status,'auditedAt',now());
end; $$;
revoke all on function public.moderate_safety_report(uuid,text,text) from public,anon;
grant execute on function public.moderate_safety_report(uuid,text,text) to authenticated;

create or replace function public.change_profile_role(p_profile_id uuid,p_new_role text,p_reason text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_before jsonb; v_after jsonb; v_actor_role text;
begin
  if not public.is_platform_admin(v_actor) then raise exception 'admin_required'; end if;
  if p_new_role not in ('scholar','scholar-athlete','transition-youth','family','mentor','educator','coach','college-coach','college-admissions','brand-partner','employer','district','other') or nullif(trim(p_reason),'') is null then raise exception 'invalid_role_change'; end if;
  select jsonb_build_object('role',role,'profile_mode',profile_mode) into v_before from public.profiles where id=p_profile_id for update;
  if v_before is null then raise exception 'profile_not_found'; end if;
  update public.profiles set role=p_new_role,profile_mode=p_new_role where id=p_profile_id returning jsonb_build_object('role',role,'profile_mode',profile_mode) into v_after;
  select role into v_actor_role from public.profiles where id=v_actor;
  insert into public.admin_audit_log(actor_id,actor_role,action_type,target_type,target_id,before_state,after_state,reason)
  values(v_actor,v_actor_role,'profile.role_changed','profile',p_profile_id::text,v_before,v_after,p_reason);
  return jsonb_build_object('profileId',p_profile_id,'role',p_new_role,'auditedAt',now());
end; $$;
revoke all on function public.change_profile_role(uuid,text,text) from public,anon;
grant execute on function public.change_profile_role(uuid,text,text) to authenticated;
