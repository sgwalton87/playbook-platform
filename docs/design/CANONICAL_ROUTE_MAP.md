# Canonical Route Map

## Purpose
Documents the canonical routes, rendered files, shared layout, and duplicate implementation status for the Playbook overnight design transformation.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 24, 2026

## Related Links
- [Engineering constitution](../../CODEX.md)
- [Architecture handbook](../ARCHITECTURE.md)
- [Design system](../UI_DESIGN_SYSTEM.md)
- [Master checklist](../MASTER_CHECKLIST.md)

## Phase 0 Findings

- Canonical app routing uses the Next.js App Router under `app/`.
- Auth/fullscreen routes bypass the app shell through `components/shell/UnifiedAppShell.tsx` and `lib/app-shell/shellRoutes.ts`.
- The canonical shared application shell is `components/shell/UnifiedAppShell.tsx`; `components/AppShell.tsx` is a compatibility pass-through used by nested layouts.
- Design tokens previously existed in `lib/design-system/tokens.ts`; Sprint 01 adds CSS runtime tokens in `styles/playbook-tokens.css` and imports them from `app/globals.css`.
- Logo/image assets are in `public/assets/` and `public/brand/`, including Playbook marks, lockups, and the current deck/home imagery.
- Icon treatment is primarily emoji-based in navigation; no external icon library is currently listed in `package.json`.

## Canonical Screens

