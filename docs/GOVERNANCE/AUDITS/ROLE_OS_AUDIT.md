# Role OS Audit

Permanent architecture audit. Canonical role wiring lives in `docs/GOVERNANCE/ROLE_REGISTRY.md`; where this audit identifies role-wiring gaps, the registry is the coordinating source of truth.

Repository-grounded audit of role operating systems as of 2026-07-21.

## Evidence map

- Signup roles are declared in `lib/auth/userPathways.ts`.
- Onboarding/pathway routing is declared in `lib/onboarding/pathwayMap.ts`.
- Shell navigation is declared in `lib/navigation/roleNavigation.ts`.
- Role OS concepts/dashboards/routes are declared in `lib/role-os/*`.
- Relationship permissions are declared in `lib/permissions/*`.
- Database foundations are primarily in `supabase/migrations/20260701_playbook_graph.sql`, `20260704_scholar_athlete_os.sql`, `20260704_support_relationships.sql`, and `202607070001_profile_onboarding_flow.sql`.

## Scholar

### VERIFIED (found in code)
- **Current dashboard:** `/dashboard` renders Scholar Dashboard with transcript upload, A-G tracker, Compass, support network, and community feed CTAs (`app/dashboard/page.tsx`).
- **Current navigation:** Dashboard, Start Here, Transcript, Academic Readiness, Compass, Opportunities, Courses, Messages, Profile (`lib/navigation/roleNavigation.ts`).
- **Current modules:** AGTracker, transcript flow, Compass, opportunities, courses, messages, profile, feed/support-network entry points.
- **Current permissions:** Relationship kind `scholar` can `view_progress`, `view_verified_record`, `view_deadlines`, `support_tasks` (`lib/permissions/rolePermissions.ts`).
- **Current routes:** `/dashboard`, `/start`, `/transcript`, `/academic-readiness`, `/compass`, `/opportunities`, `/courses`, `/messages`, `/profile`, `/support-network`, `/feed`.
- **Current data models:** `profiles` onboarding fields; `playbook_records`, achievements/evidence/verifications/timeline/opportunity/trust tables; support relationships.
- **Live integrations:** VERIFIED: authenticated profile loading, transcript/readiness entry points, support-network/feed routes, and shared navigation are present in code; end-to-end record persistence is NOT VERIFIED.

### PARTIAL (implemented but incomplete)
- **Scholar Record:** Data model and portfolio assembly exist, but onboarding does not create a `playbook_records` row directly.
- **Permissions enforcement:** Permissions are represented and used in UI gates, but many pages are route-accessible without role-specific guards.

### MISSING (no implementation found)
- Automatic Playbook Record creation during onboarding completion.
- Route-level Scholar OS authorization policy across all Scholar routes.

### NOT VERIFIED (insufficient evidence)
- Production RLS coverage for every Scholar table beyond migrations viewed.
- End-to-end transcript-to-A-G-to-Scholar Record persistence.

**Readiness score:** 72/100.

## Scholar-Athlete

### VERIFIED (found in code)
- **Current dashboard:** `/scholar-athlete-os` renders `ScholarAthleteDashboard` with eligibility, recruiting, NIL, financial intelligence, and athlete next actions (`app/scholar-athlete-os/page.tsx`, `components/scholar-athlete/ScholarAthleteDashboard.tsx`).
- **Current navigation:** Athlete Dashboard, Start Here, Transcript, Academic Readiness, Compass, Opportunities, Courses, Messages, Profile.
- **Current modules:** Eligibility intelligence, recruiting pipeline summary, NIL portfolio summary, financial intelligence, transcript/A-G/Compass shared modules.
- **Current permissions:** No scholar-athlete-specific permission kind; uses scholar-like support model in relationship permissions.
- **Current routes:** `/scholar-athlete-os`, plus shared Scholar routes.
- **Current data models:** `athlete_profiles`, `athlete_eligibility_checks`, `recruiting_targets`, `nil_deals`, `athlete_financial_entries`, plus Playbook Graph tables.
- **Live integrations:** PARTIAL: dashboard and route are wired; authenticated athlete table persistence from onboarding is NOT VERIFIED.

### PARTIAL (implemented but incomplete)
- Dashboard uses mostly demo/static summaries rather than authenticated athlete profile data.
- Athlete onboarding captures data, but direct persistence to athlete-specific tables is not shown.

### MISSING (no implementation found)
- Scholar-athlete-specific permissions and route authorization.
- Automatic athlete profile creation from onboarding fields.

### NOT VERIFIED (insufficient evidence)
- NCAA/NAIA compliance verification workflow beyond fields and labels.

