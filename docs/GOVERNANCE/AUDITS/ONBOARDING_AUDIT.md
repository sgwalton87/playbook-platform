# Onboarding Audit

Permanent architecture audit. Canonical role wiring lives in `docs/GOVERNANCE/ROLE_REGISTRY.md`; where this audit identifies role-wiring gaps, the registry is the coordinating source of truth.

Repository-grounded audit of onboarding by role as of 2026-07-21.

## Evidence map

- Signup entry point: `app/login/page.tsx`.
- Email confirmation page: `app/check-email/page.tsx`.
- Onboarding runner: `app/start/page.tsx`.
- Role pathway map: `lib/onboarding/pathwayMap.ts`.
- Role-specific onboarding steps/fields: `lib/onboarding/roleOnboarding.ts`.
- Signup role choices: `lib/auth/userPathways.ts`.
- Profile onboarding columns: `supabase/migrations/202607070001_profile_onboarding_flow.sql`.
- Support invitations/relationships: `app/api/invitations/*`, `supabase/migrations/20260704_support_relationships.sql`.

## Shared onboarding implementation

### VERIFIED (found in code)
- Signup supports email/password, Google OAuth, optional HCaptcha, role metadata, and email confirmation redirects.
- `/start` requires an authenticated user, loads/creates a safe profile object, renders role-specific steps, autosaves profile fields, sends invitations on the `network` step, requires community safety agreement on final step, marks `onboarding_completed`, and redirects to `getPathway(role).osRoute`.
- Onboarding completion persists to `profiles` via upsert, including `role`, profile basics, onboarding JSON, completion timestamps, public profile completeness, and safety-agreement fields.

### PARTIAL (implemented but incomplete)
- Required fields are mostly browser/UI level only for login credentials; role onboarding fields are not centrally marked required in the step schema.
- Verification status is stored as metadata during signup/profile migration, but role-specific verification approval is not implemented in the onboarding runner.

### MISSING (no implementation found)
- Automatic Playbook Record creation at onboarding completion.
- Automatic Scholar Record creation at onboarding completion.
- Automatic role-specific record creation for athlete, family/dependent, mentor, educator, coach, university/admissions, employer, or brand partner.

### NOT VERIFIED (insufficient evidence)
- Email confirmation callback implementation and production email deliverability.

## Scholar

### VERIFIED (found in code)
- **Entry point:** Signup role `scholar`; after auth, `/start` uses Scholar steps; completion routes to `/dashboard`.
- **Required fields:** Login requires email/password; identity includes full name, username, bio; academic fields include school, district, grade, GPA, graduation year, dream school, top schools; support/goals/activities/network/safety steps exist.
- **Verification:** Signup metadata sets `verification_status: email_pending`; no role-specific approval required for Scholar found.
- **Profile creation:** `profiles` upsert on every step and completion.
- **Playbook Record creation:** Playbook Graph model exists.
- **Scholar Record creation:** Scholar Record/portfolio builder exists outside onboarding.
- **OS assignment:** `/dashboard` via pathway map.
- **Support Network step:** `network` step captures supporter emails and calls `/api/invitations/send`.
- **Completion state:** `onboarding_completed`, `onboarding_completed_at`, `public_profile_complete`, safety agreement fields.

### PARTIAL (implemented but incomplete)
- Required field enforcement is weak; most onboarding fields can be skipped.
- Scholar Record exists as an assembled/read model, not a clear onboarding-created record.

### MISSING (no implementation found)
- Direct creation of `playbook_records` during completion.
- Direct creation of a durable Scholar Record table row during completion.

### NOT VERIFIED (insufficient evidence)
- Whether profile upsert is backed by RLS policies allowing all needed writes.

## Scholar-Athlete

### VERIFIED (found in code)
- **Entry point:** Signup role `scholar-athlete`; `/start` uses Scholar-Athlete steps; completion routes to `/scholar-athlete-os`.
- **Required fields:** Identity, scholar support, academic baseline, athlete profile, athlete recruiting, activities, network, safety agreement.
- **Verification:** Email metadata only; athlete-specific verification fields include recruiting/eligibility inputs.
- **Profile creation:** `profiles` upsert stores onboarding data.
- **Playbook Record creation:** Playbook Graph supports `scholar_athlete` record type.
- **Scholar Record creation:** Scholar Record builder exists outside onboarding.
- **OS assignment:** `/scholar-athlete-os`.
- **Support Network step:** Present and sends invitations.
- **Completion state:** Same shared profile completion fields.

