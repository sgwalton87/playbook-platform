-- Phase 12 canonical Marketplace Opportunity Catalog.
-- Real-world listings are canonical facts; PBOS readiness/recommendation artifacts remain derived intelligence.

create table if not exists public.marketplace_opportunities (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.brand_partners(id) on delete cascade,
  campaign_id uuid references public.brand_campaign_drafts(id) on delete set null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  opportunity_type text not null check (opportunity_type in ('internship','job','sponsorship','nil','scholarship','mentorship')),
  title text not null check (length(trim(title)) between 3 and 180),
  description text not null check (length(trim(description)) between 20 and 8000),
  location text check (location is null or length(location) <= 240),
  external_url text check (external_url is null or (length(external_url) <= 2048 and external_url ~ '^https?://')),
  deadline date,
  compensation_summary text check (compensation_summary is null or length(compensation_summary) <= 1000),
  eligibility jsonb not null default '[]'::jsonb check (jsonb_typeof(eligibility)='array'),
  requirements jsonb not null default '[]'::jsonb check (jsonb_typeof(requirements)='array'),
  tags jsonb not null default '[]'::jsonb check (jsonb_typeof(tags)='array'),
  status text not null default 'draft' check (status in ('draft','review_requested','changes_requested','published','rejected','closed')),
  review_notes text check (review_notes is null or length(review_notes) <= 4000),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketplace_opportunities_partner_idx
  on public.marketplace_opportunities(partner_id,status,updated_at desc);
create index if not exists marketplace_opportunities_published_idx
  on public.marketplace_opportunities(opportunity_type,published_at desc)
  where status='published';

alter table public.marketplace_opportunities enable row level security;
revoke all on public.marketplace_opportunities from anon,authenticated;

create or replace function private.assert_marketplace_opportunity_partner_scope(
  requested_partner_id uuid,
  requested_campaign_id uuid default null
)
returns public.brand_partners
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  partner public.brand_partners%rowtype;
begin
  if actor_id is null or not private.current_user_has_brand_campaign_authority() then
    raise exception 'Verified Brand Partner campaign authority required.' using errcode='42501';
  end if;

  select * into partner
    from public.brand_partners p
   where p.id=requested_partner_id
     and p.brand_user_id=actor_id
     and p.active is true;

  if partner.id is null then
    raise exception 'Verified operational Brand Partner is required.' using errcode='42501';
  end if;

  if requested_campaign_id is not null and not exists (
    select 1 from public.brand_campaign_drafts c
     where c.id=requested_campaign_id
       and c.partner_id=partner.id
       and c.brand_user_id=actor_id
       and c.verification_request_id=partner.verification_request_id
  ) then
    raise exception 'Campaign must belong to the verified Brand Partner.' using errcode='42501';
  end if;

  return partner;
end;
$$;

revoke all on function private.assert_marketplace_opportunity_partner_scope(uuid,uuid) from public,anon,authenticated;
grant execute on function private.assert_marketplace_opportunity_partner_scope(uuid,uuid) to authenticated;

create or replace function private.create_marketplace_opportunity(
  requested_type text,
  requested_title text,
  requested_description text,
  requested_location text default null,
  requested_external_url text default null,
  requested_deadline date default null,
  requested_compensation_summary text default null,
  requested_eligibility jsonb default '[]'::jsonb,
  requested_requirements jsonb default '[]'::jsonb,
  requested_tags jsonb default '[]'::jsonb,
  requested_campaign_id uuid default null
)
returns public.marketplace_opportunities
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  partner public.brand_partners%rowtype;
  saved public.marketplace_opportunities%rowtype;
  normalized_url text := nullif(trim(coalesce(requested_external_url,'')),'');
begin
  partner := private.ensure_brand_partner_organization();
  perform private.assert_marketplace_opportunity_partner_scope(partner.id,requested_campaign_id);

  if requested_type not in ('internship','job','sponsorship','nil','scholarship','mentorship') then
    raise exception 'Unsupported Marketplace opportunity type.' using errcode='22023';
  end if;
  if length(trim(coalesce(requested_title,''))) < 3 or length(trim(coalesce(requested_description,''))) < 20 then
    raise exception 'Opportunity title and description are required.' using errcode='22023';
  end if;
  if requested_deadline is not null and requested_deadline < current_date then
    raise exception 'Opportunity deadline cannot be in the past.' using errcode='22023';
  end if;
  if normalized_url is not null and normalized_url !~ '^https?://' then
    raise exception 'External URL must use http or https.' using errcode='22023';
  end if;
  if requested_eligibility is null or jsonb_typeof(requested_eligibility)<>'array'
     or requested_requirements is null or jsonb_typeof(requested_requirements)<>'array'
     or requested_tags is null or jsonb_typeof(requested_tags)<>'array' then
    raise exception 'Eligibility, requirements, and tags must be JSON arrays.' using errcode='22023';
  end if;

  insert into public.marketplace_opportunities(
    partner_id,campaign_id,created_by,opportunity_type,title,description,location,external_url,deadline,
    compensation_summary,eligibility,requirements,tags,status,created_at,updated_at
  ) values (
    partner.id,requested_campaign_id,actor_id,requested_type,trim(requested_title),trim(requested_description),
    nullif(left(trim(coalesce(requested_location,'')),240),''),normalized_url,requested_deadline,
    nullif(left(trim(coalesce(requested_compensation_summary,'')),1000),''),requested_eligibility,requested_requirements,
    requested_tags,'draft',now(),now()
  ) returning * into saved;

  return saved;
end;
$$;

revoke all on function private.create_marketplace_opportunity(text,text,text,text,text,date,text,jsonb,jsonb,jsonb,uuid) from public,anon,authenticated;
grant execute on function private.create_marketplace_opportunity(text,text,text,text,text,date,text,jsonb,jsonb,jsonb,uuid) to authenticated;

create or replace function public.create_marketplace_opportunity(
  requested_type text,
  requested_title text,
  requested_description text,
  requested_location text default null,
  requested_external_url text default null,
  requested_deadline date default null,
  requested_compensation_summary text default null,
  requested_eligibility jsonb default '[]'::jsonb,
  requested_requirements jsonb default '[]'::jsonb,
  requested_tags jsonb default '[]'::jsonb,
  requested_campaign_id uuid default null
)
returns public.marketplace_opportunities
language sql
security invoker
set search_path=''
as $$
  select private.create_marketplace_opportunity(
    requested_type,requested_title,requested_description,requested_location,requested_external_url,requested_deadline,
    requested_compensation_summary,requested_eligibility,requested_requirements,requested_tags,requested_campaign_id
  );
$$;

revoke all on function public.create_marketplace_opportunity(text,text,text,text,text,date,text,jsonb,jsonb,jsonb,uuid) from public,anon;
grant execute on function public.create_marketplace_opportunity(text,text,text,text,text,date,text,jsonb,jsonb,jsonb,uuid) to authenticated;

create or replace function private.update_marketplace_opportunity_draft(
  requested_opportunity_id uuid,
  requested_title text,
  requested_description text,
  requested_location text default null,
  requested_external_url text default null,
  requested_deadline date default null,
  requested_compensation_summary text default null,
  requested_eligibility jsonb default '[]'::jsonb,
  requested_requirements jsonb default '[]'::jsonb,
  requested_tags jsonb default '[]'::jsonb
)
returns public.marketplace_opportunities
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  saved public.marketplace_opportunities%rowtype;
  normalized_url text := nullif(trim(coalesce(requested_external_url,'')),'');
begin
  if actor_id is null or not private.current_user_has_brand_campaign_authority() then
    raise exception 'Verified Brand Partner campaign authority required.' using errcode='42501';
  end if;
  if length(trim(coalesce(requested_title,''))) < 3 or length(trim(coalesce(requested_description,''))) < 20 then
    raise exception 'Opportunity title and description are required.' using errcode='22023';
  end if;
  if requested_deadline is not null and requested_deadline < current_date then
    raise exception 'Opportunity deadline cannot be in the past.' using errcode='22023';
  end if;
  if normalized_url is not null and normalized_url !~ '^https?://' then
    raise exception 'External URL must use http or https.' using errcode='22023';
  end if;
  if requested_eligibility is null or jsonb_typeof(requested_eligibility)<>'array'
     or requested_requirements is null or jsonb_typeof(requested_requirements)<>'array'
     or requested_tags is null or jsonb_typeof(requested_tags)<>'array' then
    raise exception 'Eligibility, requirements, and tags must be JSON arrays.' using errcode='22023';
  end if;

  update public.marketplace_opportunities o
     set title=trim(requested_title),description=trim(requested_description),
         location=nullif(left(trim(coalesce(requested_location,'')),240),''),external_url=normalized_url,
         deadline=requested_deadline,compensation_summary=nullif(left(trim(coalesce(requested_compensation_summary,'')),1000),''),
         eligibility=requested_eligibility,requirements=requested_requirements,tags=requested_tags,
         review_notes=null,reviewed_by=null,reviewed_at=null,updated_at=now(),
         status=case when o.status='changes_requested' then 'draft' else o.status end
   where o.id=requested_opportunity_id
     and o.status in ('draft','changes_requested')
     and exists (
       select 1 from public.brand_partners p
        where p.id=o.partner_id and p.brand_user_id=actor_id and p.active is true
     )
  returning * into saved;

  if saved.id is null then
    raise exception 'Editable Marketplace opportunity was not found.' using errcode='P0002';
  end if;
  return saved;
end;
$$;

revoke all on function private.update_marketplace_opportunity_draft(uuid,text,text,text,text,date,text,jsonb,jsonb,jsonb) from public,anon,authenticated;
grant execute on function private.update_marketplace_opportunity_draft(uuid,text,text,text,text,date,text,jsonb,jsonb,jsonb) to authenticated;

create or replace function public.update_marketplace_opportunity_draft(
  requested_opportunity_id uuid,
  requested_title text,
  requested_description text,
  requested_location text default null,
  requested_external_url text default null,
  requested_deadline date default null,
  requested_compensation_summary text default null,
  requested_eligibility jsonb default '[]'::jsonb,
  requested_requirements jsonb default '[]'::jsonb,
  requested_tags jsonb default '[]'::jsonb
)
returns public.marketplace_opportunities
language sql
security invoker
set search_path=''
as $$
  select private.update_marketplace_opportunity_draft(
    requested_opportunity_id,requested_title,requested_description,requested_location,requested_external_url,
    requested_deadline,requested_compensation_summary,requested_eligibility,requested_requirements,requested_tags
  );
$$;

revoke all on function public.update_marketplace_opportunity_draft(uuid,text,text,text,text,date,text,jsonb,jsonb,jsonb) from public,anon;
grant execute on function public.update_marketplace_opportunity_draft(uuid,text,text,text,text,date,text,jsonb,jsonb,jsonb) to authenticated;

create or replace function private.submit_marketplace_opportunity_for_review(requested_opportunity_id uuid)
returns public.marketplace_opportunities
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  saved public.marketplace_opportunities%rowtype;
begin
  if actor_id is null or not private.current_user_has_brand_campaign_authority() then
    raise exception 'Verified Brand Partner campaign authority required.' using errcode='42501';
  end if;

  update public.marketplace_opportunities o
     set status='review_requested',review_notes=null,reviewed_by=null,reviewed_at=null,updated_at=now()
   where o.id=requested_opportunity_id
     and o.status in ('draft','changes_requested')
     and (o.deadline is null or o.deadline>=current_date)
     and exists (
       select 1 from public.brand_partners p
        where p.id=o.partner_id and p.brand_user_id=actor_id and p.active is true
     )
  returning * into saved;

  if saved.id is null then
    raise exception 'Reviewable Marketplace opportunity was not found.' using errcode='P0002';
  end if;
  return saved;
end;
$$;

revoke all on function private.submit_marketplace_opportunity_for_review(uuid) from public,anon,authenticated;
grant execute on function private.submit_marketplace_opportunity_for_review(uuid) to authenticated;

create or replace function public.submit_marketplace_opportunity_for_review(requested_opportunity_id uuid)
returns public.marketplace_opportunities
language sql
security invoker
set search_path=''
as $$ select private.submit_marketplace_opportunity_for_review(requested_opportunity_id); $$;

revoke all on function public.submit_marketplace_opportunity_for_review(uuid) from public,anon;
grant execute on function public.submit_marketplace_opportunity_for_review(uuid) to authenticated;

create or replace function private.review_marketplace_opportunity(
  requested_opportunity_id uuid,
  requested_decision text,
  requested_notes text default null
)
returns public.marketplace_opportunities
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  saved public.marketplace_opportunities%rowtype;
  next_status text;
begin
  if actor_id is null or not private.current_user_is_platform_operator() then
    raise exception 'Platform operator authority required.' using errcode='42501';
  end if;

  next_status := case requested_decision
    when 'approve' then 'published'
    when 'request_changes' then 'changes_requested'
    when 'reject' then 'rejected'
    when 'close' then 'closed'
    else null
  end;
  if next_status is null then
    raise exception 'Unsupported Marketplace review decision.' using errcode='22023';
  end if;

  update public.marketplace_opportunities o
     set status=next_status,
         review_notes=nullif(left(trim(coalesce(requested_notes,'')),4000),''),
         reviewed_by=actor_id,reviewed_at=now(),
         published_at=case when next_status='published' then coalesce(o.published_at,now()) else o.published_at end,
         updated_at=now()
   where o.id=requested_opportunity_id
     and (
       (requested_decision in ('approve','request_changes','reject') and o.status='review_requested')
       or (requested_decision='close' and o.status='published')
     )
     and (requested_decision<>'approve' or o.deadline is null or o.deadline>=current_date)
  returning * into saved;

  if saved.id is null then
    raise exception 'Marketplace opportunity is not eligible for this review decision.' using errcode='P0002';
  end if;
  return saved;
end;
$$;

revoke all on function private.review_marketplace_opportunity(uuid,text,text) from public,anon,authenticated;
grant execute on function private.review_marketplace_opportunity(uuid,text,text) to authenticated;

create or replace function public.review_marketplace_opportunity(
  requested_opportunity_id uuid,
  requested_decision text,
  requested_notes text default null
)
returns public.marketplace_opportunities
language sql
security invoker
set search_path=''
as $$ select private.review_marketplace_opportunity(requested_opportunity_id,requested_decision,requested_notes); $$;

revoke all on function public.review_marketplace_opportunity(uuid,text,text) from public,anon;
grant execute on function public.review_marketplace_opportunity(uuid,text,text) to authenticated;

create or replace function private.get_marketplace_opportunities()
returns table(
  id uuid,
  partner_id uuid,
  organization_name text,
  opportunity_type text,
  title text,
  description text,
  location text,
  external_url text,
  deadline date,
  compensation_summary text,
  eligibility jsonb,
  requirements jsonb,
  tags jsonb,
  published_at timestamptz
)
language sql
stable
security definer
set search_path=''
as $$
  select o.id,o.partner_id,p.name,o.opportunity_type,o.title,o.description,o.location,o.external_url,o.deadline,
         o.compensation_summary,o.eligibility,o.requirements,o.tags,o.published_at
    from public.marketplace_opportunities o
    join public.brand_partners p on p.id=o.partner_id and p.active is true
   where auth.uid() is not null
     and o.status='published'
     and (o.deadline is null or o.deadline>=current_date)
   order by o.published_at desc,o.created_at desc;
$$;

revoke all on function private.get_marketplace_opportunities() from public,anon,authenticated;
grant execute on function private.get_marketplace_opportunities() to authenticated;

create or replace function public.get_marketplace_opportunities()
returns table(
  id uuid,
  partner_id uuid,
  organization_name text,
  opportunity_type text,
  title text,
  description text,
  location text,
  external_url text,
  deadline date,
  compensation_summary text,
  eligibility jsonb,
  requirements jsonb,
  tags jsonb,
  published_at timestamptz
)
language sql
stable
security invoker
set search_path=''
as $$ select * from private.get_marketplace_opportunities(); $$;

revoke all on function public.get_marketplace_opportunities() from public,anon;
grant execute on function public.get_marketplace_opportunities() to authenticated;

create or replace function private.get_own_marketplace_opportunities()
returns table(
  id uuid,
  campaign_id uuid,
  opportunity_type text,
  title text,
  description text,
  location text,
  external_url text,
  deadline date,
  compensation_summary text,
  eligibility jsonb,
  requirements jsonb,
  tags jsonb,
  status text,
  review_notes text,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path=''
as $$
  select o.id,o.campaign_id,o.opportunity_type,o.title,o.description,o.location,o.external_url,o.deadline,
         o.compensation_summary,o.eligibility,o.requirements,o.tags,o.status,o.review_notes,o.reviewed_at,o.published_at,
         o.created_at,o.updated_at
    from public.marketplace_opportunities o
    join public.brand_partners p on p.id=o.partner_id
   where auth.uid() is not null
     and p.brand_user_id=auth.uid()
     and private.current_user_has_brand_campaign_authority()
   order by o.updated_at desc;
$$;

revoke all on function private.get_own_marketplace_opportunities() from public,anon,authenticated;
grant execute on function private.get_own_marketplace_opportunities() to authenticated;

create or replace function public.get_own_marketplace_opportunities()
returns table(
  id uuid,
  campaign_id uuid,
  opportunity_type text,
  title text,
  description text,
  location text,
  external_url text,
  deadline date,
  compensation_summary text,
  eligibility jsonb,
  requirements jsonb,
  tags jsonb,
  status text,
  review_notes text,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path=''
as $$ select * from private.get_own_marketplace_opportunities(); $$;

revoke all on function public.get_own_marketplace_opportunities() from public,anon;
grant execute on function public.get_own_marketplace_opportunities() to authenticated;

create or replace function private.get_marketplace_opportunities_for_review()
returns table(
  id uuid,
  organization_name text,
  opportunity_type text,
  title text,
  description text,
  location text,
  external_url text,
  deadline date,
  compensation_summary text,
  eligibility jsonb,
  requirements jsonb,
  tags jsonb,
  status text,
  review_notes text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path=''
as $$
begin
  if auth.uid() is null or not private.current_user_is_platform_operator() then
    raise exception 'Platform operator authority required.' using errcode='42501';
  end if;
  return query
  select o.id,p.name,o.opportunity_type,o.title,o.description,o.location,o.external_url,o.deadline,
         o.compensation_summary,o.eligibility,o.requirements,o.tags,o.status,o.review_notes,o.created_at,o.updated_at
    from public.marketplace_opportunities o
    join public.brand_partners p on p.id=o.partner_id
   where o.status in ('review_requested','published')
   order by case when o.status='review_requested' then 0 else 1 end,o.updated_at asc;
end;
$$;

revoke all on function private.get_marketplace_opportunities_for_review() from public,anon,authenticated;
grant execute on function private.get_marketplace_opportunities_for_review() to authenticated;

create or replace function public.get_marketplace_opportunities_for_review()
returns table(
  id uuid,
  organization_name text,
  opportunity_type text,
  title text,
  description text,
  location text,
  external_url text,
  deadline date,
  compensation_summary text,
  eligibility jsonb,
  requirements jsonb,
  tags jsonb,
  status text,
  review_notes text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path=''
as $$ select * from private.get_marketplace_opportunities_for_review(); $$;

revoke all on function public.get_marketplace_opportunities_for_review() from public,anon;
grant execute on function public.get_marketplace_opportunities_for_review() to authenticated;

comment on table public.marketplace_opportunities is
  'Canonical real-world Marketplace opportunity listings. Derived PBOS readiness/recommendation artifacts are not listing records.';
comment on function private.review_marketplace_opportunity(uuid,text,text) is
  'Human platform-operator publication authority for Marketplace listings. Brand Partners cannot self-publish.';
