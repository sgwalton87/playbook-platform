# Phase 8 Courses — Capabilities 1–9 Audit

## Goal

Complete the canonical Courses journey without creating parallel learning, credential, badge, or reward authorities.

## Canonical ownership

- `learning_courses`: course catalog authority.
- `learning_modules`: required learning-unit authority.
- `learning_module_progress`: learner completion evidence.
- `complete_learning_module`: sole governed module-completion and reward authority.
- `learning_credentials`: credential evidence.
- `achievement_badges`: badge evidence.
- Existing reward ledger: XP and coin authority.

## Capabilities

1. **Course Library** — authenticated canonical catalog, published/coming-soon separation, required-module progress, loading/error/empty states.
2. **Course Search** — client-side search and pillar/status filtering over the already-authorized canonical catalog response; no second search index or course table.
3. **Course Detail + Learning Journey** — published course detail, ordered required modules, lesson content, continuation state, reflection/acknowledgement completion.
4. **Assessments / Quizzes** — assessment behavior is represented only where canonical module content defines an assessment/checkpoint. Completion remains server-governed; no client-side score may mint completion or rewards. Rich quiz schemas remain a future curriculum extension unless represented canonically in `learning_modules`.
5. **Progress + Completion** — progress counts only required module keys belonging to the course; completion persists through `learning_module_progress` and the governed RPC.
6. **Credentials / Certificates / Badges** — course completion produces governed `learning_credentials` and `achievement_badges`, surfaced through the existing vaults and transcript.
7. **XP + Coins / Learning Economy** — module/course rewards are idempotent and recorded by the canonical reward ledger inside Learning authority; clients never mint rewards.
8. **Legacy Course Convergence** — legacy `courses`, `course_modules`, `course_progress`, route-specific response tables, static course constants, and client reward helpers are not canonical authorities. Dedicated legacy course routes must converge onto canonical Learning before they can be called certified.
9. **End-to-End Course Certification** — library → discovery → published detail → required module → governed completion → refreshed progress → credential/badge/reward evidence must pass regression, CI, build, and Vercel gates.

## MVP boundary

Capabilities 1–7 use the canonical Learning system established by the Learning convergence migrations. Capability 8 is a migration/retirement boundary: legacy course implementations may remain temporarily for historical compatibility, but they must not be counted as canonical functionality or allowed to mint parallel progress/rewards. Capability 9 is the release gate for the complete learner journey.

## Release rule

Do not mark Phase 8 green from route existence alone. Green requires user-visible functionality, durable persistence, least-privilege authority, regression coverage, production build, and deployment readiness.