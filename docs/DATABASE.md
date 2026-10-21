# Playbook OS Database Handbook

## Purpose
This handbook documents database conventions, schema responsibilities, security expectations, and migration practices for Playbook OS.

## Ownership
Owned by Playbook OS Engineering. Database changes that affect privacy, RLS, or production operations require platform review.

## Last Updated
July 23, 2026

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

## Marketplace consent hardening candidate — October 20, 2026

Owner: Playbook OS Engineering. Purpose: preserve one canonical shares/outcomes consent boundary. Related: `supabase/migrations/20261021014458_marketplace_consent_hardening.sql`, `tests/unit/application-workspace/consent-database.test.ts`, `docs/MASTER_CHECKLIST.md`.

Local candidate only. This migration depends on the existing Marketplace shares/outcomes baseline. Sharing now requires the exact `marketplace-applicant-share-v1` consent version, a Scholar-owned submitted workspace, a matching published listing within its deadline (inclusive), and an active partner. The obsolete single-argument share RPC is removed; the UI must be released with the new two-argument contract. Existing active shares are revoked for fresh consent, without fabricating prior acknowledgements. Revocation works even after listing closure. Workspace row locks serialize share, revoke and human outcome updates. Re-sharing resets withdrawn outcome decision metadata; prior transitions remain in a private append-only client-inaccessible audit table. Public privileged getters/outcome RPCs delegate to private implementations through invoker wrappers. No direct client data grants are added.

Audit events retain before/after consent and outcome rows, including internal outcome notes; operator access, retention and deletion review remain launch requirements. This is transaction-level audit preservation, not tamper-proof storage against database administrators. Rollback must be reviewed; do not restore an old caller to bypass versioned consent or automatically reactivate revoked shares. No destructive down migration is supplied.

PGlite tests execute the baseline and candidate SQL in an isolated PostgreSQL fixture with substitute auth/authority helpers. They prove the tested function boundaries but do not replace full Supabase replay, actual production authority helpers, REST schema-cache verification, concurrency stress, hosted RLS certification or live browser acceptance. Full Supabase CLI replay is blocked here by unavailable Docker. No hosted migrations were applied.

## Invitation privilege closure candidate — October 20, 2026

Full isolated Supabase replay on PR 253 passed, then invitation preflight found direct client UPDATE/DELETE privileges. The prior hardening revoked UPDATE only and did not close all inherited/default or explicit column grants. Candidate migration `20261021021256_support_invitation_privilege_closure.sql` revokes PUBLIC/anon/authenticated table and column privileges, then restores authenticated SELECT/INSERT only. Existing policy-constrained invitation creation and private claim/decline RPC remain the canonical path. PGlite regression verifies denial of table/column mutation after deliberately broad initial grants. Hosted application remains unauthorized and unperformed.

## Achievement transaction candidate — October 21, 2026

Purpose: provide one atomic, retry-safe command against the existing Playbook Record graph. Owner: Playbook OS Engineering. Related: `20261021023624_achievement_atomic_command.sql`, `tests/unit/application-workspace/achievement-command-database.test.ts`.

The candidate `public.create_achievement_with_evidence(uuid,uuid,jsonb)` uses a security-invoker wrapper and a fixed-search-path private implementation. The authenticated identity must equal the requested owner. The private receipt table has RLS and no direct client privileges. Each owner/request identifier maps to normalized content and one achievement; identical retries return that achievement and conflicting content is rejected. The owner-scoped transaction lock serializes this command's record lookup and creation. Existing duplicate active records fail closed for reconciliation; this does not establish global record uniqueness across older write paths.

Record creation, achievement, evidence pack, optional evidence/reflection, timeline entry and receipt share a transaction. Malformed fields, unsupported keys, non-HTTP(S) links, invalid categories, inaccessible/deleted retry targets and inactive records are rejected. Tests execute the baseline graph and candidate SQL in isolated PostgreSQL WASM, exercise authenticated/anonymous grants, cross-owner denial and idempotency, and inject a final-stage failure to prove all earlier writes roll back. This is behavioral SQL evidence, separate from full Supabase migration/RLS certification and hosted application.

The RPC is deliberately not connected to the current form yet: the existing browser event bus runs further timeline, portfolio, trust and opportunity writes after achievement creation. Wiring only the RPC would leave those downstream effects outside the transaction and replay contract. That integration needs durable event delivery and per-handler idempotency review before the multi-request application path can be retired. The existing seven failure-propagation tests remain applicable. No migration has been applied to a hosted database.

Receipts retain a SHA-256 fingerprint of normalized content rather than copying reflection/evidence text. Achievement deletion clears the receipt reference; the retained request identifier rejects replay instead of recreating deleted content. Profile deletion cascades to receipts. Retention review still applies to this private command metadata; receipts are not another Scholar Record or public projection.

Certification follow-up: `supabase/tests/achievement_command_preflight.sql` now exercises late-write rollback, identical/conflicting retries, cross-owner denial and private receipt grants after the full migration replay in Database Certification. The same preflight was executed successfully in the local PostgreSQL fixture and rolls back all its fixtures. Full Supabase execution at the new review head remains a separate pending result.

## Hosted Marketplace convergence — October 21, 2026

