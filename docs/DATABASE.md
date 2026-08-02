# Playbook OS Database Handbook

## Purpose
This handbook documents database conventions, schema responsibilities, security expectations, and migration practices for Playbook OS.

## Ownership
Owned by Playbook OS Engineering. Database changes that affect privacy, RLS, or production operations require platform review.

## Last Updated
August 1, 2026

## Related Documents
- Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Release process: [RELEASE_PROCESS.md](./RELEASE_PROCESS.md)
- Decisions: [DECISIONS.md](./DECISIONS.md)
- Agent rules: [../AGENTS.md](../AGENTS.md)

## Playbook Data Architecture
Playbook data architecture follows this durable value chain:

Playbook Record™

↓

Scholar Record™

↓

Evidence

↓

Trust

↓

Opportunity

↓

Outcomes

The database should preserve the raw facts, relationships, events, and evidence required to make this chain trustworthy. Presentation models may change, but canonical records should remain stable enough to support new operating systems, intelligence layers, and future products.

## Playbook Record™
Playbook Record™ is the canonical internal data model for a person, their achievements, evidence, relationships, learning, opportunities, and outcomes.

Scholar Record™ is one role-aware presentation of that record. Future role-specific records should build from the same canonical foundation rather than creating disconnected profile models. This keeps Scholar, family, educator, mentor, institution, employer, and partner experiences aligned around one trusted source of truth.

## Starting Five Graph
The Starting Five graph records trusted relationships around a Scholar. It supports:

- Invitations
- Permissions
- Messaging
- Collaboration
- Recommendations
- Trust

Graph edges should define actor, recipient, role, status, scope, timestamps, and revocation behavior. Relationship data should be auditable because it determines access to sensitive Scholar information.

## Evidence Model
Evidence is represented as durable proof attached to records, achievements, reflections, courses, applications, recommendations, and outcomes. Evidence examples include:

- Documents
- Photos
- Videos
- Certificates
- Reflections
- Links
- Verifications
- Artifacts

Evidence should strengthen the Scholar Record by making achievement more credible, portable, and useful for opportunities. Evidence records should capture ownership, storage reference, provenance, verification state, visibility, and lifecycle metadata.

## Trust Layer
Trust evaluates the quality and reliability of the Scholar Record using signals such as:

- Activity
- Evidence
- Verification
- Achievement
- Outcomes
- Community

Trust powers recommendations and opportunity readiness. Trust data should be explainable, auditable, and resistant to accidental inflation; high-trust records should be supported by evidence and verified relationships rather than engagement volume alone.

## Event Bus Data
Major actions should generate durable events. Future event-driven tables should capture actor, subject, event type, payload, correlation ID, source, created timestamp, processing state, and downstream delivery status.

Event data should support replay, analytics, notification delivery, trust updates, portfolio refreshes, recommendation recalculation, moderation review, and audit trails without forcing direct coupling between domain tables.

## Gamification Data
Gamification data should support authentic progress and verified achievement. Durable data structures should include:

- Coins
- Coin Ledger
- Coin Transactions
- Rewards
- XP
- XP Events
- XP Levels
- Badges
- Badge Awards
- Certificates
- Certificate Metadata
- Certificate Verification

Reward data must be traceable to a meaningful action, course, achievement, evidence item, milestone, or opportunity workflow. Ledger-style records are preferred for balances so history remains auditable.

## Future AI Tables
Future AI data structures should support:

- AI recommendations
- Prompt history
- Audit logs
- Reviewer feedback
- Recommendation outcomes
- Model metadata

AI tables should preserve provenance, input scope, output, model identity, safety category, reviewer decision, user action, and outcome state. AI records must never become unreviewable black boxes for high-impact Scholar recommendations.

## Database Principles
- Supabase Postgres is the system of record for durable product data.
- The Scholar Record is the primary product data concept.
- RLS must protect user-owned, Scholar-owned, relationship-owned, and institution-owned records.
- Migrations must be reviewed as production code.
- Database naming should make ownership, relationship, and lifecycle clear.

## Tables
The active schema is migration-defined under `supabase/migrations/`. The platform domains represented by existing migrations include:

