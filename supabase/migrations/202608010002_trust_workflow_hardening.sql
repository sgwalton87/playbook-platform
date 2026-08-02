-- Atomic invitations, explicit Scholar context, verification queue, packets, and event notifications.

create or replace function public.accept_support_invitation(p_token text, p_status text default 'accepted')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt()->>'email',''));
  v_invitation public.support_invitations%rowtype;
  v_relationship_id uuid;
begin
  if v_user is null then raise exception 'authentication_required'; end if;
  if p_status not in ('accepted','declined') then raise exception 'invalid_invitation_status'; end if;

  select * into v_invitation from public.support_invitations where token=p_token for update;
  if not found then raise exception 'invitation_not_found'; end if;
  if lower(v_invitation.invitee_email) <> v_email then raise exception 'invitation_email_mismatch'; end if;
  if v_invitation.status <> 'pending' and v_invitation.status <> p_status then raise exception 'invitation_already_resolved'; end if;

  if p_status = 'accepted' then
    insert into public.support_relationships(scholar_id,supporter_id,supporter_email,supporter_name,relationship,permissions,source_invitation_id,status)
    values(v_invitation.scholar_id,v_user,v_invitation.invitee_email,v_invitation.invitee_name,v_invitation.relationship,v_invitation.permissions,v_invitation.id,'active')
    on conflict(source_invitation_id) do update set supporter_id=v_user,permissions=excluded.permissions,status='active'
    returning id into v_relationship_id;
  end if;

  update public.support_invitations set status=p_status,
    accepted_at=case when p_status='accepted' then coalesce(accepted_at,now()) else null end,
    declined_at=case when p_status='declined' then coalesce(declined_at,now()) else null end
  where id=v_invitation.id;

  insert into public.playbook_events(type,scholar_id,actor_id,actor_role,payload)
  values('invitation.'||p_status,v_invitation.scholar_id::text,v_user,v_invitation.relationship,
    jsonb_build_object('invitationId',v_invitation.id,'relationshipId',v_relationship_id,'title','Support invitation '||p_status));

  return jsonb_build_object('invitationId',v_invitation.id,'scholarId',v_invitation.scholar_id,'status',p_status,
    'relationshipId',v_relationship_id,'destination',v_invitation.destination);
end; $$;
revoke all on function public.accept_support_invitation(text,text) from public, anon;
grant execute on function public.accept_support_invitation(text,text) to authenticated;

create table if not exists public.active_scholar_contexts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  scholar_id uuid not null references public.profiles(id) on delete cascade,
  relationship_id uuid not null references public.support_relationships(id) on delete cascade,
  selected_at timestamptz not null default now()
);
alter table public.active_scholar_contexts enable row level security;
create policy "Users read own active Scholar context" on public.active_scholar_contexts for select to authenticated using(user_id=auth.uid());
create policy "Users select an active Scholar relationship" on public.active_scholar_contexts for insert to authenticated
with check(user_id=auth.uid() and exists(select 1 from public.support_relationships sr where sr.id=relationship_id and sr.scholar_id=scholar_id and sr.supporter_id=auth.uid() and sr.status='active'));
create policy "Users change own active Scholar relationship" on public.active_scholar_contexts for update to authenticated
using(user_id=auth.uid()) with check(user_id=auth.uid() and exists(select 1 from public.support_relationships sr where sr.id=relationship_id and sr.scholar_id=scholar_id and sr.supporter_id=auth.uid() and sr.status='active'));
create policy "Active supporters read connected Scholar identity" on public.profiles for select to authenticated
using(exists(select 1 from public.support_relationships sr where sr.scholar_id=profiles.id and sr.supporter_id=auth.uid() and sr.status='active'));

