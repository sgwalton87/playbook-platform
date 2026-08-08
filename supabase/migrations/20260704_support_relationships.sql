create table if not exists public.support_relationships (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null,
  supporter_id uuid,
  supporter_email text not null,
  supporter_name text,
  relationship text not null,
  permissions jsonb not null default '[]'::jsonb,
  source_invitation_id uuid,
  status text not null default 'active'
    check (status in ('active', 'removed', 'blocked')),
  created_at timestamptz not null default now()
);

alter table public.support_relationships enable row level security;

drop policy if exists "Scholars can view their support relationships" on public.support_relationships;
create policy "Scholars can view their support relationships"
on public.support_relationships
for select
to authenticated
using (auth.uid() = scholar_id);

drop policy if exists "Supporters can view their scholar relationships" on public.support_relationships;
create policy "Supporters can view their scholar relationships"
on public.support_relationships
for select
to authenticated
using (auth.uid() = supporter_id);

drop policy if exists "Scholars can create support relationships" on public.support_relationships;
create policy "Scholars can create support relationships"
on public.support_relationships
for insert
to authenticated
with check (auth.uid() = scholar_id);
