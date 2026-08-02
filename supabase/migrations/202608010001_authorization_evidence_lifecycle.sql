-- Canonical authorization, onboarding completion, and evidence provenance.

alter table public.profiles add column if not exists ideal_profession text;

create unique index if not exists playbook_records_profile_active_uidx
on public.playbook_records(profile_id)
where deleted_at is null;

create table if not exists public.role_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null,
  organization_name text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id, role)
);
alter table public.role_profiles enable row level security;
create policy "Users manage own role profile" on public.role_profiles for all to authenticated
using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create table if not exists public.onboarding_completion_attempts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('failed')),
  failed_stage text not null,
  error_code text not null,
  created_at timestamptz not null default now()
);
alter table public.onboarding_completion_attempts enable row level security;
create policy "Users view own onboarding failures" on public.onboarding_completion_attempts for select to authenticated
using (profile_id = auth.uid());
create policy "Users record own onboarding failures" on public.onboarding_completion_attempts for insert to authenticated
with check (profile_id = auth.uid());

create policy "Users read own actionable notifications" on public.notifications for select to authenticated
using (user_id = auth.uid()::text);
create policy "Users update own notification attention" on public.notifications for update to authenticated
using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text);

create unique index if not exists support_relationships_invitation_uidx
on public.support_relationships(source_invitation_id);
create policy "Invitees activate accepted relationships" on public.support_relationships for insert to authenticated
with check (supporter_id = auth.uid() and exists (select 1 from public.support_invitations i where i.id = support_relationships.source_invitation_id and lower(i.invitee_email) = lower(coalesce(auth.jwt()->>'email',''))));

alter table public.evidence
  add column if not exists owner_id uuid references public.profiles(id) on delete cascade,
  add column if not exists source_type text not null default 'self_reported',
  add column if not exists source_reference text,
  add column if not exists verification_state public.verification_status not null default 'unverified',
  add column if not exists verification_actor_id uuid references public.profiles(id) on delete set null,
  add column if not exists verification_actor_role text,
  add column if not exists verified_at timestamptz,
  add column if not exists last_observed_at timestamptz not null default now(),
  add column if not exists visibility public.visibility_level not null default 'private',
  add column if not exists consent_scope text not null default 'owner_only',
  add column if not exists state_reason text,
  add column if not exists expires_at timestamptz;

update public.evidence e set owner_id = r.profile_id
from public.achievements a join public.playbook_records r on r.id = a.record_id
where e.achievement_id = a.id and e.owner_id is null;
alter table public.evidence alter column owner_id set not null;
create index if not exists evidence_owner_state_idx on public.evidence(owner_id, verification_state);

create table if not exists public.evidence_verification_audit (
  id uuid primary key default gen_random_uuid(),
  evidence_id uuid not null references public.evidence(id) on delete cascade,
  scholar_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete restrict,
  actor_role text not null,
  previous_state public.verification_status not null,
  decision public.verification_status not null check (decision in ('verified','rejected')),
  reason text,
  created_at timestamptz not null default now()
);
alter table public.evidence_verification_audit enable row level security;

-- Relationship-authorized reads mirror application view_evidence permissions.
create policy "Active supporters read consented evidence" on public.evidence for select to authenticated using (
  exists (
    select 1 from public.support_relationships sr
    where sr.scholar_id = evidence.owner_id and sr.supporter_id = auth.uid() and sr.status = 'active'
      and sr.permissions ? 'view_evidence'
      and evidence.consent_scope in ('support_network', 'relationship')
  )
);
create policy "Evidence audit visible to scholar and actor" on public.evidence_verification_audit for select to authenticated
using (scholar_id = auth.uid() or actor_id = auth.uid());
create policy "Authorized reviewers create evidence audit" on public.evidence_verification_audit for insert to authenticated
with check (actor_id = auth.uid() and exists (select 1 from public.support_relationships sr where sr.scholar_id = evidence_verification_audit.scholar_id and sr.supporter_id = auth.uid() and sr.status = 'active' and sr.permissions ? 'verify_evidence'));