| Domain | Representative data |
| --- | --- |
| Profile and onboarding | profiles, onboarding state, option selections, profile albums |
| Scholar Record and graph | Scholar identity, achievements, relationships, events, and graph edges |
| Applications | application workspaces, recommendation requests, documents, and progress |
| Support network | support relationships, support messages, actions, invitations |
| Community and social | comments, reactions, safety reports, blocks, mutes, events |
| Notifications | notification events, recipient preferences, delivery state |
| Rewards and economy | coin ledger, reward events, store redemptions, brand campaign data |
| Academic and athlete readiness | transcript-derived records, A-G progress, athlete OS data |

## Relationships
Relationships should be explicit and enforceable:

- A profile belongs to an authenticated user.
- A Scholar Record belongs to a Scholar profile and may be visible to approved support roles.
- Support relationships connect Scholars to guardians, educators, counselors, mentors, coaches, or institutions.
- Application records belong to a Scholar and may include scoped recommender or advisor access.
- Events and notifications reference the actor, recipient, subject record, and lifecycle status.

## Indexes
Add indexes for:

- Foreign keys used in joins.
- `user_id`, `profile_id`, `scholar_id`, `organization_id`, and relationship identifiers.
- Status filters such as pending, active, archived, reviewed, unread, or delivered.
- Time-ordered feeds using `created_at` or `updated_at`.
- Unique invitation, share, or token lookup values.

Indexes should be named with the pattern `idx_<table>_<columns_or_purpose>`.

## RLS Policies
RLS exists because Scholars own their data, support roles receive scoped access, institutions receive delegated access, and administrators never bypass auditing. RLS is the database-level guardrail that keeps privacy and relationship boundaries enforceable even when application code changes.

RLS is required for sensitive tables. Policies should cover:

- Owner access for authenticated users.
- Relationship access for approved support roles.
- Institution access for scoped district, university, employer, or partner workflows.
- Admin access for moderation and operational support.
- Insert and update restrictions that prevent users from assigning themselves elevated permissions.

Every RLS policy should be understandable from its name and supported by application-level permission checks where workflows are complex.

## Migrations
- Place schema changes in `supabase/migrations/` with sortable timestamp names.
- Keep migrations idempotent where practical.
- Include indexes, constraints, and RLS policy changes with the table change they support.
- Never edit a migration that has already shipped to a shared environment; add a new migration instead.
- Document material schema changes in this handbook and release notes.

## Naming Standards
| Object | Standard |
| --- | --- |
| Tables | Lowercase snake_case plural nouns |
| Columns | Lowercase snake_case with explicit units or lifecycle state |
| Primary keys | `id` unless integrating with a required external key |
| Foreign keys | `<entity>_id` |
| Timestamps | `created_at`, `updated_at`, and domain-specific lifecycle timestamps |
| Booleans | Positive names such as `is_active`, `is_verified`, or `has_consent` |
| Policies | Verb and audience, such as `select_own_profiles` |
| Enums | Lowercase snake_case values grouped by lifecycle or domain |
| Functions | Verb-first snake_case names that describe the operation |
| Triggers | `trg_<table>_<event>_<purpose>` |
| Views | `vw_<domain>_<purpose>` for read models and reporting |
| Storage buckets | Lowercase kebab-case or snake_case names scoped by data class |

## Profile Schema
Profiles should represent identity and product readiness without becoming an unbounded data bucket. Profile-related data includes account identity, display fields, role selection, onboarding progress, contact preferences, and safe public portfolio metadata. Sensitive Scholar evidence belongs in dedicated Scholar Record tables.

## Role Schema
Role data should distinguish account role, relationship role, and organization role. A user can have more than one relationship to the platform, so role tables and permission helpers must support multiple scoped roles without overwriting a user's primary identity.

## Future Tables
Future schema expansion should prioritize:

- Evidence packs with media, verification, provenance, and expiration metadata.
- AI recommendation audit logs with model, prompt category, input scope, output, reviewer, and action state.
- Institution organizations and memberships.
- Outcome records for scholarships, admissions, internships, jobs, mentorship, and awards.
- Compliance audit logs for privacy-sensitive access.