**Readiness score:** 65/100.

## Brand Partner

### VERIFIED (found in code)
- **Current dashboard:** `/brand-partner-os` loads the current profile and displays organization, category, partnership goals, budget, plus campaign action cards (`app/brand-partner-os/page.tsx`).
- **Current navigation:** Partner Dashboard, Opportunities, Courses, Messages, Profile.
- **Current modules:** Campaign builder concepts, reward campaign, NIL education/sponsorship, internships, course funding.
- **Current permissions:** No direct brand-partner relationship kind; employer partner permissions exist for opportunity creation/review candidates.
- **Current routes:** `/brand-partner-os`, `/opportunities`, `/courses`, `/messages`, `/profile`; API route `/api/brand-partners/campaigns`.
- **Current data models:** onboarding data in `profiles`; NIL/store campaign persistence via brand campaign API and migrations for store/NIL economy.
- **Live integrations:** PARTIAL: profile loading and campaign API route exist; create/edit campaign UI and compliance workflow are not verified.

### PARTIAL (implemented but incomplete)
- Campaign action UI buttons are labeled “Coming Next.”
- Brand Partner is in signup and onboarding but not represented in `role-os` shared dashboard role types.

### MISSING (no implementation found)
- Brand Partner-specific permission mapping.
- Full create/edit/manage campaign UI.
- Route-level partner authorization.

### NOT VERIFIED (insufficient evidence)
- Compliance approval workflow for NIL campaigns after onboarding.

**Readiness score:** 50/100.

## Family

### VERIFIED (found in code)
- **Current dashboard:** `/family-os` renders `RoleDashboardExperience` for `family` with progress/deadline/scholarship metrics and role intelligence.
- **Current navigation:** Family Dashboard, Opportunities, Courses, Messages, Profile.
- **Current modules:** Progress briefing, deadlines, family actions, opportunity support, messages, role intelligence.
- **Current permissions:** `parent_guardian` can `view_progress`, `view_deadlines`, `support_tasks`.
- **Current routes:** `/family-os`, `/opportunities`, `/courses`, `/messages`, `/profile`, support-network API routes.
- **Current data models:** `support_relationships`, `support_invitations`, `support_messages`, `shared_actions`, `profiles.onboarding_data`.
- **Live integrations:** PARTIAL: support-network APIs/tables exist; verified dependent-scholar linkage is not verified.

### PARTIAL (implemented but incomplete)
- Dashboard is role-config/demo-driven and not clearly connected to a selected dependent scholar.
- Family onboarding captures dependent identifiers but no verified relationship creation is shown.

### MISSING (no implementation found)
- Dependency/household linking workflow that verifies scholar consent or invite code.
- Family-specific route authorization.

### NOT VERIFIED (insufficient evidence)
- Whether family users can only see authorized scholars in production.

**Readiness score:** 58/100.

## Mentor

### VERIFIED (found in code)
- **Current dashboard:** `/mentor-os` renders `RoleDashboardExperience` for `mentor` with active scholars, check-ins, opportunities, encouragement wins.
- **Current navigation:** Mentor Dashboard, Opportunities, Courses, Messages, Profile.
- **Current modules:** Weekly check-ins, scholar goals, opportunity coaching, encouragement, role intelligence, messages.
- **Current permissions:** `mentor` can `view_progress`, `recommend_actions`, `support_tasks`.
- **Current routes:** `/mentor-os`, `/mentor-connect`, `/mentorship`, `/opportunities`, `/messages`, `/profile`.
- **Current data models:** support relationships/messages/actions plus mentor directory API.
- **Live integrations:** PARTIAL: mentor routes and support APIs exist; live scholar assignment is not verified.

### PARTIAL (implemented but incomplete)
- Mentor dashboard is role-config/demo-driven; live assignment to actual scholars is not clearly wired.
- Mentor directory exists, but support-network connection lifecycle is separate.

### MISSING (no implementation found)
- Mentor verification/approval state beyond onboarding fields.
- Mentor-specific route authorization.

### NOT VERIFIED (insufficient evidence)
- Background checks, youth-safety review, or mentor eligibility process.

**Readiness score:** 60/100.

## Educator

### VERIFIED (found in code)
- **Current dashboard:** `/educator-os` renders `RoleDashboardExperience` for `educator` with cohort, A-G alerts, verifications, interventions.
- **Current navigation:** Educator Dashboard, Academic Readiness, Opportunities, Courses, Messages, Profile.
- **Current modules:** Cohort signals, A-G risk, verification requests, interventions, academic readiness, role intelligence.
- **Current permissions:** `educator` can `view_progress`, `verify_evidence`, `recommend_actions`, `view_cohort`.
- **Current routes:** `/educator-os`, `/academic-readiness`, `/opportunities`, `/courses`, `/messages`, `/profile`.
- **Current data models:** Playbook Graph verification tables; `profiles` official school email/context; support relationships.
- **Live integrations:** PARTIAL: verification-oriented permissions/tables and educator OS route exist; live verification queue/cohort data is not verified.

