create table if not exists academic_journey_evidence (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
  readiness_score numeric not null check (readiness_score between 0 and 100), ag_updates integer not null check (ag_updates between 0 and 7),
  idempotency_key text not null unique, delivery_state text not null default 'PENDING' check (delivery_state in ('PENDING','DELIVERED')),
  provenance jsonb not null default '[]', created_at timestamptz not null default now(), delivered_at timestamptz
);
alter table academic_journey_evidence enable row level security;
drop policy if exists "academic-evidence-own" on academic_journey_evidence;
create policy "academic-evidence-own" on academic_journey_evidence using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create index if not exists academic_journey_evidence_owner_idx on academic_journey_evidence(owner_id, created_at desc);
