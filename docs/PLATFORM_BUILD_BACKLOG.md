# Playbook OS Platform Build Backlog

## Purpose

This document is the ordered, canonical implementation queue for the next Playbook OS platform build increments. Work moves from this queue into focused, testable pull requests; an item is checked only when its implementation and validation evidence are committed.

## Ownership

Owned by Playbook OS Engineering with Product, Design, Data, Security, and Operations review for their respective boundaries.

## Last Updated

August 1, 2026

## Related Documents

- [Master engineering checklist](./MASTER_CHECKLIST.md)
- [Product roadmap](./ROADMAP.md)
- [Architecture handbook](./ARCHITECTURE.md)
- [Database handbook](./DATABASE.md)
- [UI design system](./UI_DESIGN_SYSTEM.md)
- [Engineering constitution](../CODEX.md)
- [Public beta dependency audit](./GOVERNANCE/AUDITS/PUBLIC_BETA_DEPENDENCY_AUDIT.md)

## Ordered Build Queue

The highest-priority trust and portability tranche is in implementation and testing. An item remains unchecked until its application behavior, database migration, RLS policies, and authenticated end-to-end evidence satisfy the repository Definition of Done.

1. [ ] **Testing:** Implement reusable route/server authorization for canonical roles and Scholar relationships.
2. [ ] **Testing:** Implement the idempotent onboarding completion and record-linking lifecycle.
3. [ ] **Testing:** Harden Starting Five invitation acceptance and permission propagation.
4. [ ] **Testing:** Define and persist the canonical evidence provenance and verification-state model.
5. [ ] **Testing:** Implement the authorized Evidence Center read service and route.
6. [ ] **Testing:** Build the permission-gated evidence verification workflow and audit trail.
7. [ ] **Testing:** Connect the shell and evidence surfaces to authenticated Scholar and relationship context.
8. [ ] **Testing:** Add Scholar Record portfolio completion and readiness indicators.
9. [ ] **Testing:** Implement controlled Scholar Portfolio sharing, revocation, and PDF export.
10. [ ] **Testing:** Add actionable notification categories and direct governed-surface links.
11. [ ] **Testing:** Expand the Scholar OS dashboard with live next-step recommendations and evidence completion cues.
12. [ ] **Testing:** Add role-specific dashboard cards for family, educator, mentor, district, university, and employer OS.
13. [ ] **Testing:** Introduce a reusable Trust Score card that summarizes evidence, verification, and activity.
14. [ ] **Testing:** Connect trust signals into the Scholar Record and opportunity surfaces.
15. [ ] **Testing:** Implement the first institutional relationship workflow for school, district, and university roles.
16. [ ] **Testing:** Harden support network messaging with permission-safe message creation and visibility rules.
17. [ ] **Testing:** Build a role-based action routing engine for intervention and recommendation handoff.
18. [ ] **Testing:** Create an opportunity recommendation feed that is evidence-backed and role-aware.
19. [ ] **Testing:** Implement moderation and safety review surfaces for trust and content flags.
20. [ ] **Testing:** Add audit trails for remaining admin actions and role changes.
21. [ ] **Testing:** Add a reusable design-system card and metric pattern across the OS surfaces.
22. [ ] **Testing:** Replace repeated inline styles on high-traffic role pages with shared UI primitives.
23. [ ] **Testing:** Create accessible component examples for buttons, cards, badges, navigation, and forms.
24. [ ] **Testing:** Introduce role-based empty states and loading states for remaining dashboard and workflow surfaces.
25. [ ] **Testing:** Add a deploy-ready health endpoint with explicit configuration status.
26. [ ] **Testing:** Define a governed analytics taxonomy for launch-critical youth outcomes.
27. [ ] **Testing:** Add a fail-closed release-readiness evaluator for required launch evidence.
28. [ ] **Testing:** Establish monitoring ownership and operational response evidence.
29. [ ] **Testing:** Complete privacy, consent, and data-retention launch review evidence.
30. [ ] **Testing:** Validate application, migration, and communication rollback readiness.
31. [ ] **Testing:** Bind album creation to authenticated ownership.
32. [ ] **Testing:** Enforce RLS for album reads and public visibility.
33. [ ] **Testing:** Bind album photo writes and cover updates to album ownership.
34. [ ] **Testing:** Authorize application workspace creation against active Scholar context.
35. [ ] **Testing:** Authorize application workspace reads against active Scholar context.
36. [ ] **Testing:** Scope partner campaign reads to registered partner ownership.
37. [ ] **Testing:** Scope campaign creation to registered partners and canonical schema fields.
38. [ ] **Testing:** Route community event reads through RLS.
39. [ ] **Testing:** Bind community event creation to authenticated creators.
40. [ ] **Testing:** Bind guided-tour progress to authenticated identity.
41. [ ] **Testing:** Require authenticated access for the supporter directory.
42. [ ] **Testing:** Bind directory profile writes to authenticated ownership.
43. [ ] **Testing:** Authorize recommendation requests against Scholar context.
44. [ ] **Testing:** Authorize reward balance reads against Scholar context.
45. [ ] **Testing:** Restrict reward emission to audited administrators and atomic persistence.
46. [ ] **Testing:** Bind social comment creation to authenticated identity.
47. [ ] **Testing:** Bind social comment edits to authenticated ownership.
48. [ ] **Testing:** Bind social comment deletion to authenticated ownership.
49. [ ] **Testing:** Make store redemption authenticated, server-priced, serialized, and atomic.
50. [ ] **Testing:** Remove service-role bypass from support-network summary reads.
51. [ ] **Testing:** Replace static action-routing fixtures with persisted, assignee-controlled handoffs.
52. [ ] **Testing:** Replace the static application workspace demo with authenticated Scholar data and creation.
53. [ ] **Testing:** Bind transcript parsing to authenticated ownership, bounded uploads, and RLS.
54. [ ] **Testing:** Make inbound support mail fail-closed, replay-safe, relationship-bound, and atomic.
55. [ ] **Testing:** Retire the legacy shared-action service-role API in favor of governed handoff RPCs.
56. [ ] **Testing:** Establish a server-enforced beta route/capability allowlist, cohort entitlement, and kill switch.
57. [ ] **Testing:** Publish and validate the non-secret environment/configuration contract.
58. [ ] **Testing:** Implement protected-branch CI and immutable release-gate evidence.
59. [ ] **Beta P0:** Build deterministic Supabase reset, seed, migration, and generated-type reconciliation.
60. [ ] **Testing:** Certify the complete RLS allow/deny inventory and cross-boundary negative matrix.
61. [ ] **Beta P0:** Complete authentication and onboarding browser validation for every supported beta role.
62. [ ] **Beta P0:** Complete critical workflow browser coverage with deterministic role fixtures.
63. [ ] **Beta P0:** Deploy observability, SLO dashboards, synthetic probes, alerting, and response ownership.
64. [ ] **Beta P0:** Rehearse backup restore, application rollback, database recovery, and incident response.
65. [ ] **Beta P0:** Complete youth privacy, consent, retention, deletion/export, and vendor approval.
66. [ ] **Testing:** Standardize API validation, size limits, quotas, origin policy, idempotency, and safe errors; shared primitives and high-risk AI/notification adoption are implemented, remaining included handlers are pending.
67. [ ] **Testing:** Configure and verify application and edge security headers and abuse controls.
68. [ ] **Testing:** Operationalize email, guardian/admin notification, webhook, retry, and deliverability flows; provider delivery and idempotent audit are implemented, webhook/retry/dead-letter and deployed evidence are pending.
69. [ ] **Beta P1:** Wire or beta-exclude every remaining demo- or placeholder-backed route.
70. [ ] **Beta P1:** Prove block, mute, moderation, and relationship revocation propagation across all reads.
71. [ ] **Beta P1:** Complete accessibility, responsive, browser, performance, and degraded-network QA.
72. [ ] **Beta P1:** Complete AI and transcript privacy, provenance, safety, evaluation, quota, and recovery controls.
73. [ ] **Beta P1:** Operate retention, cleanup, user export/deletion, and legal-hold lifecycle jobs.
74. [ ] **Testing:** Gate dependency vulnerabilities, licenses, secrets, and build provenance in CI.
75. [ ] **Beta P1:** Define beta support, incident communications, feedback triage, and go/no-go governance.
76. [ ] **Testing:** Replace the static Scholar-Athlete dashboard with live owner-authorized profile, recruiting, and NIL workflows.
77. [ ] **Testing:** Expand the canonical athlete identity, development, audience, provenance, and verification model.
78. [ ] **Testing:** Make recruiting target and NIL lead creation atomic, event-emitting, and idempotent.
79. [ ] **Testing:** Guard NIL stage, agreement, disclosure, compliance, review, and payment transitions.
80. [ ] **Testing:** Add explicit NIL marketplace consent and minor guardian-consent discovery safeguards.
81. [ ] **Testing:** Build the administrative NIL compliance review queue; institutional delegation and appeal remain required.
82. [ ] **Athlete P0:** Build registered-brand athlete discovery, proposal, athlete acceptance, and campaign collaboration UI.
83. [ ] **Athlete P0:** Complete recruiting relationship confirmation for athlete, coach, school, and recruiter directions.
84. [ ] **Athlete P0:** Add recruiting communication history, visits, camps, showcases, offers, and commitment evidence workflows.
85. [ ] **Athlete P0:** Add verified statistic, measurement, combine, achievement, award, and highlight-media evidence workflows.
86. [ ] **Athlete P0:** Complete NIL deliverable evidence, approval, payment verification, disclosure, and document-storage workflows.
87. [ ] **Athlete P1:** Build athlete financial literacy, budget, tax reserve, advisor, and long-term planning integration.
88. [ ] **Athlete P1:** Build the governed Athlete Network graph across teams, schools, coaches, agents, brands, mentors, advisors, communities, and events.
89. [ ] **Athlete P1:** Implement middle-school, high-school, college, professional, international, and post-career journey projections.
90. [ ] **Athlete P1:** Certify Athlete OS and NIL through live RLS, browser, accessibility, privacy, performance, observability, and recovery evidence.

## Current Increment Evidence

The first increment made the role registry authoritative for onboarding eligibility, completion destinations, role selection, and shell navigation. The trust tranche has implementation foundations for authorization, onboarding, evidence, portfolio, and notifications, but remains below Complete with atomic invitation acceptance, explicit Scholar context selection, a persisted verification queue, integrated Record readiness, server-generated allowlisted packets, and event-driven notifications now implemented. Items 1–55 now have implementation foundations and remain in Testing until the migrations and authenticated route/RLS suites run successfully against an available Supabase test environment. Items 56–75 are the dependency-ordered public-beta missions defined by the [public beta dependency audit](./GOVERNANCE/AUDITS/PUBLIC_BETA_DEPENDENCY_AUDIT.md). Items 76–90 govern Athlete Network and NIL completion; implementation foundations for 76–80 are in Testing while 81–90 remain executable. No item is complete without its specified runtime and operational evidence.