Purpose: reconcile the confirmed missing hosted applicant schema without replaying unrelated historical migrations. Owner: Playbook OS Engineering. Related: `20261021025703_hosted_marketplace_convergence.sql` and consent database tests.

The new migration embeds exact, SHA-256-identified baseline and hardening SQL from the canonical shares/outcomes packages. It creates the baseline only when both applicant tables are absent, then installs versioned consent hardening in the same migration transaction. A partially present table pair or an inconsistent already-hardened schema fails closed. On a fresh full-chain replay the earlier migrations already installed both packages, so convergence preserves them. Existing shares in a legacy unhardened installation require re-consent as specified by the hardening package.

Behavioral PostgreSQL tests exercise both a missing-schema installation and an existing legacy active share, verify repeat execution against a hardened schema, require the current two-argument consent RPC and deny access to private audit history. This supplies an explicit hosted convergence candidate rather than rewriting historical migration records or inferring application from filenames. Apply only the tested candidate to the verified project, then inspect catalogs, grants and consent RPC contracts before application release. Do not replay the historical Mentor migration: it also replaces invitation functions that were hardened later. Mentor reconciliation needs a separate current-authority-safe package.

## Hosted college provenance constraint — October 21, 2026

Purpose: preserve college planning across the legacy hosted schema and current provenance/priority model. Owner: Playbook OS Engineering. Related: `20261021030623_college_provenance_constraint_convergence.sql`, `college-provenance-database.test.ts`.

Hosted college_list retained a named CHECK admitting only reach/match/safety/dream, while the canonical UI writes catalog/manual and the priority migration changes dream provenance to legacy/saved. The original flags migration failed and rolled back against that constraint. The Dream preference backfill had succeeded independently; keep those canonical rows and do not replay it to repair flags.

The candidate recognizes only the exact historical constraint or its own replacement. It retains all four existing admitted values and adds manual/catalog/saved/legacy. It refuses an unknown named constraint. Fresh schemas without the historical constraint are left unconstrained as before. It then runs the existing idempotent priority-flags package in the same transaction, preserving notes and independent priorities. Three PostgreSQL behavioral tests cover legacy conversion, permitted/rejected values, repeat execution, fresh existing priorities and unknown-constraint rejection. This changes no ownership, RLS policy, role or relationship permission.

## Mentor validation authority convergence — October 21, 2026

Purpose: restore the missing Mentor request/approval boundary while retaining current invitation and relationship authority. Owner: Playbook OS Engineering. Related: `20261021031303_mentor_validation_authority_convergence.sql`, `mentor_validation_command_preflight.sql` and Mentor database tests.

The candidate creates the canonical missing tables and bounded participant read policies. Direct request/approval mutations and the old direct Mentor relationship INSERT policy are removed; the existing private claim_support_invitation function creates pending requests unchanged. Public approval/finalization wrappers stay security invoker; private fixed-search-path commands validate the authenticated actor, accepted canonical invitation, active Scholar-scoped validators and request state. Finalization requires one active Parent/Guardian or Coach, or two distinct ordinary active validators. Candidate self-approval never counts.

Request locks serialize approval/finalization. Finalization locks validating relationships while rechecking the threshold. Repeated approval does not add a second vote; repeated successful finalization returns the existing active relationship, and retry after relationship removal cannot reactivate it. The fixed Mentor permissions remain view_progress/recommend_actions/support_tasks. No role verification, external-support permission, invitation function or broad Scholar-data access is relaxed.

Three local PostgreSQL scenarios cover privileged/ordinary thresholds, self/unrelated denial, source-invitation consistency, direct mutation denial, bounded reads, duplicate votes/activation and post-removal retry. The fixture verifies the existing claim function definition is unchanged. Full Database Certification additionally executes the real current claim → pending request → Parent approval → finalization/retry → governed revocation → denied reactivation path with synthetic local users and rollback. The relationship authority preflight now requires the governed commands and denies the retired direct Mentor insert path. Hosted application and live browser role evidence remain separate gates.

Certification follow-up found a real revocation boundary failure: the original public invoker could not SELECT FOR UPDATE/update a relationship through the closed RLS mutation boundary. The subsequent candidate keeps its response contract but moves mutation into a private, fixed-search-path participant-authorized command; unrelated IDs remain not-found, direct updates/deletes are revoked, and only the Scholar or connected supporter can remove access and clear permissions. Mentor integration now tests that actual governed revocation path, not a simulated administrative status write.

The corrected certification also requires the intended unique coin_ledger(scholar_id,event_type,source_id) index and closes direct community_events insertion/update/deletion, preserving governed definer command access. The index migration fails safely if existing duplicate keys require review; it does not delete or consolidate rewards. A read-only hosted duplicate-key count was zero. These additional authority candidates are not yet applied to production.

## Verified Mentor authority repair — October 20, 2026 (America/Los_Angeles)

Applied hosted versions: 20261021045516 Mentor validation convergence; 20261021045527 relationship revocation command; 20261021045532 certification authority boundaries. Post-application catalog/grant checks verified RLS, denied direct mutations, authenticated command availability, anonymous denial, valid reward uniqueness, and unchanged hardened invitation claim hash `95c52725c9e82e3f454a782af79c2981`. Accepted tree passed all 48 strict isolated DB gates in run 39546311769. Hosted catalogs are separate from runtime journey acceptance, which is not certified.
