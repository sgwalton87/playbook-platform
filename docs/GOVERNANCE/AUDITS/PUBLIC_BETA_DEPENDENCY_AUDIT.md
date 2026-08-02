# Playbook OS Public Beta Dependency Audit

## Purpose

This audit identifies the missing runtime connections, operational dependencies, and evidence required before Playbook OS may be offered as a public beta. It distinguishes repository foundations from production-proven behavior and provides an ordered, dependency-aware execution queue.

## Ownership

Owned by Playbook OS Engineering. Security owns threat and RLS approval; Product owns beta scope; Design owns experience and accessibility approval; Data owns retention and analytics approval; Operations owns deployment, monitoring, incident response, and recovery evidence.

## Last Updated

August 1, 2026

## Related Documents

- [Master engineering checklist](../../MASTER_CHECKLIST.md)
- [Platform build backlog](../../PLATFORM_BUILD_BACKLOG.md)
- [Release process](../../RELEASE_PROCESS.md)
- [Architecture handbook](../../ARCHITECTURE.md)
- [Database handbook](../../DATABASE.md)
- [UI design system](../../UI_DESIGN_SYSTEM.md)
- [Enterprise readiness gap analysis](../../REVIEWS/ENTERPRISE_READINESS_GAP_ANALYSIS.md)

## Certification Decision

**Public beta status: NOT READY.**

The repository contains substantial application, authorization, RLS, workflow, and unit-test foundations. Those foundations do not yet prove a safe public service. The release process intentionally fails closed when evidence is missing. CI definitions, an environment schema, an explicit beta exposure boundary, structural RLS validation, security headers, and supply-chain checks now exist, but their hosted execution and operational approval are not yet proven. Production-like migration/RLS execution, the complete role/browser QA matrix, deployed observability, recovery rehearsal, and privacy approval remain absent.

A limited **private, invited test cohort** may proceed only after gates PB-01 through PB-10 below are closed in a production-like environment. A **public beta** additionally requires PB-11 through PB-20 and formal release approval.

## Audit Method and Current Inventory

The audit traced the release gates through application routes, API handlers, Supabase migrations, authorization modules, tests, operational configuration, handbook evidence, and known demo/static data markers.

| Inventory | Repository evidence | Audit interpretation |
| --- | ---: | --- |
| App pages | 99 | Route count is not evidence of workflow completion; static generation can still contain client interactivity, while several surfaces still load demo or placeholder state. |
| API route handlers | 49 | Most consequence-bearing routes now authenticate, but request contracts, abuse controls, and end-to-end negative tests are inconsistent. |
| Supabase migrations | 29 | Schema intent is extensive, but migrations have not been certified against the designated beta project. |
| Public tables detected in migrations | 68 | All detected created tables have an explicit RLS-enable statement; this is structural evidence only. |
| RLS-enabled tables with no policy target detected by the audit | 0 | The static contract now requires an explicit policy for every created public table; live semantic and negative tests remain required. |
| Unit specs | 126 | Strong local contract coverage does not replace deployed database or browser journey evidence. |
| Browser E2E specs | 2 executable specs | Insufficient for the supported-role and device matrix. |
| Supabase integration specs | 1 executable spec | Useful foundation, currently environment-gated and not evidenced against the beta project. |
| CI workflows | 2 | Application, browser, migration-reset, dependency-audit and signature gates are defined; hosted results and branch protection remain unverified. |
| Checked-in environment contract | 1 | `.env.example` and a typed validator now define the deploy contract; hosted environment inventory, promotion and secret rotation remain unverified. |

The prior eight policy-less tables now have explicit least-privilege or deny-all dispositions. Athlete-owned data is owner-scoped, eligibility is Scholar-read-only, moderation and analytics reads are administrator-only, and inbound mail receipts deny direct authenticated access. This closes the static inventory gap but not the required live cross-identity tests.

## Critical Journey Connection Matrix

