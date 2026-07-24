# Route Runtime Map

## Purpose
Evidence map for PBOS-RUNTIME-001. This is a static runtime trace of the App Router source present in the repository on July 24, 2026. It does not claim browser-verified runtime success.

## Ownership
Playbook OS Engineering

## Last Updated
July 24, 2026

## Related Links
- [Runtime Integrity Report](./RUNTIME_INTEGRITY_REPORT.md)
- [Architecture handbook](../ARCHITECTURE.md)
- [Database handbook](../DATABASE.md)
- [Onboarding Role OS Sprint Map](../ONBOARDING_ROLE_OS_SPRINT_MAP.md)

## Evidence standard
A route is marked reachable only when a matching `app/**/page.tsx` exists. Data claims below are source-code traces, not end-to-end browser verification.

## Shared layout and middleware
- Root layout: `app/layout.tsx` wraps every route in `ThemeProvider` and `UnifiedAppShell`.
- App shell: `components/shell/UnifiedAppShell.tsx` reads the current auth user and `profiles(id,full_name,first_name,last_name,username,avatar_url,role,profile_mode)`. It suppresses the shell for `/`, `/login`, `/check-email`, `/start`, `/auth/callback`, `/pending`, `/role-select`, and `/reset-password`.
- Middleware: no `middleware.ts` file was present in this repository during the audit, so no middleware auth guard or redirect was found.

## Route table

