# Runtime Consolidation Report

## Purpose
Document PBOS-RUNTIME-002 consolidation changes, remaining limitations, and runtime verification status.

## Ownership
Playbook OS Engineering

## Last Updated
July 24, 2026

## Related Links
- [Route Runtime Map](./ROUTE_RUNTIME_MAP.md)
- [Runtime Integrity Report](./RUNTIME_INTEGRITY_REPORT.md)
- [Architecture handbook](../ARCHITECTURE.md)
- [Database handbook](../DATABASE.md)

## Completed phases

| Phase | Status | Evidence |
|---|---|---|
| Phase 1 — canonical onboarding | Implemented, runtime not verified | `/onboarding` is now a server redirect to `/start`; the duplicate client onboarding implementation was removed. |
| Phase 2 — tutorial pipeline | Implemented, runtime not verified | `/start` marks tutorial state inside existing `profiles.onboarding_data` and redirects first-time completed onboarding users to `/tutorial`; `/tutorial` persists completion in the same JSON field and then routes to the role OS destination. |
| Phase 3 — profile pipeline | Implemented, runtime not verified | `/start` now maps core onboarding fields to top-level profile columns already used by profile editor, dashboard, public profile, and Scholar Record readers while preserving the full onboarding JSON. |
| Phase 4 — role dashboards | Implemented, runtime not verified | Shared role dashboards and Scholar-Athlete OS now read the signed-in `profiles` row and show honest empty states when live metrics are not connected. |
| Phase 5 — production placeholders | Implemented, runtime not verified | Production leaderboard, feed leaderboard widget, and inbox demo message threads no longer render fabricated scholar/persona data. |
| Phase 6 — route consolidation | Implemented, runtime not verified | Runtime docs updated to reflect `/start` as the single onboarding implementation and `/onboarding` as a legacy redirect alias. |
| Phase 7 — runtime validation | Blocked by environment | Build, TypeScript, and lint passed. Browser automation and live Supabase role traces were not performed in this environment. |

## What changed
- Replaced the standalone `/onboarding` client implementation with a canonical redirect to `/start`.
- Added tutorial progress helpers under `lib/tutorial/` that use existing `profiles.onboarding_data` instead of a schema change.
- Routed completed first-time onboarding users from `/start` to `/tutorial`.
- Routed returning users through `getPostOnboardingDestination`, which sends users with incomplete tutorial state to `/tutorial` and completed users to their role OS route.
- Added a tutorial completion action on the existing `OnboardingTour` component without changing tutorial content.
- Added canonical `/start` top-level writes for existing profile fields: name parts, school district, GPA, graduation year, intended major, sport, position, current team, and highlight link, while preserving onboarding JSON.
- Replaced static role OS metrics/actions with signed-in profile reads and empty states.
- Replaced the Scholar-Athlete OS hardcoded recruiting/NIL data with signed-in profile reads and empty states.
- Removed production placeholder leaderboard rows and inbox demo conversations from runtime surfaces.

## What remains
- Browser role traces were not executed; no role is marked COMPLETE.
- Several demo, studio, and founder-demo surfaces intentionally still contain demo personas because they are demo-specific routes, not general production runtime paths.
- Live leaderboard metrics require a real XP/coin/badge/streak data source before rankings can be restored.
- Live inbox conversations require the production message persistence pipeline before empty-state messages can be replaced with real threads.
- Role OS cohort metrics for district, university, employer, educator, family, and mentor require real relationship/cohort data; the current implementation does not fabricate those metrics.

## Known limitations
- No Supabase schema changes were made.
- No database migrations were added.
- Tutorial completion is stored in `profiles.onboarding_data` because that JSON column already exists.
- Runtime behavior remains `IMPLEMENTED, RUNTIME NOT VERIFIED` until browser automation or manual role traces are captured against a real Supabase project.

## Runtime evidence
- `npm run build` passed with build-safe Supabase placeholder warnings for missing local public Supabase environment variables.
- `npx tsc --noEmit` passed.
- `npm run lint` passed.
- Browser automation was not available/performed; screenshots were not captured.

## Recommended next sprint
Run PBOS-RUNTIME-003 as a live-environment verification sprint: seed one account per role, perform the login → onboarding → tutorial → dashboard → profile → public profile → logout → login-again trace, and capture screenshots plus Supabase row evidence before any route is marked COMPLETE.