## Operational Expectations
Database changes must pass migration review before release. Backfills need dry-run plans, rollback paths, and communication in [RELEASE_PROCESS.md](./RELEASE_PROCESS.md). Architecture implications should be recorded in [DECISIONS.md](./DECISIONS.md).

## August 1, 2026 — Authorization, Onboarding, and Evidence Provenance

Migration `supabase/migrations/202608010001_authorization_evidence_lifecycle.sql` adds the persistence and RLS contract for the trusted Scholar workflow:

- `role_profiles` provides one idempotent role-specific record per profile and canonical role.
- `onboarding_completion_attempts` records failed completion attempts while leaving `profiles.onboarding_completed` false.
- A partial unique index guarantees one active `playbook_records` row per profile.
- Accepted support invitations map idempotently to one active `support_relationships` row and inherit the canonical relationship permission set.
- Evidence now records owner, source type/reference, verification state and actor, verification time, observation time, visibility, consent scope, state reason, and expiration.
- `evidence_verification_audit` records the previous state, decision, actor role, reason, and decision time.
- Evidence read/review RLS requires an active relationship, the matching JSON permission, and an allowed consent scope; owner policies remain in force.
- Portfolio shares remain Scholar-owned under RLS; share creation, listing, revocation, and PDF export now resolve the authenticated Scholar server-side rather than accepting an arbitrary owner identifier.

The `complete_onboarding(jsonb)` function runs record creation/linking and the final profile transition in one database transaction. Its profile-completion update is the final lifecycle write, so an earlier failure cannot produce a completed profile without its dependent records.

## August 1, 2026 — Trust Workflow Hardening

Migration `supabase/migrations/202608010002_trust_workflow_hardening.sql` adds:

- `accept_support_invitation(text,text)`, an authenticated, row-locking transaction that validates invitee email, activates the permission-bearing relationship, updates invitation state, and emits one event atomically.
- `active_scholar_contexts`, which requires the selected Scholar and relationship to belong to the authenticated supporter and remain active.
- `evidence_verification_requests`, including one open request per evidence item, Scholar-owned request creation, reviewer queue reads, required decision reasons, and atomic request/evidence/audit/event transitions.
- `portfolio_packet_snapshots`, recording the exact server-generated packet and section allowlist used by a controlled share.
- A unique notification source/recipient index and `playbook_events` trigger that materializes verification, intervention, opportunity, and milestone notifications without duplicate delivery.
- Event insert/read policies that bind the actor to `auth.uid()` and require Scholar ownership or an active relationship.

### Authenticated Supabase integration gate

Run `npm run test:integration:supabase` with `SUPABASE_TEST_URL`, `SUPABASE_TEST_ANON_KEY`, and `SUPABASE_TEST_SERVICE_ROLE_KEY` pointed to an isolated Supabase project after applying all migrations. The suite creates disposable Scholar, supporter, and unrelated users; validates negative and positive evidence RLS, explicit context enforcement, and atomic/idempotent invitation acceptance; then removes test data. It skips rather than substituting mocks when a real test project is unavailable.

Run `npm run test:e2e -- tests/e2e/authenticated-route-authorization.spec.ts` with `TEST_SCHOLAR_EMAIL` and `TEST_SCHOLAR_PASSWORD` for a seeded Scholar in that project. These direct-navigation tests verify wrong-role denial and authenticated Evidence Center access.


## Launch Readiness Governance (August 1, 2026)

Migration `202608010003_launch_readiness_tranche.sql` adds consented `institutional_relationships`, relationship-bound `support_messages`, `role_action_handoffs`, provenance fields on `opportunity_matches`, a distinct `content_safety_reports` queue, and append-only `admin_audit_log`. Participant reads use RLS. Sensitive state transitions use security-definer functions that recheck the authenticated actor and active relationship; moderation and role changes require a non-empty reason and persist before/after audit state. Queue and relationship lookup indexes cover launch-critical status paths.

## Governed Launch Analytics (August 1, 2026)

