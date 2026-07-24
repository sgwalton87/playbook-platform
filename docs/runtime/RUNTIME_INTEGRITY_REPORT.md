# Runtime Integrity Report

## Purpose
PBOS-RUNTIME-001 forensic audit of what code is actually present and what data paths are actually wired. This report intentionally does not fix code.

## Ownership
Playbook OS Engineering

## Last Updated
July 24, 2026

## Related Links
- [Route Runtime Map](./ROUTE_RUNTIME_MAP.md)
- [Architecture handbook](../ARCHITECTURE.md)
- [Database handbook](../DATABASE.md)
- [Onboarding Role OS Sprint Map](../ONBOARDING_ROLE_OS_SPRINT_MAP.md)

## Audit limits
- This is source-trace evidence, not browser automation evidence.
- No feature is marked COMPLETE.
- Status language uses `IMPLEMENTED, RUNTIME NOT VERIFIED`, `BROKEN`, `NOT CONNECTED`, `MOCK`, `WRONG COLUMN`, or `NOT READ`.

## Executive findings
1. `/start` is structurally canonical because login Google OAuth targets `/auth/callback?next=/start`, the role registry maps onboarding destinations to `/start?first=1&role=...`, and `/start` contains the role-aware onboarding schema/persistence/final role-OS routing.
2. `/onboarding` still exists as a complete independent page. It does not appear to be a redirect-only compatibility shim.
3. `/tutorial` is an independent route backed by `OnboardingTour`; it does not participate in the `/start` completion path.
4. Tutorials do not appear because completion of `/start` redirects to the role OS route and no source-traced bridge sets tutorial state, routes first-login users to `/tutorial`, or embeds `OnboardingTour` in the OS pages.
5. Maya still originates from recommender/demo/collaboration/static intelligence sources and remains reachable anywhere those components/routes are reachable.
6. Public profiles do not fully reflect onboarding because `/start` writes many onboarding fields only inside `profiles.onboarding_data`, while public profile readers and `buildScholarRecord` read many fields from top-level profile columns.

## Phase 2 — onboarding trace

### Sign in / sign up
- Password sign-in in `/login` calls Supabase `signInWithPassword` and redirects to `/dashboard` after success. That means returning users do not necessarily pass through `/start`.
- Google sign-in redirects through `/auth/callback?next=/start`.
- Sign-up stores role/profile metadata in Supabase auth user metadata, then redirects user to check-email; the email callback next route is `/pending`, not `/start`.

### Entry route
- `/start` reads the authenticated user. If absent, it navigates to `/login`.
- It reads `profiles` by auth user id with `.maybeSingle()`.
- If no profile row exists, it creates only an in-memory `safeProfile`, then continues.

### Role selection and pages
- `/start` normalizes role from query/profile and loads steps from `getOnboardingSteps(role)`.
- Role-specific steps are defined in `lib/onboarding/roleOnboarding.ts` for scholar, scholar-athlete, brand partner, family, mentor, educator, coach, college-coach, college-admissions, transition-youth, and other.
- Employer and district are marked `onboarding: false` in the role registry and therefore are not in public onboarding roles, despite route OS pages existing.

### Writes
- Custom options: `onboarding_options.insert({ type, value, created_by })` for new college/career/activity/district choices.
- Profile: `/start` upserts `profiles` with top-level `role`, `profile_mode`, `requested_role`, `full_name`, `username`, `avatar_url`, `bio`, `school`, `grade`, `dream_school`, `ideal_profession`, plus `onboarding_data` containing all form fields and arrays.
- Completion: `/start` sets `onboarding_completed`, `onboarding_completed_at`, `public_profile_complete`, `community_safety_agreed`, policy version, and related timestamps.
- Support invites: on the network step, `/start` posts to `/api/invitations/send` for supporter emails.
- Avatar: `/start` writes to Supabase storage bucket `avatars` and persists the public URL to profile.

### Reads after submit
- Dashboard reads `profiles.*` and `ag_progress`, then calls `buildScholarRecord`.
- Profile editor reads `profiles.*` and stores many profile-editor fields as top-level profile columns.
- Public profile reads profile by username and then reads certificates, user badges, feed posts, student activities, photo storage, and realtime feed/certificate changes.
- Scholar-athlete OS does not read the onboarding profile; brand-partner OS reads `profile.onboarding_data`; other role OS routes use static role dashboard config.

### Redirects
- `/start` final submit redirects after 15 seconds to `getPathway(role).osRoute`.
- There is no source-traced redirect from `/start` to `/tutorial`.
- Password sign-in returns to `/dashboard`, not role OS or first-login tutorial.