| Feature | Route | Rendered file | Shared layout | Current status | Duplicate implementations found | Canonical implementation selected | Legacy implementation status |
|---|---|---|---|---|---|---|---|
| Landing Page | `/` | `app/page.tsx` | Fullscreen public route | Active | `app/home/page.tsx`, brand story components | `app/page.tsx` | Preserve as secondary/legacy route |
| Login | `/login` | `app/login/page.tsx` | Fullscreen public route | Active | `app/reset-password/page.tsx`, `app/check-email/page.tsx` are related auth pages | `app/login/page.tsx` | Related auth routes preserved |
| Role Selection | `/role-select` | `app/role-select/page.tsx` | Fullscreen auth/onboarding route | Active | `components/role-os/RoleSelect.tsx`, `app/onboarding/page.tsx`, `app/start/page.tsx` | `app/role-select/page.tsx` | Component preserved for role OS use |
| Scholar Dashboard | `/dashboard` | `app/dashboard/page.tsx` | Unified app shell plus `app/dashboard/layout.tsx` compatibility wrapper | PGSL-007 implemented; visual certification pending | `components/scholar/ScholarRecordDashboard.tsx`, `components/core-journey/CoreJourneyDashboard.tsx` | `components/dashboard/ScholarDashboardExperience.tsx` composed by `app/dashboard/page.tsx` | Earlier components preserved as feature modules; approved boards and integrity manifest live under `docs/design/canon/scholar-dashboard/` |
| Scholar Athlete Dashboard | `/scholar-athlete-os` | `app/scholar-athlete-os/page.tsx` | Unified app shell | Active | `components/scholar-athlete/ScholarAthleteDashboard.tsx` | `app/scholar-athlete-os/page.tsx` | Component preserved as feature module |
| Parent Dashboard | `/family-os` | `app/family-os/page.tsx` | Unified app shell | Active | No exact duplicate found; family navigation maps here | `app/family-os/page.tsx` | None |
| Mentor Dashboard | `/mentor-os` | `app/mentor-os/page.tsx` | Unified app shell | Active | `app/mentorship/page.tsx`, `app/mentor-connect/page.tsx` | `app/mentor-os/page.tsx` | Preserve related mentorship/directory routes |
| Coach Dashboard | `/mentor-os` for current coach role | `app/mentor-os/page.tsx` | Unified app shell | Active role mapping | No dedicated coach route found | `app/mentor-os/page.tsx` with coach-aware future refinement | FUNCTIONAL WIRING REQUIRED for dedicated coach IA if product requires separate route |
| Feed | `/feed` | `app/feed/page.tsx` | Unified app shell plus `app/feed/layout.tsx` | Active | `app/scholar-network/page.tsx`, `components/social/SocialIdentity.tsx` | `app/feed/page.tsx` | Preserve community/network routes |
| Profile | `/profile` | `app/profile/page.tsx` | Unified app shell plus `app/profile/layout.tsx` | Active | `app/u/[username]/page.tsx`, profile components | `app/profile/page.tsx` | Public profile route preserved |
| Messaging | `/messages` | `app/messages/page.tsx` | Unified app shell plus `app/messages/layout.tsx` | Active | `app/messages/[threadId]/page.tsx`, `app/support-messages/page.tsx`, `components/messages/*` | `app/messages/page.tsx` | Thread/support routes preserved |
| Starting 5 | `/support-network` | `app/support-network/page.tsx` | Unified app shell | Active | `app/connections/page.tsx`, `components/support-network/*`, `components/support-network-live/*` | `app/support-network/page.tsx` | Related connection routes preserved |
| Transcript | `/transcript` | `app/transcript/page.tsx` | Unified app shell plus `app/transcript/layout.tsx` | Active | Transcript upload component | `app/transcript/page.tsx` | Component preserved |
| Certificates | `/certificates` | `app/certificates/page.tsx` | Unified app shell plus `app/certificates/layout.tsx` | Active | `app/badges/page.tsx` related achievements | `app/certificates/page.tsx` | Badges route preserved |
| Courses | `/courses` | `app/courses/page.tsx` | Unified app shell plus `app/courses/layout.tsx` | Active | `app/courses/page.backup.tsx`, `app/courses/page.pre-schema-redesign.backup.tsx`, course detail routes | `app/courses/page.tsx` | Backup files are legacy and must not be styled |
| Store | `/store` | `app/store/page.tsx` | Unified app shell plus `app/store/layout.tsx` | Active | `app/store-v2/page.tsx`, `components/store-v2/StoreV2.tsx`, `app/reward-economy/page.tsx` | `app/store/page.tsx` | V2/reward routes preserved |
| Events | `/events` | `app/events/page.tsx` | Unified app shell plus `app/events/layout.tsx` | Active | `app/community-events/page.tsx`, studio events | `app/events/page.tsx` | Related routes preserved |
| Notifications | `/notifications` | `app/notifications/page.tsx` | Unified app shell plus `app/notifications/layout.tsx` | Active | `components/notifications-v2/NotificationCenter.tsx` | `app/notifications/page.tsx` | Component preserved |
| Settings | `/permissions` | `app/permissions/page.tsx` | Unified app shell | Active closest current settings/privacy surface | No `/settings` route found | `app/permissions/page.tsx` for current settings-like surface | FUNCTIONAL WIRING REQUIRED for a dedicated `/settings` route if required |
| Admin | `/admin` | `app/admin/page.tsx` | Unified app shell plus `app/admin/layout.tsx` | Active | `app/studio/*` operational tooling, `app/admin/moderation/page.tsx` | `app/admin/page.tsx` | Studio/admin subroutes preserved |
| Mentor Directory | `/mentor-connect` | `app/mentor-connect/page.tsx` | Unified app shell | Active | `app/mentorship/page.tsx`, `components/network/*` | `app/mentor-connect/page.tsx` | Related mentorship route preserved |
| College Search | `/opportunities` | `app/opportunities/page.tsx` | Unified app shell | Active closest search/opportunity surface | `components/CollegeSearch.tsx`, `components/college/CollegeSearch.tsx` | `app/opportunities/page.tsx` with college-search section/component | FUNCTIONAL WIRING REQUIRED for dedicated `/college-search` if product requires it |
| Recruiting | `/university-os` | `app/university-os/page.tsx` | Unified app shell | Active for college coach/admissions roles | `app/scholar-athlete-os/page.tsx` has related recruiting preview | `app/university-os/page.tsx` | Preserve athlete recruiting preview |
| Financial Dashboard | `/economy` | `app/economy/page.tsx` | Unified app shell | Active closest financial/reward economy route | `app/reward-economy/page.tsx`, `components/economy/EconomyCommandCenter.tsx` | `app/economy/page.tsx` | Reward economy route preserved |

## Existing Design System Inventory

| Category | Current source |
|---|---|
| Runtime CSS tokens | `styles/playbook-tokens.css` |
| TypeScript design constants | `lib/design-system/tokens.ts` |
| Global styles | `app/globals.css` |
| Canonical shell | `components/shell/UnifiedAppShell.tsx` |
| Compatibility shell | `components/AppShell.tsx` |
| UI page helpers | `components/ui/PlaybookPage.tsx` and `components/ui/index.ts` |
| System states | `components/system/PlaybookEmptyState.tsx`, `components/system/PlaybookErrorState.tsx`, `components/system/PlaybookLoading.tsx` |
| Logos | `components/brand/PlaybookLogo.tsx`, `public/assets/*logo*`, `public/brand/playbook-logo.png` |
| Imagery | `public/assets/deck-*.png`, `public/assets/home-*.png`, `public/demo/founder-archive/*` |
| Icons | Emoji navigation glyphs in `lib/navigation/roleNavigation.ts` |