create table if not exists public.evidence_verification_requests (
  id uuid primary key default gen_random_uuid(),
  evidence_id uuid not null references public.evidence(id) on delete cascade,
  scholar_id uuid not null references public.profiles(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete restrict,
  assigned_relationship_id uuid references public.support_relationships(id) on delete set null,
  status text not null default 'pending' check(status in ('pending','in_review','verified','rejected','cancelled')),
  request_note text,
  decision_reason text,
  requested_at timestamptz not null default now(),
  decided_at timestamptz
);
alter table public.evidence_verification_requests enable row level security;
create index if not exists verification_requests_scholar_status_idx on public.evidence_verification_requests(scholar_id,status,requested_at);
create unique index if not exists verification_requests_open_evidence_uidx on public.evidence_verification_requests(evidence_id) where status in ('pending','in_review');
create policy "Scholars read own verification requests" on public.evidence_verification_requests for select to authenticated using(scholar_id=auth.uid());
create policy "Scholars create own verification requests" on public.evidence_verification_requests for insert to authenticated with check(scholar_id=auth.uid() and requested_by=auth.uid() and exists(select 1 from public.evidence e where e.id=evidence_id and e.owner_id=auth.uid()));
create policy "Authorized reviewers read verification queue" on public.evidence_verification_requests for select to authenticated
using(exists(select 1 from public.support_relationships sr where sr.scholar_id=evidence_verification_requests.scholar_id and sr.supporter_id=auth.uid() and sr.status='active' and sr.permissions ? 'verify_evidence'));

alter table public.evidence_verification_audit add column if not exists request_id uuid references public.evidence_verification_requests(id) on delete set null;

create or replace function public.request_evidence_verification(p_evidence_id uuid,p_note text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_request_id uuid;
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;
  if not exists(select 1 from public.evidence e where e.id=p_evidence_id and e.owner_id=auth.uid() and e.deleted_at is null) then raise exception 'owned_evidence_required'; end if;
  insert into public.evidence_verification_requests(evidence_id,scholar_id,requested_by,request_note)
  values(p_evidence_id,auth.uid(),auth.uid(),p_note) returning id into v_request_id;
  update public.evidence set verification_state='pending',consent_scope='relationship' where id=p_evidence_id;
  insert into public.playbook_events(type,scholar_id,actor_id,actor_role,payload) values('verification.requested',auth.uid()::text,auth.uid(),'scholar',
    jsonb_build_object('requestId',v_request_id,'evidenceId',p_evidence_id,'title','Evidence verification requested','detail',coalesce(p_note,'A Scholar requested evidence review.')));
  return jsonb_build_object('requestId',v_request_id,'state','pending','requestedAt',now());
end; $$;
revoke all on function public.request_evidence_verification(uuid,text) from public,anon;
grant execute on function public.request_evidence_verification(uuid,text) to authenticated;

create or replace function public.review_verification_request(p_request_id uuid,p_decision public.verification_status,p_reason text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_request public.evidence_verification_requests%rowtype;
  v_evidence public.evidence%rowtype;
  v_actor_role text;
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;
  if p_decision not in ('verified','rejected') then raise exception 'invalid_verification_decision'; end if;
  if nullif(trim(p_reason),'') is null then raise exception 'decision_reason_required'; end if;
  select * into v_request from public.evidence_verification_requests where id=p_request_id for update;
  if not found or v_request.status not in ('pending','in_review') then raise exception 'request_not_reviewable'; end if;
  select relationship into v_actor_role from public.support_relationships
    where scholar_id=v_request.scholar_id and supporter_id=auth.uid() and status='active' and permissions ? 'verify_evidence' limit 1;
  if v_actor_role is null then raise exception 'verification_permission_required'; end if;
  select * into v_evidence from public.evidence where id=v_request.evidence_id for update;

  update public.evidence set verification_state=p_decision,verified=(p_decision='verified'),verification_actor_id=auth.uid(),
    verification_actor_role=v_actor_role,verified_at=case when p_decision='verified' then now() else null end,state_reason=p_reason
  where id=v_request.evidence_id;
  update public.evidence_verification_requests set status=p_decision::text,decision_reason=p_reason,decided_at=now() where id=p_request_id;
  insert into public.evidence_verification_audit(evidence_id,scholar_id,actor_id,actor_role,previous_state,decision,reason,request_id)
  values(v_evidence.id,v_request.scholar_id,auth.uid(),v_actor_role,v_evidence.verification_state,p_decision,p_reason,p_request_id);
  insert into public.playbook_events(type,scholar_id,actor_id,actor_role,payload)
  values('verification.'||p_decision,v_request.scholar_id::text,auth.uid(),v_actor_role,
    jsonb_build_object('requestId',p_request_id,'evidenceId',v_evidence.id,'title','Evidence '||p_decision,'detail',p_reason));
  return jsonb_build_object('requestId',p_request_id,'state',p_decision,'reviewedAt',now());
end; $$;
revoke all on function public.review_verification_request(uuid,public.verification_status,text) from public,anon;
grant execute on function public.review_verification_request(uuid,public.verification_status,text) to authenticated;

create table if not exists public.portfolio_packet_snapshots (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null references public.profiles(id) on delete cascade,
  target_use text not null,
  packet jsonb not null,
  allowed_sections text[] not null,
  created_at timestamptz not null default now()
);
alter table public.portfolio_packet_snapshots enable row level security;
create policy "Scholars manage own packet snapshots" on public.portfolio_packet_snapshots for all to authenticated
using(scholar_id=auth.uid()) with check(scholar_id=auth.uid());
alter table public.portfolio_shares add column if not exists packet_snapshot_id uuid references public.portfolio_packet_snapshots(id) on delete restrict;
alter table public.portfolio_shares add column if not exists revoked_at timestamptz;

delete from public.notifications a using public.notifications b
where a.source_event_id is not null and a.user_id=b.user_id and a.source_event_id=b.source_event_id and a.ctid>b.ctid;
create unique index if not exists notifications_source_recipient_uidx on public.notifications(user_id,source_event_id) where source_event_id is not null;

create or replace function public.create_notifications_for_playbook_event()
returns trigger language plpgsql security definer set search_path=public as $$
declare
  v_category text;
  v_href text;
  v_priority text := 'medium';
begin
  v_category := case
    when new.type like 'verification.%' then 'verification'
    when new.type like 'intervention.%' or new.type in ('action.assigned','network.blocker_detected') then 'intervention'
    when new.type like 'opportunity.%' then 'opportunity'
    when new.type like 'milestone.%' then 'milestone'
    else null end;
  if v_category is null then return new; end if;
  v_href := case v_category when 'verification' then case when new.type='verification.requested' then '/evidence/verification-queue' else '/evidence' end
    when 'intervention' then '/action-routing' when 'opportunity' then '/opportunities' when 'milestone' then '/portfolio' end;
  v_priority := case v_category when 'verification' then 'high' when 'intervention' then 'high' else 'medium' end;

  if new.type='verification.requested' then
    insert into public.notifications(user_id,scholar_id,type,title,body,href,priority,source_event_id)
    select distinct sr.supporter_id::text,new.scholar_id,v_category,coalesce(new.payload->>'title','Verification requested'),
      coalesce(new.payload->>'detail','Evidence is ready for review.'),v_href,v_priority,new.id
    from public.support_relationships sr where sr.scholar_id::text=new.scholar_id and sr.status='active' and sr.supporter_id is not null and sr.permissions ? 'verify_evidence'
    on conflict(user_id,source_event_id) where source_event_id is not null do nothing;
  else
    insert into public.notifications(user_id,scholar_id,type,title,body,href,priority,source_event_id)
    values(new.scholar_id,new.scholar_id,v_category,coalesce(new.payload->>'title',initcap(v_category)||' update'),
      coalesce(new.payload->>'detail','Review the latest governed update.'),v_href,v_priority,new.id)
    on conflict(user_id,source_event_id) where source_event_id is not null do nothing;

    if v_category in ('intervention','milestone') then
      insert into public.notifications(user_id,scholar_id,type,title,body,href,priority,source_event_id)
      select distinct sr.supporter_id::text,new.scholar_id,v_category,coalesce(new.payload->>'title',initcap(v_category)||' update'),
        coalesce(new.payload->>'detail','Review the latest governed update.'),v_href,v_priority,new.id
      from public.support_relationships sr where sr.scholar_id::text=new.scholar_id and sr.status='active' and sr.supporter_id is not null
        and (sr.permissions ? 'view_progress' or sr.permissions ? 'support_tasks' or sr.permissions ? 'recommend_actions')
      on conflict(user_id,source_event_id) where source_event_id is not null do nothing;
    end if;
  end if;
  return new;
end; $$;
drop trigger if exists trg_playbook_events_create_notifications on public.playbook_events;
create trigger trg_playbook_events_create_notifications after insert on public.playbook_events for each row execute function public.create_notifications_for_playbook_event();

create policy "Authenticated actors create governed events" on public.playbook_events for insert to authenticated
with check(actor_id=auth.uid() and (scholar_id=auth.uid()::text or exists(select 1 from public.support_relationships sr where sr.scholar_id::text=playbook_events.scholar_id and sr.supporter_id=auth.uid() and sr.status='active')));
create policy "Actors and Scholars read governed events" on public.playbook_events for select to authenticated
using(actor_id=auth.uid() or scholar_id=auth.uid()::text);

-- Packet contents and share lifecycle writes are server-service operations only.
drop policy if exists "Scholars can manage own portfolio shares" on public.portfolio_shares;
create policy "Scholars read own portfolio shares" on public.portfolio_shares for select to authenticated using(scholar_id=auth.uid());
drop policy if exists "Scholars manage own packet snapshots" on public.portfolio_packet_snapshots;
create policy "Scholars read own packet snapshots" on public.portfolio_packet_snapshots for select to authenticated using(scholar_id=auth.uid());