### Persistence verification status
- IMPLEMENTED, RUNTIME NOT VERIFIED: `/start` contains writes and readers exist.
- BROKEN / NOT CONNECTED: full persistence into dashboard/public profile is incomplete because many fields are only stored in JSON and downstream readers expect top-level columns.
- NOT VERIFIED: no browser evidence or live Supabase row evidence was captured in this audit.

## Phase 3 — why both onboarding routes exist

| Question | Answer from source trace |
|---|---|
| Does `/onboarding` redirect? | No redirect-only implementation was found. It is a complete client page. |
| Is `/onboarding` still a complete page? | Yes. It imports UI, Supabase, `CollegeSearch`, `Confetti`, and declares many local form/option constants. |
| Does it render independently? | Yes. It has its own `export default function` page. |
| Is there duplicated onboarding logic? | Yes. `/start` and `/onboarding` both maintain onboarding form state and Supabase profile persistence logic independently. |
| Is there shared logic? | Partial. `/start` uses `lib/onboarding` and `lib/onboarding/pathwayMap`; `/onboarding` imports other shared components/types but carries substantial local logic/constants. |
| Should `/onboarding` exist? | Product decision required. Source evidence contradicts the previous claim that legacy onboarding was removed. If retained, it should be a documented redirect/shim; if not retained, removal requires PO approval. |

## Phase 4 — role tutorials

| Name searched | Exists | Location / use | Runtime participation |
|---|---:|---|---|
| `OnboardingTour` | Yes | `components/tutorial/OnboardingTour.tsx`; imported only by `app/tutorial/page.tsx` | Independent tutorial page only; not launched by onboarding. |
| `FirstLoginTour` | No implementation found | Prior reports overstated rename/completion | Missing connection/name. |
| `Tutorial` | Yes as page/lib naming | `app/tutorial/page.tsx`, `lib/tutorial/tutorialEngine.ts` | Static route; no completion persistence. |
| `Walkthrough` | Not found as runtime component | N/A | Not connected. |
| `GuidedTour` | Not found as runtime component | N/A | Not connected. |
| `CoachTour` | Not found | N/A | Not connected. |
| `ScholarTour` | Not found | N/A | Not connected. |
| `MentorTour` | Not found | N/A | Not connected. |
| `FamilyTour` | Not found | N/A | Not connected. |

Exact missing connection: `/start` final completion calls `window.location.href = getPathway(role).osRoute`; it never sets a first-login tutorial flag and never redirects to `/tutorial`. `OnboardingTour` computes progress with hardcoded completed IDs and does not write completion state.

## Phase 5 — profile data flow table

