# Onboarding and Role OS Sprint Map

**Execution queue:** `docs/sprints/AUTO_BUILD_QUEUE.json`

**Role blueprint:** `docs/ROLE_ONBOARDING_BLUEPRINT.md`

**Exact step catalog:** `docs/ROLE_ONBOARDING_STEP_CATALOG.md`

**Current state:** OR-001 merged. OR-002 through OR-007 are built and contract-tested on the local review branch. OR-008 release validation is in progress. Nothing is approved for `main` until desktop review.

**Source of truth:** `docs/PLAYBOOK_MASTER_CHECKLIST.md`, `TECH_DEBT.md`, current architecture documents, and verified application routes on `main`.

## Quality gates for every sprint

- Use the strongest existing Playbook visual language: navy/cream/orange palette, Playbook typography, generous editorial spacing, responsive layouts, and shared UI primitives.
- Preserve a single canonical Playbook Record and avoid duplicate profile ownership.
- Include persistence, permissions, loading/error/recovery states, mobile behavior, accessibility, tests, and production compilation evidence.
- Do not mark a role complete until role selection, onboarding, redirect, navigation, OS landing, and permission boundaries all agree.

## Sprint OR-001 — Canonical role registry and routing

**Status:** Merged — PR #6.

**Goal:** Make one registry authoritative for role aliases, onboarding availability, OS destinations, and role-selection labels.

**Acceptance gates:**

- Every launch role has one stable key and one OS destination.
- Role selection begins onboarding instead of bypassing it.
- Auth callbacks, invitations, navigation, and onboarding completion use the same destination resolver.
- Legacy `/onboarding` entry points resolve to `/start`.
- Unit tests cover aliases and every role destination.

## Sprint OR-002 — Unified premium onboarding shell

**Status:** Local implementation and validation complete; not yet merged.

**Goal:** Promote `/start` as the sole onboarding experience and bring every step to the strongest Playbook design standard.

**Acceptance gates:**

- Shared responsive shell, progress system, validation, autosave state, error recovery, and completion transition.
- Keyboard, focus, contrast, reduced-motion, tablet, and mobile validation.
- No raw browser alerts for normal validation or save failures.
- Legacy scholar-only onboarding is retired without broken links.

## Sprint OR-003 — Learner pathways

**Status:** Role schemas and routes built locally; release validation pending.

**Roles:** Scholar, Scholar-Athlete, Transition-Aged Youth, Athlete Abroad.

**Acceptance gates:** complete identity, demographics/support data, academics, goals, activities, athletics/recruiting where applicable, support network, agreement capture, Playbook Record projection, and correct OS landing.

## Sprint OR-004 — Family and trusted-support pathways

**Roles:** Parent/Guardian and Mentor.

**Acceptance gates:** scholar relationship/invite handoff, consent-aware access, support preferences, verification state, permission-scoped OS landing, and recovery when an invite is missing or expired.

## Sprint OR-005 — K–12 institutional pathways

**Roles:** Teacher/Educator, High School Counselor, High School Coach, District/School Administrator.

**Acceptance gates:** institutional verification, school/district affiliation, student/roster relationship, scoped permissions, and distinct role-appropriate OS landing/navigation.

## Sprint OR-006 — College pathways

**Roles:** College Coach/Recruiter and College Admissions.

**Acceptance gates:** institutional verification, recruiting/admissions criteria, contact boundaries, opportunity permissions, compliance state, and distinct recruiting/admissions experiences inside University OS.

## Sprint OR-007 — Opportunity partner pathways

**Roles:** Brand Partner and Employer/Workforce Partner.

**Acceptance gates:** organization verification, opportunity intent, audience, compliance, budget/engagement preferences, permissions, and correct Partner/Employer OS landing.

## Sprint OR-008 — Governance and release validation

**Goal:** Close the onboarding and Role OS release gate.

**Acceptance gates:** centralized permission matrix, role-by-role E2E coverage, RLS verification, audit-ready agreement records, email/invite validation, analytics events, production build, and checklist/architecture/tech-debt reconciliation.

## Current architectural decisions

- `/start` is the canonical onboarding route.
- Account creation is an integrated onboarding checkpoint for new users; `/login` is reserved for returning users and recovery.
- `profile_mode` may specialize the experience, but canonical role resolution must remain deterministic.
- OS dashboards are projections of role, relationships, permissions, and the Playbook Record; they are not separate data owners.
- Founder/admin access is provisioned and permission-gated, not offered as a public signup role.
