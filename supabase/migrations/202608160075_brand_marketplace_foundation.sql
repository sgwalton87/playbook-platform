-- Phase 12 Brand Marketplace foundation.
-- Verification evidence remains authoritative for approval scope.
-- brand_partners owns the operational organization profile.
-- brand_campaign_drafts owns campaign drafts only.

alter table public.brand_partners
  add column if not exists summary text,
  add column if not exists website_url text,
  add column if not exists logo_url text,
  add column if not exists location text,
  add column if not exists partnership_focus jsonb not null default '[]'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

alter table public.brand_partners drop constraint if exists brand_partners_summary_length;
alter table public.brand_partners add constraint brand_partners_summary_length
  check (summary is null or length(summary) <= 2000);
alter table public.brand_partners drop constraint if exists brand_partners_website_url_length;
alter table public.brand_partners add constraint brand_partners_website_url_length
  check (website_url is null or (length(website_url) <= 2048 and website_url ~ '^https?://'));
alter table public.brand_partners drop constraint if exists brand_partners_logo_url_length;
alter table public.brand_partners add constraint brand_partners_logo_url_length
  check (logo_url is null or (length(logo_url) <= 2048 and logo_url ~ '^https?://'));
alter table public.brand_partners drop constraint if exists brand_partners_location_length;
alter table public.brand_partners add constraint brand_partners_location_length
  check (location is null or length(location) <= 240);
alter table public.brand_partners drop constraint if exists brand_partners_partnership_focus_array;
alter table public.brand_partners add constraint brand_partners_partnership_focus_array
  check (jsonb_typeof(partnership_focus)='array');

-- Preserve direct RLS compatibility while fixing verification ownership integrity.
drop policy if exists "Verified brand users can update own organization" on public.brand_partners;
create policy "Verified brand users can update own organization"
  on public.brand_partners for update to authenticated
  using (
    brand_user_id=(select auth.uid())
    and (select private.current_user_has_brand_campaign_authority())
  )
  with check (
    brand_user_id=(select auth.uid())
    and (select private.current_user_has_brand_campaign_authority())
    and exists (
      select 1 from public.brand_partner_verification_requests verification
      where verification.id=brand_partners.verification_request_id
        and verification.brand_user_id=(select auth.uid())
        and verification.status='approved'
        and verification.campaign_scope_approved is true
        and verification.compliance_scope_approved is true
    )
  );

-- Campaign rows must always remain attached to the same verified partner/scope.
drop policy if exists "Verified brands can update own campaign drafts" on public.brand_campaign_drafts;
create policy "Verified brands can update own campaign drafts"
  on public.brand_campaign_drafts for update to authenticated
  using (
    brand_user_id=(select auth.uid())
    and status='draft'
    and (select private.current_user_has_brand_campaign_authority())
  )
  with check (
    brand_user_id=(select auth.uid())
    and status in ('draft','review_requested')
    and (select private.current_user_has_brand_campaign_authority())
    and exists (
      select 1
      from public.brand_partners partner
      join public.brand_partner_verification_requests verification
        on verification.id=brand_campaign_drafts.verification_request_id
      where partner.id=brand_campaign_drafts.partner_id
        and partner.brand_user_id=(select auth.uid())
        and partner.verification_request_id=verification.id
        and verification.brand_user_id=(select auth.uid())
        and verification.status='approved'
        and verification.campaign_scope_approved is true
        and verification.compliance_scope_approved is true
    )
  );

create or replace function private.ensure_brand_partner_organization()
returns public.brand_partners
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  verification public.brand_partner_verification_requests%rowtype;
  saved public.brand_partners%rowtype;