### PARTIAL (implemented but incomplete)
- Verification request capability is displayed, but no complete educator verification queue was found.
- Cohort metrics appear static/config-based.

### MISSING (no implementation found)
- Institutional educator verification approval workflow.
- Educator-specific route authorization.

### NOT VERIFIED (insufficient evidence)
- FERPA/school data-sharing controls beyond high-level fields and permissions.

**Readiness score:** 62/100.

## High School Coach

### VERIFIED (found in code)
- **Current dashboard:** Navigation sends coach to `/mentor-os` labeled Coach OS.
- **Current navigation:** Coach Dashboard, Academic Readiness, Opportunities, Courses, Messages, Profile.
- **Current modules:** Coach onboarding fields for school verification, team details, athlete advocacy; dashboard inherits Mentor OS experience.
- **Current permissions:** `coach` alias maps to educator OS destination in `roleRoutes`, but shell navigation maps to Mentor OS; no coach-specific permission kind.
- **Current routes:** `/mentor-os`, `/academic-readiness`, shared routes.
- **Current data models:** Coach details stored in `profiles.onboarding_data`; athlete/recruiting tables exist separately.
- **Live integrations:** PARTIAL: coach onboarding/navigation are wired; roster, film, and athlete relationship integrations are not verified.

### PARTIAL (implemented but incomplete)
- Coach has onboarding but no dedicated dashboard implementation.
- Route destination is inconsistent between `lib/navigation/roleNavigation.ts` and `lib/role-os/roleRoutes.ts`.

### MISSING (no implementation found)
- Dedicated Coach OS route/dashboard.
- Coach-to-roster data model and athlete relationship workflow.
- Coach-specific permissions.

### NOT VERIFIED (insufficient evidence)
- School/coach verification process after official email capture.

**Readiness score:** 42/100.

## College Coach / Recruiter

### VERIFIED (found in code)
- **Current dashboard:** Navigation routes to `/university-os` labeled Recruiting OS.
- **Current navigation:** Recruiting Dashboard, Opportunities, Messages, Profile.
- **Current modules:** Recruiting onboarding fields; University OS verified talent/pathway fit/recruitment dashboard.
- **Current permissions:** University partner permissions can `view_verified_record` and `recommend_actions`; no college-coach-specific permission kind.
- **Current routes:** `/university-os`, `/opportunities`, `/messages`, `/profile`.
- **Current data models:** Recruiting targets and athlete profiles exist; college coach preferences persist only in `profiles.onboarding_data`.
- **Live integrations:** PARTIAL: shared University OS and athlete/recruiting tables exist; live recruiting discovery is not verified.

### PARTIAL (implemented but incomplete)
- Uses University OS rather than a dedicated recruiting OS.
- Recruiting discovery/filtering UI is not clearly implemented.

### MISSING (no implementation found)
- Institutional recruiting authorization workflow.
- Dedicated college coach permissions and route guard.
- Live athlete discovery connected to verified Scholar-Athlete Records.

### NOT VERIFIED (insufficient evidence)
- NCAA communication/compliance enforcement.

**Readiness score:** 45/100.

## College Admissions Officer

### VERIFIED (found in code)
- **Current dashboard:** Navigation routes to `/university-os` labeled Admissions OS.
- **Current navigation:** Admissions Dashboard, Opportunities, Messages, Profile.
- **Current modules:** Admissions onboarding fields; University OS verified scholars/readiness/pathway fit/recruitment dashboard.
- **Current permissions:** University partner permissions can `view_verified_record`, `recommend_actions`.
- **Current routes:** `/university-os`, `/opportunities`, `/messages`, `/profile`.
- **Current data models:** Admissions criteria live in `profiles.onboarding_data`; Playbook Graph has verified records/opportunity matches.
- **Live integrations:** PARTIAL: shared University OS and criteria capture exist; live scholar discovery is not verified.

### PARTIAL (implemented but incomplete)
- Admissions-specific criteria are collected but no dedicated admissions workflow was found.
- University OS dashboard is demo/config-driven.

### MISSING (no implementation found)
- Institution verification/approval workflow.
- Dedicated admissions permissions and route guard.
- Live scholar search connected to admissions criteria.

