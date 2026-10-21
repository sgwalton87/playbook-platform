-- Existing Application Workspace and shares/outcomes remain canonical.
-- Legacy active grants require fresh explicit consent; history is retained.
alter table public.marketplace_application_shares add column consent_version text;
create table private.marketplace_consent_events (
  id bigint generated always as identity primary key,
  entity text not null, entity_id uuid not null, actor_id uuid,
  occurred_at timestamptz not null default now(),
  before_state jsonb, after_state jsonb not null
);
alter table private.marketplace_consent_events enable row level security;
revoke all on private.marketplace_consent_events from public,anon,authenticated;
create function private.audit_marketplace_consent() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  insert into private.marketplace_consent_events(entity,entity_id,actor_id,before_state,after_state)
  values (TG_TABLE_NAME,NEW.id,auth.uid(),case when TG_OP='UPDATE' then to_jsonb(OLD) else null end,to_jsonb(NEW));
  return NEW;
end; $$;
revoke all on function private.audit_marketplace_consent() from public,anon,authenticated;
create trigger marketplace_share_audit after insert or update on public.marketplace_application_shares
for each row execute function private.audit_marketplace_consent();
create trigger marketplace_outcome_audit after insert or update on public.marketplace_application_outcomes
for each row execute function private.audit_marketplace_consent();
update public.marketplace_application_shares set consent_status='revoked',revoked_at=now(),updated_at=now()
where consent_status='active';
update public.marketplace_application_outcomes set status='withdrawn',updated_at=now()
where share_id in (select id from public.marketplace_application_shares where consent_version is null);
alter table public.marketplace_application_shares add constraint active_marketplace_consent_version
check (consent_status <> 'active' or (consent_version is not null and consent_version='marketplace-applicant-share-v1'));
drop function public.share_marketplace_application(uuid);
drop function private.share_marketplace_application(uuid);
create or replace function private.share_marketplace_application(requested_workspace_id uuid, requested_consent_version text)
returns public.marketplace_application_shares
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  workspace public.application_workspaces%rowtype;
  opportunity public.marketplace_opportunities%rowtype;
  saved public.marketplace_application_shares%rowtype;
begin
  if actor_id is null or not private.current_user_is_onboarded_learner() then
    raise exception 'Onboarded learner authority required.' using errcode='42501';
  end if;

  if requested_consent_version is distinct from 'marketplace-applicant-share-v1' then
    raise exception 'Current explicit applicant-sharing consent required.' using errcode='22023';
  end if;

  select * into workspace
    from public.application_workspaces w
   where w.id=requested_workspace_id
     and w.scholar_id=actor_id
     and w.status='submitted' for update;
  if workspace.id is null then
    raise exception 'A submitted Scholar-owned Application Workspace is required.' using errcode='42501';
  end if;

  select * into opportunity
    from public.marketplace_opportunities o
   where o.id::text=workspace.opportunity_id
     and o.status='published'
     and (o.deadline is null or o.deadline>=current_date)
     and exists (select 1 from public.brand_partners bp where bp.id=o.partner_id and bp.active is true)
     for share;
  if opportunity.id is null then
    raise exception 'Workspace is not linked to a published Marketplace opportunity.' using errcode='22023';
  end if;

  insert into public.marketplace_application_shares(
    workspace_id, opportunity_id, scholar_id, partner_id, consent_version, consent_status, shared_at, revoked_at, updated_at
  ) values (
    workspace.id, opportunity.id, actor_id, opportunity.partner_id, requested_consent_version, 'active', now(), null, now()
  )
  on conflict (workspace_id, opportunity_id) do update
    set consent_version=requested_consent_version, consent_status='active', shared_at=now(), revoked_at=null, updated_at=now()
  returning * into saved;

  insert into public.marketplace_application_outcomes(share_id,partner_id,opportunity_id,status,created_at,updated_at)
  values (saved.id,saved.partner_id,saved.opportunity_id,'submitted',now(),now())
  on conflict (share_id) do update
    set status=case when public.marketplace_application_outcomes.status='withdrawn' then 'submitted' else public.marketplace_application_outcomes.status end,
        decided_by=case when public.marketplace_application_outcomes.status='withdrawn' then null else public.marketplace_application_outcomes.decided_by end,
        decided_at=case when public.marketplace_application_outcomes.status='withdrawn' then null else public.marketplace_application_outcomes.decided_at end,
        note=case when public.marketplace_application_outcomes.status='withdrawn' then null else public.marketplace_application_outcomes.note end,
        updated_at=now();

  return saved;
