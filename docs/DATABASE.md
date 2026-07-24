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
