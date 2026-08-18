# Phase 8 Courses — Capabilities 1–9 Audit

## Goal

Complete the canonical Courses journey without creating parallel learning, credential, badge, assessment, or reward authorities.

## Canonical ownership

- `learning_courses`: course catalog authority.
- `learning_modules`: required learning-unit and learner-visible rich curriculum authority.
- `private.learning_module_checkpoint_answers`: non-client checkpoint-answer authority.
- `learning_module_responses`: owner-scoped activity, interaction, and checkpoint evidence.
- `learning_module_progress`: learner completion evidence.
- `complete_learning_module`: sole governed module-completion and reward authority.
- `learning_credentials`: credential evidence.
- `achievement_badges`: badge evidence.
- Existing reward ledger: XP and coin authority.

## Production baseline discovered during audit

Before this package, canonical Learning already held four published courses: College Application Playbook, Captain's Mindset, Money in the Game, and Mind of an Athlete. The strongest authored experiences lived outside that authority: the 15-Week Leadership course had 15/15 fully populated rich modules and Civic Engagement had 10/10. Community Safety and Athletes Abroad existed as authored static lesson/quiz prototypes. No legacy Leadership/Civic learner progress or module-response rows existed at convergence time, so there is no learner history to orphan.

## Capabilities

1. **Course Library** — authenticated canonical catalog, published/coming-soon separation, required-module progress, loading/error/empty states.
2. **Course Search** — client-side search and pillar filtering over the already-authorized canonical catalog response; no second search index or course table.
3. **Course Detail + Learning Journey** — published course detail, ordered required modules, lesson content, objectives, activities, interactions, continuation state, and reflection/acknowledgement completion.
4. **Assessments / Quizzes** — rich checkpoints are represented canonically. Correct answers are withheld from public module payloads, learner responses are persisted owner-scoped, and correctness is evaluated server-side before completion may proceed.
5. **Progress + Completion** — progress counts only required module keys belonging to the course; completion persists through `learning_module_progress` and the governed RPC.
6. **Credentials / Certificates / Badges** — course completion produces governed `learning_credentials` and `achievement_badges`, surfaced through the existing vaults and transcript.
7. **XP + Coins / Learning Economy** — module/course rewards are idempotent and recorded by the canonical reward ledger inside Learning authority; clients never mint rewards.
8. **Legacy Course Convergence** — Leadership, Civic Engagement, Community Safety, and Athletes Abroad authored content is converged into canonical Learning. Their route-specific page authorities and the two static course constants are retired, allowing the existing URLs to resolve through `/courses/[slug]`. Legacy tables remain historical/non-canonical data until a later physical cleanup, but no certified course UI writes to them.
9. **End-to-End Course Certification** — library → search → published detail → rich module work → server checkpoint validation → governed completion → refreshed progress → credential/badge/reward evidence must pass regression, full migration replay, CI, production build, and Vercel gates.

## Leadership quality standard

The 15-Week Leadership course is the benchmark for the canonical learner experience. Convergence preserves its learning objectives, applied activities, knowledge checkpoints, interactions, lesson content, and 15-week structure. The canonical generic experience is elevated to that standard rather than replacing Leadership with a simpler experience.

## Exact-head certification

Release certification must be tied to the final PR head after all migration-time assertions are present. A successful older run is not sufficient after the branch head moves.

## Release rule

Do not mark Phase 8 green from route existence alone. Green requires user-visible functionality, durable persistence, least-privilege authority, server-side assessment integrity, regression coverage, full database migration replay, production build, deployment readiness, and post-merge hosted-database verification.