end;
$$;
revoke all on function private.share_marketplace_application(uuid,text) from public,anon,authenticated;
grant execute on function private.share_marketplace_application(uuid,text) to authenticated;

create or replace function public.share_marketplace_application(requested_workspace_id uuid, requested_consent_version text)
returns public.marketplace_application_shares
language sql
security invoker
set search_path=''
as $$ select private.share_marketplace_application(requested_workspace_id,requested_consent_version); $$;
revoke all on function public.share_marketplace_application(uuid,text) from public,anon;
grant execute on function public.share_marketplace_application(uuid,text) to authenticated;

create or replace function private.revoke_marketplace_application_share(requested_workspace_id uuid)
returns public.marketplace_application_shares
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  saved public.marketplace_application_shares%rowtype;
begin
  if actor_id is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;
  perform 1 from public.application_workspaces where id=requested_workspace_id for update;
  update public.marketplace_application_shares s
     set consent_status='revoked',revoked_at=now(),updated_at=now()
   where s.workspace_id=requested_workspace_id
     and s.scholar_id=actor_id
     and s.consent_status='active'
  returning * into saved;
  if saved.id is null then
    raise exception 'Active Marketplace application share was not found.' using errcode='P0002';
  end if;
  update public.marketplace_application_outcomes
     set status='withdrawn',decided_by=actor_id,decided_at=now(),updated_at=now()
   where share_id=saved.id;
  return saved;
end;
$$;
revoke all on function private.revoke_marketplace_application_share(uuid) from public,anon,authenticated;
grant execute on function private.revoke_marketplace_application_share(uuid) to authenticated;

create or replace function public.revoke_marketplace_application_share(requested_workspace_id uuid)
returns public.marketplace_application_shares
language sql
security invoker
set search_path=''
as $$ select private.revoke_marketplace_application_share(requested_workspace_id); $$;
revoke all on function public.revoke_marketplace_application_share(uuid) from public,anon;
grant execute on function public.revoke_marketplace_application_share(uuid) to authenticated;

create or replace function private.get_own_marketplace_application_shares()
returns table(workspace_id uuid, opportunity_id uuid, consent_status text, shared_at timestamptz, revoked_at timestamptz, outcome_status text)
language sql
security definer
set search_path=''
as $$
  select s.workspace_id,s.opportunity_id,s.consent_status,s.shared_at,s.revoked_at,o.status
    from public.marketplace_application_shares s
    left join public.marketplace_application_outcomes o on o.share_id=s.id
   where s.scholar_id=auth.uid()
   order by s.updated_at desc;
$$;
revoke all on function private.get_own_marketplace_application_shares() from public,anon,authenticated;
grant execute on function private.get_own_marketplace_application_shares() to authenticated;
create or replace function public.get_own_marketplace_application_shares()
returns table(workspace_id uuid, opportunity_id uuid, consent_status text, shared_at timestamptz, revoked_at timestamptz, outcome_status text)
language sql security invoker set search_path='' as $$ select * from private.get_own_marketplace_application_shares(); $$;
revoke all on function public.get_own_marketplace_application_shares() from public,anon;
grant execute on function public.get_own_marketplace_application_shares() to authenticated;