### PARTIAL (implemented but incomplete)
- Athlete-specific tables exist but onboarding does not insert `athlete_profiles`, eligibility checks, recruiting targets, or NIL records.
- Scholar Record creation is not tied to onboarding completion.

### MISSING (no implementation found)
- Automatic athlete profile/eligibility/recruiting seed record creation.
- Compliance verification workflow.

### NOT VERIFIED (insufficient evidence)
- Data mapping from onboarding keys like `primary_sport` to migration columns like `sport`.

## Brand Partner

### VERIFIED (found in code)
- **Entry point:** Signup role `brand-partner`; `/start` uses Brand Partner steps; completion routes to `/brand-partner-os`.
- **Required fields:** Identity, partnership profile, compliance, network, safety agreement.
- **Verification:** Compliance acknowledgement and approval contact fields exist.
- **Profile creation:** `profiles` upsert stores brand context.
- **Playbook Record creation:** Organization record type exists in Playbook Graph.
- **Scholar Record creation:** Not applicable except where brand supports scholars.
- **OS assignment:** `/brand-partner-os`.
- **Support Network step:** Present and sends invitations.
- **Completion state:** Shared profile completion fields.

### PARTIAL (implemented but incomplete)
- Brand compliance is captured as data but not routed into an approval workflow.
- Campaign API exists, but onboarding completion does not create partner organization/campaign records.

### MISSING (no implementation found)
- Partner organization record creation.
- Brand/NIL compliance review queue.

### NOT VERIFIED (insufficient evidence)
- Whether brand partners should invite support network members during onboarding or a different organization team step.

## Family

### VERIFIED (found in code)
- **Entry point:** Signup role `family`; `/start` uses Family steps; completion routes to `/family-os`.
- **Required fields:** Identity, relationship to scholar, invite code/dependent name/email, household scholars, contact method, family focus, network, safety agreement.
- **Verification:** Child invite code/dependent email are collected.
- **Profile creation:** `profiles` upsert stores family context.
- **Playbook Record creation:** Parent record type exists in Playbook Graph.
- **Scholar Record creation:** Not applicable for the family member; should link to scholar.
- **OS assignment:** `/family-os`.
- **Support Network step:** Present and sends invitations.
- **Completion state:** Shared profile completion fields.

### PARTIAL (implemented but incomplete)
- Dependent scholar relationship data is collected but not validated or converted into `support_relationships` by onboarding.

### MISSING (no implementation found)
- Invite-code verification/linking during onboarding.
- Household/dependent record creation.

### NOT VERIFIED (insufficient evidence)
- Consent model for parent/guardian access.

## Mentor

### VERIFIED (found in code)
- **Entry point:** Signup role `mentor`; `/start` uses Mentor steps; completion routes to `/mentor-os`.
- **Required fields:** Identity, organization/company, title, expertise, age groups, availability, format, recommendation openness, network, safety agreement.
- **Verification:** Mentor profile data captured.
- **Profile creation:** `profiles` upsert stores mentor context.
- **Playbook Record creation:** Mentor record type exists in Playbook Graph.
- **Scholar Record creation:** Not applicable for mentor; mentor can support scholar records.
- **OS assignment:** `/mentor-os`.
- **Support Network step:** Present and sends invitations.
- **Completion state:** Shared profile completion fields.

### PARTIAL (implemented but incomplete)
- Mentor directory/API exists, but onboarding does not clearly register mentors into a verified mentor directory.

### MISSING (no implementation found)
- Mentor approval/safety verification workflow.
- Scholar assignment/matching at completion.

### NOT VERIFIED (insufficient evidence)
- Background check or youth-protection review requirements.

## Educator

### VERIFIED (found in code)
- **Entry point:** Signup role `educator`; `/start` uses Educator steps; completion routes to `/educator-os`.
- **Required fields:** Identity, school, district, subjects, official school email, existing students, student names, recommendation openness, support focus, network, safety agreement.
- **Verification:** Official school email is captured.
- **Profile creation:** `profiles` upsert stores educator context.
- **Playbook Record creation:** Educator record type exists in Playbook Graph.
- **Scholar Record creation:** Not applicable for educator; verification tables support evidence verification.
- **OS assignment:** `/educator-os`.
- **Support Network step:** Present and sends invitations.
- **Completion state:** Shared profile completion fields.

