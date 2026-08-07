create table if not exists public.pbos_opportunity_recommendations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  opportunity_key text not null,
  opportunity_type text not null,
  title text not null,
  description text not null,
  score integer not null check (score between 0 and 100),
  reasons jsonb not null default '[]'::jsonb,
  next_steps jsonb not null default '[]'::jsonb,
  status text not null default 'RECOMMENDED' check (status in ('RECOMMENDED','SAVED','DISMISSED')),
  pending_action text check (pending_action is null or pending_action in ('SAVED','DISMISSED')),
  delivery_state text not null default 'PENDING' check (delivery_state in ('PENDING','DELIVERED')),
  signal_fingerprint text not null,
  discovery_idempotency_key text not null,
  decision_idempotency_key text,
  provenance jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  decided_at timestamptz,
  unique(owner_id, opportunity_key)
);
alter table public.pbos_opportunity_recommendations enable row level security;
drop policy if exists "pbos-opportunities-own" on public.pbos_opportunity_recommendations;
create policy "pbos-opportunities-own" on public.pbos_opportunity_recommendations for all
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create index if not exists pbos_opportunities_owner_status_idx
  on public.pbos_opportunity_recommendations(owner_id, status, score desc);
