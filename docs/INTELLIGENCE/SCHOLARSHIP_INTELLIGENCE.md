# Scholarship Intelligence

## Purpose
Specify scholarship discovery/readiness as an extension of the existing Opportunity Engine.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 25, 2026

## Related Documents
- [Intelligence architecture](./ARCHITECTURE.md)
- [Compass](./COMPASS.md)
- [Recommendation Letters](./RECOMMENDATION_LETTERS.md)

## Mission and Purpose
Increase equitable access to relevant scholarships by explaining eligibility/readiness, missing evidence, deadlines, and scholar-controlled application actions.

## Repository Status — Represented by Existing Functionality

### Already Implemented
- **Inputs:** academic, leadership/service, certificates, badges, and broader opportunity signals.
- **Outputs:** scholarship readiness, reasons, and next steps in [`lib/opportunities/engine.ts`](../../lib/opportunities/engine.ts).
- **Domain/components/UI:** generic matching/ontology under [`lib/opportunity-graph/`](../../lib/opportunity-graph/), opportunity libraries/components, [`app/opportunities/page.tsx`](../../app/opportunities/page.tsx), toolkit and workspaces.
- **Database:** `opportunity_matches` in the Playbook graph and `application_workspaces` in [`supabase/migrations/20260704_application_toolkit_persistence.sql`](../../supabase/migrations/20260704_application_toolkit_persistence.sql).
- **APIs:** application workspace and related portfolio/recommender routes.

No repository evidence supports a separate scholarship truth store or complete scholarship-specific engine.

## Current Limitations
The built-in scholarship entry is a readiness category, not a live catalog or eligibility rules engine. Award amount, sponsor provenance, residency/citizenship rules, deadline lifecycle, renewal, scam/safety review, and application outcome tracking are not established as complete capabilities.

## Required Extensions
Extend the opportunity ontology and matcher with scholarship-specific typed criteria, source freshness, deadline/award data, evidence requirements and application stages. Map requirements to existing Record evidence and application workspaces. Explanations must distinguish hard eligibility, inferred fit, missing data, and optional strengthening actions.

## Engineering Readiness

| Area | Specification |
|---|---|
| Dependencies | Scholar Record, opportunity graph, Compass, applications, resume, recommendations, notifications. |
| Complexity | High because catalog quality and rule normalization dominate ranking code. |
| Risks | Stale/scam listings, discriminatory proxies, false eligibility, deadline errors, over-notification. |
| Validation | Source/refresh audits, rule fixtures, deadline/time-zone tests, explanation fidelity, fairness/access review, user reporting flow. |
| Success metrics | Valid listing rate, eligibility precision, deadline-save/application completion, award outcomes, equitable match exposure, report resolution. |

## Future Vision
Partner feeds and assisted criteria extraction may populate the existing opportunity system after source verification and human review. Ranking must remain explainable and must not suppress the Scholar's ability to search or apply independently.