Migration `202608010004_governed_launch_analytics.sql` adds Scholar-owned analytics consent and pseudonymous allowlisted outcome events. Collection fails closed unless the authenticated user has explicitly granted the current policy version. Event properties are narrowed at the application boundary, direct table writes are unavailable, events expire after 13 months, and the expiry index supports scheduled retention deletion. Analytics consent is independent of core service access and may be withdrawn from Settings.


## Consequence API RLS Alignment (August 1, 2026)

Migration `202608010005_consequence_api_hardening.sql` aligns application routes with authenticated RLS for guided tours, community events, partner campaigns, store data, shared actions, and application workspaces. Reward emission is administrator-only and atomic. Store redemption derives price from `store_products`, serializes each Scholar balance with a transaction advisory lock, and writes redemption plus debit in one function. The application authorization resolver now requires both role capability and the permission explicitly persisted on the active relationship.


## Inbound Mail and Transcript Hardening (August 1, 2026)

Migration `202608010006_inbound_mail_and_transcript_hardening.sql` adds unique provider-message receipts and `ingest_support_mail`. The function records unmatched senders without creating messages, deduplicates provider retries, resolves only active relationships, and inserts relationship-bound support messages atomically. It is executable only by the service role after the route validates the configured webhook secret. A–G progress remains Scholar-owned under authenticated RLS; transcript routes no longer use service credentials or browser-supplied user IDs.

## Complete RLS Inventory and Beta Access (August 1, 2026)

Migration `202608010007_complete_rls_policy_inventory.sql` gives every previously policy-less table an explicit disposition. Scholar-owned athlete profile, recruiting, NIL, and financial records use owner policies; eligibility results are Scholar-read-only; moderation actions and launch analytics are administrator-readable; inbound mail receipts explicitly deny direct authenticated access and remain service-function-only.

Migration `202608010008_beta_exposure_control.sql` adds indexed, expiring `beta_access_grants`. Users may inspect only their own grant, while audited platform administrators govern cohort membership. The application proxy uses the grant only for beta admission; all underlying route authorization and RLS remain mandatory. `npm run db:validate:rls` statically rejects any migration-created public table without both RLS enablement and an explicit policy, while live Supabase negative tests remain required for semantic certification.

## Athlete Network and NIL Foundation (August 1, 2026)

Migration `202608010009_athlete_network_nil_foundation.sql` evolves the one-per-Scholar athlete profile with level, sports, teams, leagues, seasons, history, achievements, statistics, awards, leadership, measurements, combine data, audience, provenance, consent, and verification state. A preflight blocks migration when duplicate athlete profiles require human reconciliation rather than deleting records implicitly.

The migration adds `athlete_nil_profiles`, `athlete_recruiting_activities`, `nil_deal_deliverables`, append-only `nil_compliance_audit`, and deny-direct `athlete_command_receipts`. Owner policies additionally require the canonical Scholar-Athlete role. NIL marketplace discovery is a minimum-necessary function restricted to active registered brand partners, explicit marketplace consent, recruiting/public athlete visibility, and guardian consent for youth through high-school levels.

Recruiting target and NIL opportunity creation are atomic, event-emitting, and idempotent. A trigger prevents direct lifecycle, agreement, disclosure, compliance, review, and payment-state changes. Owner transition and submission functions require reasons; signed/active/completed NIL state requires approved compliance; administrator review writes both the NIL audit and immutable administrative audit.

## API Abuse and Delivery Controls (August 1, 2026)

Migration `202608010010_api_abuse_and_delivery_controls.sql` adds serialized per-actor quota windows, idempotent communication delivery attempts, user-owned AI processing consent, and privacy-minimized AI guidance provenance. All tables enable RLS; quota, delivery, and AI provenance writes deny direct authenticated access and execute only through narrow security-definer functions. Delivery records store a one-way recipient hash rather than an email address, bind guardian delivery to an active Scholar-owned family relationship, and distinguish provider acceptance from failure. A unique actor, purpose, and command key prevents duplicate sends on replay. AI guidance fails closed unless the current policy version is explicitly granted and remains withdrawable from Settings; run records retain provider, model, policy, status, content hashes, and a 13-month expiry without prompt or output text. Scheduled expiry operation remains a release gate.
