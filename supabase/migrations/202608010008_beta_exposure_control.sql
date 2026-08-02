create table if not exists public.beta_access_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  cohort text not null,
  status text not null default 'active' check (status in ('active', 'suspended', 'expired', 'revoked')),
  granted_by uuid references public.profiles(id) on delete set null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  reason text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, cohort)
);

create index if not exists beta_access_grants_active_user_idx
on public.beta_access_grants(user_id, status, expires_at);

alter table public.beta_access_grants enable row level security;

create policy "Users read own beta access"
on public.beta_access_grants for select to authenticated
using (user_id = auth.uid());

create policy "Admins govern beta access"
on public.beta_access_grants for all to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());
