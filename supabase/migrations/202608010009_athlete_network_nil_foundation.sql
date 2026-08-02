-- Canonical Scholar-Athlete profile, recruiting activity, NIL identity, and
-- compliance foundation. Athlete ownership remains authoritative; discovery
-- uses allowlisted projections rather than direct table exposure.

create or replace function public.is_scholar_athlete(p_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1 from public.profiles profile
    where profile.id=p_user
      and coalesce(nullif(profile.profile_mode,''),profile.role::text) in ('scholar-athlete','scholar_athlete','athlete')
  );
$$;
revoke all on function public.is_scholar_athlete(uuid) from public,anon;
grant execute on function public.is_scholar_athlete(uuid) to authenticated;

do $$
begin
  if exists(
    select scholar_id from public.athlete_profiles
    group by scholar_id having count(*) > 1
  ) then
    raise exception 'duplicate_athlete_profiles_require_reconciliation';
  end if;
end; $$;

drop policy if exists "Scholars manage own athlete profile" on public.athlete_profiles;
create policy "Scholar athletes read own athlete profile"
on public.athlete_profiles for select to authenticated
using (scholar_id=auth.uid() and public.is_scholar_athlete());
create policy "Scholar athletes create own athlete profile"
on public.athlete_profiles for insert to authenticated
with check (scholar_id=auth.uid() and public.is_scholar_athlete());
create policy "Scholar athletes update own athlete profile"
on public.athlete_profiles for update to authenticated
using (scholar_id=auth.uid() and public.is_scholar_athlete())
with check (scholar_id=auth.uid() and public.is_scholar_athlete());

drop policy if exists "Scholars read own eligibility checks" on public.athlete_eligibility_checks;
create policy "Scholar athletes read own eligibility checks"
on public.athlete_eligibility_checks for select to authenticated
using (scholar_id=auth.uid() and public.is_scholar_athlete());

drop policy if exists "Scholars manage own recruiting targets" on public.recruiting_targets;
create policy "Scholar athletes read own recruiting targets"
on public.recruiting_targets for select to authenticated
using (scholar_id=auth.uid() and public.is_scholar_athlete());
create policy "Scholar athletes create own recruiting targets"
on public.recruiting_targets for insert to authenticated
with check (scholar_id=auth.uid() and public.is_scholar_athlete());
create policy "Scholar athletes update own recruiting targets"
on public.recruiting_targets for update to authenticated
using (scholar_id=auth.uid() and public.is_scholar_athlete())
with check (scholar_id=auth.uid() and public.is_scholar_athlete());

drop policy if exists "Scholars manage own athlete financial entries" on public.athlete_financial_entries;
create policy "Scholar athletes govern own financial entries"
on public.athlete_financial_entries for all to authenticated
using (scholar_id=auth.uid() and public.is_scholar_athlete())
with check (scholar_id=auth.uid() and public.is_scholar_athlete());

create unique index if not exists athlete_profiles_scholar_unique_idx
on public.athlete_profiles(scholar_id);

alter table public.athlete_profiles
  add column if not exists athlete_level text not null default 'high_school'
    check (athlete_level in ('youth','middle_school','high_school','college','professional','retired','international')),
  add column if not exists secondary_sport text,
  add column if not exists bio text,
  add column if not exists location text,
  add column if not exists teams jsonb not null default '[]'::jsonb,
  add column if not exists leagues jsonb not null default '[]'::jsonb,
  add column if not exists seasons jsonb not null default '[]'::jsonb,
  add column if not exists athletic_history jsonb not null default '[]'::jsonb,
  add column if not exists achievements jsonb not null default '[]'::jsonb,
  add column if not exists statistics jsonb not null default '[]'::jsonb,
  add column if not exists awards jsonb not null default '[]'::jsonb,
  add column if not exists leadership_experience jsonb not null default '[]'::jsonb,
  add column if not exists measurements jsonb not null default '{}'::jsonb,
  add column if not exists combine_data jsonb not null default '{}'::jsonb,
  add column if not exists visibility text not null default 'private'
    check (visibility in ('private','network','recruiting','public')),
  add column if not exists verification_state text not null default 'unverified'
    check (verification_state in ('unverified','pending','partially_verified','verified','rejected')),
  add column if not exists provenance jsonb not null default '{}'::jsonb,
  add column if not exists consent_scope text[] not null default array['owner']::text[],
  add column if not exists updated_at timestamptz not null default now();