create or replace function public.review_evidence(p_evidence_id uuid, p_decision public.verification_status, p_reason text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_evidence public.evidence%rowtype;
  v_actor_role text;
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;
  if p_decision not in ('verified','rejected') then raise exception 'invalid_verification_decision'; end if;
  select * into v_evidence from public.evidence where id=p_evidence_id for update;
  if not found then raise exception 'evidence_not_found_or_forbidden'; end if;
  select relationship into v_actor_role from public.support_relationships
    where scholar_id=v_evidence.owner_id and supporter_id=auth.uid() and status='active' and permissions ? 'verify_evidence' limit 1;
  if v_actor_role is null then raise exception 'verification_permission_required'; end if;

  update public.evidence set verification_state=p_decision, verified=(p_decision='verified'), verification_actor_id=auth.uid(),
    verification_actor_role=v_actor_role, verified_at=case when p_decision='verified' then now() else null end, state_reason=p_reason
  where id=p_evidence_id;
  insert into public.evidence_verification_audit(evidence_id,scholar_id,actor_id,actor_role,previous_state,decision,reason)
  values(p_evidence_id,v_evidence.owner_id,auth.uid(),v_actor_role,v_evidence.verification_state,p_decision,p_reason);
  return jsonb_build_object('state',p_decision,'reviewedAt',now());
end; $$;

create or replace function public.complete_onboarding(p_profile jsonb)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_role text := coalesce(p_profile->>'role', 'scholar');
  v_record_type public.playbook_record_type;
  v_record_id uuid;
begin
  if v_user is null then raise exception 'authentication_required'; end if;
  v_record_type := case v_role
    when 'scholar-athlete' then 'scholar_athlete'::public.playbook_record_type
    when 'family' then 'parent'::public.playbook_record_type
    when 'mentor' then 'mentor'::public.playbook_record_type
    when 'coach' then 'coach'::public.playbook_record_type
    when 'educator' then 'educator'::public.playbook_record_type
    when 'district' then 'admin'::public.playbook_record_type
    when 'other' then 'organization'::public.playbook_record_type
    when 'employer' then 'organization'::public.playbook_record_type
    when 'brand-partner' then 'organization'::public.playbook_record_type
    else 'scholar'::public.playbook_record_type end;

  insert into public.role_profiles(profile_id, role, organization_name, metadata)
  values(v_user, v_role, p_profile#>>'{onboarding_data,organization_name}', coalesce(p_profile->'onboarding_data','{}'::jsonb))
  on conflict(profile_id, role) do update set organization_name=excluded.organization_name, metadata=excluded.metadata, updated_at=now();

  insert into public.playbook_records(profile_id, record_type, created_by, updated_by, metadata)
  values(v_user, v_record_type, v_user, v_user, jsonb_build_object('onboarding_role',v_role))
  on conflict(profile_id) where deleted_at is null do update set record_type=excluded.record_type, updated_by=v_user, updated_at=now()
  returning id into v_record_id;

  insert into public.support_relationships(scholar_id,supporter_id,supporter_email,supporter_name,relationship,permissions,source_invitation_id,status)
  select i.scholar_id,v_user,i.invitee_email,i.invitee_name,i.relationship,i.permissions,i.id,'active'
  from public.support_invitations i
  where lower(i.invitee_email)=lower(coalesce(auth.jwt()->>'email','')) and i.status='accepted'
  on conflict(source_invitation_id) do update set supporter_id=v_user,status='active';

  update public.profiles set
    role=v_role, profile_mode=v_role, requested_role=v_role,
    full_name=nullif(p_profile->>'full_name',''), username=nullif(p_profile->>'username',''),
    avatar_url=nullif(p_profile->>'avatar_url',''), bio=nullif(p_profile->>'bio',''),
    school=nullif(p_profile->>'school',''), grade=nullif(p_profile->>'grade',''),
    dream_school=nullif(p_profile->>'dream_school',''), ideal_profession=nullif(p_profile->>'ideal_profession',''), onboarding_data=coalesce(p_profile->'onboarding_data','{}'::jsonb),
    onboarding_completed=true, onboarding_completed_at=now(), public_profile_complete=coalesce((p_profile->>'public_profile_complete')::boolean,false),
    community_safety_agreed=true, community_safety_agreed_at=now(), community_safety_policy_version='playbook-safety-v1'
  where id=v_user;

  return jsonb_build_object('profileId',v_user,'recordId',v_record_id,'role',v_role);
end; $$;
