# ADR-0013 — Marketplace Applicant Consent and Narrow Partner Projection

## Status
Accepted for implementation.

## Context
Marketplace Opportunity publication creates a real Scholar-visible listing, but publication does not grant the Brand Partner access to Scholars, their Scholar Records, or their private Application Workspaces.

Application Workspaces are Scholar-owned and already contain private tasks, documents, evidence, essays, recommendations, and support workflows. Phase 12 requires Opportunity Applicants, but applicant visibility must not bypass the existing ownership and privacy model.

## Decision
Introduce one explicit consent/submission record: `marketplace_application_submissions`.

The record links:
- one published `marketplace_opportunities` listing,
- one Scholar-owned `application_workspaces` workspace,
- the Scholar who owns that workspace,
- an explicit versioned consent acknowledgement,
- submission/withdrawal lifecycle timestamps.

The submission record does not copy the Application Workspace, Scholar Record, documents, or evidence.

### Scholar submission
A Scholar may share an Application Workspace with the listing organization only when:
- the Scholar is authenticated and owns the workspace,
- the workspace has already reached `submitted`,
- `application_workspaces.opportunity_id` equals the canonical Marketplace opportunity UUID,
- the Marketplace listing is still published and not past its deadline,
- the partner remains active,
- the Scholar explicitly accepts the current Marketplace applicant-sharing consent version.

A Scholar may withdraw sharing. Withdrawal removes the applicant from the partner's current live roster but preserves an auditable submission record.

### Brand Partner applicant visibility
A verified Brand Partner may view the active applicant roster only for Marketplace opportunities owned by that same operational `brand_partners` organization.

The partner projection is intentionally narrow. It may contain:
- submission ID,
- Scholar display name,
- username,
- avatar URL,
- application status,
- submitted timestamp.

It must not expose:
- email or phone,
- private application documents,
- essays,
- resume snapshots,
- evidence payloads,
- recommendations,
- support relationships,
- academic records,
- protected demographic data,
- other Scholar Record data.

### No selection authority in this package
Applicant visibility is not a selection engine and does not create automated hiring, scholarship, internship, sponsorship, NIL, or mentorship decisions.

Phase 12 Opportunity Tracking may later record human workflow/outcomes, but any consequential decision must remain attributable to a human actor and must not be generated automatically from protected Scholar data.

### Withdrawal
The Scholar controls the sharing relationship. Withdrawal does not delete history but prevents the submission from appearing in the current partner applicant roster.

## Consequences
- No parallel application table is introduced.
- Application Workspace remains the canonical application owner.
- Marketplace submission is an explicit consent/visibility edge.
- Publication alone grants zero applicant visibility.
- Future applicant packet sharing can extend this consent boundary explicitly rather than broadening the current projection silently.

## Validation requirements
Release certification must verify:
- RLS enabled and direct client table mutation denied.
- Anonymous access denied.
- submission requires Scholar ownership, submitted workspace state, published matching opportunity, active partner, valid deadline, and exact consent version.
- withdrawal is Scholar-owned.
- Brand Partner projection is organization-owned and active-submission-only.
- partner projection signature contains no private application/Scholar Record fields.
- existing Application Workspace direct RLS remains Scholar-only.
