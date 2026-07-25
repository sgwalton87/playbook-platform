# Financial Literacy Journey

## Purpose
Specify how a future financial literacy journey can extend existing courses, achievements, athlete finance, and reward-economy capabilities.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 25, 2026

## Related Documents
- [Canonical Student Record](./CANONICAL_STUDENT_RECORD.md)
- [Intelligence architecture](./ARCHITECTURE.md)
- [Career Journey](./CAREER_JOURNEY.md)

## Mission and Purpose
Build practical financial confidence through education, reflection, verified milestones, and trusted-human support—not individualized financial advice or autonomous financial decisions.

## Repository Status — Represented by Existing Functionality

### Already Implemented
- **Existing database:** `athlete_financial_entries` in [`supabase/migrations/20260704_scholar_athlete_os.sql`](../../supabase/migrations/20260704_scholar_athlete_os.sql); `coin_ledger`, `reward_events`, store products/redemptions and RLS in economy migrations.
- **Existing domain/UI:** [`lib/store-economy/`](../../lib/store-economy/), [`lib/economy-integrity/`](../../lib/economy-integrity/), reward modules, [`app/economy/`](../../app/economy/), [`app/reward-economy/page.tsx`](../../app/reward-economy/page.tsx), store and course/certificate surfaces.
- **Current inputs/outputs:** learning/reward activity, athlete financial records and redemptions produce balances, events, entries, achievements/certificates, and notifications.

These capabilities are not evidence of a general financial literacy journey, budgeting service, or advisory engine.

## Current Limitations
There is no evidenced cross-population curriculum graph, competency model, assessment contract, general milestone state, or advice-safety policy. Virtual coins/rewards must not be confused with real money or financial competence. Athlete financial entries are domain-specific.

## Required Extensions
- Extend existing course/journey primitives with versioned literacy competencies and milestones.
- Record course completion/certificates as existing achievements/evidence; keep sensitive reflections or financial entries separately permissioned.
- Provide educational scenarios and explanations with prominent “education, not advice” boundaries.
- Let Scholars invite family/mentors/counselors through existing support relationships; do not expose sensitive values by default.

## Engineering Readiness

| Area | Specification |
|---|---|
| Dependencies | Courses/certificates, Scholar Record, journey, economy integrity, permissions, support network, notifications. |
| Complexity | High due to safety, age, jurisdiction, accessibility, and sensitive-data requirements. |
| Risks | Harmful advice, privacy exposure, coercive gamification, confusing rewards with money, inequitable assumptions. |
| Validation | Expert content review, age/privacy/legal review, scenario tests, consent/RLS tests, accessibility, no-advice language audit. |
| Success metrics | Competency completion and retention, confidence change, help-seeking, privacy incidents (target zero), opt-out satisfaction—not spending. |

## Future Vision
Adaptive educational pathways may recommend the next lesson from demonstrated competencies. They must avoid product recommendations, credit/investment decisions, or claims of guaranteed outcomes, and should encourage qualified human guidance.

