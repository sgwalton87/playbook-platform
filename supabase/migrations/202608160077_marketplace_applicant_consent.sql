-- Phase 12 Marketplace Applicant consent boundary.
-- Application Workspaces remain Scholar-owned; this table stores only the explicit sharing edge.

create table if not exists public.marketplace_application_submissions (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.marketplace_opportunities(id) on delete restrict,
  workspace_id uuid not null references public.application_workspaces(id) on delete restrict,
  scholar_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'submitted' check (status in ('submitted','withdrawn')),
  consent_version text not null,
  consented_at timestamptz not null,
  submitted_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(opportunity_id,scholar_id),
  unique(workspace_id)
);

create index if not exists marketplace_application_submissions_opportunity_idx
  on public.marketplace_application_submissions(opportunity_id,status,submitted_at desc);
create index if not exists marketplace_application_submissions_scholar_idx
  on public.marketplace_application_submissions(scholar_id,updated_at desc);

alter table public.marketplace_application_submissions enable row level security;
revoke all on public.marketplace_application_submissions from anon,authenticated;

create or replace function private.submit_marketplace_application(
  requested_workspace_id uuid,
  requested_consent_version text
)
returns public.marketplace_application_submissions
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  workspace public.application_workspaces%rowtype;
  opportunity public.marketplace_opportunities%rowtype;
  saved public.marketplace_application_submissions%rowtype;
begin
  if actor_id is null or not private.current_user_is_onboarded_learner() then
    raise exception 'Onboarded Scholar authority required.' using errcode='42501';
  end if;
  if requested_consent_version <> 'marketplace-applicant-share-v1' then
    raise exception 'Current Marketplace applicant-sharing consent is required.' using errcode='42501';
  end if;

  select * into workspace
    from public.application_workspaces w
   where w.id=requested_workspace_id
     and w.scholar_id=actor_id
     and w.status='submitted'
   for update;

  if workspace.id is null then
    raise exception 'A submitted Scholar-owned Application Workspace is required.' using errcode='42501';
  end if;

  select * into opportunity
    from public.marketplace_opportunities o
    join public.brand_partners p on p.id=o.partner_id
   where o.id::text=workspace.opportunity_id
     and o.status='published'
     and p.active is true
     and (o.deadline is null or o.deadline>=current_date)
   for update of o;

  if opportunity.id is null then
    raise exception 'A current published Marketplace opportunity matching this workspace is required.' using errcode='42501';
  end if;

  insert into public.marketplace_application_submissions(
    opportunity_id,workspace_id,scholar_id,status,consent_version,consented_at,submitted_at,withdrawn_at,created_at,updated_at
  ) values (
    opportunity.id,workspace.id,actor_id,'submitted',requested_consent_version,now(),now(),null,now(),now()
  )
  on conflict(opportunity_id,scholar_id) do update set
    workspace_id=excluded.workspace_id,
    status='submitted',
    consent_version=excluded.consent_version,
    consented_at=now(),
    submitted_at=now(),
    withdrawn_at=null,
    updated_at=now()
  returning * into saved;

  return saved;
end;
$$;

revoke all on function private.submit_marketplace_application(uuid,text) from public,anon,authenticated;
grant execute on function private.submit_marketplace_application(uuid,text) to authenticated;

create or replace function public.submit_marketplace_application(
  requested_workspace_id uuid,
  requested_consent_version text
)
returns public.marketplace_application_submissions
language sql
security invoker
set search_path=''
as $$ select private.submit_marketplace_application(requested_workspace_id,requested_consent_version); $$;

revoke all on function public.submit_marketplace_application(uuid,text) from public,anon;
grant execute on function public.submit_marketplace_application(uuid,text) to authenticated;

create or replace function private.withdraw_marketplace_application(requested_submission_id uuid)
returns public.marketplace_application_submissions
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  saved public.marketplace_application_submissions%rowtype;
begin
  if actor_id is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;

  update public.marketplace_application_submissions s
     set status='withdrawn',withdrawn_at=now(),updated_at=now()
   where s.id=requested_submission_id
     and s.scholar_id=actor_id
     and s.status='submitted'
  returning * into saved;

  if saved.id is null then
    raise exception 'Active Scholar-owned Marketplace submission was not found.' using errcode='P0002';
  end if;
  return saved;
end;
$$;

revoke all on function private.withdraw_marketplace_application(uuid) from public,anon,authenticated;
grant execute on function private.withdraw_marketplace_application(uuid) to authenticated;

create or replace function public.withdraw_marketplace_application(requested_submission_id uuid)
returns public.marketplace_application_submissions
language sql
security invoker
set search_path=''
as $$ select private.withdraw_marketplace_application(requested_submission_id); $$;

