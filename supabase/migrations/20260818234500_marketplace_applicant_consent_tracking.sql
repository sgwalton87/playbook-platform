-- Phase 12: consent-gated Marketplace applicants and human outcome tracking.
-- Application Workspace remains Scholar-owned. This package creates an explicit,
-- revocable projection boundary for verified Brand Partners without granting
-- direct access to application tables, documents, or the Scholar Record.

create table if not exists public.marketplace_application_shares (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.application_workspaces(id) on delete cascade,
  opportunity_id uuid not null references public.marketplace_opportunities(id) on delete cascade,
  scholar_id uuid not null references public.profiles(id) on delete cascade,
  partner_id uuid not null references public.brand_partners(id) on delete cascade,
  consent_status text not null default 'active' check (consent_status in ('active','revoked')),
  shared_at timestamptz not null default now(),
  revoked_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (workspace_id, opportunity_id)
);

create index if not exists marketplace_application_shares_partner_idx
  on public.marketplace_application_shares(partner_id, opportunity_id, consent_status, updated_at desc);
create index if not exists marketplace_application_shares_scholar_idx
  on public.marketplace_application_shares(scholar_id, consent_status, updated_at desc);

create table if not exists public.marketplace_application_outcomes (
  id uuid primary key default gen_random_uuid(),
  share_id uuid not null unique references public.marketplace_application_shares(id) on delete cascade,
  partner_id uuid not null references public.brand_partners(id) on delete cascade,
  opportunity_id uuid not null references public.marketplace_opportunities(id) on delete cascade,
  status text not null default 'submitted' check (status in ('submitted','under_review','selected','not_selected','withdrawn')),
  note text check (note is null or length(note) <= 2000),
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marketplace_application_shares enable row level security;
alter table public.marketplace_application_outcomes enable row level security;
revoke all on public.marketplace_application_shares from anon, authenticated;
revoke all on public.marketplace_application_outcomes from anon, authenticated;

create or replace function private.share_marketplace_application(requested_workspace_id uuid)
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

  select * into workspace
    from public.application_workspaces w
   where w.id=requested_workspace_id
     and w.scholar_id=actor_id
     and w.status='submitted';
  if workspace.id is null then
    raise exception 'A submitted Scholar-owned Application Workspace is required.' using errcode='42501';
  end if;

  select * into opportunity
    from public.marketplace_opportunities o
   where o.id::text=workspace.opportunity_id
     and o.status in ('published','closed');
  if opportunity.id is null then
    raise exception 'Workspace is not linked to a published Marketplace opportunity.' using errcode='22023';
  end if;

  insert into public.marketplace_application_shares(
    workspace_id, opportunity_id, scholar_id, partner_id, consent_status, shared_at, revoked_at, updated_at
  ) values (
    workspace.id, opportunity.id, actor_id, opportunity.partner_id, 'active', now(), null, now()
  )
  on conflict (workspace_id, opportunity_id) do update
    set consent_status='active', shared_at=now(), revoked_at=null, updated_at=now()
  returning * into saved;

  insert into public.marketplace_application_outcomes(share_id,partner_id,opportunity_id,status,created_at,updated_at)
  values (saved.id,saved.partner_id,saved.opportunity_id,'submitted',now(),now())
  on conflict (share_id) do update
    set status=case when public.marketplace_application_outcomes.status='withdrawn' then 'submitted' else public.marketplace_application_outcomes.status end,
        updated_at=now();

  return saved;
end;
$$;
revoke all on function private.share_marketplace_application(uuid) from public,anon,authenticated;
grant execute on function private.share_marketplace_application(uuid) to authenticated;

create or replace function public.share_marketplace_application(requested_workspace_id uuid)
returns public.marketplace_application_shares
language sql
security invoker
set search_path=''
as $$ select private.share_marketplace_application(requested_workspace_id); $$;
revoke all on function public.share_marketplace_application(uuid) from public,anon;
grant execute on function public.share_marketplace_application(uuid) to authenticated;

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

create or replace function public.get_own_marketplace_application_shares()
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
revoke all on function public.get_own_marketplace_application_shares() from public,anon;
grant execute on function public.get_own_marketplace_application_shares() to authenticated;

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
   where s.consent_status='active'
   order by s.shared_at desc;
end;
$$;
revoke all on function public.get_marketplace_applicants() from public,anon;
grant execute on function public.get_marketplace_applicants() to authenticated;

create or replace function public.set_marketplace_applicant_outcome(
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
  if requested_status not in ('under_review','selected','not_selected') then
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
revoke all on function public.set_marketplace_applicant_outcome(uuid,text,text) from public,anon;
grant execute on function public.set_marketplace_applicant_outcome(uuid,text,text) to authenticated;

comment on table public.marketplace_application_shares is 'Revocable Scholar consent projection for submitted Marketplace applications; never grants direct Application Workspace or Scholar Record access.';
comment on table public.marketplace_application_outcomes is 'Human-recorded Marketplace application lifecycle outcome tied to a consented application share.';