# Resume Intelligence

## Purpose
Specify the existing resume projection and its extension into a verified, scholar-controlled application artifact.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 25, 2026

## Related Documents
- [Canonical Student Record](./CANONICAL_STUDENT_RECORD.md)
- [Portfolio Intelligence decision](../DECISIONS/ADR-0003-Portfolio-Intelligence.md)
- [Recommendation Letters](./RECOMMENDATION_LETTERS.md)

## Mission and Purpose
Help Scholars select and communicate relevant, truthful experience for an opportunity while keeping the Scholar Record—not the resume—the source of truth.

## Repository Status — Partially Implemented

### Already Implemented
- **Inputs:** profile, courses, certificates, evidence, goals, and athletics.
- **Outputs:** name/headline plus education, course, certificate, evidence, goal, and athletics sections.
- **Domain:** [`lib/scholar-data/scholarApplicationData.ts`](../../lib/scholar-data/scholarApplicationData.ts) builds application data and a deterministic resume projection.
- **UI/components:** portfolio, opportunity toolkit, application workspace, and PDF tooling under [`components/portfolio/`](../../components/portfolio/), [`components/opportunity-toolkit/`](../../components/opportunity-toolkit/), and [`lib/opportunity-toolkit/pdf/`](../../lib/opportunity-toolkit/pdf/).
- **APIs/database:** portfolio-share and application-workspace routes/tables in [`app/api/portfolio/shares/route.ts`](../../app/api/portfolio/shares/route.ts), [`app/api/application-workspaces/route.ts`](../../app/api/application-workspaces/route.ts), and the application toolkit migrations.

## Current Capabilities and Limitations
The repository can assemble reusable Scholar data for applications. The mapper currently accepts legacy/permissive shapes, supplies a generic fallback headline, reduces items to names/titles, and does not carry verification, provenance, dates, outcomes, audience, or tailoring rationale. A complete resume lifecycle and canonical resume API are not evidenced.

## Required Extensions
- Replace loose input at the boundary with the existing typed Record projection.
- Preserve record/evidence identifiers, verification state, dates, issuer and measurable outcomes.
- Add scholar-controlled selection/order/editing and opportunity-specific suggestions with visible reasons.
- Export accessible PDF/structured formats and snapshot the exact artifact shared, using existing sharing/workspace systems.
- Treat generated language as a draft requiring Scholar approval; never fabricate metrics or experience.

## Engineering Readiness

| Area | Specification |
|---|---|
| Dependencies | Scholar Record, evidence/verifications, opportunity/application workspace, portfolio sharing, PDF renderer. |
| Complexity | Medium. |
| Risks | Fabrication, loss of provenance, privacy leakage, inaccessible output, stale shared links. |
| Validation | Mapping and snapshot tests, verified/unverified labels, PDF accessibility/visual checks, permission/expiry tests, no-fabrication fixtures. |
| Success metrics | Verified-item coverage, Scholar edit/approval rate, export success, expired-share enforcement, application completion. |

## Future Vision
Explainable tailoring can suggest which verified experiences are relevant to a specific opportunity. It must show why each item was suggested and let the Scholar change every word and inclusion decision.

