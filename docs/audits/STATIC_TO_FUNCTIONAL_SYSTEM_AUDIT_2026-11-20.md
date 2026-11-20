# PBOS-RCC-001 — System-wide static-to-functional audit (2026-11-20)

**Status: SOURCE AUDIT / NOT A PRODUCTION CERTIFICATION.** This is a new inspection of main-branch source files plus the prior product audits, 15-role journey contract, and the current 107-capability certification standard. It is **not** a claim that every repository file, deployed database policy, or authenticated live browser state was tested. Perform a reproducible complete route/API/UI import graph scan and browser acceptance before declaring the inventory exhaustive.

## Executive decision

The user's complaint is **confirmed**: several live-reachable routes still display hardcoded or simulated data or give users navigation cards in place of a role-specific actionable workspace. CI and 15-role login/onboarding tests are not sufficient functional certification. HOLD production expansion; keep the already-working durable services and their authorization intact. Replace demo-in-production, connect dashboards to canonical projections, and require actionable persistence and negative authorization evidence per capability.

### Current main-source findings (directly inspected on 2026-11-20)

| ID | Severity | User surface | Observed source behavior | Required repair and acceptance |
|---|---|---|---|---|
| DYN-001 | **P0 — misleading member data** | `/leaderboard` | `app/leaderboard/page.tsx` renders a constant `ALL_SCHOLARS` with invented names, school, XP, coins, rank and `isYou`, even for an authenticated user. Sorting/filtering is interactive but never reads canonical reward/progress records. | Remove fictional figures from the live route; show a truthful empty/unavailable state until a safe, consent-scoped ranked projection is available. Prove two real fixtures, denied private identity disclosure, rank updates after idempotent reward and sign-in/out recovery. |
| DYN-002 | **P0 — misleading/undurable messages** | `/support-messages` | `SupportNetworkLiveCenter` initializes with `getDemoSupportThread`/`getDemoSharedActions`, uses a literal `DEMO_SCHOLAR_ID = "scholar-record"`, optimistic demo send and catches errors to say locally saved. | Never represent a locally synthesized message/action as sent; resolve active Scholar relationship ID by authenticated authority, read source-backed thread, make all mutations error-aware, provide retry and no-data states, test revocation and per-recipient denial. |
| DYN-003 | **P0 — phantom approvals** | `/recommenders/[requestId]` | Ignores route requestId; constructs a `request-demo` letter from `Coach Taylor`, and Approve/Revision only flip local React state. | Resolve authorized request by URL ID, support immutable letter versions, role/consent, durable approval or revision RPC, receipt and reload, reject missing/expired/foreign requests. Do not bypass other canonical recommendation flows. |
| DYN-004 | **P1 — decorative dashboard metrics** | `/family-os`, `/transition-youth-os` and verified shared-role dashboard | `RoleDashboardExperience` gets role constants from `roleDashboards`; all metrics say `Not connected` and cards route elsewhere. `VerifiedRoleActivationBridge` renders this same shell after verified approval; Mentor can also reach it after validation. | Replace shared static metrics with per-role authorized aggregates and the first real action. For each role prove access -> task -> database change -> reload -> approved relationship view -> revocation denial. Keep the authority gates. |
| DYN-005 | **P1 — capability directory presented as OS** | `/athlete-abroad-os` | Sixteen static `pathways` cards link to shared pages; headline metrics are constant text / pathway counts, not user's readiness, application, event, international plan or outcomes. A separate readiness gate exists in layout and must be preserved. | Add a personal global-readiness workspace with persisted milestone, destination, course, application, event and scoped support-state; show real progress and permitted next action. Validate jurisdiction/readiness denial. |
| DYN-006 | **P1 — illustrative intelligence only** | `/role-intelligence` | User manually picks among 13 roles; `buildRoleRecommendations` and `buildRoleScenarios` use role-only illustrative scenarios rather than authorized Scholar Record or contextual evidence. Page acknowledges illustrative status. | Define actual evidence inputs, confidence/freshness and human accept/defer/dismiss outcomes; restrict projection to authenticated, approved role and relationship; audit explanations and denied reads. |
| DYN-007 | **P1 — generic experience still thin** | Family/Mentor/Educator/Counselor/Coach/District/Recruiting/Admissions/Employer/Community | Many verified-specific entry pages enforce role/review first, but `VerifiedRoleActivationBridge` sends approved users into shared `RoleDashboardExperience` with route cards and disconnected metrics. This is an incomplete post-approval experience, **not** evidence that role verification is broken. | Implement first meaningful role task per the 15-role matrix, with real authorized data and persistence. Prefer role-specific composed feature services over duplicated OS backend. |
| DYN-008 | **P1 — incomplete individualized intelligence** | `/compass` | Reads A-G subject rows but passes `trustScore={0}` to `CompassCoreCard`; no evidence of actionable durable guided decisions in the inspected page. | Avoid implying a calculated trust score; connect explainable personalized guidance to canonical Scholar Record, support action decisions, and readback. |
| DYN-009 | **P2 — documentation drift** | Historical audits and completion claims | July `MOCK_DATA_INVENTORY` and `RUNTIME_COMPONENT_MAP` still claim `InboxV2`, Scholar-Athlete OS and portfolio shares are demo/static. **Current source contradicts those older claims.** | Reconcile historical inventories to current head and date them. Never use stale docs as proof of a present runtime defect. |

