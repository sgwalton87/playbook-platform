# Canonical Student Record

## Purpose
Specify the existing Scholar Record as Playbook's authoritative lifelong student record and the integration boundary for every intelligence engine.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 25, 2026

## Related Documents
- [Intelligence architecture](./ARCHITECTURE.md)
- [Scholar Record data model](../ENGINEERING/SCHOLAR_RECORD_DATA_MODEL.md)
- [Playbook Record ADR](../ADR/ADR-0001-Playbook-Record.md)
- [Scholar Record decision](../DECISIONS/ADR-0002-Scholar-Record.md)

## Mission and Purpose
Give each Scholar ownership of one verified, portable, lifelong record of identity, learning, achievement, evidence, relationships, reflection, outcomes, and opportunity progress. “Canonical Student Record” is an architectural description of the existing **Scholar Record**, not a new model or product name.

## Repository Status — Implemented

### Already Implemented
- **Existing database:** `playbook_records` and its achievements, evidence, verifications, reflections, outcomes, evidence packs, timeline events, opportunity matches, trust reports, and vault items are created and protected by RLS in [`supabase/migrations/20260701_playbook_graph.sql`](../../supabase/migrations/20260701_playbook_graph.sql).
- **Existing domain:** [`lib/scholar/`](../../lib/scholar/) supplies Scholar models/modules; [`lib/playbook-record/index.ts`](../../lib/playbook-record/index.ts) reuses that domain; achievements service code lives in [`lib/playbook-record/services/achievements.ts`](../../lib/playbook-record/services/achievements.ts).
- **Existing UI:** [`app/record/page.tsx`](../../app/record/page.tsx), [`components/playbook-record/`](../../components/playbook-record/), portfolio/profile/transcript/certificate/badge surfaces.
- **Existing APIs:** portfolio sharing, transcript parsing, albums, rewards, application workspaces, and support workflows provide bounded adjacent write/read surfaces; there is intentionally no new generic “intelligence record” API.

### Current Inputs
Profile/onboarding, transcript and courses, certificates/badges, achievements, uploaded evidence, verifications, reflections, goals/outcomes, athletics, opportunity/application state, event participation, reward events, and scholar/supporter actions.

### Current Outputs
Record views, verified portfolio/evidence packs, timeline events, readiness inputs, opportunity-match rows, application/resume projections, and permission-filtered shares.

## Current Capabilities
The graph separates claims (`achievements`, `evidence`) from trust decisions (`verifications`) and narrative/outcome context. Ownership keys and RLS make the Scholar boundary explicit. Timeline and evidence-pack structures support reuse instead of copying truth into each engine.

## Current Limitations
Record concepts are represented through several library namespaces (`scholar`, `playbook-record`, `playbook/record`, portfolio/repository adapters). Not every UI signal demonstrably persists through one typed adapter. Provenance, issuer assurance, staleness, revocation, and projection versioning need stronger uniform contracts.

## Partially Implemented
Unified read projections, command-style writes, adapter consolidation, and full provenance are partial. These gaps do not justify another canonical table or model.

## Recommended Constitutional Extensions
- Extend the existing domain with a versioned `ScholarRecordProjection` containing only authorized fields and evidence references.
- Define explicit commands for proposed achievement/evidence/outcome/timeline updates, including actor, source, consent, validation result, and idempotency key.
- Extend existing verification records with issuer/provenance and revocation semantics through reviewed migrations.
- Emit existing Playbook events after successful writes; do not let notification delivery determine record truth.

## Engineering Readiness

| Requirement | Specification |
|---|---|
| Existing components | Reuse record, portfolio, transcript, certificates, badges, timeline, trust and permission components. |
| Required extensions | Typed projection/commands, provenance metadata, adapter inventory, RLS parity tests. |
| Complexity | High: this is the shared boundary for every engine. |
| Dependencies | Auth/profile, roles, Supabase/RLS, evidence/verification, portfolio sharing, events. |
| Risks | Duplicate truth, over-sharing, stale projections, unverified claims appearing verified, migration drift. |
| Validation | Mapping/contract tests, migration review, RLS tests by role, export/privacy review, correction and deletion workflows. |
| Success metrics | Verified completeness, provenance coverage, correction turnaround, unauthorized-access count (target zero), projection freshness. |

## Future Vision
A Scholar-controlled portable record can support assisted interpretation across a lifetime. Portability must preserve provenance and consent; external or model-derived data remains proposed/unverified until accepted and, where required, verified by a human or issuer.