| Onboarding field | Validation | `/start` write | Dashboard reader | Profile editor reader | Public profile reader | Status |
|---|---|---|---|---|---|---|
| `full_name` | Required only by UI expectations; no schema validation found | Top-level `profiles.full_name` and JSON | `buildScholarRecord.identity.fullName` | Reads/splits profile name fields | `ProfileHero`/record via profile | IMPLEMENTED, RUNTIME NOT VERIFIED |
| `username` | No uniqueness validation in source trace | Top-level `profiles.username` and JSON | Not displayed in dashboard metrics | Profile editor reads | Public profile lookup uses username | IMPLEMENTED, RUNTIME NOT VERIFIED |
| `bio` | No schema validation | Top-level and JSON | Not displayed in dashboard metrics | Reads/writes top-level | About/profile components read profile | IMPLEMENTED, RUNTIME NOT VERIFIED |
| `avatar_url` | Storage upload error alert only | Top-level and JSON | Shell/avatar only | Reads/writes top-level | Public hero/avatar reads | IMPLEMENTED, RUNTIME NOT VERIFIED |
| `school` | No schema validation | Top-level and JSON | ScholarRecord academics reads top-level | Reads/writes top-level | Public academics/about reads top-level | IMPLEMENTED, RUNTIME NOT VERIFIED |
| `grade` | Select option | Top-level and JSON | ScholarRecord academics reads top-level | Reads/writes top-level | Public/profile components read top-level | IMPLEMENTED, RUNTIME NOT VERIFIED |
| `dream_school` | No schema validation | Top-level and JSON | ScholarRecord reads top-level | Reads/writes top-level | Academics panel reads top-level | IMPLEMENTED, RUNTIME NOT VERIFIED |
| `ideal_profession` | No schema validation | Top-level and JSON | ScholarRecord career reads top-level but dashboard does not display | Profile editor may read/write career fields | Not visibly displayed in audited public panel | NOT READ / PARTIAL |
| `school_district` | Select/search only | JSON only | Not read by dashboard | Profile editor uses top-level district/school_district variants separately | Not read in audited public panel | NOT CONNECTED |
| `race_ethnicity` | Multi-select UI only | JSON only | Not read by dashboard | Profile editor uses `race` top-level, not `race_ethnicity` | Not read | WRONG COLUMN |
| `lgbtqia_affinity` | Select UI only | JSON only | Not read | Not read in profile editor trace | Not read | NOT READ |
| `first_generation` | Select UI only | JSON only | Not read by dashboard | Profile editor uses `first_generation` top-level boolean/string separately | Not public | NOT CONNECTED |
| `ell_status` | Select UI only | JSON only | Not read | Not read | Not read | NOT READ |
| `free_reduced_lunch` | Select UI only | JSON only | Not read | Profile editor uses top-level `free_reduced_lunch` separately | Not public | NOT CONNECTED |
| `foster_youth` | Select UI only | JSON only | Not read | Profile editor top-level uses boolean separately | Not public | NOT CONNECTED |
| `housing_insecurity` | Select UI only | JSON only | Not read | Profile editor uses `unhoused`, not same key | Not public | WRONG COLUMN |
| `gpa` | Text input | JSON only in `/start`; top-level not included in payload | Dashboard reads top-level `gpa`/`weighted_gpa`; public panel reads `profile.gpa` | Profile editor writes `weighted_gpa`/`unweighted_gpa`, not onboarding `gpa` | Reads top-level `gpa` | WRONG COLUMN |
| `graduation_year` | Text input | JSON only | Dashboard `buildScholarRecord` can read `graduation_year`; public panel not visible | Profile editor uses `grad_year` | Public record can read via builder | PARTIAL / WRONG COLUMN RISK |
| `top_schools` | List UI | JSON only | Not read | Not read | Not read | NOT READ |
| `intended_major` | Text input | JSON only | `buildScholarRecord` reads top-level `intended_major`, not JSON | Profile editor writes top-level | Public record reads top-level | NOT CONNECTED |
| `sat_act_status` | Select UI | JSON only | Not read | Not read | Not read | NOT READ |
| `engagement_preferences` | Multi-select UI | JSON only | Not read | Not read | Not read | NOT READ |
| `activities` | List UI | JSON only | Dashboard achievements do not read JSON activities | Public profile reads `student_activities`, not JSON | Public profile reads `student_activities`, not JSON | NOT CONNECTED |
| Athlete fields (`primary_sport`, `position`, `current_team`, `height_weight`, `key_stats_honors`, recruiting fields) | UI only | JSON only | Scholar-athlete OS does not read profile | Profile editor writes different top-level athletic fields | Public profile mostly reads top-level sport/profile fields | NOT CONNECTED / WRONG COLUMN |
| Brand fields (`organization_name`, `brand_category`, etc.) | UI only | JSON only | Not dashboard | Not profile editor | Brand Partner OS reads JSON | IMPLEMENTED FOR BRAND OS, RUNTIME NOT VERIFIED |
| Family/Mentor/Educator/Coach/University-specific fields | UI only | JSON only | Role OS shared dashboards do not read profile | Not read | Not read | NOT CONNECTED |
| `invite_supporters` | Email-like list UI; no robust validation found | JSON plus POST `/api/invitations/send` | Not dashboard | Not profile editor | Not public | IMPLEMENTED, RUNTIME NOT VERIFIED |
| `community_safety_agreed` | Blocking alert on final step | Top-level booleans/timestamps and JSON | Not displayed | Not displayed | Not displayed | IMPLEMENTED, RUNTIME NOT VERIFIED |

## Phase 6 — hardcoded data

| Term/source | Runtime source | Screen/route | Reason | Still reachable? |
|---|---|---|---|---|
| Maya Johnson / Coach Taylor | `components/recommenders/RecommenderWorkflowDashboard.tsx` and `app/recommenders/[requestId]/page.tsx` | Recommender dashboards/routes | Demo recommender workflow data | Yes if route/component reachable |
| Maya references | `lib/collaboration/collaborationLayer.ts` | Collaboration/intelligence surfaces | Static scenario actions | Likely reachable through collaboration routes/components |
| Jordan Miles | `components/connections/page.tsx.before-live-network`, `app/leaderboard/page.tsx`, other demo/static lists | Connections backup, leaderboard | Demo leaderboard/profile fixtures | Leaderboard yes; backup file no unless imported |
| Coach T / Coach Mike | Search terms appear in static/demo sources if present | Support/recruiting demo contexts | Demo/support labels | Needs route-specific browser confirmation |
| `demo`, `mock`, `sample`, `placeholder`, `fallback`, `fixture`, `fake` | Repository-wide docs/tests/components/libs | Many screens | Mixed: legitimate docs/tests plus runtime placeholders | Some are reachable; each must be removed or documented by product decision before claiming production readiness |
| `default scholar` / `default profile` | No canonical runtime default profile implementation identified in audited source | N/A | Phrase search did not identify a central runtime default profile | N/A |
| Browser storage | `playbook_saved_email`, theme keys | Login/theme | UX preference persistence, not profile data | Yes |

