-- PBOS-RLS-003: canonical authorization infrastructure foundation.
-- Deny by default: only explicit policies below grant access.

create table if not exists public.authorization_roles (
  id text primary key,
  description text not null,
  is_public_onboarding_role boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.authorization_permissions (
  id text primary key,
  action text not null check (action in ('VIEW','CREATE','UPDATE','DELETE','APPROVE','ADMINISTER','DELEGATE','EXPORT','SHARE')),
  data_domain text not null,
  description text not null,
  risk_level text not null check (risk_level in ('low','moderate','high','critical')),
  created_at timestamptz not null default now()
);

create table if not exists public.authorization_role_permissions (
  role_id text not null references public.authorization_roles(id) on delete cascade,
  permission_id text not null references public.authorization_permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table if not exists public.authorization_role_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id text not null references public.authorization_roles(id),
  context_type text not null default 'platform' check (context_type in ('platform','relationship','organization')),
  context_id uuid,
  status text not null default 'pending' check (status in ('requested','pending','active','rejected','suspended','revoked','expired')),
  source text not null,
  approved_by uuid references auth.users(id) on delete set null,
  effective_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  revocation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (approved_by is null or approved_by <> user_id),
  check (expires_at is null or effective_at is null or expires_at > effective_at)
);

create unique index if not exists authorization_role_assignments_active_unique
  on public.authorization_role_assignments(user_id, role_id, context_type, coalesce(context_id, '00000000-0000-0000-0000-000000000000'::uuid))
  where status = 'active' and revoked_at is null;

create table if not exists public.authorization_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization_type text not null,
  status text not null default 'pending' check (status in ('pending','verified','rejected','suspended','revoked')),
  verified_at timestamptz,
  verified_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.authorization_organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.authorization_organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id text not null references public.authorization_roles(id),
  status text not null default 'pending' check (status in ('pending','active','rejected','suspended','revoked','expired')),
  verified_at timestamptz,
  verified_by uuid references auth.users(id) on delete set null,
  effective_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  revocation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at is null or effective_at is null or expires_at > effective_at),
  unique (organization_id, user_id, role_id)
);

create table if not exists public.authorization_consents (
  id uuid primary key default gen_random_uuid(),
  subject_user_id uuid not null references auth.users(id) on delete cascade,
  requesting_user_id uuid references auth.users(id) on delete set null,
  requesting_organization_id uuid references public.authorization_organizations(id) on delete set null,
  granted_by uuid references auth.users(id) on delete set null,
  scope jsonb not null default '{}'::jsonb,
  purpose text not null,
  policy_version text not null,
  status text not null default 'pending' check (status in ('pending','granted','declined','expired','revoked','disputed')),
  effective_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  revocation_reason text,
  created_at timestamptz not null default now(),
  check (requesting_user_id is not null or requesting_organization_id is not null),
  check (expires_at is null or effective_at is null or expires_at > effective_at)
);

create table if not exists public.authorization_verifications (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('role_assignment','relationship','organization','organization_membership','guardian','institutional_contact','service_actor')),
  subject_id uuid not null,
  status text not null default 'pending' check (status in ('pending','verified','rejected','expired','revoked')),
  method text not null,
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  revocation_reason text,
  evidence_reference text,
  created_at timestamptz not null default now()
);

