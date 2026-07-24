# PBOS-BRANCH-CONVERGENCE-001 Conflict Forecast

## Purpose
Predict likely merge conflicts, high-risk files, and manual review requirements for branch convergence.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 24, 2026

## Related Links
- [Branch matrix](./BRANCH_MATRIX.md)
- [Merge sequence](./MERGE_SEQUENCE.md)
- [Canonical implementation map](./CANONICAL_IMPLEMENTATION_MAP.md)
- [PBOS branch convergence report](./PBOS_BRANCH_CONVERGENCE_REPORT.md)

## Likely Conflict Clusters

| Cluster | High-risk files/directories | Why conflict is likely | Required manual review |
|---|---|---|---|
| Onboarding and Role OS | `app/onboarding/page.tsx`, `app/start/page.tsx`, `app/tutorial/page.tsx`, `components/role-os/`, `lib/onboarding/`, `lib/role-os/`, `lib/roles/` | Multiple branches canonicalized onboarding, role routing, first-login tours, and role configs. | Product owner, auth/session reviewer, and role-permission reviewer. |
| App shell and navigation | `components/layout/`, `components/shell/UnifiedAppShell.tsx`, `app/globals.css`, `styles/playbook-tokens.css` | Design-system branches changed layout primitives while onboarding branches changed navigation entry points. | Design-system owner and accessibility reviewer. |
| Scholar Record and transcript | `lib/scholar/`, `app/transcript/page.tsx`, `components/scholar/`, `components/playbook-record/` | Sprint branches and later current-state branches touch Scholar Record models and UI. | Domain owner plus data mapping reviewer. |
| Portfolio | `components/portfolio/`, `app/api/portfolio/pdf/route.tsx`, `app/profile/page.tsx`, `app/u/[username]/page.tsx` | Portfolio UI, PDF generation, and profile surfaces appear in broad Codex branches. | Portfolio owner, route-handler reviewer, and privacy reviewer. |
| Opportunity Toolkit and Compass | `components/opportunities/`, `components/opportunity-graph/`, `components/opportunity-marketplace/`, `components/compass/` | Multiple feature names map to similar discovery/recommendation UI surfaces. | Product taxonomy reviewer and domain reviewer. |
| Support Network and notifications | `components/support-network-live/`, `components/network/`, `components/notifications-v2/`, `app/api/notify-admin/route.ts` | Notification automation and network UX can duplicate relationship flows. | Notifications owner, abuse/moderation reviewer, RLS reviewer. |
| PBOS engine and docs | `pbos/`, `docs/`, `eslint.config.mjs`, `package.json` | Engineering-system branches changed docs, state machine files, lint configuration, and package scripts. | Engineering systems owner. |
| Backup files and scripts | `backups/`, `scripts/backups/`, `*.backup.tsx`, `*.pre-*.backup.tsx` | Backup files are runtime-shaped TypeScript and can trigger lint without being intended source. | Repository maintainer; decide archive location or lint exclusion separately, not during this planning task. |

## Duplicate Implementation Signals

- **Scholar Record**: `lib/scholar/record.ts`, `components/scholar/*`, and `components/playbook-record/*` must be compared for overlapping models and achievement forms.
- **Role OS**: `components/role-os/*`, `lib/role-os/*`, `lib/roles/*`, and onboarding role configs must converge on one registry.
- **Opportunity Toolkit**: opportunity feed, graph, and marketplace components may represent competing discovery models.
- **Portfolio**: `PortfolioEngine`, `PortfolioHero`, `PortfolioCompletion`, profile pages, and public username pages may duplicate completion and presentation logic.
- **Support Network**: network connection components and support-network-live dashboard may duplicate relationship state.
- **Onboarding**: legacy first-login tour, tutorial, role select, callback, start, and onboarding pages are the highest duplicate-risk area.
- **Notification Automation**: `notifications-v2` and notify-admin route require manual review for event ownership and delivery side effects.
- **Compass, Trust, Timeline, Living Scholar**: these appear as component-level implementations and should not become independent data models unless the architecture handbook names them canonical.

## Manual Review Gates Before Any Merge

1. Confirm branch ancestry with `git merge-base --is-ancestor <branch> main` and `git cherry main <branch>`.
2. Generate `git diff --stat main...<branch>` and `git diff --name-status main...<branch>` for every branch.
3. Run lint and build after each merge candidate; do not batch branches with known lint failures.
4. Review Supabase migrations and RLS before accepting route or UI changes that depend on them.
5. Resolve backup-script linting by policy before treating lint as a merge gate failure for product code.