### PARTIAL (implemented but incomplete)
- Verification fields exist, but no approval workflow or domain validation is shown.
- Student search names are captured but not resolved to scholar relationships.

### MISSING (no implementation found)
- Educator institutional verification process.
- Student roster/cohort creation during onboarding.

### NOT VERIFIED (insufficient evidence)
- FERPA/school consent gating.

## High School Coach

### VERIFIED (found in code)
- **Entry point:** Signup role `coach`; `/start` uses High School Coach steps; shell navigation routes Coach Dashboard to `/mentor-os`; pathway map routes coach completion to `/mentor-os`.
- **Required fields:** Identity, school/city/state/official email, primary sport, coach role, years coaching, roster size, film/recommendation intent, support priorities, network, safety agreement.
- **Verification:** Official school email is captured.
- **Profile creation:** `profiles` upsert stores coach context.
- **Playbook Record creation:** Coach record type exists in Playbook Graph.
- **Scholar Record creation:** Not applicable for coach; should link to scholar-athletes.
- **OS assignment:** `/mentor-os` by pathway map.
- **Support Network step:** Present and sends invitations.
- **Completion state:** Shared profile completion fields.

### PARTIAL (implemented but incomplete)
- Coach onboarding exists, but no dedicated Coach OS or roster linkage exists.
- `roleRoutes` maps coach-like roles to `/educator-os`, creating inconsistent role destination evidence.

### MISSING (no implementation found)
- Coach verification approval.
- Roster/player relationship creation.
- Dedicated Coach OS completion destination.

### NOT VERIFIED (insufficient evidence)
- Whether coach should inherit mentor or educator permissions.

## College Coach / Recruiter

### VERIFIED (found in code)
- **Entry point:** Signup role `college-coach`; `/start` uses College Coach steps; completion routes to `/university-os`.
- **Required fields:** Identity, college name, conference, division, official email, recruiting sport/scope/classes, contact preferences, NCAA/institutional status, network, safety agreement.
- **Verification:** Institutional email and NCAA/institutional verification status are captured.
- **Profile creation:** `profiles` upsert stores recruiting context.
- **Playbook Record creation:** Organization/admin-style record types exist but no college-coach record type.
- **Scholar Record creation:** Not applicable for the coach; should access verified scholar-athlete records.
- **OS assignment:** `/university-os`.
- **Support Network step:** Present and sends invitations.
- **Completion state:** Shared profile completion fields.

### PARTIAL (implemented but incomplete)
- Verification data is captured but not evaluated.
- Recruiting criteria are stored but not connected to athlete discovery.

### MISSING (no implementation found)
- College coach-specific record model.
- Recruiting authorization approval workflow.
- Live matching/search creation at completion.

### NOT VERIFIED (insufficient evidence)
- Compliance constraints for student-athlete contact.

## College Admissions Officer

### VERIFIED (found in code)
- **Entry point:** Signup role `college-admissions`; `/start` uses Admissions steps; completion routes to `/university-os`.
- **Required fields:** Identity, college name, department, region, official email, criteria, target majors, populations, contact preference, engagement opportunities, network, safety agreement.
- **Verification:** Official .edu email captured.
- **Profile creation:** `profiles` upsert stores admissions context.
- **Playbook Record creation:** Organization/admin-style record types exist but no admissions-specific record type.
- **Scholar Record creation:** Not applicable for admissions officer; should access verified Scholar Records.
- **OS assignment:** `/university-os`.
- **Support Network step:** Present and sends invitations.
- **Completion state:** Shared profile completion fields.

### PARTIAL (implemented but incomplete)
- Admissions criteria are collected but not connected to live scholar discovery.

### MISSING (no implementation found)
- Admissions institution verification workflow.
- Dedicated admissions organization/member record.

### NOT VERIFIED (insufficient evidence)
- Student consent for admissions discovery.

## Transition-Aged Youth

### VERIFIED (found in code)
- **Entry point:** Signup role `transition-youth`; `/start` uses Transition-Aged Youth steps; completion routes to `/dashboard`.
- **Required fields:** Identity, scholar support, academic baseline, goals, athlete profile, activities, network, safety agreement.
- **Verification:** Email/profile metadata only.
- **Profile creation:** `profiles` upsert stores TAY context.
- **Playbook Record creation:** Scholar record type exists.
- **Scholar Record creation:** Scholar Record builder exists outside onboarding.
- **OS assignment:** `/dashboard`.
- **Support Network step:** Present and sends invitations.
- **Completion state:** Shared profile completion fields.