begin
  if actor_id is null or not private.current_user_has_brand_campaign_authority() then
    raise exception 'Verified Brand Partner campaign authority required.' using errcode='42501';
  end if;

  select * into verification
    from public.brand_partner_verification_requests v
   where v.brand_user_id=actor_id
     and v.status='approved'
     and v.campaign_scope_approved is true
     and v.compliance_scope_approved is true
   order by v.reviewed_at desc nulls last,v.updated_at desc,v.id
   limit 1;

  if verification.id is null then
    raise exception 'Approved Brand Partner verification is required.' using errcode='42501';
  end if;

  insert into public.brand_partners(
    partner_key,name,category,active,brand_user_id,verification_request_id,partnership_focus,updated_at
  ) values (
    'brand-' || replace(actor_id::text,'-',''),
    verification.organization_name,
    coalesce(nullif(trim(verification.brand_category),''),'General'),
    true,actor_id,verification.id,coalesce(verification.partnership_goals,'[]'::jsonb),now()
  )
  on conflict(brand_user_id) do update set
    name=excluded.name,
    category=excluded.category,
    active=true,
    verification_request_id=excluded.verification_request_id,
    updated_at=now()
  returning * into saved;

  return saved;
end;
$$;

revoke all on function private.ensure_brand_partner_organization() from public,anon,authenticated;
grant execute on function private.ensure_brand_partner_organization() to authenticated;

create or replace function public.ensure_brand_partner_organization()
returns public.brand_partners
language sql
security invoker
set search_path=''
as $$ select private.ensure_brand_partner_organization(); $$;

revoke all on function public.ensure_brand_partner_organization() from public,anon;
grant execute on function public.ensure_brand_partner_organization() to authenticated;

create or replace function private.update_brand_partner_organization(
  requested_summary text default null,
  requested_website_url text default null,
  requested_logo_url text default null,
  requested_location text default null,
  requested_partnership_focus jsonb default '[]'::jsonb
)
returns public.brand_partners
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  saved public.brand_partners%rowtype;
  normalized_website text := nullif(trim(coalesce(requested_website_url,'')),'');
  normalized_logo text := nullif(trim(coalesce(requested_logo_url,'')),'');
begin
  if actor_id is null or not private.current_user_has_brand_campaign_authority() then
    raise exception 'Verified Brand Partner campaign authority required.' using errcode='42501';
  end if;
  perform private.ensure_brand_partner_organization();

  if requested_partnership_focus is null or jsonb_typeof(requested_partnership_focus)<>'array' then
    raise exception 'Partnership focus must be a JSON array.' using errcode='22023';
  end if;
  if normalized_website is not null and normalized_website !~ '^https?://' then
    raise exception 'Website URL must use http or https.' using errcode='22023';
  end if;
  if normalized_logo is not null and normalized_logo !~ '^https?://' then
    raise exception 'Logo URL must use http or https.' using errcode='22023';
  end if;

  update public.brand_partners
     set summary=nullif(left(trim(coalesce(requested_summary,'')),2000),''),
         website_url=normalized_website,
         logo_url=normalized_logo,
         location=nullif(left(trim(coalesce(requested_location,'')),240),''),
         partnership_focus=requested_partnership_focus,
         updated_at=now()
   where brand_user_id=actor_id
  returning * into saved;

  if saved.id is null then
    raise exception 'Brand Partner organization could not be resolved.' using errcode='P0002';
  end if;
  return saved;
end;
$$;

revoke all on function private.update_brand_partner_organization(text,text,text,text,jsonb) from public,anon,authenticated;
grant execute on function private.update_brand_partner_organization(text,text,text,text,jsonb) to authenticated;

create or replace function public.update_brand_partner_organization(
  requested_summary text default null,
  requested_website_url text default null,
  requested_logo_url text default null,
  requested_location text default null,
  requested_partnership_focus jsonb default '[]'::jsonb
)
returns public.brand_partners
language sql
security invoker
set search_path=''
as $$
  select private.update_brand_partner_organization(
    requested_summary,requested_website_url,requested_logo_url,requested_location,requested_partnership_focus
  );
$$;

revoke all on function public.update_brand_partner_organization(text,text,text,text,jsonb) from public,anon;
grant execute on function public.update_brand_partner_organization(text,text,text,text,jsonb) to authenticated;