### Confirmed canonical dynamic foundations (do NOT regress or label falsely static)

- `components/messages/InboxV2.tsx`: now requests `/api/support-network/messages`, `/api/network/messages`, `/api/groups/messages` and related safety state; the older inventory is stale. Feature-level RLS/attachment/recovery certification is still open.
- `components/scholar-athlete/ScholarAthleteDashboard.tsx`: now reads authenticated `recruiting_targets`, `nil_deals`, `athlete_eligibility_checks` and `recruiting_visits`, with explicit loading/error/empty states. Its *downstream* recruiting and eligibility journey remains a separate acceptance gate.
- `app/portfolio/[shareId]/page.tsx`: now calls scoped `resolve_portfolio_share` and handles revoked/expired shares; the historical static fallback assessment is stale.
- `app/feed/page.tsx`: uses `get_feed_page` and authorized reactions/comments/identity projections.
- `app/courses/page.tsx`: uses `/api/learning/courses`, real progress and catalog filtering.
- `app/events/page.tsx`: uses `/api/community/events` and persistent RSVP updates.
- `app/academic-readiness/page.tsx`: reads A-G and application records and writes decision-evidence state.
- `app/brand-partner-os/page.tsx` and `app/brand-partner-os/opportunities/page.tsx`: now read organization, approved campaigns and opportunity drafts via Supabase with governed create/review; live approved-user acceptance is not yet certified.
- All 15 role registration/onboarding/OS destinations have an earlier isolated passing journey. This does not certify their post-login tasks, hosted activation or authorization of arbitrary features.

### 15-role post-onboarding functional closure matrix

| Role | Existing destination | Meaningful durable task required next |
|---|---|---|
| Scholar | `/dashboard` | Add Scholar achievement/evidence, view consistent private record and safe public projection |
| Scholar-Athlete | `/scholar-athlete-os` | Persist recruiting target/visit/eligibility update; verify counts and permitted coach view |
| Transition-Aged Youth | `/transition-youth-os` | Save and revisit personal goal/milestone and restricted support delegation |
| Parent/Guardian | `/family-os` | Accept consent-bound relationship, act on authorized task, revoke access |
| Mentor | `/mentor-os` | Activate verified relationship and persist supported check-in/next action |
| Educator | `/educator-os` | Review permitted student case, save bounded intervention, block foreign roster |
| Counselor | `/counselor-os` | Post scoped guidance/application milestone, block unrelated student |
| Coach | `/coach-os` | Manage verified athlete recommendation/support item with roster boundary |
| College Coach | `/recruiting-os` | Record governed recruiting intent with permitted candidate interaction |
| Admissions | `/admissions-os` | Take bounded review action on consented application without broad Scholar access |
| Brand Partner | `/brand-partner-os` | Maintain verified organization, submit listing, observe independent review outcome |
| Employer | `/employer-os` | Create scoped opportunity and process consented applicant step |
| District | `/district-os` | Read institution-authorized aggregates, save bounded action, reject foreign school |
| Athlete Abroad | `/athlete-abroad-os` | Save destination readiness milestones, link real course and application evidence |
| Community Partner | `/community-partner-os` | Complete approved scope, submit governed service/referral with receipt |