create table if not exists public.authorization_relationships (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null references auth.users(id) on delete cascade,
  actor_user_id uuid not null references auth.users(id) on delete cascade,
  relationship_type text not null check (relationship_type in ('guardian','mentor','educator','coach','institution','employer')),
  actor_role_id text not null references public.authorization_roles(id),
  organization_membership_id uuid references public.authorization_organization_memberships(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','active','declined','expired','revoked','removed','blocked')),
  verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected','expired','revoked')),
  source_invitation_id uuid references public.support_invitations(id) on delete set null,
  consent_required boolean not null default false,
  consent_id uuid references public.authorization_consents(id) on delete set null,
  effective_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  revocation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (scholar_id <> actor_user_id),
  check (expires_at is null or effective_at is null or expires_at > effective_at),
  check ((consent_required = false) or consent_id is not null),
  check (
    (relationship_type = 'guardian' and actor_role_id = 'family') or
    (relationship_type = 'mentor' and actor_role_id = 'mentor') or
    (relationship_type = 'educator' and actor_role_id = 'educator') or
    (relationship_type = 'coach' and actor_role_id = 'coach') or
    (relationship_type = 'institution' and actor_role_id in ('college-coach','college-admissions','district')) or
    (relationship_type = 'employer' and actor_role_id = 'employer')
  )
);

create index if not exists authorization_relationships_scholar_idx
  on public.authorization_relationships(scholar_id, status);
create index if not exists authorization_relationships_actor_idx
  on public.authorization_relationships(actor_user_id, status);

create table if not exists public.authorization_delegations (
  id uuid primary key default gen_random_uuid(),
  delegator_user_id uuid not null references auth.users(id) on delete cascade,
  delegate_user_id uuid references auth.users(id) on delete cascade,
  delegate_organization_id uuid references public.authorization_organizations(id) on delete cascade,
  relationship_id uuid references public.authorization_relationships(id) on delete cascade,
  permission_id text not null references public.authorization_permissions(id),
  resource_type text not null,
  resource_id uuid,
  purpose text not null,
  consent_id uuid references public.authorization_consents(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','active','expired','revoked')),
  effective_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  revocation_reason text,
  created_at timestamptz not null default now(),
  check ((delegate_user_id is not null) <> (delegate_organization_id is not null)),
  check (expires_at is null or effective_at is null or expires_at > effective_at)
);

create table if not exists public.authorization_audit_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  recorded_at timestamptz not null default now(),
  event_type text not null check (event_type in ('authentication','authorization_failure','permission_change','consent_created','consent_revoked','sensitive_data_access','administrative_action','export','deletion','correction')),
  schema_version text not null default '1.0.0',
  actor_user_id uuid references auth.users(id) on delete set null,
  service_actor text,
  subject_user_id uuid references auth.users(id) on delete set null,
  organization_id uuid references public.authorization_organizations(id) on delete set null,
  relationship_id uuid references public.authorization_relationships(id) on delete set null,
  action text,
  target_domain text not null,
  target_type text not null,
  target_id text,
  decision text not null check (decision in ('allowed','denied','not_applicable')),
  authorization_basis jsonb not null default '{}'::jsonb,
  purpose text,
  outcome text not null,
  reason_category text,
  correlation_id text,
  source text not null,
  metadata jsonb not null default '{}'::jsonb,
  check (actor_user_id is not null or service_actor is not null)
);

-- Seed only canonical roles already present in the executable Role Registry.
insert into public.authorization_roles (id, description, is_public_onboarding_role) values
  ('scholar','Scholar',true),
  ('scholar-athlete','Scholar-Athlete',true),
  ('transition-youth','Transition-Aged Youth',true),
  ('family','Parent / Guardian',true),
  ('mentor','Mentor',true),
  ('educator','Teacher / Educator',true),
  ('coach','High School Coach',true),
  ('college-coach','College Coach / Recruiter',true),
  ('college-admissions','College Admissions',true),
  ('brand-partner','Brand Partner',true),
  ('employer','Employer / Workforce Partner',false),
  ('district','District / School Administrator',false),
  ('other','Community Partner',true)
on conflict (id) do update set
  description = excluded.description,
  is_public_onboarding_role = excluded.is_public_onboarding_role;

-- Seed exactly the existing permission registry; no new grants are introduced.
insert into public.authorization_permissions (id, action, data_domain, description, risk_level) values
  ('view_progress','VIEW','scholar_progress','Read a bounded Scholar progress projection','high'),
  ('view_verified_record','VIEW','scholar_record','Read an explicitly eligible verified-record projection','critical'),
  ('view_deadlines','VIEW','scholar_deadlines','Read bounded Scholar deadline data','moderate'),
  ('support_tasks','UPDATE','support_actions','Participate in bounded support-task workflows','high'),
  ('verify_evidence','APPROVE','evidence','Verify eligible evidence within scoped educational context','critical'),
  ('recommend_actions','CREATE','recommendations','Create recommendations without editing canonical Scholar facts','high'),
  ('view_cohort','VIEW','institutional_cohort','Read an approved scoped cohort projection','critical'),
  ('view_equity_metrics','VIEW','institutional_analytics','Read approved aggregate equity metrics','critical'),
  ('create_opportunities','CREATE','opportunities','Create organization-scoped opportunities','high'),
  ('review_candidates','APPROVE','applications','Review explicitly shared candidates in organization scope','critical')
on conflict (id) do update set
  action = excluded.action,
  data_domain = excluded.data_domain,
  description = excluded.description,
  risk_level = excluded.risk_level;

insert into public.authorization_role_permissions (role_id, permission_id) values
  ('scholar','view_progress'), ('scholar','view_verified_record'), ('scholar','view_deadlines'), ('scholar','support_tasks'),
  ('family','view_progress'), ('family','view_deadlines'), ('family','support_tasks'),
  ('educator','view_progress'), ('educator','verify_evidence'), ('educator','recommend_actions'), ('educator','view_cohort'),
  ('mentor','view_progress'), ('mentor','recommend_actions'), ('mentor','support_tasks'),
  ('district','view_cohort'), ('district','view_equity_metrics'),
  ('employer','view_verified_record'), ('employer','create_opportunities'), ('employer','review_candidates')
on conflict do nothing;

-- Authorization helpers are database-enforced, stable, and fail closed.
create or replace function public.authorization_has_active_role(requested_role text, requested_context_id uuid default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.authorization_role_assignments assignment
    where assignment.user_id = auth.uid()
      and assignment.role_id = requested_role
      and assignment.status = 'active'
      and assignment.effective_at is not null
      and assignment.effective_at <= now()
      and (assignment.expires_at is null or assignment.expires_at > now())
      and assignment.revoked_at is null
      and (requested_context_id is null or assignment.context_id = requested_context_id)
  );
$$;

create or replace function public.authorization_has_permission(
  requested_permission text,
  requested_scholar_id uuid default null,
  requested_organization_id uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    auth.uid() is not null
    and exists (select 1 from public.authorization_permissions p where p.id = requested_permission)
    and (
      (
        requested_scholar_id = auth.uid()
        and exists (
          select 1 from public.authorization_role_permissions owner_template
          where owner_template.role_id = 'scholar'
            and owner_template.permission_id = requested_permission
        )
      )
      or exists (
        select 1
        from public.authorization_relationships relationship
        join public.authorization_role_permissions grant_template
          on grant_template.role_id = relationship.actor_role_id
         and grant_template.permission_id = requested_permission
        left join public.authorization_consents consent on consent.id = relationship.consent_id
        where relationship.scholar_id = requested_scholar_id
          and relationship.actor_user_id = auth.uid()
          and relationship.status = 'active'
          and relationship.verification_status = 'verified'
          and relationship.effective_at is not null
          and relationship.effective_at <= now()
          and (relationship.expires_at is null or relationship.expires_at > now())
          and relationship.revoked_at is null
          and (
            relationship.consent_required = false
            or (
              consent.status = 'granted'
              and consent.effective_at is not null
              and consent.effective_at <= now()
              and (consent.expires_at is null or consent.expires_at > now())
              and consent.revoked_at is null
            )
          )
      )
      or exists (
        select 1
        from public.authorization_organization_memberships membership
        join public.authorization_organizations organization on organization.id = membership.organization_id
        join public.authorization_role_permissions grant_template
          on grant_template.role_id = membership.role_id
         and grant_template.permission_id = requested_permission
        where membership.user_id = auth.uid()
          and membership.organization_id = requested_organization_id
          and membership.status = 'active'
          and organization.status = 'verified'
          and membership.effective_at is not null
          and membership.effective_at <= now()
          and (membership.expires_at is null or membership.expires_at > now())
          and membership.revoked_at is null
      )
    );
$$;

create or replace function public.authorization_can_view_scholar(requested_scholar_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select requested_scholar_id = auth.uid()
    or public.authorization_has_permission('view_progress', requested_scholar_id, null)
    or public.authorization_has_permission('view_verified_record', requested_scholar_id, null);
$$;

revoke all on function public.authorization_has_active_role(text, uuid) from public;
revoke all on function public.authorization_has_permission(text, uuid, uuid) from public;
revoke all on function public.authorization_can_view_scholar(uuid) from public;
grant execute on function public.authorization_has_active_role(text, uuid) to authenticated, service_role;
grant execute on function public.authorization_has_permission(text, uuid, uuid) to authenticated, service_role;
grant execute on function public.authorization_can_view_scholar(uuid) to authenticated, service_role;

-- Enable RLS for all authorization infrastructure. Tables without a policy remain inaccessible.
alter table public.authorization_roles enable row level security;
alter table public.authorization_permissions enable row level security;
alter table public.authorization_role_permissions enable row level security;
alter table public.authorization_role_assignments enable row level security;
alter table public.authorization_organizations enable row level security;
alter table public.authorization_organization_memberships enable row level security;
alter table public.authorization_consents enable row level security;
alter table public.authorization_verifications enable row level security;
alter table public.authorization_relationships enable row level security;
alter table public.authorization_delegations enable row level security;
alter table public.authorization_audit_events enable row level security;

create policy "Authenticated users read role registry"
  on public.authorization_roles for select to authenticated using (true);
create policy "Authenticated users read permission registry"
  on public.authorization_permissions for select to authenticated using (true);
create policy "Authenticated users read role permission registry"
  on public.authorization_role_permissions for select to authenticated using (true);
create policy "Users read own role assignments"
  on public.authorization_role_assignments for select to authenticated using (user_id = auth.uid());
create policy "Users read own organization memberships"
  on public.authorization_organization_memberships for select to authenticated using (user_id = auth.uid());
create policy "Verified members read own organizations"
  on public.authorization_organizations for select to authenticated
  using (
    exists (
      select 1 from public.authorization_organization_memberships membership
      where membership.organization_id = authorization_organizations.id
        and membership.user_id = auth.uid()
        and membership.status = 'active'
        and membership.revoked_at is null
        and (membership.expires_at is null or membership.expires_at > now())
    )
  );
create policy "Consent parties read consent records"
  on public.authorization_consents for select to authenticated
  using (subject_user_id = auth.uid() or requesting_user_id = auth.uid() or granted_by = auth.uid());
create policy "Relationship parties read relationships"
  on public.authorization_relationships for select to authenticated
  using (scholar_id = auth.uid() or actor_user_id = auth.uid());
create policy "Delegation parties read delegations"
  on public.authorization_delegations for select to authenticated
  using (delegator_user_id = auth.uid() or delegate_user_id = auth.uid());

-- Existing tables: owner access only. No public or delegated profile policy is added here.
alter table public.profiles enable row level security;
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "Users create own profile" on public.profiles;
create policy "Users create own profile" on public.profiles for insert to authenticated with check (id = auth.uid());

-- Effective role and verification are server-governed even when a user owns the profile row.
revoke update (role, verification_status) on public.profiles from authenticated;

-- Athletics tables previously had RLS enabled without policies. Foundation access is read-only
-- until operation-specific ownership and lifecycle rules are approved.
create policy "Scholars read own athlete profile" on public.athlete_profiles for select to authenticated
  using (scholar_id = auth.uid());
create policy "Scholars read own eligibility checks" on public.athlete_eligibility_checks for select to authenticated
  using (scholar_id = auth.uid());
create policy "Scholars read own recruiting targets" on public.recruiting_targets for select to authenticated
  using (scholar_id = auth.uid());
create policy "Scholars read own NIL deals" on public.nil_deals for select to authenticated
  using (scholar_id = auth.uid());
create policy "Scholars read own athlete financial entries" on public.athlete_financial_entries for select to authenticated
  using (scholar_id = auth.uid());
