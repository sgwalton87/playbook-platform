-- Brand campaign authority hardening.
-- A verified Brand Partner may create organization-owned campaign drafts only.
-- Scholar/Athlete targeting and NIL activation remain separate, fail-closed flows.

alter table public.brand_partners
  add column if not exists brand_user_id uuid unique references public.profiles(id) on delete cascade,
  add column if not exists verification_request_id uuid unique references public.brand_partner_verification_requests(id) on delete restrict;

create or replace function private.current_user_has_brand_campaign_authority()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.profiles profile
      join public.brand_partner_verification_requests verification
        on verification.brand_user_id = profile.id
     where profile.id = auth.uid()
       and coalesce(profile.profile_mode, profile.role, profile.requested_role) = 'brand-partner'
       and profile.onboarding_completed is true
       and verification.status = 'approved'
       and verification.campaign_scope_approved is true
       and verification.compliance_scope_approved is true
  );
$$;

revoke all on function private.current_user_has_brand_campaign_authority() from public;
revoke all on function private.current_user_has_brand_campaign_authority() from anon;
revoke all on function private.current_user_has_brand_campaign_authority() from authenticated;

-- Canonical organization identity belongs to the authenticated verified Brand user.
drop policy if exists "Verified brand users can view own organization" on public.brand_partners;
create policy "Verified brand users can view own organization"
on public.brand_partners
for select
to authenticated
using (
  brand_user_id = (select auth.uid())
  and (select private.current_user_has_brand_campaign_authority())
);

drop policy if exists "Verified brand users can create own organization" on public.brand_partners;
create policy "Verified brand users can create own organization"
on public.brand_partners
for insert
to authenticated
with check (
  brand_user_id = (select auth.uid())
  and (select private.current_user_has_brand_campaign_authority())
  and exists (
    select 1
      from public.brand_partner_verification_requests verification
     where verification.id = brand_partners.verification_request_id
       and verification.brand_user_id = (select auth.uid())
       and verification.status = 'approved'
       and verification.campaign_scope_approved is true
       and verification.compliance_scope_approved is true
  )
);

drop policy if exists "Verified brand users can update own organization" on public.brand_partners;
create policy "Verified brand users can update own organization"
on public.brand_partners
for update
to authenticated
using (
  brand_user_id = (select auth.uid())
  and (select private.current_user_has_brand_campaign_authority())
)
with check (
  brand_user_id = (select auth.uid())
  and (select private.current_user_has_brand_campaign_authority())
);

grant select, insert, update on public.brand_partners to authenticated;

create table if not exists public.brand_campaign_drafts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.brand_partners(id) on delete cascade,
  brand_user_id uuid not null references public.profiles(id) on delete cascade,
  verification_request_id uuid not null references public.brand_partner_verification_requests(id) on delete restrict,
  title text not null,
  description text,
  campaign_type text not null,
  deliverables jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','review_requested')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists brand_campaign_drafts_owner_idx
  on public.brand_campaign_drafts(brand_user_id, updated_at desc);

alter table public.brand_campaign_drafts enable row level security;
grant select, insert, update, delete on public.brand_campaign_drafts to authenticated;

drop policy if exists "Verified brands can view own campaign drafts" on public.brand_campaign_drafts;
create policy "Verified brands can view own campaign drafts"
on public.brand_campaign_drafts
for select
to authenticated
using (
  brand_user_id = (select auth.uid())
  and (select private.current_user_has_brand_campaign_authority())
  and exists (
    select 1 from public.brand_partners partner
     where partner.id = brand_campaign_drafts.partner_id
       and partner.brand_user_id = (select auth.uid())
  )
);

drop policy if exists "Verified brands can create own campaign drafts" on public.brand_campaign_drafts;
create policy "Verified brands can create own campaign drafts"
on public.brand_campaign_drafts
for insert
to authenticated
with check (
  brand_user_id = (select auth.uid())
  and status = 'draft'
  and (select private.current_user_has_brand_campaign_authority())
  and exists (
    select 1
      from public.brand_partners partner
      join public.brand_partner_verification_requests verification
        on verification.id = brand_campaign_drafts.verification_request_id
     where partner.id = brand_campaign_drafts.partner_id
       and partner.brand_user_id = (select auth.uid())
       and partner.verification_request_id = verification.id
       and verification.brand_user_id = (select auth.uid())
       and verification.status = 'approved'
       and verification.campaign_scope_approved is true
       and verification.compliance_scope_approved is true
  )
);

drop policy if exists "Verified brands can update own campaign drafts" on public.brand_campaign_drafts;
create policy "Verified brands can update own campaign drafts"
on public.brand_campaign_drafts
for update
to authenticated
using (
  brand_user_id = (select auth.uid())
  and status = 'draft'
  and (select private.current_user_has_brand_campaign_authority())
)
with check (
  brand_user_id = (select auth.uid())
  and status in ('draft','review_requested')
  and (select private.current_user_has_brand_campaign_authority())
  and exists (
    select 1 from public.brand_partners partner
     where partner.id = brand_campaign_drafts.partner_id
       and partner.brand_user_id = (select auth.uid())
  )
);

drop policy if exists "Verified brands can delete own campaign drafts" on public.brand_campaign_drafts;
create policy "Verified brands can delete own campaign drafts"
on public.brand_campaign_drafts
for delete
to authenticated
using (
  brand_user_id = (select auth.uid())
  and status = 'draft'
  and (select private.current_user_has_brand_campaign_authority())
);

-- The older scholar-linked NIL campaign table remains unavailable to Brand
-- users until a separate Scholar/Athlete targeting and consent contract exists.
revoke all on public.nil_store_campaigns from authenticated;
