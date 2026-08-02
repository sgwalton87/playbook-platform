# Canonical Role Operating System Architecture

## Purpose

Define the minimum structural contract for every Playbook Role Operating System (OS) without claiming that incomplete user journeys are production ready.

## Ownership

Playbook Experience Governance owns the role contract. Identity and Access Governance owns assignment and permission boundaries. Each named OS governance owner certifies its experience.

## Last Updated

August 1, 2026

## Canonical Role Boundaries

| OS | Users | Dashboard | Governing role | Current repository reality |
|---|---|---|---|---|
| Scholar | Scholars | `/dashboard` | `ROLE:SCHOLAR` | Partial |
| Scholar Athlete | Scholar athletes | `/scholar-athlete-os` | `ROLE:SCHOLAR_ATHLETE` | Partial |
| Parent | Parents and guardians | `/family-os` | `ROLE:PARENT` | Partial |
| Mentor | Approved mentors | `/mentor-os` | `ROLE:MENTOR` | Partial |
| Coach | Coaches | `/educator-os` | `ROLE:COACH` | Partial; dedicated experience remains unresolved |
| Counselor | Counselors | `/educator-os` | `ROLE:COUNSELOR` | Blocked by role aliasing and missing dedicated journey |
| Institution | Institution operators | `/university-os` | `ROLE:INSTITUTION` | Partial |
| Brand Partner | Approved brand operators | `/brand-partner-os` | `ROLE:BRAND_PARTNER` | Partial |
| Financial Advisor | Approved financial educators/advisors | none | `ROLE:FINANCIAL_ADVISOR` | Missing and beta-ineligible |
| Administrator | Provisioned platform operators | `/admin` | `ROLE:ADMINISTRATOR` | Blocked by provisioning and role-registry conflict |

## Required OS Contract

Every OS must own a dashboard, governed workflows, explicit permissions, scoped data projections, actionable notifications, and outcome metrics. Completion requires executable browser journeys plus positive and negative live-database authorization evidence. A shared dashboard component does not establish role completeness.

Role identifiers are distinct authorities. `COUNSELOR` must not be silently normalized to Educator, and `ADMINISTRATOR` must not be silently normalized to District. Compatibility aliases may exist only at a documented ingress boundary and may not alter authorization semantics.

## Common Permission Model

- **View:** own data, consented relationship projections, or organization-scoped projections.
- **Edit:** own records or explicitly delegated workflow fields.
- **Approve:** only a named workflow authority; never inferred from read access.
- **Verify:** only qualified relationship or institutional authorities, with reason and audit record.
- **Administer:** separately provisioned platform administrators; all actions audited.

## Related Documents

- [Platform Registry Architecture](../ENGINEERING/PLATFORM_REGISTRY_ARCHITECTURE.md)
- [Authorization Architecture](../ENGINEERING/AUTHORIZATION_ARCHITECTURE.md)
- [System Audit](../REVIEWS/PLAYBOOK_PLATFORM_SYSTEM_AUDIT_001.md)