revoke all on function public.withdraw_marketplace_application(uuid) from public,anon;
grant execute on function public.withdraw_marketplace_application(uuid) to authenticated;

create or replace function private.get_my_marketplace_application_submissions()
returns table(
  submission_id uuid,
  opportunity_id uuid,
  workspace_id uuid,
  organization_name text,
  opportunity_title text,
  opportunity_type text,
  submission_status text,
  consent_version text,
  consented_at timestamptz,
  submitted_at timestamptz,
  withdrawn_at timestamptz
)
language sql
stable
security definer
set search_path=''
as $$
  select s.id,s.opportunity_id,s.workspace_id,p.name,o.title,o.opportunity_type,s.status,s.consent_version,
         s.consented_at,s.submitted_at,s.withdrawn_at
    from public.marketplace_application_submissions s
    join public.marketplace_opportunities o on o.id=s.opportunity_id
    join public.brand_partners p on p.id=o.partner_id
   where auth.uid() is not null
     and s.scholar_id=auth.uid()
   order by s.updated_at desc;
$$;

revoke all on function private.get_my_marketplace_application_submissions() from public,anon,authenticated;
grant execute on function private.get_my_marketplace_application_submissions() to authenticated;

create or replace function public.get_my_marketplace_application_submissions()
returns table(
  submission_id uuid,
  opportunity_id uuid,
  workspace_id uuid,
  organization_name text,
  opportunity_title text,
  opportunity_type text,
  submission_status text,
  consent_version text,
  consented_at timestamptz,
  submitted_at timestamptz,
  withdrawn_at timestamptz
)
language sql
stable
security invoker
set search_path=''
as $$ select * from private.get_my_marketplace_application_submissions(); $$;

revoke all on function public.get_my_marketplace_application_submissions() from public,anon;
grant execute on function public.get_my_marketplace_application_submissions() to authenticated;

create or replace function private.get_marketplace_applicants(requested_opportunity_id uuid)
returns table(
  submission_id uuid,
  scholar_display_name text,
  scholar_username text,
  scholar_avatar_url text,
  application_status text,
  submitted_at timestamptz
)
language plpgsql
stable
security definer
set search_path=''
as $$
begin
  if auth.uid() is null or not private.current_user_has_brand_campaign_authority() then
    raise exception 'Verified Brand Partner campaign authority required.' using errcode='42501';
  end if;

  if not exists (
    select 1
      from public.marketplace_opportunities o
      join public.brand_partners p on p.id=o.partner_id
     where o.id=requested_opportunity_id
       and o.status in ('published','closed')
       and p.brand_user_id=auth.uid()
       and p.active is true
  ) then
    raise exception 'Owned Marketplace opportunity is required.' using errcode='42501';
  end if;

  return query
  select s.id,
         coalesce(nullif(trim(profile.full_name),''),nullif(trim(profile.username),''),'Scholar') as scholar_display_name,
         profile.username,
         profile.avatar_url,
         workspace.status,
         s.submitted_at
    from public.marketplace_application_submissions s
    join public.application_workspaces workspace on workspace.id=s.workspace_id and workspace.scholar_id=s.scholar_id
    join public.profiles profile on profile.id=s.scholar_id
   where s.opportunity_id=requested_opportunity_id
     and s.status='submitted'
   order by s.submitted_at asc,s.id;
end;
$$;

revoke all on function private.get_marketplace_applicants(uuid) from public,anon,authenticated;
grant execute on function private.get_marketplace_applicants(uuid) to authenticated;

create or replace function public.get_marketplace_applicants(requested_opportunity_id uuid)
returns table(
  submission_id uuid,
  scholar_display_name text,
  scholar_username text,
  scholar_avatar_url text,
  application_status text,
  submitted_at timestamptz
)
language sql
stable
security invoker
set search_path=''
as $$ select * from private.get_marketplace_applicants(requested_opportunity_id); $$;

revoke all on function public.get_marketplace_applicants(uuid) from public,anon;
grant execute on function public.get_marketplace_applicants(uuid) to authenticated;

comment on table public.marketplace_application_submissions is
  'Explicit Scholar-controlled sharing edge between a submitted Application Workspace and one published Marketplace opportunity. Does not copy or grant broad Application Workspace / Scholar Record access.';
comment on function private.get_marketplace_applicants(uuid) is
  'Narrow Brand Partner applicant roster projection. Excludes email, phone, documents, essays, resume, evidence, recommendations, support relationships, academics, and other Scholar Record data.';