### NOT VERIFIED (insufficient evidence)
- Student consent and institutional data-sharing controls.

**Readiness score:** 47/100.

## Transition-Aged Youth

### VERIFIED (found in code)
- **Current dashboard:** Pathway routes to `/dashboard`; shell navigation label is TAY OS with Dashboard, Start Here, Compass, shared routes.
- **Current navigation:** Dashboard, Start Here, Compass, Opportunities, Courses, Messages, Profile.
- **Current modules:** Scholar support, academic baseline, goals, athlete profile, activities, support network.
- **Current permissions:** No TAY-specific permission kind; effectively Scholar/shared support model.
- **Current routes:** `/dashboard`, `/start`, `/compass`, shared routes.
- **Current data models:** `profiles.onboarding_data`, Playbook Graph, support relationships.
- **Live integrations:** PARTIAL: scholar-style dashboard/navigation and onboarding exist; TAY-specific service integrations are not verified.

### PARTIAL (implemented but incomplete)
- TAY onboarding exists, but dashboard is generic Scholar Dashboard.
- Athlete profile step is included for all TAY, even where athletics may be optional.

### MISSING (no implementation found)
- Dedicated TAY OS dashboard/modules for housing, employment, services, case support.
- TAY-specific permission model.

### NOT VERIFIED (insufficient evidence)
- Sensitive youth support/privacy workflows.

**Readiness score:** 45/100.

## Employer

### VERIFIED (found in code)
- **Current dashboard:** `/employer-os` renders `RoleDashboardExperience` for `employer` with talent, career readiness, internships, skills.
- **Current navigation:** Employer Dashboard, Opportunities, Messages, Profile.
- **Current modules:** Talent pipeline, career pathways, trust signals, workforce readiness, role intelligence.
- **Current permissions:** `employer_partner` can `view_verified_record`, `create_opportunities`, `review_candidates`.
- **Current routes:** `/employer-os`, `/opportunities`, `/messages`, `/profile`.
- **Current data models:** Playbook Graph opportunity matches; employer role in role OS; no employer onboarding fields in `ROLE_ONBOARDING`.
- **Live integrations:** PARTIAL: Employer OS route and permission kind exist; onboarding, candidate review, and moderation workflows are not verified.

### PARTIAL (implemented but incomplete)
- Employer is listed in signup and role OS, but is not present in onboarding pathway map or role onboarding steps.
- Dashboard is config/demo-driven.

### MISSING (no implementation found)
- Employer onboarding implementation.
- Employer route in pathway map.
- Employer verification/approval workflow.

### NOT VERIFIED (insufficient evidence)
- Live candidate review workflow and opportunity posting moderation.

**Readiness score:** 40/100.

## Other / Community Partner

### VERIFIED (found in code)
- **Current dashboard:** Pathway map routes `other` to `/pending`; shell navigation fallback home is `/dashboard`.
- **Current navigation:** Dashboard, Opportunities, Courses, Messages, Profile.
- **Current modules:** Identity, network invite, user agreement onboarding only.
- **Current permissions:** No dedicated permission kind.
- **Current routes:** `/pending`, fallback `/dashboard`, shared routes.
- **Current data models:** `profiles` requested role/verification/onboarding fields.
- **Live integrations:** PARTIAL: pending page reads profile verification status; manual review/assignment workflow is not verified.

### PARTIAL (implemented but incomplete)
- Pending page has review-state UI, but signup email redirect uses `/pending` while Start completion routes by pathway.

### MISSING (no implementation found)
- Formal role review/admin assignment workflow for “Other.”
- Dedicated Community Partner OS.

### NOT VERIFIED (insufficient evidence)
- Manual approval process and expiry fields, despite pending UI referencing them.

**Readiness score:** 30/100.

## Cross-role gaps

### VERIFIED (found in code)
- Role-aware shell navigation exists and reads `profiles.role/profile_mode`.
- Relationship permissions exist and are displayed through `PermissionGate`.
- Support-network tables/APIs exist for invitations, relationships, messages, summaries, and actions.

### PARTIAL (implemented but incomplete)
- Multiple role systems exist in parallel: signup pathways, onboarding pathways, shell navigation, `role-os` roles, and role destinations are not fully normalized.
- Most role dashboards are config-driven and not always backed by authenticated live data.

### MISSING (no implementation found)
- Central role registry that binds role, onboarding, OS route, permissions, data model, dashboard component, and authorization policy.
- Consistent route guards for role OS pages.
- Automatic creation/linking of Playbook Records and role-specific records from onboarding.

### NOT VERIFIED (insufficient evidence)
- Production deployment policies, complete RLS state, and real data lifecycle tests.