### PARTIAL (implemented but incomplete)
- Uses Scholar dashboard and scholar-like onboarding with an athlete profile step.

### MISSING (no implementation found)
- TAY-specific onboarding for housing, workforce, benefits, case support, or transition services.
- Automatic Scholar Record creation.

### NOT VERIFIED (insufficient evidence)
- Privacy/safety workflow for vulnerable youth data.

## Employer

### VERIFIED (found in code)
- **Entry point:** Signup role `employer` exists in `USER_PATHWAYS`.
- **Required fields:** Login email/password only found; no employer onboarding steps found.
- **Verification:** Employer partner permissions exist, but onboarding verification fields are absent.
- **Profile creation:** Signup metadata can store requested role, but `/start` normalization does not recognize employer in `pathwayMap`.
- **Playbook Record creation:** Organization record type exists.
- **Scholar Record creation:** Not applicable.
- **OS assignment:** `/employer-os` exists in Role OS, but onboarding pathway map lacks employer.
- **Support Network step:** Not implemented for employer onboarding because employer role is missing from `ROLE_ONBOARDING`.
- **Completion state:** Not role-specific; employer likely normalizes to Scholar if routed through `/start`.

### PARTIAL (implemented but incomplete)
- Employer has signup copy and a dashboard route, but onboarding is not wired.

### MISSING (no implementation found)
- Employer onboarding steps.
- Employer role alias/pathway map entry.
- Employer verification and organization creation.

### NOT VERIFIED (insufficient evidence)
- Whether employers can currently complete onboarding without being misassigned.

## Other / Community Partner

### VERIFIED (found in code)
- **Entry point:** Signup role `other`; `/start` uses Other steps; completion routes to `/pending`.
- **Required fields:** Identity, network, safety agreement.
- **Verification:** Pending route exists and reads verification status.
- **Profile creation:** `profiles` upsert stores identity/onboarding data.
- **Playbook Record creation:** No direct creation found.
- **Scholar Record creation:** Not applicable by default.
- **OS assignment:** `/pending` through pathway map.
- **Support Network step:** Present and sends invitations.
- **Completion state:** Shared profile completion fields.

### PARTIAL (implemented but incomplete)
- Pending page references verification expiry/status concepts, but migration only adds base verification fields in viewed evidence.

### MISSING (no implementation found)
- Admin review/approval assignment from Other to a concrete role.
- Community Partner onboarding profile beyond identity.

### NOT VERIFIED (insufficient evidence)
- Manual operations around pending verification.

## Cross-role missing steps

### VERIFIED (found in code)
- Every role in `ROLE_ONBOARDING` includes identity, network, and community safety steps.
- `sendInvites` runs only when the step id is `network`.

### PARTIAL (implemented but incomplete)
- “Required fields” are implied by product copy, not expressed in the schema as required/optional flags.
- Verification is captured as profile/onboarding data for some roles but not processed.

### MISSING (no implementation found)
- Unified post-completion hook that creates/links profile, Playbook Record, Scholar Record, role-specific records, OS assignment, and permissions.
- Employer onboarding.
- Role-specific verification queues and approval state transitions.

### NOT VERIFIED (insufficient evidence)
- Complete Supabase trigger/function behavior, if any exists outside migrations inspected.

## Remediation Update — August 1, 2026

The previously identified unified completion gap is remediated by the authenticated `/api/onboarding/complete` boundary and transactional `complete_onboarding` database function. Completion now resolves a canonical role profile, creates or reuses the Playbook Record, activates relationships from accepted invitations, and marks the profile complete only after those writes succeed. The operation is idempotent through unique profile/role, active-record, and invitation constraints. A predictable discriminated response separates authentication, validation, and persistence failures, and failed persistence attempts are recorded without setting completion state.

Role-specific downstream products beyond the generic canonical `role_profiles` record remain future domain expansions; this remediation does not claim that every institution-specific workflow or external verification integration is production-certified.

## Trust Hardening Follow-up — August 1, 2026

Invitation acceptance now executes through the transactional `accept_support_invitation` database function. Invitation locking, authenticated email matching, relationship upsert with the invitation permission snapshot, invitation state transition, and lifecycle event creation succeed or roll back together. Repeat acceptance is idempotent, while attempts to reverse an already resolved invitation fail closed. Production completion remains contingent on applying the migration and passing the authenticated Supabase integration gate.
