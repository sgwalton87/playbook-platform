# Runtime Component Map

Purpose: forensic route-resolution audit for PBOS-ONBOARDING-INTEGRITY-001. Owner: Playbook OS Engineering. Last updated: July 24, 2026.

Related links: `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/DATABASE.md`, `docs/MASTER_CHECKLIST.md`.

## Method
Verified by App Router file discovery (`find app ... page.tsx/layout.tsx/route.ts`), import tracing, and source inspection. No production Supabase credentials or safe test account were available in this environment, so runtime database rows and screenshots are blocked pending product-owner credentials.

## Route map

| Route | Rendered page file | Layout | Child components | Data loading | Tables queried | Fallback/mock data | Legacy/runtime reachability |
|---|---|---|---|---|---|---|---|
| `/start` | `app/start/page.tsx` | root `app/layout.tsx` | `StartPage` -> `Suspense` -> `StartContent` -> `FieldRenderer`, `PlaybookLogo`, `Image` | client `supabase.auth.getUser`; `profiles.select('*').eq('id', user.id).maybeSingle`; `onboarding_options.select('type,value').in(...)`; storage upload | `profiles`, `onboarding_options`, `avatars` storage | if profile row missing, creates `safeProfile` object in memory; no error state for profile query | canonical reachable route; writes only selected top-level profile columns plus all values in `onboarding_data` |
| `/onboarding` | `app/onboarding/page.tsx` | root | legacy standalone onboarding page | client Supabase profile update path | `profiles`, options/storage inferred by source | duplicate legacy implementation | reachable competing onboarding implementation; do not use as canonical |
| `/dashboard` | `app/dashboard/page.tsx` | `app/dashboard/layout.tsx` + root | `DashboardPage`, `AGTracker`, UI cards/metrics | client `supabase.auth.getUser`; `profiles.select('*').eq('id', user.id).single`; `ag_progress.select('*')...` | `profiles`, `ag_progress` | metric labels default to `Active`, `Live`, `—`; does not show many onboarding fields | reachable Scholar OS; no First Login Tour import |
| `/scholar-athlete-os` | `app/scholar-athlete-os/page.tsx` | root | `ScholarAthleteDashboard` | none in page/component | none | hardcoded recruiting targets, hardcoded eligibility action state | reachable; does not read authenticated profile/onboarding data; no First Login Tour import |
| `/family-os` | `app/family-os/page.tsx` | root | `RoleDashboardExperience role='family'` | none | none | `getRoleDashboard('family')` returns static metrics/actions with Maya action | reachable role OS; no Supabase read; no tour import |
| `/mentor-os` | `app/mentor-os/page.tsx` | root | `RoleDashboardExperience role='mentor'` | none | none | static metrics/actions include `Review Maya's next step` | reachable role OS; no tour import |
| `/educator-os` | `app/educator-os/page.tsx` | root | `RoleDashboardExperience role='educator'` | none | none | static role dashboard/intelligence | reachable; coach role routes here via role registry |
| `/university-os` | `app/university-os/page.tsx` | root | `RoleDashboardExperience role='university'` | none | none | static role dashboard/intelligence | reachable; college coach/admissions route here |
| `/brand-partner-os` | `app/brand-partner-os/page.tsx` | root | local `Card`, `Action`, `PlaybookLogo` | client auth, `profiles.select('*').eq('id', user.id).maybeSingle` | `profiles` | displays `Not set` for absent onboarding values | reachable and partially reads `profile.onboarding_data` |
| `/employer-os` | `app/employer-os/page.tsx` | root | `RoleDashboardExperience role='employer'` | none | none | static dashboard | reachable |
| `/district-os` | `app/district-os/page.tsx` | root | `RoleDashboardExperience role='district'` | none | none | static dashboard | reachable |
| `/athlete-abroad-os` | `app/athlete-abroad-os/page.tsx` | root | local static cards | none | none | static module list | reachable, no onboarding connection |
| `/profile` | `app/profile/page.tsx` | `app/profile/layout.tsx` + root | `ProfilePage`, `CollegeSearch`, profile form sections | client auth; `profiles.select('*').eq('id', user.id).single`; storage avatar upload; update on save | `profiles`, `avatars` storage | loading state only; empty/error handling unclear; field map differs from `/start` | reachable private profile editor; reads profile columns and mapped scholar record, not arbitrary onboarding JSON |
| `/u/[username]` | `app/u/[username]/page.tsx` | `app/u/[username]/layout.tsx` + root | `PublicProfilePage`, `ProfileHero`, `ScholarRecordDashboard`, `TrustScoreCard`, `ScholarOpportunityGraphSection`, `PortfolioEngine`, `ProfileStats`, `AboutCard` | client auth; `profiles.select('*').ilike('username', username).maybeSingle`; certificates/badges/feed/student_activities/storage | `profiles`, `certificates`, `user_badges`, `feed_posts`, `student_activities`, `photos` storage | honest `Profile not found`; global gallery lists all `photos/gallery` files, not profile-scoped | reachable public profile; reads username row but only top-level columns + derived record |
| `/messages` | `app/messages/page.tsx` | `app/messages/layout.tsx` + root | `InboxV2` | none | none | `getDemoConversations`, `getDemoConversationMessages`, senderName `Maya` on new message | reachable and actively mock-backed |
| `/messages/[threadId]` | `app/messages/[threadId]/page.tsx` | `app/messages/layout.tsx` + root | `InboxV2` | none; ignores route param | none | same demo conversations/messages | reachable and actively mock-backed |
| `/support-messages` | `app/support-messages/page.tsx` | root | `SupportNetworkLiveCenter` | fetches support APIs using constant `scholar-maya`; falls back to demo state | API may query support-network tables | constant `DEMO_SCHOLAR_ID='scholar-maya'`; initial demo thread/actions | reachable and actively Maya-backed |
| Starting 5 routes | none found | n/a | n/a | n/a | n/a | repository contains no App Router route named Starting 5/starting-five/starting5 | not reachable as a route in current runtime |

## Runtime root-cause findings

1. Role OS pages do not mount a tour component and do not fetch tour completion state. The only visible tutorial route is `/tutorial`, which renders a generic `OnboardingTour` page.
2. Several role OS pages use `RoleDashboardExperience`, which reads static `lib/role-os/roleDashboards.ts` objects rather than the authenticated profile.
3. Scholar-Athlete OS is fully static/hardcoded and does not query Supabase.
4. `/start` writes many submitted fields only into `profiles.onboarding_data`; `/profile` and `/u/[username]` display mostly top-level profile columns, so those fields cannot appear unless separately mapped.
5. Messaging routes are actively mock-backed and include Maya demo identity paths.