| Journey | Connected foundation | Missing connection before public beta | State |
| --- | --- | --- | --- |
| Sign-up, verification, login, recovery | Supabase auth pages and callback exist | Production email delivery, redirect allowlist, session expiry, abuse/captcha, recovery, and mobile-browser evidence | Blocked |
| Role selection and onboarding | Canonical role registry and completion RPC exist | Every public role path, refresh/resume/idempotency, invite collision, and correct Role OS redirect in browser tests | Blocked |
| Scholar Record → evidence → verification | Server authorization, provenance, queue, audits, UI actions | Live migration execution, storage policies, verifier-role negatives, concurrency/replay, notification delivery | Blocked |
| Portfolio → share → revoke → export | Server packet allowlist and snapshots exist | Live RLS, expiry/revocation cache behavior, recipient privacy, PDF accessibility, load and abuse testing | Blocked |
| Support invite → Scholar context → message/action | Atomic invitation and relationship-scoped services exist | Multi-Scholar switching, revoked/expired relationship behavior, permission downgrade, browser and database negatives | Blocked |
| Opportunity → application → recommendation | Opportunity and application foundations exist | Complete persisted opportunity/application/recommender lifecycle, ownership transitions, deadlines, notifications, browser evidence | Partial |
| Feed, connections, messaging, groups | Several APIs and pages exist | Demo/static data removal, moderation propagation, block/mute enforcement in every read, realtime delivery, pagination and abuse controls | Partial |
| Institution and admin operations | Role guards, moderation and audit foundations exist | Tenant isolation, admin provisioning/break-glass, institution-scoped negative matrix, immutable audit export and review | Blocked |
| Analytics and consent | Allowlisted event RPC and settings control exist | Retention job, deletion/export behavior, production governance approval, operational dashboards, alert thresholds | Blocked |
| Release and operations | Fail-closed evaluator and shallow readiness route exist | Actual CI, environment promotion, dependency probes, telemetry, SLOs, alert paging, incident exercise, backup/restore and rollback rehearsal | Blocked |

## Public Beta Gates and Missing Dependencies

