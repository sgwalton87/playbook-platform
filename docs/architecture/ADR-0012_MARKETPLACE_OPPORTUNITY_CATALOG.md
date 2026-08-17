# ADR-0012 — Canonical Marketplace Opportunity Catalog

## Status
Accepted for implementation.

## Context
Playbook currently has two distinct concepts that must not be conflated:

1. Opportunity Intelligence / readiness ontology nodes that help Scholars understand pathways and readiness.
2. Real-world opportunities published by verified organizations.

The current `/opportunities` experience can present readiness ontology nodes as if they were actual opportunities and can route them into an Application Workspace. That violates canonical ownership and transparency because derived intelligence is not a real scholarship, job, internship, sponsorship, NIL opportunity, or mentorship listing.

Phase 12 also requires internships, jobs, sponsorships, NIL opportunities, scholarships, mentorship, applicants, tracking, rewards, and compliance review. These capabilities must converge on shared platform services rather than create independent type-specific systems.

## Decision
Create one canonical `marketplace_opportunities` dataset for real-world Marketplace listings.

Supported listing types:
- internship
- job
- sponsorship
- nil
- scholarship
- mentorship

A listing belongs to a verified operational `brand_partners` organization and may reference an existing `brand_campaign_drafts` campaign. The opportunity record—not the campaign, readiness ontology, recommendation, or application workspace—is the canonical owner of the external listing facts.

### Publication authority
Brand Partners may create and edit their own drafts and request review. They may not publish, approve, reject, or close listings through partner authority.

Platform operators perform human publication review. Only an operator approval may transition a listing to `published`.

### Scholar consumption
Scholars may browse only published listings through a narrow authenticated projection. A published listing may open the existing Scholar-owned Application Workspace using the stable opportunity ID and listing facts.

Application Workspaces remain the owner of Scholar application progress and private application materials. Marketplace opportunities do not own applications.

### Intelligence separation
Opportunity Intelligence remains derived guidance. PBOS readiness nodes may explain pathways, gaps, and suggested next steps, but they must be visibly labeled as readiness guidance and must not be represented as published Marketplace listings.

Future matching may rank real `marketplace_opportunities` using authorized Scholar signals. The canonical catalog must exist before intelligence consumes it.

### Applicant privacy
Publishing an opportunity grants no automatic access to Scholar records or applications. Applicant visibility requires a separate, explicit Phase 12 authority contract built on Application Workspace sharing/consent. This ADR does not grant applicant access.

### NIL and consequential decisions
A published NIL listing is not NIL compliance approval, contract approval, compensation approval, or an endorsement. A published scholarship/job/internship/mentorship listing does not grant the partner selection authority beyond a future explicitly governed applicant-review workflow. Human decision authority remains explicit.

## Consequences
- One opportunity catalog serves all Marketplace listing types.
- No `internships`, `jobs`, `scholarships`, `sponsorships`, or `nil_opportunities` duplicate tables are introduced.
- Brand campaign records remain planning artifacts and do not imply publication.
- PBOS recommendations remain derived intelligence and do not become canonical listing facts.
- Applicant access, rewards, outcome tracking, and compliance-specific review can extend this catalog without changing its ownership boundary.

## Validation requirements
Release certification must verify:
- RLS is enabled.
- Anonymous access is denied.
- Brand Partners cannot publish/review listings.
- Platform operator authority is required for publication decisions.
- Published Scholar projection excludes review notes/internal authority fields.
- Partner mutation is owner-scoped and verification-scoped.
- Listing type is constrained to the canonical six-type taxonomy.
- No parallel type-specific opportunity tables are introduced.