| Route | Actual page file | Layout | Child components | Data loader / API / Supabase | Fallback data | Redirects / auth guard | Reachable |
|---|---|---|---|---|---|---|---|
| `/` | `app/page.tsx` | Root layout, shell bypassed | `PlaybookLogo`, `next/image` | No Supabase/API; reads `PLAYBOOK_HERO_VISUALS.home` | Static hero copy/image config | Links to `/login` and `/login?mode=signup`; no auth guard | Yes |
| `/login` | `app/login/page.tsx` | Root layout, shell bypassed | `PlaybookLogo`, `HCaptcha`, `next/image` | Supabase auth: OAuth, sign-up, password sign-in. Local storage key `playbook_saved_email`. | Static pathway and hero config | Google redirects to `/auth/callback?next=/start`; sign-up email callback points to `/auth/callback?next=/pending`; password sign-in redirects to `/dashboard` | Yes |
| `/start` | `app/start/page.tsx` | Root layout, shell bypassed | `PlaybookLogo`, dynamic field renderers from `lib/onboarding`, `next/image` | `auth.getUser`; `profiles.select('*').eq(id).maybeSingle`; `onboarding_options.select(type,value).in(...)`; writes `onboarding_options`; upserts `profiles`; posts invitation requests to `/api/invitations/send`; avatar storage upload to `avatars` | If no profile row exists, creates in-memory `safeProfile` from auth user and route role before upsert | Unauthenticated browser redirect to `/login`; final submit redirects after 15s to `getPathway(role).osRoute` | Yes |
| `/onboarding` | `app/onboarding/page.tsx` | Root layout, server redirect before UI | None | No Supabase/API; calls Next `redirect("/start")` | None | Legacy alias redirects to `/start` | Yes, as redirect alias |
| `/tutorial` | `app/tutorial/page.tsx` | Root layout with shell | `OnboardingTour` | `auth.getUser`; reads `profiles(id,onboarding_completed,onboarding_data,profile_mode,role)`; writes tutorial completion to `profiles.onboarding_data` | Tutorial content remains static; completion state is live profile JSON | Unauthenticated to `/login`; incomplete onboarding to `/start`; completed tutorial to role OS | Yes |
| `/pending` | `app/pending/page.tsx` | Root layout, shell bypassed | Inline page UI | `auth.getUser`; `profiles.select('*').eq(id).single()` | Static role labels and route list | Unauthenticated/no profile to `/login`; approved profile to `/dashboard`; sign out to `/login` | Yes |
| `/dashboard` | `app/dashboard/page.tsx` | Root layout with shell | `AGTracker`, UI cards/metrics | `auth.getUser`; `profiles.select('*').eq(id).single`; `ag_progress.select('*').eq(user_id).order(...)`; maps through `buildScholarRecord` | Metrics show `Active`, `Live`, and `—` when record/fields absent | If no user, returns without redirect; route still renders generic shell/cards | Yes |
| `/profile` | `app/profile/page.tsx` | `app/profile/layout.tsx` plus root layout | Inline profile editor, `next/image` | `auth.getUser`; `profiles.select('*').eq(id).single`; storage upload to `avatars`; `profiles.update(...)` on save | Many placeholders; initial state falls back to empty strings | Unauthenticated to `/login`; no profile to `/start` | Yes |
| `/u/[username]` | `app/u/[username]/page.tsx` | `app/u/[username]/layout.tsx` plus root layout | `ProfileHero`, `ProfileStats`, `AboutCard`, `ScholarRecordDashboard`, `PortfolioEngine`, `TrustScoreCard`, `ScholarOpportunityGraphSection`, `ProfileAvatar` | `auth.getUser`; `profiles.select('*').ilike(username).maybeSingle`; certificates, badges, feed posts, student activities; storage list `photos/gallery`; realtime feed/certificate subscriptions; feed post insert on upload | If no profile, displays Profile not found. Portfolio engines may compute defaults from absent fields. | No auth required to read public profile route; own-user checks before posting | Yes |
| `/messages` | `app/messages/page.tsx` | Root layout with shell | `InboxV2` | Data behavior delegated to `components/messages/InboxV2` | Depends on component | Page wrapper has no auth guard | Yes |
| `/support-network` | `app/support-network/page.tsx` | Root layout with shell | `SupportNetworkMap` | Data behavior delegated to `components/support-network/SupportNetworkMap` and support API routes | Depends on component | Page wrapper has no auth guard | Yes |
| `/transcript` | `app/transcript/page.tsx` | `app/transcript/layout.tsx` plus root layout | `TranscriptUploadCard`, `PlaybookStoryBanner`, A-G UI | `auth.getUser`; reads profile, ag_progress, certificates, student_activities; builds ScholarRecord | Initializes A-G rows from record requirements when rows absent | Unauthenticated redirects to `/login` | Yes |
| `/feed` | `app/feed/page.tsx` | Root layout with shell | Inline feed UI | Supabase auth/profile/feed reads and writes in page | Static UI copy and empty state | Page must be inspected for exact guard; page exists | Yes |
| `/scholar-athlete-os` | `app/scholar-athlete-os/page.tsx` | Root layout with shell | `ScholarAthleteDashboard` | `auth.getUser`; reads signed-in `profiles` row and onboarding JSON for sport/team/highlight fields | Honest empty states for missing eligibility, recruiting, and NIL records | Unauthenticated to `/login` | Yes |
| `/family-os` | `app/family-os/page.tsx` | Root layout with shell | `RoleDashboardExperience(role='family')` | No profile read in route component; shared component reads static role dashboard/intelligence config only | Static role dashboard config | No auth guard in route component | Yes |
| `/mentor-os` | `app/mentor-os/page.tsx` | Root layout with shell | `RoleDashboardExperience(role='mentor')` | Same as family | Static role dashboard config | No auth guard in route component | Yes |
| `/educator-os` | `app/educator-os/page.tsx` | Root layout with shell | `RoleDashboardExperience(role='educator')` | Same as family | Static role dashboard config | No auth guard in route component | Yes |
| `/district-os` | `app/district-os/page.tsx` | Root layout with shell | `RoleDashboardExperience(role='district')` | Same as family | Static role dashboard config | No auth guard in route component | Yes |
| `/university-os` | `app/university-os/page.tsx` | Root layout with shell | `RoleDashboardExperience(role='university')` | Same as family | Static role dashboard config | No auth guard in route component | Yes |
| `/brand-partner-os` | `app/brand-partner-os/page.tsx` | Root layout with shell | `PlaybookLogo`, inline cards/actions | `auth.getUser`; `profiles.select('*').eq(id).maybeSingle`; reads `profile.onboarding_data` | Card values use `Not set`; action cards are static and buttons say `Coming Next` | Unauthenticated browser redirect to `/login` | Yes |
| `/athlete-abroad-os` | `app/athlete-abroad-os/page.tsx` | Root layout with shell | Inline cards only | No auth/API/Supabase | Entire route is static module copy | No auth guard | Yes |
| `/employer-os` | `app/employer-os/page.tsx` | Root layout with shell | `RoleDashboardExperience(role='employer')` | Same as family | Static role dashboard config | No auth guard in route component | Yes |

## Route-trace conclusions
- `/start` is the only route that combines role-aware onboarding schema, profile upsert, custom option persistence, support invites, and role OS destination routing in one flow.
- `/onboarding` is now a legacy redirect alias rather than a duplicate onboarding implementation.
- `/tutorial` participates in first-login onboarding through `profiles.onboarding_data` tutorial flags.
- Shared role OS routes now read the signed-in user profile and show empty states rather than fabricated metrics when live role data is unavailable.
