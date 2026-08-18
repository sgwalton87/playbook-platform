# Courses Library MVP Audit

## Purpose

Certify the existing canonical Learning library as an MVP-functional shared platform capability before additional Phase 8 expansion.

## Canonical ownership

- `learning_courses` owns course catalog metadata.
- `learning_modules` owns canonical course modules.
- `learning_module_progress` owns learner completion evidence.
- `learning_credentials` owns course-completion credentials.
- `achievement_badges` owns evidence-backed learning badges.
- Reward issuance remains inside the governed Learning completion authority and the existing reward ledger.

No legacy course table, React constant, or client-side reward helper may become canonical authority.

## MVP requirements

The Courses library must:

1. Load authenticated catalog data from `/api/learning/courses`.
2. Display published courses separately from coming-soon metadata.
3. Calculate progress only from required modules belonging to the course.
4. Route published course cards into the canonical `/courses/[slug]` experience.
5. Refuse unpublished course detail as an active learning experience.
6. Preserve loading, empty, success, and error feedback.
7. Preserve idempotent governed completion, credential, badge, XP, and coin issuance.

## Deferred Phase 8 capabilities

Course Search, quizzes, additional curriculum convergence, and dedicated Community Safety / Athletes Abroad course migration are separate Phase 8 audit items. Existing legacy course implementations must not be treated as certified canonical Learning merely because routes exist.

## Definition of Done

Course Library is MVP-certified when catalog loading, required-module progress, published-course entry, and existing governed completion are covered by regression tests and the exact branch passes repository CI and Vercel gates.
