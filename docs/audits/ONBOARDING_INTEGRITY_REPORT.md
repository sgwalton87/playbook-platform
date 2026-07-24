# Onboarding Integrity Report

Purpose: forensic findings for PBOS-ONBOARDING-INTEGRITY-001 before applying fixes. Owner: Playbook OS Engineering. Last updated: July 24, 2026.

Related links: `docs/audits/RUNTIME_COMPONENT_MAP.md`, `docs/audits/ONBOARDING_DATA_FLOW.md`, `docs/audits/MOCK_DATA_INVENTORY.md`, `docs/audits/FIRST_LOGIN_TOUR_AUDIT.md`, `docs/ARCHITECTURE.md`, `docs/DATABASE.md`.

## Executive finding

The canonical `/start` onboarding route exists and writes a `profiles` upsert, but the promised user-visible behavior is disconnected. Role OS pages either do not read Supabase or only read a small subset of profile data. The First Login Tour role configuration exists separately from onboarding but is not mounted on OS pages. Several production-reachable routes still render hardcoded demo data, including Maya.

## Required questions answered

1. **Why did the previous canonical onboarding sprint omit or disconnect role-based tutorials?** The code contains two separate tutorial concepts: a generic `/tutorial` page and a role-specific guided-experience library/API. The role OS entry pages do not import either a tour launcher or guided-progress reader, so `/start` redirects directly to OS routes without triggering a tour.
2. **Where exactly are those tutorials now?** Generic tutorial UI: `components/tutorial/OnboardingTour.tsx` and `lib/tutorial/tutorialEngine.ts`. Role-specific configs: `lib/guided-experience/guidedExperience.ts`. Persistence API: `app/api/guided-tour/progress/route.ts`.
3. **Why was Maya previously reported as retired?** The demo-mode Maya file was likely treated as isolated demo content, but Maya remained in active non-demo runtime sources.
4. **What exact source was still rendering Maya?** Active sources include `lib/role-os/roleDashboards.ts`, `components/messages/InboxV2.tsx` through `lib/messages/conversationEngine.ts`, and `components/support-network-live/SupportNetworkLiveCenter.tsx` through demo support-network data.
5. **Why did the platform display hardcoded data?** Many role dashboards and messaging pages are implemented as static shell components using local arrays/helpers instead of authenticated Supabase queries.
6. **Which files contained active hardcoded fallbacks?** See `MOCK_DATA_INVENTORY.md`; highest-risk active files are `components/scholar-athlete/ScholarAthleteDashboard.tsx`, `components/role-os/dashboards/RoleDashboardExperience.tsx`, `lib/role-os/roleDashboards.ts`, `components/messages/InboxV2.tsx`, `lib/messages/conversationEngine.ts`, `components/support-network-live/SupportNetworkLiveCenter.tsx`, and `lib/support-network-live/supportNetworkLive.ts`.
7. **Did onboarding data successfully reach Supabase?** Source shows `/start` attempts to upsert `profiles`; runtime success is not proven because no safe authenticated test account/credentials were available.
8. **Which exact fields persisted?** Source-level payload persists top-level `full_name`, `username`, `avatar_url`, `bio`, `school`, `grade`, `dream_school`, `ideal_profession`, role/completion/safety flags, and all form values under `onboarding_data`. Runtime persistence is unverified.
9. **Which fields failed?** Any field only in `onboarding_data` but expected on dashboards/public profile fails the visible-flow standard unless the reader maps JSON. Known mismatches: `gpa`, `graduation_year`, `school_district`, `top_schools`, `activities`, `intended_major`, `primary_sport`, `current_team`, `height_weight`, `key_stats_honors`, `highlight_link`, `nil_interest`.
10. **Why did persisted information not appear on `/profile` or `/u/[username]`?** Those routes read profile columns and normalized tables, while `/start` stores many values only in `onboarding_data` under different keys.
11. **What root causes were fixed?** None yet. Per sprint instruction, this commit is audit-only and pauses before fixes.
12. **What remains unresolved?** All product defects remain unresolved pending approval to change code and run E2E verification.
13. **What database actions still require product-owner approval?** Possible cleanup of demo rows (especially any profiles/messages containing Maya/Jaylen/Jordan/Angela/Coach demo identities) must be identified against an approved development/production database before destructive SQL is executed. A proposed SQL cleanup file should be created only after row inspection.
14. **What runtime evidence proves the corrected flow works?** None yet. Required runtime proof is blocked pending safe test account and approval to implement fixes.

## Approval gate

Recommended next steps after product-owner approval:

1. Implement canonical onboarding-to-profile mapper for top-level public/profile fields and normalized activity rows where intended.
2. Replace active mock-backed route behavior with authenticated data, honest empty/error states, and no demo-user substitution.
3. Mount role-specific First Login Tour launcher on OS entry pages and persist completion in `guided_tour_progress`.
4. Add tests for the ten required acceptance cases.
5. Run app with a safe test account and capture the requested screenshots.