| ID | Priority | Missing connection or dependency | Required exit evidence | Accountable owner |
| --- | --- | --- | --- | --- |
| PB-01 | P0 | **CI is implemented but not operationally proven.** Clean install, environment/RLS validation, lint, unit tests, build, browser smoke, migration reset, artifact retention, dependency audit and signatures are defined. Hosted runs and protected-branch enforcement remain missing. | Protected-branch workflow runs all required gates from a clean install and archives immutable results. | Engineering / Release |
| PB-02 | P0 | **The environment contract is implemented but deployment governance is incomplete.** A checked-in non-secret manifest and fail-closed validator exist; environment promotion and secret rotation evidence do not. | Environment schema, staging/beta separation, secret ownership/rotation record, preview restrictions, and deploy verification. | Operations / Security |
| PB-03 | P0 | **Migrations are structurally reviewed but not deployed and reconciled.** | Clean database reset plus upgrade-from-current rehearsal, generated schema/types diff, migration checksum, and beta-project execution record. | Data / Engineering |
| PB-04 | P0 | **RLS is structurally complete but not production-proven.** Every created public table now enables RLS and declares an explicit policy; institution/admin and negative-permission matrices remain incomplete. | Authenticated cross-user, cross-Scholar, cross-institution, revoked, unauthenticated, and admin negative tests on the beta database. | Security / Data |
| PB-05 | P0 | **Authentication and onboarding are not certified end to end.** | Browser evidence for sign-up, email verification, login, recovery, role selection, resume, completion, destination, logout, session expiry, and abuse controls. | Identity / QA |
| PB-06 | P0 | **Supported-role browser coverage is incomplete.** Two E2E specs cannot certify the role matrix. | Seeded deterministic fixtures and passing Scholar, Scholar-Athlete, Family, Educator, Counselor, Mentor, Coach, Admissions, Partner, Employer, Admin, and Abroad journeys. | QA / Product |
| PB-07 | P0 | **The beta exposure boundary is implemented but not deployed.** The opt-in proxy allowlist, persisted expiring cohort grants, denied API response, and unavailable page fail closed; grant operations and deployed verification remain incomplete. | Server-enforced beta route/capability allowlist, cohort entitlement, unavailable-state standard, kill switch, and route inventory test. | Product / Engineering |
| PB-08 | P0 | **Observability foundation is implemented but not deployed or operationally certified.** Structured/redacted events, edge correlation, server/client error capture, selected API/provider signals, per-instance metrics, alert contracts, ownership, and synthetic definitions now exist. No durable collector, cross-instance metric/trace backend, hosted dashboard, bound alert, test-alert receipt, authenticated synthetic result, or acknowledged on-call schedule is proven. | Deploy and retain correlated logs, errors, traces and metrics; bind SLOs and alert thresholds; acknowledge named responders; pass authenticated synthetic probes and a test alert. | Operations |
| PB-09 | P0 | **Recovery is documented but unrehearsed.** | Point-in-time restore, backup verification, application rollback, forward database repair, feature kill switch, recovery time/result, and signed exercise report. | Operations / Data |
| PB-10 | P0 | **Youth privacy, consent, and compliance approval is missing.** | Data inventory/classification, lawful basis, guardian/age handling, retention/deletion/export, vendor review, privacy/security approval, terms and privacy notices. | Legal / Privacy / Security |
| PB-11 | P1 | **Request validation and abuse protection remain inconsistent across the full API inventory.** A shared authenticated boundary and persistent quota primitive now harden AI and notification routes, but adoption across every included handler is incomplete. | Shared boundary validation, body limits, authentication/authorization, CSRF/origin decision, rate limits/quotas, idempotency, sanitized errors, and negative tests. | Security / API |
| PB-12 | P1 | **Application security headers are configured but edge protections are not proven.** CSP, HSTS, framing, MIME, referrer, permissions and cross-origin policies have unit evidence; deployed header inspection, WAF and abuse controls remain. | Reviewed CSP, HSTS, framing, MIME, referrer and permissions policy; upload/media constraints; WAF/bot/rate-limit strategy; automated header tests. | Security / Operations |
| PB-13 | P1 | **Email and notification delivery is implemented but not operationally verified.** Admin and guardian delivery now use configured addresses, active relationships, provider responses, quotas, idempotency, and delivery audits; verified domains, webhook feedback, retry/dead-letter workers, and deployed deliverability evidence remain absent. | Verified sending domains, recipient configuration, templates, bounce/complaint handling, retry/dead-letter behavior, replay tests and deliverability monitoring. | Communications / Operations |
| PB-14 | P1 | **Demo and placeholder experiences remain on beta-reachable routes.** Feed, albums, connections, messages, mentor, profile, public profile and support surfaces contain markers or demo-backed components. | Each exposed route is persisted, authorized, state-complete and tested, or removed from the beta allowlist with honest unavailable UX. | Product / Engineering |
| PB-15 | P1 | **Cross-feature trust controls are not proven.** Block, mute, moderation and relationship revocation must affect every feed, directory, message, notification, and search read. | Contract map plus integration tests proving immediate propagation across all affected queries and realtime subscriptions. | Trust & Safety |
| PB-16 | P1 | **Accessibility, responsive and performance evidence is absent.** | Automated accessibility gate, keyboard/screen-reader review, reduced-motion/contrast validation, mobile/tablet/desktop matrix, Web Vitals and load budgets on critical journeys. | Design / QA |
| PB-17 | P1 | **AI/transcript governance is incomplete.** Provider calls and derived transcript data need consent, provenance, safety, cost, timeout and human-correction controls. | Model/provider inventory, bounded inputs/outputs, redaction policy, audit/provenance, evaluation set, failure/fallback UX, quotas and human review. | AI / Privacy / Product |
| PB-18 | P1 | **Data lifecycle jobs are not operated.** Analytics retention is contractual but no scheduler/monitor proves deletion; user export/deletion and orphan cleanup are not certified. | Scheduled jobs, metrics/alerts, dry-run reports, deletion/export integration tests, legal-hold behavior and operator runbooks. | Data / Privacy |
| PB-19 | P1 | **Dependency and signature gates are defined but not yet evidenced.** Dependabot, locked installs, high-severity production audit and registry-signature verification exist; hosted results, licenses, secrets and build provenance remain. | Lockfile clean-install, dependency/license/vulnerability scan with approved exceptions, secret scan, build provenance and update ownership in CI. | Security / Engineering |
| PB-20 | P1 | **Beta operations and feedback loop are undefined.** | Cohort plan, support channel, incident severity/escalation, status communications, feedback intake/triage, release notes, go/no-go authority and daily health review. | Product / Operations |