### Roadmap/system acceptance strategy

1. **P0 truth + safety:** Remove demo identities from live leaderboard; eliminate simulated send/approval actions in support messages and recommenders. Never create a false durable success state. Preserve private user content and already approved relationships.
2. **P0 runtime capability census:** Inventory all App Router `page.tsx`, route handlers, component imports and catalog capabilities; classify as `DYNAMIC_PERSISTED`, `DYNAMIC_READ_ONLY`, `STATIC_INFORMATIONAL`, `SHELL_LINK_OUT`, `DEMO_IN_PRODUCTION`, `BROKEN`, `BLOCKED_BY_AUTHORITY`, or `NOT_INSPECTED`. Every reachable registered route gets source path, data read/write owner, RLS, fixture, owner, current SHA and evidence. Treat 107 non-Founder catalog entries as the business-facing scope, not proof of 107 working capabilities.
3. **P1 build role workspaces:** Connect canonical services using verified identity/relationship per role; show genuine owner-specific counts and pending tasks; add meaningful persisted action (not just hyperlink) in each 15 OS entries.
4. **P1 functional acceptance:** For each capability: authenticated happy path, wrong-role/foreign-user denial, database readback and reload, empty/error states, mobile keyboard/accessibility, retry/idempotency, and audit evidence.
5. **P0 release gates:** Real hosted activation and signing, end-to-end 15-role tests, entire 107-capability ledger, migration/source replay, production security/rollback and founder release approval remain separate gates. Original Mac PBOS state and authority must not be touched by this source audit.

## Key inspected evidence

- `app/leaderboard/page.tsx`
- `components/support-network-live/SupportNetworkLiveCenter.tsx`
- `app/recommenders/[requestId]/page.tsx`
- `components/role-os/dashboards/RoleDashboardExperience.tsx`, `lib/role-os/roleDashboards.ts`
- `components/role-os/VerifiedRoleActivationBridge.tsx`, `components/mentor/MentorValidationExperience.tsx`
- `app/athlete-abroad-os/page.tsx` + readiness `layout.tsx`
- `components/role-intelligence/RoleIntelligenceCenter.tsx`, `app/compass/page.tsx`
- `components/messages/InboxV2.tsx`, `components/scholar-athlete/ScholarAthleteDashboard.tsx`
- `app/portfolio/[shareId]/page.tsx`, `app/feed/page.tsx`, `app/courses/page.tsx`, `app/events/page.tsx`, `app/academic-readiness/page.tsx`
- `app/brand-partner-os/page.tsx`, `app/brand-partner-os/opportunities/page.tsx`
- Existing `docs/audits/MOCK_DATA_INVENTORY.md`, `docs/audits/RUNTIME_COMPONENT_MAP.md` (**historical, partly superseded**)
- `docs/USER_JOURNEYS.md`, `docs/design/FUNCTIONAL_WIRING_BACKLOG.md`, `docs/ENGINEERING/CAPABILITY_CERTIFICATION_STANDARD.md`.

## Signoff status

**CONFIRMED SOURCE-LEVEL DEFECTS:** DYN-001–DYN-008 (degree differs); DYN-009 documentation drift.

**NOT YET PROVEN:** live production reachability and actual current deployed SHA for every route, deployed database/RLS/access policies, full raw route census, all 107 runtime journeys, feature-specific mobile/accessibility and live hosted authority. Do not interpret this report or passing CI as a full-system certification.