create or replace function private.get_marketplace_applicants()
returns table(
  share_id uuid,
  workspace_id uuid,
  opportunity_id uuid,
  opportunity_title text,
  opportunity_type text,
  applicant_name text,
  application_status text,
  outcome_status text,
  shared_at timestamptz,
  outcome_updated_at timestamptz
)
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
begin
  if actor_id is null or not private.current_user_has_brand_campaign_authority() then
    raise exception 'Verified Brand Partner authority required.' using errcode='42501';
  end if;
  return query
  select s.id,s.workspace_id,s.opportunity_id,mo.title,mo.opportunity_type,
         coalesce(nullif(trim(p.full_name),''),nullif(trim(coalesce(p.first_name,'') || ' ' || coalesce(p.last_name,'')),''),'Playbook applicant'),
         w.status,coalesce(o.status,'submitted'),s.shared_at,coalesce(o.updated_at,s.updated_at)
    from public.marketplace_application_shares s
    join public.brand_partners bp on bp.id=s.partner_id and bp.brand_user_id=actor_id and bp.active is true
    join public.marketplace_opportunities mo on mo.id=s.opportunity_id and mo.partner_id=bp.id
    join public.application_workspaces w on w.id=s.workspace_id and w.scholar_id=s.scholar_id
    join public.profiles p on p.id=s.scholar_id
    left join public.marketplace_application_outcomes o on o.share_id=s.id
   where s.consent_status='active' and s.consent_version='marketplace-applicant-share-v1'
   order by s.shared_at desc;
end;
$$;
revoke all on function private.get_marketplace_applicants() from public,anon,authenticated;
grant execute on function private.get_marketplace_applicants() to authenticated;
create or replace function public.get_marketplace_applicants()
returns table(
  share_id uuid,
  workspace_id uuid,
  opportunity_id uuid,
  opportunity_title text,
  opportunity_type text,
  applicant_name text,
  application_status text,
  outcome_status text,
  shared_at timestamptz,
  outcome_updated_at timestamptz
)
language sql security invoker set search_path='' as $$ select * from private.get_marketplace_applicants(); $$;
revoke all on function public.get_marketplace_applicants() from public,anon;
grant execute on function public.get_marketplace_applicants() to authenticated;

create or replace function private.set_marketplace_applicant_outcome(
  requested_share_id uuid,
  requested_status text,
  requested_note text default null
)
returns public.marketplace_application_outcomes
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  saved public.marketplace_application_outcomes%rowtype;
begin
  if actor_id is null or not private.current_user_has_brand_campaign_authority() then
    raise exception 'Verified Brand Partner authority required.' using errcode='42501';
  end if;
  perform 1 from public.application_workspaces w join public.marketplace_application_shares s on s.workspace_id=w.id
    where s.id=requested_share_id for update of w;
  if requested_status is null or requested_status not in ('under_review','selected','not_selected') then
    raise exception 'Unsupported applicant outcome status.' using errcode='22023';
  end if;

  update public.marketplace_application_outcomes o
     set status=requested_status,
         note=nullif(left(trim(coalesce(requested_note,'')),2000),''),
         decided_by=actor_id,decided_at=now(),updated_at=now()
   where o.share_id=requested_share_id
     and exists (
       select 1
         from public.marketplace_application_shares s
         join public.brand_partners bp on bp.id=s.partner_id
        where s.id=o.share_id
          and s.consent_status='active'
          and s.consent_version='marketplace-applicant-share-v1'
          and bp.brand_user_id=actor_id
          and bp.active is true
     )
  returning * into saved;

  if saved.id is null then
    raise exception 'Active consented applicant was not found.' using errcode='P0002';
  end if;
  return saved;
end;
$$;
revoke all on function private.set_marketplace_applicant_outcome(uuid,text,text) from public,anon,authenticated;
grant execute on function private.set_marketplace_applicant_outcome(uuid,text,text) to authenticated;
create or replace function public.set_marketplace_applicant_outcome(
  requested_share_id uuid,
  requested_status text,
  requested_note text default null
)
returns public.marketplace_application_outcomes
language sql security invoker set search_path='' as $$ select * from private.set_marketplace_applicant_outcome(requested_share_id,requested_status,requested_note); $$;
revoke all on function public.set_marketplace_applicant_outcome(uuid,text,text) from public,anon;
grant execute on function public.set_marketplace_applicant_outcome(uuid,text,text) to authenticated;