## Ordered Next 20 Engineering Missions

The execution order respects prerequisites. Parallel work is allowed only where it does not weaken a preceding control.

1. Establish the beta scope, supported roles, route allowlist, cohort entitlement, and kill-switch contract.
2. Add a checked-in, non-secret environment schema and validate required configuration at build/deploy time.
3. Implement pull-request and protected-branch CI with clean install, lint, unit tests, build, migration checks, and archived evidence.
4. Create a reproducible local/CI Supabase reset-and-seed harness with deterministic role fixtures.
5. Rehearse all migrations from empty and current production-like baselines; reconcile generated database types.
6. Complete the RLS policy inventory and explicitly classify every table as allowlisted or deny-all.
7. Expand authenticated database tests across users, Scholars, institutions, revoked grants, moderation and admins.
8. Harden public API boundaries with shared validation, quotas, body limits, origin policy, idempotency and safe errors.
9. Remove or govern the unauthenticated AI/admin-notification endpoints and implement the guardian delivery workflow.
10. Configure security headers and test the deployed edge/security posture.
11. Complete authentication/onboarding browser fixtures and all role completion/redirect journeys.
12. Implement the critical browser journey matrix for evidence, portfolio, invitation, context, message, action, opportunity and application flows.
13. Enforce the beta exposure boundary and convert nonincluded routes to honest, accessible unavailable states.
14. Wire demo-backed included routes to authorized persistence or remove them from beta scope.
15. Deploy error, log, trace, metric and synthetic instrumentation with SLOs, dashboards and alert ownership.
16. Complete email/domain, notification, webhook, retry, dead-letter and deliverability validation.
17. Complete privacy, youth-consent, retention, deletion/export, vendor and AI governance reviews.
18. Run accessibility, device, browser, Web Vitals, load and degraded-network QA on the allowlisted journeys.
19. Rehearse backup restore, application rollback, forward database recovery, alert response and incident communications.
20. Run an invited soft launch, resolve severity-one/two findings, and issue a signed public-beta go/no-go record.

## Recommended Beta Boundary

Until the gates close, the safest candidate is an invite-only cohort centered on the minimum governed loop:

1. authentication and onboarding;
2. Scholar dashboard and Scholar Record;
3. evidence submission and verification;
4. portfolio assembly and controlled sharing;
5. one support invitation, active Scholar context, messaging and action handoff;
6. one opportunity-to-application workflow;
7. settings, privacy controls, support and account recovery.

All other routes should be either explicitly included with equivalent evidence or fail closed behind the beta capability boundary. A page rendering successfully, a static Next.js route marker, or a passing production build is not sufficient admission evidence.

## Evidence Required for Reassessment

Reassessment requires links or immutable artifacts for CI runs, deployed build identity, environment manifest, migration checksums, live RLS results, browser traces/screenshots, accessibility report, performance results, security review, privacy approval, monitoring dashboards, alert test, restore/rollback exercise, incident/support runbooks, cohort scope, open-defect ledger, and an accountable go/no-go decision.

No checklist item should move to Complete merely because its implementation exists. Completion requires the runtime, operational, negative-test, and approval evidence named in this audit.