drop policy if exists "Scholar athletes create own athlete profile" on public.athlete_profiles;
create policy "Scholar athletes create own athlete profile"
on public.athlete_profiles for insert to authenticated
with check (scholar_id=auth.uid() and public.is_scholar_athlete() and verification_state='unverified');

create or replace function public.guard_athlete_profile_verification()
returns trigger language plpgsql set search_path=public as $$
begin
  if new.verification_state is distinct from old.verification_state
    and coalesce(current_setting('playbook.athlete_verification_command',true),'false') <> 'true'
  then raise exception 'governed_athlete_verification_required'; end if;
  return new;
end; $$;

drop trigger if exists guard_athlete_profile_verification on public.athlete_profiles;
create trigger guard_athlete_profile_verification
before update on public.athlete_profiles
for each row execute function public.guard_athlete_profile_verification();

drop trigger if exists set_athlete_profiles_updated_at on public.athlete_profiles;
create trigger set_athlete_profiles_updated_at
before update on public.athlete_profiles
for each row execute function public.set_updated_at();

create table if not exists public.athlete_nil_profiles (
  id uuid primary key default gen_random_uuid(),
  athlete_profile_id uuid not null unique references public.athlete_profiles(id) on delete cascade,
  scholar_id uuid not null unique references public.profiles(id) on delete cascade,
  brand_statement text,
  brand_values text[] not null default '{}'::text[],
  audience_demographics jsonb not null default '{}'::jsonb,
  social_presence jsonb not null default '[]'::jsonb,
  content_portfolio jsonb not null default '[]'::jsonb,
  brand_categories text[] not null default '{}'::text[],
  partnership_interests text[] not null default '{}'::text[],
  visibility text not null default 'private' check (visibility in ('private','network','marketplace')),
  discoverable boolean not null default false,
  marketplace_consent_at timestamptz,
  guardian_consent_at timestamptz,
  verification_state text not null default 'unverified'
    check (verification_state in ('unverified','pending','partially_verified','verified','rejected')),
  provenance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not discoverable or (visibility = 'marketplace' and marketplace_consent_at is not null))
);

create index if not exists athlete_nil_profiles_marketplace_idx
on public.athlete_nil_profiles(discoverable, visibility, updated_at desc)
where discoverable = true;

alter table public.athlete_nil_profiles enable row level security;
create policy "Athletes read own NIL profile"
on public.athlete_nil_profiles for select to authenticated
using (scholar_id=auth.uid() and public.is_scholar_athlete());
create policy "Athletes create own NIL profile"
on public.athlete_nil_profiles for insert to authenticated
with check (scholar_id=auth.uid() and public.is_scholar_athlete() and verification_state='unverified' and guardian_consent_at is null);
create policy "Athletes update own NIL profile"
on public.athlete_nil_profiles for update to authenticated
using (scholar_id=auth.uid() and public.is_scholar_athlete())
with check (scholar_id=auth.uid() and public.is_scholar_athlete());
create policy "Athletes delete own NIL profile"
on public.athlete_nil_profiles for delete to authenticated
using (scholar_id=auth.uid() and public.is_scholar_athlete());

create or replace function public.guard_athlete_nil_verification()
returns trigger language plpgsql set search_path=public as $$
begin
  if (
    new.verification_state is distinct from old.verification_state
    or new.guardian_consent_at is distinct from old.guardian_consent_at
  ) and coalesce(current_setting('playbook.athlete_verification_command',true),'false') <> 'true'
  then raise exception 'governed_athlete_verification_required'; end if;
  return new;
end; $$;
create trigger guard_athlete_nil_verification
before update on public.athlete_nil_profiles
for each row execute function public.guard_athlete_nil_verification();

create trigger set_athlete_nil_profiles_updated_at
before update on public.athlete_nil_profiles
for each row execute function public.set_updated_at();