create or replace function private.validate_brand_campaign_scope()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  verification public.brand_partner_verification_requests%rowtype;
begin
  if actor_id is null or new.brand_user_id<>actor_id then
    raise exception 'Campaign owner identity mismatch.' using errcode='42501';
  end if;
  if not private.current_user_has_brand_campaign_authority() then
    raise exception 'Verified Brand Partner campaign authority required.' using errcode='42501';
  end if;

  select v.* into verification
    from public.brand_partners partner
    join public.brand_partner_verification_requests v on v.id=new.verification_request_id
   where partner.id=new.partner_id
     and partner.brand_user_id=actor_id
     and partner.verification_request_id=v.id
     and v.brand_user_id=actor_id
     and v.status='approved'
     and v.campaign_scope_approved is true
     and v.compliance_scope_approved is true;

  if verification.id is null then
    raise exception 'Campaign must reference the verified operational Brand Partner.' using errcode='42501';
  end if;
  if nullif(trim(coalesce(new.campaign_type,'')),'') is null
     or not coalesce(verification.campaign_types,'[]'::jsonb) ? new.campaign_type then
    raise exception 'Campaign type is outside the approved verification scope.' using errcode='42501';
  end if;
  if new.deliverables is null or jsonb_typeof(new.deliverables)<>'array' then
    raise exception 'Campaign deliverables must be a JSON array.' using errcode='22023';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.validate_brand_campaign_scope() from public,anon,authenticated;

drop trigger if exists brand_campaign_scope_guard on public.brand_campaign_drafts;
create trigger brand_campaign_scope_guard
before insert or update on public.brand_campaign_drafts
for each row execute function private.validate_brand_campaign_scope();

create or replace function private.create_brand_campaign_draft(
  requested_title text,
  requested_description text,
  requested_campaign_type text,
  requested_deliverables jsonb default '[]'::jsonb
)
returns public.brand_campaign_drafts
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  partner public.brand_partners%rowtype;
  saved public.brand_campaign_drafts%rowtype;
begin
  if actor_id is null or not private.current_user_has_brand_campaign_authority() then
    raise exception 'Verified Brand Partner campaign authority required.' using errcode='42501';
  end if;
  if length(trim(coalesce(requested_title,'')))<3 then
    raise exception 'Campaign title is required.' using errcode='22023';
  end if;
  if requested_deliverables is null or jsonb_typeof(requested_deliverables)<>'array' then
    raise exception 'Campaign deliverables must be a JSON array.' using errcode='22023';
  end if;

  partner := private.ensure_brand_partner_organization();

  insert into public.brand_campaign_drafts(
    partner_id,brand_user_id,verification_request_id,title,description,campaign_type,deliverables,status,created_at,updated_at
  ) values (
    partner.id,actor_id,partner.verification_request_id,
    trim(requested_title),nullif(left(trim(coalesce(requested_description,'')),4000),''),
    trim(requested_campaign_type),requested_deliverables,'draft',now(),now()
  ) returning * into saved;

  return saved;
end;
$$;

revoke all on function private.create_brand_campaign_draft(text,text,text,jsonb) from public,anon,authenticated;
grant execute on function private.create_brand_campaign_draft(text,text,text,jsonb) to authenticated;

create or replace function public.create_brand_campaign_draft(
  requested_title text,
  requested_description text,
  requested_campaign_type text,
  requested_deliverables jsonb default '[]'::jsonb
)
returns public.brand_campaign_drafts
language sql
security invoker
set search_path=''
as $$
  select private.create_brand_campaign_draft(requested_title,requested_description,requested_campaign_type,requested_deliverables);
$$;

revoke all on function public.create_brand_campaign_draft(text,text,text,jsonb) from public,anon;
grant execute on function public.create_brand_campaign_draft(text,text,text,jsonb) to authenticated;

comment on table public.brand_partners is
  'Canonical operational Brand Partner organization profile materialized only from approved Brand Partner verification evidence.';
comment on table public.brand_campaign_drafts is
  'Verified Brand Partner campaign drafts. Draft status does not imply opportunity publication, compliance approval, NIL approval, selection authority, or Scholar Record access.';
