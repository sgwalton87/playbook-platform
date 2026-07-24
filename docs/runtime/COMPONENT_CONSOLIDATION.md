# Component Consolidation Audit

## Purpose
Identify duplicate component patterns and recommend canonical implementations.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 24, 2026

## Related Links
- [UI Design System](../UI_DESIGN_SYSTEM.md)
- [Repository Canon](../REPOSITORY_CANON.md)
- [Route Audit](./ROUTE_AUDIT.md)

## Findings
The repository has healthy domain component coverage but repeated UI primitives across route-specific folders.

## Canonicalization Recommendations
| Pattern | Canonical home | Duplicate locations to review | Recommendation |
| --- | --- | --- | --- |
| Buttons/actions | `components/ui/actions`, `components/ui` | Route-local buttons in dashboards/profile/studio | Consolidate variants into shared action primitives. |
| Cards | `components/ui`, `components/ui/data` | Dashboard, portfolio, role, scholar, studio cards | Keep domain cards only when they encode domain semantics. |
| Avatars/profile identity | `components/profile`, `components/ui` | Profile, scholar, support network, messages | Create one accessible avatar/profile summary primitive. |
| Loading states | `components/ui/feedback` | Inline route loading text | Standardize skeleton/spinner/copy patterns. |
| Empty states | `components/ui/feedback` | Domain empty panels | Standardize empty state structure with domain-specific copy. |
| Error states | `components/ui/feedback` | API/route-local error displays | Standardize recoverable/retry and permission-restricted states. |
| Layout shells | `components/layout`, `components/shell`, `components/ui/layout` | App shell, route wrappers, Studio shells | Choose `components/shell` for app shell and `components/ui/layout` for primitives. |
| Dashboards | `components/dashboard`, `components/role-os/dashboards` | Role-specific dashboards | Keep role dashboards domain-specific but share card/grid primitives. |
| Profile components | `components/profile`, `components/scholar`, `components/playbook-record` | Profile route inline UI | Extract reusable profile sections only after Scholar Record projections stabilize. |
| College search | `components/CollegeSearch.tsx`, `components/college` | Top-level component vs folder | Move into `components/college/` in follow-up and keep top-level barrel if needed. |

## Consolidation Sequence
1. Freeze Scholar Record projections.
2. Normalize shared feedback states.
3. Normalize card/action/avatar primitives.
4. Move one-off top-level domain components into domain folders with barrels.
5. Convert route-local UI only when reused by at least two routes.
