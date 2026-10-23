-- Founder-first, delegated-later Brand Partner review. No automatic reviewer grants.
-- Review authority is tied to authenticated user IDs, never to notification addresses.
create table if not exists public.brand_partner_reviewer_grants (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  review_scope text not null check (review_scope in ('organization','campaign','compliance')),
  active boolean not null default true,
  grant_reason text not null,
  granted_by uuid references auth.users(id),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (reviewer_id,review_scope),
  check (not active or revoked_at is null)
);
alter table public.brand_partner_reviewer_grants enable row level security;
revoke all on public.brand_partner_reviewer_grants from anon, authenticated;
-- Provision and revoke reviewer grants only through a controlled privileged migration/
-- operator channel after founder authorization. No client-accessible grant mutation RPC.

create table if not exists public.brand_partner_review_audit (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.brand_partner_verification_requests(id),
  reviewer_id uuid not null references auth.users(id),
  review_scope text not null check (review_scope in ('organization','campaign','compliance')),
  decision text not null check (decision in ('approve','reject')),
  reason text not null,
  prior_status text not null,
  next_status text not null,
  prior_campaign_approved boolean not null,
  next_campaign_approved boolean not null,
  prior_compliance_approved boolean not null,
  next_compliance_approved boolean not null,
  decided_at timestamptz not null default now()
);
alter table public.brand_partner_review_audit enable row level security;
revoke all on public.brand_partner_review_audit from anon, authenticated;

create or replace function public.list_brand_partner_review_queue()
returns table (
  request_id uuid,
  organization_name text,
  brand_category text,
  status text,
  campaign_scope_approved boolean,
  compliance_scope_approved boolean,
  submitted_at timestamptz
)
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.brand_partner_reviewer_grants g
    where g.reviewer_id = auth.uid() and g.active and g.revoked_at is null
  ) then
    raise exception 'Brand Partner reviewer authorization required' using errcode = '42501';
  end if;
  return query select r.id,r.organization_name,r.brand_category,r.status,
    r.campaign_scope_approved,r.compliance_scope_approved,r.submitted_at
    from public.brand_partner_verification_requests r
    order by r.submitted_at asc;
end;
$$;
revoke all on function public.list_brand_partner_review_queue() from public, anon;
grant execute on function public.list_brand_partner_review_queue() to authenticated;

create or replace function public.decide_brand_partner_review(
  p_request_id uuid, p_scope text, p_decision text, p_reason text
) returns void
language plpgsql security definer set search_path = ''
as $$
declare r public.brand_partner_verification_requests%rowtype;
declare v_actor uuid := auth.uid();
declare v_status text;
declare v_campaign boolean;
declare v_compliance boolean;
begin
  if v_actor is null or p_scope not in ('organization','campaign','compliance')
    or p_decision not in ('approve','reject') or length(trim(coalesce(p_reason,''))) < 8 then
    raise exception 'Invalid or unauthorized review request' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.brand_partner_reviewer_grants g
    where g.reviewer_id = v_actor and g.review_scope = p_scope and g.active
    and g.revoked_at is null
  ) then
    raise exception 'Missing review-scope authorization' using errcode = '42501';
  end if;
  select * into r from public.brand_partner_verification_requests
    where id = p_request_id for update;
  if not found then raise exception 'Review request not found'; end if;
  if r.brand_user_id = v_actor then
    raise exception 'Self-approval prohibited' using errcode = '42501';
  end if;
  if r.status = 'rejected' then
    raise exception 'Rejected requests must be resubmitted through a governed process';
  end if;
  if p_scope <> 'organization' and r.status <> 'approved' then
    raise exception 'Organization identity approval is required first';
  end if;
  v_status := r.status;
  v_campaign := r.campaign_scope_approved;
  v_compliance := r.compliance_scope_approved;
  if p_decision = 'reject' then
    v_status := 'rejected'; v_campaign := false; v_compliance := false;
  elsif p_scope = 'organization' then
    v_status := 'approved';
  elsif p_scope = 'campaign' then
    v_campaign := true;
  elsif p_scope = 'compliance' then
    v_compliance := true;
  end if;
  update public.brand_partner_verification_requests
    set status = v_status, campaign_scope_approved = v_campaign,
      compliance_scope_approved = v_compliance, reviewed_at = now(),
      review_notes = left(trim(p_reason),2000), updated_at = now()
    where id = p_request_id;
  insert into public.brand_partner_review_audit(
    request_id,reviewer_id,review_scope,decision,reason,
    prior_status,next_status,prior_campaign_approved,next_campaign_approved,
    prior_compliance_approved,next_compliance_approved
  ) values (
    p_request_id,v_actor,p_scope,p_decision,left(trim(p_reason),2000),
    r.status,v_status,r.campaign_scope_approved,v_campaign,
    r.compliance_scope_approved,v_compliance
  );
end;
$$;
revoke all on function public.decide_brand_partner_review(uuid,text,text,text) from public, anon;
grant execute on function public.decide_brand_partner_review(uuid,text,text,text) to authenticated;