## Phase 7 — role dashboards

| OS route | Expected profile data | Actually read | Hardcoded/mocked/disconnected |
|---|---|---|---|
| `/scholar-athlete-os` | athlete profile, eligibility, recruiting, NIL, financial plan | No Supabase/profile read | Hardcoded `Target University`, `Dream College`, `eligibilityStatus: action_needed`, financial incomplete |
| `/family-os` | scholar relationship, dependent, family focus | None in route/shared dashboard | Static role dashboard/intelligence config; onboarding JSON not read |
| `/mentor-os` | mentor organization/title/expertise/availability | None in route/shared dashboard | Static role dashboard/intelligence config; onboarding JSON not read |
| `/educator-os` | school/district/subjects/students/support focus | None in route/shared dashboard | Static role dashboard/intelligence config; onboarding JSON not read |
| `/district-os` | district admin profile/equity metrics | None in route/shared dashboard | Static role dashboard/intelligence config; role marked onboarding false |
| `/university-os` | college coach/admissions data | None in route/shared dashboard | Static role dashboard/intelligence config; onboarding role maps to college-coach/college-admissions but route role prop is `university` |
| `/brand-partner-os` | organization, category, goals, budget | Reads authenticated `profiles.*`, then `profile.onboarding_data` | Partially connected; campaign actions are static Coming Next cards |
| `/athlete-abroad-os` | athlete portfolio/passport/international targets | None | Entire page is static module list |
| `/employer-os` | employer/workforce profile | None in route/shared dashboard | Static role dashboard/intelligence config; role marked onboarding false |

## Required answers

1. **Which onboarding route is actually canonical?** `/start` is structurally canonical in source. Runtime end-to-end canonical behavior is IMPLEMENTED, RUNTIME NOT VERIFIED.
2. **Why does the second onboarding route exist?** Source evidence shows `/onboarding` still exists as a legacy complete page. No redirect/shim reason is encoded in source.
3. **Does `/tutorial` still participate in onboarding?** No source-traced participation found.
4. **Why do tutorials not appear?** No onboarding-to-tutorial redirect, no first-login flag, no role OS import/embed, and no completion persistence.
5. **Where does Maya still originate?** Recommender demo pages/components and collaboration/static scenario data.
6. **Which components still use hardcoded data?** `ScholarAthleteDashboard`, `RoleDashboardExperience` through static role dashboards/intelligence, recommender workflow components, leaderboard/static demo surfaces, Athlete Abroad OS, and multiple demo/intelligence modules.
7. **Which profile fields never reach public profile?** Most JSON-only onboarding fields: demographics/support, top schools, engagement preferences, activities, role-specific family/mentor/educator/coach/university fields, many athlete recruiting fields.
8. **Which profile fields never reach dashboard?** Dashboard only consumes ScholarRecord academics from top-level profile plus A-G rows, so most onboarding JSON fields never reach dashboard.
9. **Which pages are still disconnected?** `/tutorial`, most role OS pages, `/onboarding` legacy flow, and any public profile fields expecting top-level columns not populated by `/start`.
10. **Which implementation reports overstated completion?** Claims that legacy onboarding was removed, role tutorials were renamed/executing as `FirstLoginTour`, onboarding persistence was centralized, and Maya was retired are contradicted by source evidence.
11. **Which fixes are required?** Decide route ownership; convert `/onboarding` to redirect or remove; map `/start` fields to canonical columns/tables; connect activities to `student_activities`; connect role OS dashboards to authenticated profile/onboarding data; create/route/persist first-login tutorials; remove or gate hardcoded demo data.
12. **Which fixes require Product Owner approval?** Removing `/onboarding`, deleting/gating demo personas including Maya/Jordan, changing canonical profile schema/columns, changing post-onboarding destination behavior, and deciding whether `/tutorial` is required for all roles.

## Final audit status
- Audit artifacts created: `docs/runtime/ROUTE_RUNTIME_MAP.md` and `docs/runtime/RUNTIME_INTEGRITY_REPORT.md`.
- No application code was modified.
- No runtime browser evidence was captured; therefore all implemented paths remain `IMPLEMENTED, RUNTIME NOT VERIFIED` rather than COMPLETE.
