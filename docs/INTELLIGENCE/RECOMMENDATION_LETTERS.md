# Recommendation Letter Intelligence

## Purpose
Specify the existing recommender request workflow and safe extension into evidence-grounded, recommender-owned letter support.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 25, 2026

## Related Documents
- [Canonical Student Record](./CANONICAL_STUDENT_RECORD.md)
- [Resume Intelligence](./RESUME_INTELLIGENCE.md)
- [Beta 3.3 recommender workflow](../releases/BETA_3.3_SPRINT_II_RECOMMENDER_WORKFLOW.md)

## Mission and Purpose
Help Scholars request strong recommendations and help trusted recommenders work from consented, verified evidence while preserving the recommender's independent voice and judgment.

## Repository Status — Partially Implemented

### Already Implemented
- **Domain:** [`lib/recommenders/recommenderWorkflow.ts`](../../lib/recommenders/recommenderWorkflow.ts) defines roles, status lifecycle, request construction, evidence references, and email copy.
- **Database/security:** `recommender_requests` in [`supabase/migrations/20260704_application_toolkit_persistence.sql`](../../supabase/migrations/20260704_application_toolkit_persistence.sql), with Scholar and email-based recommender policies in [`supabase/migrations/20260704_application_toolkit_rls.sql`](../../supabase/migrations/20260704_application_toolkit_rls.sql).
- **API/UI/components:** [`app/api/recommenders/request/route.ts`](../../app/api/recommenders/request/route.ts), [`app/recommenders/`](../../app/recommenders/), and [`components/recommenders/`](../../components/recommenders/).
- **Inputs/outputs:** Scholar/recommender identity, role, opportunity and evidence produce a request ID, status transitions, email, request view, and application workflow state.
- **Validation:** recommender and recommender-auth tests under [`tests/unit/recommenders/`](../../tests/unit/recommenders/) and [`tests/unit/recommender-auth/`](../../tests/unit/recommender-auth/).

## Current Capabilities and Limitations
The repository supports the request lifecycle and tells recommenders that a brag sheet/verified evidence is available. A governed letter artifact, recommender consent, secure upload/editor, immutable submission snapshot, audit/retention, withdrawal/expiry, provenance, and drafting-assistance policy are not established as complete capabilities. Email-based policy must be reviewed carefully against authentication identity and token flows.

## Required Extensions
- Reuse recommender requests, auth, mail gateway, evidence packs, workspaces, events and notifications.
- Store only consented evidence references; give the Scholar a preview of the shared pack and the recommender independent control of the letter.
- Add secure accept/decline, deadline/reminder preferences, draft/upload, submit, immutable snapshot, withdrawal/expiry and audit events.
- If drafting assistance is later approved, it must cite supplied evidence, refuse fabrication, disclose assistance to the recommender, and never submit automatically.

## Engineering Readiness

| Area | Specification |
|---|---|
| Dependencies | Scholar Record/evidence packs, recommender auth, mail gateway, application workspace, permissions/RLS, events/notifications. |
| Complexity | High because confidentiality, identity, consent, and artifact governance are consequential. |
| Risks | Unauthorized access, fabricated praise, coercion, leaked confidential letters, duplicate reminders, status inconsistency. |
| Validation | Token/auth/RLS penetration tests, lifecycle/idempotency tests, evidence consent tests, retention/export review, mail-delivery tests, accessibility. |
| Success metrics | Request acceptance/submission and on-time rates, verified evidence use, reminder opt-out, security incidents (target zero), recommender satisfaction. |

## Future Vision
Evidence-grounded prompts may help a recommender recall relevant examples, but the recommender chooses content and owns the final letter. The system must support declining, revising, or writing without assistance and must never represent generated text as firsthand knowledge.

