# Playbook Auto-Build Control Board

This board converts the master checklist into an ordered build program. The JSON manifest beside this file is the machine-readable source for sprint order, dependencies, branches, and status.

## Current release train

| Order | Sprint | Outcome | State | Can start? |
| --- | --- | --- | --- | --- |
| 1 | OR-001 | Canonical roles and OS routing | Merged in PR #6 | Complete |
| 2 | OR-002 | Premium shared onboarding shell | Built and validated locally | Publish/merge next |
| 3 | OR-003 | Four learner pathways and inherited Scholar capabilities | Local-complete on review branch | Review with OR-002–007 |
| 4 | OR-004 | Parent/Guardian and Mentor pathways | Local-complete on review branch | Review with OR-002–007 |
| 5 | OR-005 | Educator, Counselor, Coach, and District pathways | Local-complete on review branch | Review with OR-002–007 |
| 6 | OR-006 | College Coach/Recruiter and Admissions pathways | Local-complete on review branch | Review with OR-002–007 |
| 7 | OR-007 | Brand Partner and Employer pathways | Local-complete on review branch | Review with OR-002–007 |
| 8 | OR-008 | Permissions, RLS, migrations, email, and 14-role E2E release gate | Next / in progress | Yes—highest-value task |

After OR-008, the `CORE-001` through `CORE-006` train closes the remaining master-checklist systems in dependency order: authentication, public Playbook Record, network/messaging, community, learning/rewards, and academic/recruiting.

## Automatic execution contract

For each sprint, the builder must:

1. Start from an up-to-date `main` and use the branch declared in `AUTO_BUILD_QUEUE.json`.
2. Read the master checklist, current architecture, data model, tech debt, and the sprint-specific map before editing.
3. Reuse the strongest existing Playbook design system and shared components.
4. Implement the full vertical slice: interface, persistence, permissions, integrations, recovery states, accessibility, and responsive behavior.
5. Add focused tests, then pass lint, TypeScript, the full test suite, and the production build.
6. Record evidence in the sprint map, checklist, architecture, and tech-debt register.
7. Open a PR and merge only when required checks pass. A local commit is not a completed sprint.
8. Stop if a dependency is unmerged, credentials are unavailable, migrations are unsafe, requirements conflict, or validation fails.

## Completion language

- `queued`: dependencies or earlier work remain.
- `in-progress`: implementation is actively changing.
- `local-complete`: implementation and local gates pass, but no merge exists.
- `in-review`: branch is pushed and a PR is open.
- `merged`: PR merge evidence exists on `main`.
- `blocked`: a named external decision or unsafe condition prevents progress.

No checklist percentage changes automatically merely because code was written. Percentages change only after the master checklist Definition of Done has evidence.
