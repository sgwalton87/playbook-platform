# Phase 12 — Brand Partner Marketplace Certification

Status: Release candidate

## Canonical architecture

Phase 12 extends existing owners. It does not create independent marketplaces for jobs, internships, scholarships, sponsorships, NIL opportunities, or mentorship.

| Tracker capability | Canonical implementation |
| --- | --- |
| Organization Profiles | `brand_partners` + `/brand-partner-os/organization` |
| Campaign Builder | `brand_campaign_drafts` + `/brand-partner-os/campaigns` |
| Rewards | shared Rewards / reward economy; Brand Partners do not mint rewards directly |
| Internships | `marketplace_opportunities.opportunity_type = internship` |
| Jobs | `marketplace_opportunities.opportunity_type = job` |
| Sponsorships | `marketplace_opportunities.opportunity_type = sponsorship` |
| NIL Opportunities | `marketplace_opportunities.opportunity_type = nil` |
| Scholarships | `marketplace_opportunities.opportunity_type = scholarship` |
| Mentorship | `marketplace_opportunities.opportunity_type = mentorship` |
| Opportunity Applicants | revocable `marketplace_application_shares` projection from submitted Scholar-owned Application Workspaces |
| Opportunity Tracking | `marketplace_application_outcomes`, human-recorded and consent-gated |
| Compliance Review | independent platform-operator publication review + verified compliance scope |

## Applicant privacy contract

Publishing an opportunity grants zero applicant access.

A Scholar must:

1. create and complete a Scholar-owned Application Workspace;
2. explicitly mark the application submitted;
3. explicitly share that submitted Marketplace-linked workspace with the organization.

The Brand Partner then receives only a narrow applicant projection: applicant display name, opportunity identity, application status, share time, and human-recorded outcome status. Direct Application Workspace table access, uploaded documents, transcript data, contact details, support relationships, and unrelated Scholar Record data remain outside Brand Partner authority.

Consent may be revoked. Revocation removes the application from the partner applicant view and records the outcome as withdrawn without deleting historical evidence.

## Opportunity tracking

Tracking is a human decision ledger, not automated selection. Verified partners may record only `under_review`, `selected`, or `not_selected` while consent remains active. The platform does not infer hiring, scholarship, sponsorship, NIL, or mentorship decisions from publication, ranking, recommendations, or campaign state.

## Rewards boundary

Phase 12 inherits the shared Rewards service. Marketplace publication, application sharing, or selection does not grant Brand Partners direct XP/coin/badge/certificate mint authority. Any future reward trigger must pass the shared reward policy and verified outcome/evidence rules.

## Compliance boundary

Marketplace listing publication remains an independent human platform-operator decision. Brand verification and approved compliance scope are prerequisites to partner marketplace operation, but publication is not NIL contract approval, compensation approval, hiring approval, scholarship selection, or legal/compliance advice.

## Release gates

Phase 12 is GREEN only when the exact immutable PR head passes:

- dependency audit
- lint
- PBOS audit
- unit/integration tests
- production build
- complete local database replay
- Marketplace catalog preflight
- Marketplace applicant consent/outcome preflight

No Phase 12 capability may be certified solely because a route exists.