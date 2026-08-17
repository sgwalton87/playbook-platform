# ADR-0011 — Brand Marketplace Foundation

Status: Accepted for implementation

## Context

Playbook already has verified Brand Partner identity evidence, `brand_partners`, `brand_campaign_drafts`, Opportunity/Application services, NIL campaign records, mentorship, and shared rewards. The current Brand Partner OS does not converge those owners: it reads legacy onboarding JSON for organization context and displays hard-coded zero marketplace metrics.

A verified Brand Partner can also reach the OS before an operational `brand_partners` row exists, while existing campaign RLS requires that row. This creates an authority-safe but unusable handoff.

## Decision

Phase 12 will extend existing owners rather than introduce a parallel marketplace database.

### Verification Evidence

`brand_partner_verification_requests` remains the authoritative verification evidence and approved campaign/compliance scope.

### Operational Organization Profile

`brand_partners` is the operational Organization Profile owner for verified Brand Partners. A governed idempotent bootstrap materializes the approved organization identity into `brand_partners` only after campaign and compliance scopes are both approved.

Editable public/operational organization fields may extend `brand_partners`; verification evidence is not overwritten by profile edits.

### Campaign Builder

`brand_campaign_drafts` remains the canonical draft campaign owner. Draft creation must reference the verified operational partner and the approved verification request. A requested campaign type must already exist in the verification request's approved/requested campaign-type evidence.

Campaign drafts do not become published opportunities, NIL deals, scholarships, jobs, internships, sponsorships, rewards, or compliance approvals by themselves.

### Downstream Marketplace Capabilities

Future Phase 12 packages shall reference existing canonical services where available:

- Opportunity publication/discovery → Opportunity service
- Scholar application lifecycle → Application Workspace service
- NIL activation → NIL campaign/deal services
- Mentorship → Mentorship service
- Rewards → shared Rewards service
- Compliance decisions → governed human review

## Trust Boundaries

- Brand verification is evidence, not the Organization Profile itself.
- Organization Profile bootstrap requires approved campaign and compliance scopes.
- Campaign creation cannot expand beyond verified campaign-type evidence.
- Draft campaigns are not published opportunities.
- Campaign records grant no Scholar Record access.
- No scholar applicant data is exposed by this package.
- No campaign approval, compliance clearance, NIL clearance, hiring decision, scholarship selection, or sponsorship commitment is inferred.

## Release Requirements

- one operational organization owner
- idempotent verification → organization bootstrap
- verified-scope campaign-type enforcement
- RLS / least privilege preserved
- honest zero-data states
- live OS metrics, no hard-coded connected counts
- CI, full database certification, and Vercel on one exact immutable head
