alter table public.academic_journey_evidence
  add column if not exists recommendation_key text,
  add column if not exists primary_recommendation jsonb,
  add column if not exists decision_state text not null default 'PENDING',
  add column if not exists decision_note text,
  add column if not exists decision_at timestamptz,
  add column if not exists outcome jsonb,
  add column if not exists outcome_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  alter table public.academic_journey_evidence
    drop constraint if exists academic_journey_evidence_decision_state_check;
  alter table public.academic_journey_evidence
    add constraint academic_journey_evidence_decision_state_check
    check (decision_state in ('PENDING','ACCEPTED','REJECTED','MODIFIED','COMPLETED'));
end $$;

create index if not exists academic_journey_evidence_decision_idx
  on public.academic_journey_evidence(owner_id, decision_state, created_at desc);

drop policy if exists "academic-evidence-own" on public.academic_journey_evidence;
create policy "academic-evidence-own"
  on public.academic_journey_evidence
  for all
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
