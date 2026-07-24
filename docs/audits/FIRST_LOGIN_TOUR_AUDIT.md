# First Login Tour Audit

Purpose: determine why role-based first-login tutorials are disconnected. Owner: Playbook OS Engineering. Last updated: July 24, 2026.

Related links: `docs/audits/RUNTIME_COMPONENT_MAP.md`, `docs/ARCHITECTURE.md`.

## Findings

| Item | Status | Evidence | Runtime result |
|---|---|---|---|
| Generic tutorial UI | Exists | `app/tutorial/page.tsx` imports `components/tutorial/OnboardingTour.tsx`; `OnboardingTour` calls `getFirstLoginTutorial()` | Reachable only at `/tutorial`; not automatically shown after onboarding |
| Generic tutorial config | Exists | `lib/tutorial/tutorialEngine.ts` defines five generic steps: home, record, messages, notifications, store | Not role-specific; hardcodes `/dashboard` as home |
| Role-specific tour config | Exists | `lib/guided-experience/guidedExperience.ts` defines `getRoleTour(role)` for scholar, scholar_athlete, family, educator, mentor, district, university, employer | Not imported by OS pages or `/tutorial`; API only computes progress on POST |
| Completion API | Exists | `app/api/guided-tour/progress/route.ts` service-role upserts `guided_tour_progress` | No UI caller found during import/source search |
| Role OS integration | Missing | `/dashboard`, `/scholar-athlete-os`, and `RoleDashboardExperience` do not import guided-experience or tutorial components | First Login Tour cannot auto-open on role OS entry |
| Completion storage | Intended table | `guided_tour_progress` used by API | No read path in UI, no automatic trigger |
| Replay from Help/Settings | Not found | no Help/Settings tour replay control found in inspected runtime files | Not implemented in current runtime |

## Previously implemented role tutorials

The canonical intended implementation appears to be `lib/guided-experience/guidedExperience.ts`, not `lib/tutorial/tutorialEngine.ts`, because it has role-specific arrays and progress logic. It covers: scholar, scholar_athlete, family, educator, mentor, district, university, and employer. Coach, college-coach, college-admissions, and brand-partner onboarding roles are not direct `GuidedRole` values and require canonical role normalization before use.

## Disconnection cause

The consolidation appears to have kept `/start` as canonical onboarding but did not mount `getRoleTour` in role OS entry components and did not add a client-side read of `guided_tour_progress`. As a result, onboarding completion redirects users directly to the OS route, but the OS route has no tour trigger.

## Required fix plan after approval

- Keep `/start` onboarding separate from First Login Tour.
- Add a single reusable First Login Tour launcher to OS entry components.
- Normalize Playbook roles to guided roles.
- Read/write `guided_tour_progress` for current authenticated user and role.
- Show only after `profiles.onboarding_completed = true` and no completed/skipped progress exists.
- Provide a safe replay entry if an existing Help/Settings location is identified or product approves adding one.
