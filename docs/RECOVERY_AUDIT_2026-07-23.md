# Playbook OS Recovery Audit — 2026-07-23

## Repository forensics

- Current branch: `work` at `ada2871c59aa9ea9cd0f1358de00f68243c8e841` (`Merge pull request #6 from sgwalton87/agent/onboarding-role-os-foundation`).
- Local branch inventory: only `work` is present in this checkout.
- Remote inventory: no remotes are configured in this checkout, so no remote branch comparison was possible from local Git metadata.
- Last-72-hour commits accounted for:
  - `ada2871` — merge PR #6, onboarding role OS foundation.
  - `84035c2` — record onboarding foundation validation.
  - `dc54ce0` — unify onboarding role and OS routing.
  - `3a49993` — merge PR #5, integrate sprint 001-004.
  - `bb8400f` — preserve community transcript integration.
  - `ec3c002` — canonicalize academic scholar record.
  - `1fb73bd` — canonicalize scholar community activities.
  - `66331f1` — consolidate implementation backlog.
- Merged branches: PR #5 and PR #6 are represented as merge commits in `work`; the source branch refs are not present locally.
- Unmerged branches: none are visible locally because only the `work` branch exists.
- Dangling/orphaned commits: `git fsck --no-reflogs --unreachable --lost-found` returned no unreachable objects.
- Cherry-picked commits: no alternate local branch refs exist for cherry comparison; no duplicate patch candidates were visible from the local ref set.
- Renamed files in the last 72 hours: none reported by `git log --diff-filter=R`.
- Deleted files in the last 72 hours: none reported by `git log --diff-filter=D`.

## Canonical onboarding evidence

- `/start` is the canonical onboarding route according to the sprint map and current routing implementation.
- `lib/roles/registry.ts` is the authoritative role registry for labels, onboarding availability, aliases, and OS destinations.
- `lib/onboarding/pathwayMap.ts` derives pathways from the registry instead of maintaining a separate role map.
- Role selection uses `components/role-os/RoleSelect.tsx`, whose copy states that onboarding shapes the user's Playbook experience.
- Auth callback and login routing use the shared pathway/role normalization utilities.
- `/onboarding` still exists as a legacy scholar-heavy flow; sprint evidence says legacy `/onboarding` entry points should resolve to `/start`, so this remains a release risk to verify manually.

## Role OS audit

Requested audit roles and local evidence status:

| Role | Registry status | Route evidence | Notes |
| --- | --- | --- | --- |
| Scholar | Present | `/dashboard` | Canonical learner/scholar dashboard route. |
| Scholar Athlete | Present | `/scholar-athlete-os` | Dedicated OS page exists. |
| Transition Age Youth | Present | `/dashboard` | Shares scholar dashboard; no dedicated TAY OS page visible. |
| Athlete Abroad | Partial | `/athlete-abroad-os` | Page exists, but role is not in the canonical registry. |
| Family | Present | `/family-os` | Dedicated shared RoleDashboardExperience route. |
| Mentor | Present | `/mentor-os` | Dedicated shared RoleDashboardExperience route. |
| Educator | Present | `/educator-os` | Dedicated shared RoleDashboardExperience route. |
| Counselor | Alias only | `/educator-os` via alias | No distinct counselor registry role or dashboard. |
| Coach | Present | Registry routes `/educator-os`; navigation routes `/mentor-os` | Inconsistency remains between registry and navigation. |
| College Coach | Present | `/university-os` | Shared university OS projection. |
| College Admissions | Present | `/university-os` | Shared university OS projection. |
| Brand Partner | Present | `/brand-partner-os` | Dedicated page exists, separate from shared RoleDashboardExperience. |
| Employer | Present, onboarding disabled | `/employer-os` | Dedicated shared RoleDashboardExperience route. |
| District | Present, onboarding disabled | `/district-os` | Dedicated shared RoleDashboardExperience route, but not included in `ROLE_NAVIGATION`. |

## UI recovery audit

- Current component catalog identifies `components/role-os/RoleSelect.tsx` and `components/role-os/dashboards/RoleDashboardExperience.tsx` as active Role OS UI surfaces.
- Existing UI backup artifacts are present (`*.backup`, `*.backup.tsx`, and `*.before-live-network`), but no deleted or renamed UI files appeared in the last-72-hour Git diff filters.
- No UI components were recreated during this recovery pass.

## Build stabilization

- Initial `npm run build` compiled successfully but failed during page-data collection for `/api/notify-admin` because `new Resend(process.env.RESEND_API_KEY)` ran at module load with no `RESEND_API_KEY`.
- The fix was limited to moving Resend client construction until after the existing environment guard inside the POST handler. This preserves behavior when the key exists and preserves the existing skip response when it does not.

## Remaining risks

- Only one local branch and no remotes are available in this checkout; if other feature branches exist elsewhere, they cannot be audited without fetching or adding remotes.
- The requested 14-role surface is not fully represented as 14 distinct canonical registry entries/dashboards. Athlete Abroad and Counselor are partial/alias-only, and District is missing from role navigation.
- Coach routing is inconsistent between `lib/roles/registry.ts` and `lib/navigation/roleNavigation.ts`.
- Employer and District have OS routes but onboarding is disabled in the canonical registry.
- `/onboarding` legacy flow remains present while the sprint map names `/start` as canonical.

## Merge readiness checklist

- [x] Last-72-hour local commits accounted for.
- [x] Dangling/orphaned local commits checked.
- [x] Renamed/deleted files checked.
- [x] Canonical onboarding implementation identified as `/start` + `lib/roles/registry.ts`.
- [x] Build blocker fixed without feature development.
- [ ] Confirm external branches/remotes if they exist outside this checkout.
- [ ] Resolve role OS inconsistencies with product guidance before merge.
- [ ] Complete manual onboarding QA against Supabase-backed persistence and routing.
