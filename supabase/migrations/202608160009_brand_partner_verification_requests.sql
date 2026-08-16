create table if not exists public.brand_partner_verification_requests (
  id uuid primary key default gen_random_uuid(),
  brand_user_id uuid not null unique references public.profiles(id) on delete cascade,
  organization_name text not null,
  partner_title text,
  brand_category text,
  partnership_goals jsonb not null default '[]'::jsonb,
  target_audience jsonb not null default '[]'::jsonb,
  monthly_budget_range text,
  nil_acknowledgement text not null,
  campaign_types jsonb not null default '[]'::jsonb,
  approval_contact text,
  campaign_scope_approved boolean not null default false,
  compliance_scope_approved boolean not null default false,
  status text not null default 'pending' check (status in ('pending','under_review','approved','rejected')),
  submitted_at timestamptz not null default now(), reviewed_at timestamptz, review_notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.brand_partner_verification_requests enable row level security;
grant select, insert, update on public.brand_partner_verification_requests to authenticated;

drop policy if exists "Brand partners can view own verification request" on public.brand_partner_verification_requests;
create policy "Brand partners can view own verification request" on public.brand_partner_verification_requests for select to authenticated using (brand_user_id = (select auth.uid()));

drop policy if exists "Brand partners can submit own verification request" on public.brand_partner_verification_requests;
create policy "Brand partners can submit own verification request" on public.brand_partner_verification_requests for insert to authenticated with check (
  brand_user_id = (select auth.uid()) and status = 'pending'
  and campaign_scope_approved = false and compliance_scope_approved = false
  and exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and coalesce(p.profile_mode,p.role,p.requested_role) = 'brand-partner' and p.onboarding_completed = true
  )
);

drop policy if exists "Brand partners can update pending verification evidence" on public.brand_partner_verification_requests;
create policy "Brand partners can update pending verification evidence" on public.brand_partner_verification_requests for update to authenticated
using (brand_user_id = (select auth.uid()) and status = 'pending')
with check (
  brand_user_id = (select auth.uid()) and status = 'pending'
  and campaign_scope_approved = false and compliance_scope_approved = false
  and reviewed_at is null and review_notes is null
);
