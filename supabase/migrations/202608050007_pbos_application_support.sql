create table if not exists public.application_support_requests (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null references auth.users(id),
  application_workspace_id uuid not null references public.application_workspaces(id),
  support_relationship_id uuid not null references public.support_relationships(id),
  category text not null check (category in ('RECOMMENDATION','DOCUMENTS','ESSAY_REVIEW','DEADLINE','OTHER')),
  summary text not null check (char_length(summary) between 3 and 500),
  state text not null default 'OPEN' check (state in ('OPEN','ACCEPTED','DECLINED','COMPLETED','CANCELLED')),
  idempotency_key text not null unique,
  pbos_delivery_state text not null default 'PENDING' check (pbos_delivery_state in ('PENDING','DELIVERED')),
  provenance jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.application_support_requests enable row level security;
drop policy if exists "Scholars manage own application support requests" on public.application_support_requests;
create policy "Scholars manage own application support requests" on public.application_support_requests for all to authenticated
  using (auth.uid() = scholar_id) with check (auth.uid() = scholar_id);
drop policy if exists "Authorized supporters view application support requests" on public.application_support_requests;
create policy "Authorized supporters view application support requests" on public.application_support_requests for select to authenticated using (
  exists (select 1 from public.support_relationships relationship
    where relationship.id = public.application_support_requests.support_relationship_id
    and relationship.scholar_id = public.application_support_requests.scholar_id and relationship.status = 'active'
    and relationship.permissions ? 'support_tasks'
    and (relationship.supporter_id = auth.uid() or lower(relationship.supporter_email) = lower(coalesce(auth.jwt() ->> 'email', ''))))
);
create index if not exists application_support_requests_owner_idx on public.application_support_requests(scholar_id, created_at desc);
create index if not exists application_support_requests_relationship_idx on public.application_support_requests(support_relationship_id, state, created_at desc);