create table if not exists public.athlete_recruiting_activities (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null references public.profiles(id) on delete cascade,
  recruiting_target_id uuid references public.recruiting_targets(id) on delete cascade,
  activity_type text not null check (activity_type in ('interest','outreach','message','visit','camp','showcase','offer','commitment','note')),
  direction text not null check (direction in ('athlete_to_school','school_to_athlete','coach_to_athlete','athlete_to_coach','internal')),
  status text not null default 'planned' check (status in ('planned','completed','cancelled')),
  organization_name text,
  contact_name text,
  occurred_at timestamptz,
  scheduled_for timestamptz,
  notes text,
  provenance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists athlete_recruiting_activity_scholar_idx
on public.athlete_recruiting_activities(scholar_id, created_at desc);
create index if not exists athlete_recruiting_activity_target_idx
on public.athlete_recruiting_activities(recruiting_target_id, created_at desc);
alter table public.athlete_recruiting_activities enable row level security;
create policy "Athletes read own recruiting activity"
on public.athlete_recruiting_activities for select to authenticated
using (scholar_id=auth.uid() and public.is_scholar_athlete());
create policy "Athletes create own recruiting activity"
on public.athlete_recruiting_activities for insert to authenticated
with check (
  scholar_id = auth.uid() and public.is_scholar_athlete()
  and (
    recruiting_target_id is null
    or exists (
      select 1 from public.recruiting_targets target
      where target.id = recruiting_target_id and target.scholar_id = auth.uid()
    )
  )
);
create policy "Athletes update own recruiting activity"
on public.athlete_recruiting_activities for update to authenticated
using (scholar_id=auth.uid() and public.is_scholar_athlete())
with check (
  scholar_id = auth.uid() and public.is_scholar_athlete()
  and (
    recruiting_target_id is null
    or exists (
      select 1 from public.recruiting_targets target
      where target.id = recruiting_target_id and target.scholar_id = auth.uid()
    )
  )
);
create trigger set_athlete_recruiting_activities_updated_at
before update on public.athlete_recruiting_activities
for each row execute function public.set_updated_at();

create or replace function public.guard_recruiting_stage()
returns trigger language plpgsql set search_path=public as $$
begin
  if new.stage is distinct from old.stage
    and coalesce(current_setting('playbook.recruiting_transition_command',true),'false') <> 'true'
  then raise exception 'governed_recruiting_transition_required'; end if;
  return new;
end; $$;
create trigger guard_recruiting_stage
before update on public.recruiting_targets
for each row execute function public.guard_recruiting_stage();

alter table public.nil_deals
  add column if not exists opportunity_type text not null default 'sponsorship'
    check (opportunity_type in ('sponsorship','ambassador','appearance','camp','clinic','social_campaign','content','merchandise','affiliate','entrepreneurship')),
  add column if not exists source_name text,
  add column if not exists source_url text,
  add column if not exists jurisdiction text,
  add column if not exists institution_name text,
  add column if not exists agreement_reference text,
  add column if not exists compliance_status text not null default 'not_submitted'
    check (compliance_status in ('not_submitted','submitted','under_review','approved','changes_required','rejected')),
  add column if not exists compliance_notes text,
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists provenance jsonb not null default '{}'::jsonb,
  add column if not exists payment_verification_state text not null default 'unverified'
    check (payment_verification_state in ('unverified','pending','verified','disputed')),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.nil_deal_deliverables (
  id uuid primary key default gen_random_uuid(),
  nil_deal_id uuid not null references public.nil_deals(id) on delete cascade,
  scholar_id uuid not null references public.profiles(id) on delete cascade,
  label text not null check (length(trim(label)) between 1 and 240),
  due_at timestamptz,
  status text not null default 'planned' check (status in ('planned','in_progress','submitted','accepted','changes_required','completed','cancelled')),
  evidence_reference text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists nil_deal_deliverables_deal_idx
on public.nil_deal_deliverables(nil_deal_id, status, due_at);
alter table public.nil_deal_deliverables enable row level security;
create policy "Athletes read own NIL deliverables"
on public.nil_deal_deliverables for select to authenticated
using (scholar_id=auth.uid() and public.is_scholar_athlete());
create policy "Athletes create own NIL deliverables"
on public.nil_deal_deliverables for insert to authenticated
with check (scholar_id=auth.uid() and public.is_scholar_athlete()
  and exists(select 1 from public.nil_deals deal where deal.id=nil_deal_id and deal.scholar_id=auth.uid()) and status='planned' and evidence_reference is null and completed_at is null);
create policy "Athletes update own NIL deliverable details"
on public.nil_deal_deliverables for update to authenticated
using (scholar_id=auth.uid() and public.is_scholar_athlete())
with check (scholar_id=auth.uid() and public.is_scholar_athlete()
  and exists(select 1 from public.nil_deals deal where deal.id=nil_deal_id and deal.scholar_id=auth.uid()));
create or replace function public.guard_nil_deliverable_decision()
returns trigger language plpgsql set search_path=public as $$
begin
  if (
    new.status is distinct from old.status
    or new.evidence_reference is distinct from old.evidence_reference
    or new.completed_at is distinct from old.completed_at
  ) and coalesce(current_setting('playbook.nil_deliverable_command',true),'false') <> 'true'
  then raise exception 'governed_nil_deliverable_command_required'; end if;
  return new;
end; $$;
create trigger guard_nil_deliverable_decision
before update on public.nil_deal_deliverables
for each row execute function public.guard_nil_deliverable_decision();
create trigger set_nil_deal_deliverables_updated_at
before update on public.nil_deal_deliverables
for each row execute function public.set_updated_at();

create table if not exists public.nil_compliance_audit (
  id uuid primary key default gen_random_uuid(),
  nil_deal_id uuid not null references public.nil_deals(id) on delete restrict,
  scholar_id uuid not null references public.profiles(id) on delete restrict,
  actor_id uuid not null references public.profiles(id) on delete restrict,
  action text not null,
  before_state jsonb,
  after_state jsonb not null,
  reason text not null check (length(trim(reason)) between 3 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists nil_compliance_audit_deal_idx
on public.nil_compliance_audit(nil_deal_id, created_at desc);
alter table public.nil_compliance_audit enable row level security;
create policy "Athletes read own NIL compliance audit"
on public.nil_compliance_audit for select to authenticated
using (scholar_id = auth.uid() and public.is_scholar_athlete());
create policy "Admins read NIL compliance audit"
on public.nil_compliance_audit for select to authenticated
using (public.is_platform_admin());

create table if not exists public.athlete_command_receipts (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete cascade,
  command_key text not null check (length(command_key) between 16 and 120),
  command_type text not null,
  result jsonb,
  created_at timestamptz not null default now(),
  unique(actor_id, command_type, command_key)
);
alter table public.athlete_command_receipts enable row level security;
create policy "Athlete command receipts deny direct access"
on public.athlete_command_receipts for all to authenticated
using (false) with check (false);

drop policy if exists "Scholars manage own NIL deals" on public.nil_deals;
create policy "Athletes read own NIL deals"
on public.nil_deals for select to authenticated
using (scholar_id = auth.uid() and public.is_scholar_athlete());
create policy "Admins read NIL compliance queue"
on public.nil_deals for select to authenticated
using (public.is_platform_admin());
create policy "Athletes create own NIL leads"
on public.nil_deals for insert to authenticated
with check (
  scholar_id = auth.uid() and public.is_scholar_athlete() and stage = 'lead'
  and contract_status = 'not_received'
  and disclosure_status = 'not_started'
  and compliance_status = 'not_submitted'
  and payment_status = 'not_due'
  and reviewed_by is null and reviewed_at is null
);
create policy "Athletes update own NIL deal details"
on public.nil_deals for update to authenticated
using (scholar_id = auth.uid())
with check (scholar_id = auth.uid() and public.is_scholar_athlete());

create or replace function public.guard_nil_deal_governance()
returns trigger language plpgsql set search_path=public as $$
begin
  if (
    new.stage is distinct from old.stage
    or new.contract_status is distinct from old.contract_status
    or new.disclosure_status is distinct from old.disclosure_status
    or new.compliance_status is distinct from old.compliance_status
    or new.payment_status is distinct from old.payment_status
    or new.payment_verification_state is distinct from old.payment_verification_state
    or new.agreement_reference is distinct from old.agreement_reference
    or new.jurisdiction is distinct from old.jurisdiction
    or new.institution_name is distinct from old.institution_name
    or new.compliance_notes is distinct from old.compliance_notes
    or new.reviewed_by is distinct from old.reviewed_by
    or new.reviewed_at is distinct from old.reviewed_at
  ) and coalesce(current_setting('playbook.nil_governance_command', true), 'false') <> 'true' then
    raise exception 'governed_nil_command_required';
  end if;
  return new;
end; $$;

drop trigger if exists guard_nil_deal_governance on public.nil_deals;
create trigger guard_nil_deal_governance
before update on public.nil_deals
for each row execute function public.guard_nil_deal_governance();

drop trigger if exists set_nil_deals_updated_at on public.nil_deals;
create trigger set_nil_deals_updated_at
before update on public.nil_deals
for each row execute function public.set_updated_at();

create or replace function public.transition_nil_deal(
  p_deal_id uuid,
  p_next_stage text,
  p_reason text,
  p_idempotency_key text
) returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_actor uuid := auth.uid();
  v_deal public.nil_deals%rowtype;
  v_before jsonb;
  v_allowed boolean := false;
  v_receipt_id uuid;
  v_existing jsonb;
  v_result jsonb;
begin
  if v_actor is null then raise exception 'authentication_required'; end if;
  if not public.is_scholar_athlete(v_actor) then raise exception 'scholar_athlete_required'; end if;
  if length(coalesce(p_idempotency_key,'')) not between 16 and 120 then raise exception 'invalid_idempotency_key'; end if;
  insert into public.athlete_command_receipts(actor_id,command_key,command_type)
  values(v_actor,p_idempotency_key,'transition_nil_deal') on conflict do nothing returning id into v_receipt_id;
  if v_receipt_id is null then
    select result into v_existing from public.athlete_command_receipts where actor_id=v_actor and command_type='transition_nil_deal' and command_key=p_idempotency_key for update;
    if v_existing is not null then return v_existing; end if;
  end if;
  if nullif(trim(p_reason), '') is null or length(trim(p_reason)) < 3 then raise exception 'transition_reason_required'; end if;
  select * into v_deal from public.nil_deals where id = p_deal_id for update;
  if not found then raise exception 'nil_deal_not_found'; end if;
  if v_deal.scholar_id <> v_actor then raise exception 'nil_deal_owner_required'; end if;

  v_allowed := case v_deal.stage
    when 'lead' then p_next_stage in ('conversation','declined')
    when 'conversation' then p_next_stage in ('negotiation','declined')
    when 'negotiation' then p_next_stage in ('review','declined')
    when 'review' then p_next_stage in ('signed','declined')
    when 'signed' then p_next_stage in ('active','declined')
    when 'active' then p_next_stage in ('completed')
    else false
  end;
  if not v_allowed then raise exception 'invalid_nil_stage_transition'; end if;
  if p_next_stage in ('signed','active','completed') and (
    v_deal.contract_status <> 'signed'
    or v_deal.compliance_status <> 'approved'
    or v_deal.disclosure_status not in ('submitted','approved')
  ) then raise exception 'nil_compliance_approval_required'; end if;

  v_before := to_jsonb(v_deal);
  perform set_config('playbook.nil_governance_command', 'true', true);
  update public.nil_deals set stage = p_next_stage where id = p_deal_id returning * into v_deal;
  insert into public.nil_compliance_audit(nil_deal_id,scholar_id,actor_id,action,before_state,after_state,reason)
  values(p_deal_id,v_actor,v_actor,'stage_transition',v_before,to_jsonb(v_deal),trim(p_reason));
  insert into public.playbook_events(type,scholar_id,actor_id,actor_role,payload)
  values('nil.stage_changed',v_actor::text,v_actor,'scholar-athlete',jsonb_build_object('dealId',p_deal_id,'stage',p_next_stage,'title','NIL opportunity updated','detail','Your governed NIL pipeline stage changed.'));
  v_result:=jsonb_build_object('ok',true,'dealId',p_deal_id,'stage',p_next_stage);
  update public.athlete_command_receipts set result=v_result where actor_id=v_actor and command_type='transition_nil_deal' and command_key=p_idempotency_key;
  return v_result;
end; $$;

create or replace function public.submit_nil_compliance(
  p_deal_id uuid,
  p_agreement_reference text,
  p_jurisdiction text,
  p_institution_name text,
  p_reason text,
  p_idempotency_key text
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_deal public.nil_deals%rowtype; v_before jsonb; v_receipt_id uuid; v_existing jsonb; v_result jsonb;
begin
  if v_actor is null then raise exception 'authentication_required'; end if;
  if not public.is_scholar_athlete(v_actor) then raise exception 'scholar_athlete_required'; end if;
  if length(coalesce(p_idempotency_key,'')) not between 16 and 120 then raise exception 'invalid_idempotency_key'; end if;
  insert into public.athlete_command_receipts(actor_id,command_key,command_type)
  values(v_actor,p_idempotency_key,'submit_nil_compliance') on conflict do nothing returning id into v_receipt_id;
  if v_receipt_id is null then
    select result into v_existing from public.athlete_command_receipts where actor_id=v_actor and command_type='submit_nil_compliance' and command_key=p_idempotency_key for update;
    if v_existing is not null then return v_existing; end if;
  end if;
  if nullif(trim(p_agreement_reference),'') is null then raise exception 'agreement_reference_required'; end if;
  if nullif(trim(p_jurisdiction),'') is null then raise exception 'jurisdiction_required'; end if;
  if nullif(trim(p_reason),'') is null or length(trim(p_reason)) < 3 then raise exception 'submission_reason_required'; end if;
  select * into v_deal from public.nil_deals where id=p_deal_id for update;
  if not found then raise exception 'nil_deal_not_found'; end if;
  if v_deal.scholar_id<>v_actor then raise exception 'nil_deal_owner_required'; end if;
  if v_deal.stage not in ('negotiation','review') then raise exception 'nil_deal_not_ready_for_compliance'; end if;
  v_before:=to_jsonb(v_deal);
  perform set_config('playbook.nil_governance_command','true',true);
  update public.nil_deals set
    stage='review', contract_status='signed', disclosure_status='submitted',
    compliance_status='submitted', agreement_reference=trim(p_agreement_reference),
    jurisdiction=trim(p_jurisdiction), institution_name=nullif(trim(p_institution_name),'')
  where id=p_deal_id returning * into v_deal;
  insert into public.nil_compliance_audit(nil_deal_id,scholar_id,actor_id,action,before_state,after_state,reason)
  values(p_deal_id,v_actor,v_actor,'compliance_submitted',v_before,to_jsonb(v_deal),trim(p_reason));
  insert into public.playbook_events(type,scholar_id,actor_id,actor_role,payload)
  values('nil.compliance_submitted',v_actor::text,v_actor,'scholar-athlete',jsonb_build_object('dealId',p_deal_id,'title','NIL compliance submitted','detail','Your agreement is awaiting an authorized compliance decision.'));
  v_result:=jsonb_build_object('ok',true,'dealId',p_deal_id,'complianceStatus','submitted');
  update public.athlete_command_receipts set result=v_result where actor_id=v_actor and command_type='submit_nil_compliance' and command_key=p_idempotency_key;
  return v_result;
end; $$;

create or replace function public.review_nil_compliance(
  p_deal_id uuid,
  p_decision text,
  p_reason text,
  p_idempotency_key text
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_deal public.nil_deals%rowtype; v_before jsonb; v_status text; v_receipt_id uuid; v_existing jsonb; v_result jsonb;
begin
  if v_actor is null or not public.is_platform_admin(v_actor) then raise exception 'admin_required'; end if;
  if length(coalesce(p_idempotency_key,'')) not between 16 and 120 then raise exception 'invalid_idempotency_key'; end if;
  insert into public.athlete_command_receipts(actor_id,command_key,command_type)
  values(v_actor,p_idempotency_key,'review_nil_compliance') on conflict do nothing returning id into v_receipt_id;
  if v_receipt_id is null then
    select result into v_existing from public.athlete_command_receipts where actor_id=v_actor and command_type='review_nil_compliance' and command_key=p_idempotency_key for update;
    if v_existing is not null then return v_existing; end if;
  end if;
  if p_decision not in ('approved','changes_required','rejected') then raise exception 'invalid_compliance_decision'; end if;
  if nullif(trim(p_reason),'') is null or length(trim(p_reason)) < 3 then raise exception 'decision_reason_required'; end if;
  select * into v_deal from public.nil_deals where id=p_deal_id for update;
  if not found then raise exception 'nil_deal_not_found'; end if;
  if v_deal.compliance_status not in ('submitted','under_review','changes_required') then raise exception 'nil_compliance_not_reviewable'; end if;
  v_before:=to_jsonb(v_deal); v_status:=p_decision;
  perform set_config('playbook.nil_governance_command','true',true);
  update public.nil_deals set compliance_status=v_status,compliance_notes=trim(p_reason),reviewed_by=v_actor,reviewed_at=now()
  where id=p_deal_id returning * into v_deal;
  insert into public.nil_compliance_audit(nil_deal_id,scholar_id,actor_id,action,before_state,after_state,reason)
  values(p_deal_id,v_deal.scholar_id,v_actor,'compliance_'||p_decision,v_before,to_jsonb(v_deal),trim(p_reason));
  insert into public.admin_audit_log(actor_id,actor_role,action_type,target_type,target_id,before_state,after_state,reason)
  values(v_actor,'admin','review_nil_compliance','nil_deal',p_deal_id::text,v_before,to_jsonb(v_deal),trim(p_reason));
  insert into public.playbook_events(type,scholar_id,actor_id,actor_role,payload)
  values('nil.compliance_reviewed',v_deal.scholar_id::text,v_actor,'admin',jsonb_build_object('dealId',p_deal_id,'decision',p_decision,'title','NIL compliance decision','detail','An authorized reviewer completed the NIL compliance review.'));
  v_result:=jsonb_build_object('ok',true,'dealId',p_deal_id,'complianceStatus',v_status);
  update public.athlete_command_receipts set result=v_result where actor_id=v_actor and command_type='review_nil_compliance' and command_key=p_idempotency_key;
  return v_result;
end; $$;

revoke all on function public.transition_nil_deal(uuid,text,text,text) from public,anon;
grant execute on function public.transition_nil_deal(uuid,text,text,text) to authenticated;
revoke all on function public.submit_nil_compliance(uuid,text,text,text,text,text) from public,anon;
grant execute on function public.submit_nil_compliance(uuid,text,text,text,text,text) to authenticated;
revoke all on function public.review_nil_compliance(uuid,text,text,text) from public,anon;
grant execute on function public.review_nil_compliance(uuid,text,text,text) to authenticated;

create or replace function public.discover_nil_athletes()
returns table(
  athlete_profile_id uuid,
  nil_profile_id uuid,
  display_name text,
  sport text,
  position text,
  graduation_year integer,
  athlete_level text,
  location text,
  highlight_url text,
  brand_statement text,
  brand_values text[],
  brand_categories text[],
  partnership_interests text[],
  verification_state text
) language plpgsql stable security definer set search_path=public as $$
begin
  if auth.uid() is null or not exists(
    select 1 from public.brand_partners partner
    where partner.owner_profile_id=auth.uid() and partner.active=true
  ) then raise exception 'registered_brand_partner_required'; end if;
  return query
  select athlete.id,nil_profile.id,coalesce(profile.full_name,profile.username,'Athlete'),
    athlete.sport,athlete.position,athlete.graduation_year,athlete.athlete_level,
    athlete.location,athlete.highlight_url,nil_profile.brand_statement,
    nil_profile.brand_values,nil_profile.brand_categories,nil_profile.partnership_interests,
    nil_profile.verification_state
  from public.athlete_nil_profiles nil_profile
  join public.athlete_profiles athlete on athlete.id=nil_profile.athlete_profile_id
  join public.profiles profile on profile.id=nil_profile.scholar_id
  where nil_profile.discoverable=true and nil_profile.visibility='marketplace'
    and nil_profile.marketplace_consent_at is not null
    and (
      athlete.athlete_level in ('college','professional','retired')
      or nil_profile.guardian_consent_at is not null
    )
    and athlete.visibility in ('recruiting','public');
end; $$;
revoke all on function public.discover_nil_athletes() from public,anon;
grant execute on function public.discover_nil_athletes() to authenticated;

create or replace function public.create_athlete_recruiting_target(
  p_school_name text,
  p_athletic_program text,
  p_division text,
  p_coach_name text,
  p_coach_email text,
  p_stage text,
  p_next_action text,
  p_next_action_due_at timestamptz,
  p_notes text,
  p_idempotency_key text
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_target_id uuid; v_receipt_id uuid; v_existing jsonb; v_result jsonb;
begin
  if v_actor is null then raise exception 'authentication_required'; end if;
  if not public.is_scholar_athlete(v_actor) then raise exception 'scholar_athlete_required'; end if;
  if length(coalesce(p_idempotency_key,'')) not between 16 and 120 then raise exception 'invalid_idempotency_key'; end if;
  insert into public.athlete_command_receipts(actor_id,command_key,command_type)
  values(v_actor,p_idempotency_key,'create_recruiting_target') on conflict do nothing returning id into v_receipt_id;
  if v_receipt_id is null then
    select result into v_existing from public.athlete_command_receipts where actor_id=v_actor and command_type='create_recruiting_target' and command_key=p_idempotency_key for update;
    if v_existing is not null then return v_existing; end if;
  end if;
  if nullif(trim(p_school_name),'') is null or length(trim(p_school_name))>160 then raise exception 'invalid_school_name'; end if;
  if p_stage not in ('researching','watchlist','contacted','conversation','visit','offer','committed','closed') then raise exception 'invalid_recruiting_stage'; end if;
  insert into public.recruiting_targets(scholar_id,school_name,athletic_program,division,coach_name,coach_email,stage,next_action,next_action_due_at,notes)
  values(v_actor,trim(p_school_name),nullif(trim(p_athletic_program),''),nullif(trim(p_division),''),nullif(trim(p_coach_name),''),nullif(trim(p_coach_email),''),p_stage,nullif(trim(p_next_action),''),p_next_action_due_at,nullif(trim(p_notes),''))
  returning id into v_target_id;
  insert into public.athlete_recruiting_activities(scholar_id,recruiting_target_id,activity_type,direction,status,organization_name,contact_name,notes,provenance)
  values(v_actor,v_target_id,'interest','athlete_to_school','completed',trim(p_school_name),nullif(trim(p_coach_name),''),'Recruiting target created.',jsonb_build_object('source','athlete_command'));
  insert into public.playbook_events(type,scholar_id,actor_id,actor_role,payload)
  values('recruiting.target_added',v_actor::text,v_actor,'scholar-athlete',jsonb_build_object('targetId',v_target_id,'title','Recruiting target added','detail','A program was added to your athlete-controlled recruiting pipeline.'));
  v_result:=jsonb_build_object('ok',true,'targetId',v_target_id);
  update public.athlete_command_receipts set result=v_result where actor_id=v_actor and command_type='create_recruiting_target' and command_key=p_idempotency_key;
  return v_result;
end; $$;

create or replace function public.create_nil_opportunity(
  p_brand_name text,
  p_opportunity_title text,
  p_opportunity_type text,
  p_compensation_type text,
  p_compensation_amount numeric,
  p_source_name text,
  p_source_url text,
  p_jurisdiction text,
  p_institution_name text,
  p_idempotency_key text
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_deal public.nil_deals%rowtype; v_receipt_id uuid; v_existing jsonb; v_result jsonb;
begin
  if v_actor is null then raise exception 'authentication_required'; end if;
  if not public.is_scholar_athlete(v_actor) then raise exception 'scholar_athlete_required'; end if;
  if length(coalesce(p_idempotency_key,'')) not between 16 and 120 then raise exception 'invalid_idempotency_key'; end if;
  insert into public.athlete_command_receipts(actor_id,command_key,command_type)
  values(v_actor,p_idempotency_key,'create_nil_opportunity') on conflict do nothing returning id into v_receipt_id;
  if v_receipt_id is null then
    select result into v_existing from public.athlete_command_receipts where actor_id=v_actor and command_type='create_nil_opportunity' and command_key=p_idempotency_key for update;
    if v_existing is not null then return v_existing; end if;
  end if;
  if nullif(trim(p_brand_name),'') is null or length(trim(p_brand_name))>160 then raise exception 'invalid_brand_name'; end if;
  if nullif(trim(p_opportunity_title),'') is null or length(trim(p_opportunity_title))>200 then raise exception 'invalid_opportunity_title'; end if;
  if p_opportunity_type not in ('sponsorship','ambassador','appearance','camp','clinic','social_campaign','content','merchandise','affiliate','entrepreneurship') then raise exception 'invalid_opportunity_type'; end if;
  if p_compensation_type is not null and p_compensation_type not in ('cash','product','equity','mixed') then raise exception 'invalid_compensation_type'; end if;
  if p_compensation_amount is not null and (p_compensation_amount<0 or p_compensation_amount>100000000) then raise exception 'invalid_compensation_amount'; end if;
  insert into public.nil_deals(scholar_id,brand_name,opportunity_title,opportunity_type,compensation_type,compensation_amount,source_name,source_url,jurisdiction,institution_name,provenance)
  values(v_actor,trim(p_brand_name),trim(p_opportunity_title),p_opportunity_type,p_compensation_type,p_compensation_amount,nullif(trim(p_source_name),''),nullif(trim(p_source_url),''),nullif(trim(p_jurisdiction),''),nullif(trim(p_institution_name),''),jsonb_build_object('source','athlete_command','recordedAt',now()))
  returning * into v_deal;
  insert into public.nil_compliance_audit(nil_deal_id,scholar_id,actor_id,action,after_state,reason)
  values(v_deal.id,v_actor,v_actor,'opportunity_recorded',to_jsonb(v_deal),'Athlete recorded an NIL opportunity.');
  insert into public.playbook_events(type,scholar_id,actor_id,actor_role,payload)
  values('nil.opportunity_recorded',v_actor::text,v_actor,'scholar-athlete',jsonb_build_object('dealId',v_deal.id,'title','NIL opportunity recorded','detail','A new athlete-controlled NIL lead was added. No earnings or outcome is guaranteed.'));
  v_result:=jsonb_build_object('ok',true,'dealId',v_deal.id,'stage',v_deal.stage);
  update public.athlete_command_receipts set result=v_result where actor_id=v_actor and command_type='create_nil_opportunity' and command_key=p_idempotency_key;
  return v_result;
end; $$;

revoke all on function public.create_athlete_recruiting_target(text,text,text,text,text,text,text,timestamptz,text,text) from public,anon;
grant execute on function public.create_athlete_recruiting_target(text,text,text,text,text,text,text,timestamptz,text,text) to authenticated;
revoke all on function public.create_nil_opportunity(text,text,text,text,numeric,text,text,text,text,text) from public,anon;
grant execute on function public.create_nil_opportunity(text,text,text,text,numeric,text,text,text,text,text) to authenticated;
