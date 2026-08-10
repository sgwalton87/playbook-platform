# Role Registry

Permanent architecture document. Related audits: `docs/GOVERNANCE/AUDITS/ONBOARDING_AUDIT.md` and `docs/GOVERNANCE/AUDITS/ROLE_OS_AUDIT.md`.

Canonical role-wiring registry as of 2026-07-21. This document is the repository-grounded control table for keeping signup pathways, onboarding pathways, navigation, role OS routing, permissions, routes, records, and verification workflows synchronized.

## Purpose

The role system is currently distributed across multiple files rather than one executable registry. Until this is converted into a typed source module, use this document as the human-readable source of truth for role wiring and as the checklist for adding or changing a role.

## Status legend

- **VERIFIED:** implementation found in code.
- **PARTIAL:** implementation exists but is incomplete, inconsistent, or not wired end-to-end.
- **MISSING:** no implementation found.
- **NOT VERIFIED:** insufficient repository evidence.

## Canonical role wiring table

| Role | Signup | Onboarding | OS Route | Dashboard | Permissions | Record Type | Playbook Record | Scholar Record | Verification | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Scholar | VERIFIED: `scholar` signup option. | VERIFIED: `ROLE_ONBOARDING.scholar`. | VERIFIED: `/dashboard` in pathway map and navigation. | VERIFIED: `app/dashboard/page.tsx`. | VERIFIED: `scholar` relationship permissions. | VERIFIED: `scholar` Playbook Graph enum. | PARTIAL: data model exists; onboarding completion does not create record. | PARTIAL: record/portfolio assembly exists outside onboarding; no onboarding-created row verified. | PARTIAL: email status exists; no role-specific verification required/found. | PARTIAL |
| Scholar-Athlete | VERIFIED: `scholar-athlete` signup option. | VERIFIED: `ROLE_ONBOARDING["scholar-athlete"]`. | VERIFIED: `/scholar-athlete-os`. | VERIFIED: `app/scholar-athlete-os/page.tsx` and `ScholarAthleteDashboard`. | PARTIAL: no dedicated relationship kind; scholar-like support model only. | VERIFIED: `scholar_athlete` Playbook Graph enum plus athlete tables. | PARTIAL: model supports it; onboarding completion does not create record. | PARTIAL: Scholar Record builder exists outside onboarding. | PARTIAL: athletic compliance fields exist; no approval workflow verified. | PARTIAL |
| Brand Partner | VERIFIED: `brand-partner` signup option. | VERIFIED: `ROLE_ONBOARDING["brand-partner"]`. | VERIFIED: `/brand-partner-os`. | VERIFIED: `app/brand-partner-os/page.tsx`. | MISSING: no brand-partner relationship kind or permission map found. | VERIFIED/PARTIAL: `organization` Playbook Graph enum fits partner records; no brand-specific enum found. | PARTIAL: organization record type exists; onboarding completion does not create it. | MISSING: not applicable except supported scholars; no partner-owned Scholar Record. | PARTIAL: NIL/compliance acknowledgement fields exist; no review queue verified. | PARTIAL |
| Family | VERIFIED: `family` signup option. | VERIFIED: `ROLE_ONBOARDING.family`. | VERIFIED: `/family-os`. | VERIFIED: `app/family-os/page.tsx`. | VERIFIED: `parent_guardian` relationship permissions. | VERIFIED: `parent` Playbook Graph enum. | PARTIAL: model supports parent records; onboarding completion does not create record. | MISSING: family should link to scholar record; link workflow not verified. | PARTIAL: invite/dependent fields exist; no consent/approval workflow verified. | PARTIAL |
| Mentor | VERIFIED: `mentor` signup option. | VERIFIED: `ROLE_ONBOARDING.mentor`. | VERIFIED: `/mentor-os`. | VERIFIED: `app/mentor-os/page.tsx`. | VERIFIED: `mentor` relationship permissions. | VERIFIED: `mentor` Playbook Graph enum. | PARTIAL: model supports mentor records; onboarding completion does not create record. | MISSING: not applicable except assigned scholars; no link creation verified. | MISSING: no mentor eligibility/background/approval workflow found. | PARTIAL |
| Educator | VERIFIED: `educator` signup option. | VERIFIED: `ROLE_ONBOARDING.educator`. | VERIFIED: `/educator-os`. | VERIFIED: `app/educator-os/page.tsx`. | VERIFIED: `educator` relationship permissions. | VERIFIED: `educator` Playbook Graph enum. | PARTIAL: model supports educator records; onboarding completion does not create record. | MISSING: not applicable except supported scholars; no roster/cohort link creation verified. | PARTIAL: official school email captured; no institutional approval workflow verified. | PARTIAL |
| High School Coach | VERIFIED: `coach` signup option. | VERIFIED: `ROLE_ONBOARDING.coach`. | VERIFIED: `/coach-os`. | PARTIAL: dedicated route with an honest zero-state dashboard; no browser certification. | MISSING: coach authority intentionally fails closed until an accepted relationship contract exists. | VERIFIED: `coach` Playbook Graph enum. | PARTIAL: model supports coach records; onboarding completion does not create record. | MISSING: athlete/scholar roster relationship workflow not found. | PARTIAL: official school email captured; no approval workflow verified. | PARTIAL |
| College Coach / Recruiter | VERIFIED: `college-coach` signup option. | VERIFIED: `ROLE_ONBOARDING["college-coach"]`. | VERIFIED: `/recruiting-os`. | PARTIAL: dedicated route with an honest zero-state dashboard; no browser certification. | MISSING: recruiter authority intentionally fails closed until an accepted relationship contract exists. | VERIFIED/PARTIAL: `organization` enum can represent institution; no college-coach enum found. | PARTIAL: model supports organization records; onboarding completion does not create record. | MISSING: access to Scholar-Athlete Records not wired to verified recruiting workflow. | PARTIAL: institutional/NCAA fields captured; no approval workflow verified. | PARTIAL |
| College Admissions Officer | VERIFIED: `college-admissions` signup option. | VERIFIED: `ROLE_ONBOARDING["college-admissions"]`. | VERIFIED: `/admissions-os`. | PARTIAL: dedicated route with an honest zero-state dashboard; no browser certification. | MISSING: admissions authority intentionally fails closed until an accepted relationship contract exists. | VERIFIED/PARTIAL: `organization` enum can represent institution; no admissions enum found. | PARTIAL: model supports organization records; onboarding completion does not create record. | MISSING: scholar search/access is not wired to admissions criteria workflow. | PARTIAL: official .edu email captured; no approval workflow verified. | PARTIAL |
| Transition-Aged Youth | VERIFIED: `transition-youth` signup option. | VERIFIED: `ROLE_ONBOARDING["transition-youth"]`. | VERIFIED: `/transition-youth-os`. | PARTIAL: dedicated route with an honest zero-state dashboard; no browser certification. | PARTIAL: explicitly inherits the existing scholar relationship boundary pending a TAY-specific governance decision. | PARTIAL: no TAY enum; closest Playbook Graph type is `scholar`. | PARTIAL: model can likely use scholar record; onboarding completion does not create it. | PARTIAL: Scholar Record concepts apply; TAY-specific record not verified. | PARTIAL: support/life-context fields captured through Scholar Support; no TAY verification workflow found. | PARTIAL |
| Employer | VERIFIED: `employer` signup option. | MISSING: no `ROLE_ONBOARDING.employer` entry found, so onboarding falls back to Scholar if requested directly. | PARTIAL/MISSING: navigation has `/employer-os`, but pathway map has no `employer` entry and auth completion may default elsewhere. | VERIFIED: `app/employer-os/page.tsx` exists. | VERIFIED: `employer_partner` permissions exist. | VERIFIED/PARTIAL: `organization` enum fits employer records; no employer-specific enum found. | PARTIAL: model supports organization records; onboarding completion does not create record. | MISSING: not applicable except candidates; no access workflow verified. | MISSING: employer verification workflow not found. | MISSING |
| Community Partner (`other`) | VERIFIED: `other` signup option. | VERIFIED: `ROLE_ONBOARDING.other`. | VERIFIED: `/community-partner-os`. | PARTIAL: dedicated route with an honest zero-state dashboard; no browser certification. | MISSING: community-partner authority intentionally fails closed until an accepted relationship contract exists. | MISSING: no community-partner Playbook Graph enum. | MISSING: no record creation found. | MISSING: not applicable unless later assigned a scholar relationship. | PARTIAL: onboarding exists, but review workflow is not verified. | PARTIAL |

## Role details

Each role below expands the canonical table with description, implementation status, and source files. Evidence is repository-only; gaps are labeled MISSING or NOT VERIFIED.

### Scholar
- **Description:** Student/scholar experience for academic readiness, college preparation, opportunities, support network, and public profile/record building.
- **Signup pathway:** VERIFIED: `scholar` in `USER_PATHWAYS`.
- **Onboarding flow:** VERIFIED: `ROLE_ONBOARDING.scholar`; identity, support data, academic baseline, future vision, activities, network, safety agreement.
- **Verification requirements:** PARTIAL: email/profile status only; no role-specific approval workflow found.
- **Playbook Record type:** VERIFIED: `scholar`.
- **Scholar Record applicability:** PARTIAL: applicable, but onboarding-created Scholar Record is not verified.
- **Operating System route:** VERIFIED: `/dashboard`.
- **Dashboard component:** VERIFIED: `app/dashboard/page.tsx`.
- **Navigation configuration:** VERIFIED: `ROLE_NAVIGATION.scholar`.
- **Permission set:** VERIFIED: `scholar` relationship grants `view_progress`, `view_verified_record`, `view_deadlines`, `support_tasks`.
- **Data model(s):** VERIFIED/PARTIAL: `profiles`, Playbook Graph tables, support-network tables.
- **Completion hook:** PARTIAL: `app/start/page.tsx` updates `profiles`; no Playbook Record creation hook found.
- **Current implementation status:** PARTIAL.
- **Source files:** `lib/auth/userPathways.ts`; `lib/onboarding/roleOnboarding.ts`; `lib/onboarding/pathwayMap.ts`; `lib/navigation/roleNavigation.ts`; `lib/permissions/rolePermissions.ts`; `app/start/page.tsx`; `app/dashboard/page.tsx`; `supabase/migrations/20260701_playbook_graph.sql`; `supabase/migrations/20260704_support_relationships.sql`; `supabase/migrations/202607070001_profile_onboarding_flow.sql`.

### Scholar-Athlete
- **Description:** Scholar experience extended for athletics, recruiting, eligibility, NIL, and life-after-sports workflows.
- **Signup pathway:** VERIFIED: `scholar-athlete` in `USER_PATHWAYS`.
- **Onboarding flow:** VERIFIED: `ROLE_ONBOARDING["scholar-athlete"]`; scholar baseline plus athlete profile and recruiting steps.
- **Verification requirements:** PARTIAL: athletic/recruiting fields exist; approval/compliance workflow not verified.
- **Playbook Record type:** VERIFIED: `scholar_athlete`; athlete adjunct tables exist.
- **Scholar Record applicability:** PARTIAL: applicable, but onboarding-created Scholar Record is not verified.
- **Operating System route:** VERIFIED: `/scholar-athlete-os`.
- **Dashboard component:** VERIFIED: `app/scholar-athlete-os/page.tsx`; `components/scholar-athlete/ScholarAthleteDashboard.tsx`.
- **Navigation configuration:** VERIFIED: `ROLE_NAVIGATION["scholar-athlete"]`.
- **Permission set:** PARTIAL: no dedicated relationship kind found.
- **Data model(s):** VERIFIED/PARTIAL: `profiles`, Playbook Graph, `athlete_profiles`, eligibility, recruiting, NIL, athlete finance tables.
- **Completion hook:** MISSING: no athlete profile/record creation at onboarding completion found.
- **Current implementation status:** PARTIAL.
- **Source files:** `lib/auth/userPathways.ts`; `lib/onboarding/roleOnboarding.ts`; `lib/onboarding/pathwayMap.ts`; `lib/navigation/roleNavigation.ts`; `app/scholar-athlete-os/page.tsx`; `components/scholar-athlete/ScholarAthleteDashboard.tsx`; `supabase/migrations/20260704_scholar_athlete_os.sql`; `supabase/migrations/20260701_playbook_graph.sql`.

### Brand Partner
- **Description:** External partner/brand experience for campaigns, rewards, NIL education, sponsorship, internships, and funded opportunities.
- **Signup pathway:** VERIFIED: `brand-partner` in `USER_PATHWAYS`.
- **Onboarding flow:** VERIFIED: `ROLE_ONBOARDING["brand-partner"]`; identity, partner profile, compliance, network, agreement.
- **Verification requirements:** PARTIAL: compliance acknowledgement/contact fields exist; compliance review workflow not verified.
- **Playbook Record type:** PARTIAL: `organization` is available; brand-specific type not found.
- **Scholar Record applicability:** MISSING by ownership; brand may support scholar records but no direct Scholar Record creation/access workflow verified.
- **Operating System route:** VERIFIED: `/brand-partner-os`.
- **Dashboard component:** VERIFIED: `app/brand-partner-os/page.tsx`.
- **Navigation configuration:** VERIFIED: `ROLE_NAVIGATION["brand-partner"]`.
- **Permission set:** MISSING: no brand-partner relationship kind found.
- **Data model(s):** PARTIAL: `profiles.onboarding_data`, organization-capable Playbook Graph, brand campaign API/migrations.
- **Completion hook:** MISSING: no partner organization/campaign setup hook found.
- **Current implementation status:** PARTIAL.
- **Source files:** `lib/auth/userPathways.ts`; `lib/onboarding/roleOnboarding.ts`; `lib/onboarding/pathwayMap.ts`; `lib/navigation/roleNavigation.ts`; `app/brand-partner-os/page.tsx`; `app/api/brand-partners/campaigns/route.ts`; `supabase/migrations/20260701_playbook_graph.sql`.

### Family
- **Description:** Parent/guardian/caregiver support role for monitoring, deadlines, opportunity support, and scholar support actions.
- **Signup pathway:** VERIFIED: `family` in `USER_PATHWAYS`.
- **Onboarding flow:** VERIFIED: `ROLE_ONBOARDING.family`; identity, scholar/dependent context, network, agreement.
- **Verification requirements:** PARTIAL: invite/dependent fields exist; verified consent/link workflow not found.
- **Playbook Record type:** VERIFIED: `parent`.
- **Scholar Record applicability:** MISSING for own record; should link to a scholar record, but link creation is not verified.
- **Operating System route:** VERIFIED: `/family-os`.
- **Dashboard component:** VERIFIED: `app/family-os/page.tsx`.
- **Navigation configuration:** VERIFIED: `ROLE_NAVIGATION.family`.
- **Permission set:** VERIFIED: `parent_guardian` grants `view_progress`, `view_deadlines`, `support_tasks`.
- **Data model(s):** VERIFIED/PARTIAL: `profiles`, support relationships/invitations/messages/actions, Playbook Graph parent type.
- **Completion hook:** MISSING: no family-to-scholar relationship creation on completion found.
- **Current implementation status:** PARTIAL.
- **Source files:** `lib/auth/userPathways.ts`; `lib/onboarding/roleOnboarding.ts`; `lib/onboarding/pathwayMap.ts`; `lib/navigation/roleNavigation.ts`; `lib/permissions/rolePermissions.ts`; `app/family-os/page.tsx`; `supabase/migrations/20260704_support_relationships.sql`.

### Mentor
- **Description:** Trusted adult/advisor role for check-ins, goals, recommendations, opportunity coaching, and encouragement.
- **Signup pathway:** VERIFIED: `mentor` in `USER_PATHWAYS`.
- **Onboarding flow:** VERIFIED: `ROLE_ONBOARDING.mentor`; identity, guidance profile, network, agreement.
- **Verification requirements:** MISSING: no approval/background/eligibility workflow found.
- **Playbook Record type:** VERIFIED: `mentor`.
- **Scholar Record applicability:** MISSING for own record; assigned scholar access/link creation not verified.
- **Operating System route:** VERIFIED: `/mentor-os`.
- **Dashboard component:** VERIFIED: `app/mentor-os/page.tsx`.
- **Navigation configuration:** VERIFIED: `ROLE_NAVIGATION.mentor`.
- **Permission set:** VERIFIED: `mentor` grants `view_progress`, `recommend_actions`, `support_tasks`.
- **Data model(s):** VERIFIED/PARTIAL: `profiles`, support relationships/messages/actions, Playbook Graph mentor type.
- **Completion hook:** MISSING: no mentor-to-scholar assignment/link creation on completion found.
- **Current implementation status:** PARTIAL.
- **Source files:** `lib/auth/userPathways.ts`; `lib/onboarding/roleOnboarding.ts`; `lib/onboarding/pathwayMap.ts`; `lib/navigation/roleNavigation.ts`; `lib/permissions/rolePermissions.ts`; `app/mentor-os/page.tsx`; `app/mentor-connect/page.tsx`; `app/mentorship/page.tsx`.

### Educator
- **Description:** Teacher/educator support role for academic progress, verification, recommendations, cohort signals, and interventions.
- **Signup pathway:** VERIFIED: `educator` in `USER_PATHWAYS`.
- **Onboarding flow:** VERIFIED: `ROLE_ONBOARDING.educator`; identity, school verification context, network, agreement.
- **Verification requirements:** PARTIAL: official school email captured; institutional approval workflow not verified.
- **Playbook Record type:** VERIFIED: `educator`.
- **Scholar Record applicability:** MISSING for own record; access to supported scholar records needs verified relationship/consent not found.
- **Operating System route:** VERIFIED: `/educator-os`.
- **Dashboard component:** VERIFIED: `app/educator-os/page.tsx`.
- **Navigation configuration:** VERIFIED: `ROLE_NAVIGATION.educator`.
- **Permission set:** VERIFIED: `educator` grants `view_progress`, `verify_evidence`, `recommend_actions`, `view_cohort`.
- **Data model(s):** VERIFIED/PARTIAL: `profiles`, Playbook Graph verification tables, support relationships.
- **Completion hook:** MISSING: no educator institution/roster record creation on completion found.
- **Current implementation status:** PARTIAL.
- **Source files:** `lib/auth/userPathways.ts`; `lib/onboarding/roleOnboarding.ts`; `lib/onboarding/pathwayMap.ts`; `lib/navigation/roleNavigation.ts`; `lib/permissions/rolePermissions.ts`; `app/educator-os/page.tsx`; `supabase/migrations/20260701_playbook_graph.sql`.

### High School Coach
- **Description:** High school coach role for team/roster support, athlete advocacy, film/recommendations, and recruiting support.
- **Signup pathway:** VERIFIED: `coach` in `USER_PATHWAYS`.
- **Onboarding flow:** VERIFIED: `ROLE_ONBOARDING.coach`; identity, school verification, coaching details, athlete advocacy, network, agreement.
- **Verification requirements:** PARTIAL: official school email captured; approval workflow not verified.
- **Playbook Record type:** VERIFIED: `coach`.
- **Scholar Record applicability:** MISSING for own record; athlete/scholar roster links not verified.
- **Operating System route:** VERIFIED: `/coach-os`.
- **Dashboard component:** PARTIAL: `app/coach-os/page.tsx` renders the canonical shared role dashboard with an honest zero state; browser acceptance remains pending.
- **Navigation configuration:** VERIFIED: `ROLE_NAVIGATION.coach` points to the distinct route.
- **Permission set:** MISSING: no coach-specific relationship kind found.
- **Data model(s):** PARTIAL: `profiles.onboarding_data`, Playbook Graph coach type, athlete tables exist separately.
- **Completion hook:** MISSING: no coach record/roster creation on completion found.
- **Current implementation status:** PARTIAL.
- **Source files:** `lib/auth/userPathways.ts`; `lib/onboarding/roleOnboarding.ts`; `lib/onboarding/pathwayMap.ts`; `lib/navigation/roleNavigation.ts`; `lib/role-os/roleRoutes.ts`; `supabase/migrations/20260701_playbook_graph.sql`.

### College Coach / Recruiter
- **Description:** Postsecondary recruiting role for institution-specific talent discovery and compliant recruiting communication.
- **Signup pathway:** VERIFIED: `college-coach` in `USER_PATHWAYS`.
- **Onboarding flow:** VERIFIED: `ROLE_ONBOARDING["college-coach"]`; identity, institution verification, recruiting scope, contact/compliance, network, agreement.
- **Verification requirements:** PARTIAL: institutional/NCAA fields captured; verification workflow not found.
- **Playbook Record type:** PARTIAL: `organization` can represent institution; college-coach-specific type not found.
- **Scholar Record applicability:** MISSING: access to verified Scholar-Athlete Records not wired to a verified recruiting workflow.
- **Operating System route:** VERIFIED: `/recruiting-os`.
- **Dashboard component:** PARTIAL: `app/recruiting-os/page.tsx` renders the canonical shared role dashboard with an honest zero state; browser acceptance remains pending.
- **Navigation configuration:** VERIFIED: `ROLE_NAVIGATION["college-coach"]` points to the distinct route.
- **Permission set:** PARTIAL: `university_partner` permissions exist; no college-coach-specific kind found.
- **Data model(s):** PARTIAL: `profiles.onboarding_data`, Playbook Graph organization type, athlete/recruiting tables.
- **Completion hook:** MISSING: no institution/recruiting authorization record creation on completion found.
- **Current implementation status:** PARTIAL.
- **Source files:** `lib/auth/userPathways.ts`; `lib/onboarding/roleOnboarding.ts`; `lib/onboarding/pathwayMap.ts`; `lib/navigation/roleNavigation.ts`; `lib/permissions/rolePermissions.ts`; `app/university-os/page.tsx`; `supabase/migrations/20260704_scholar_athlete_os.sql`.

### College Admissions Officer
- **Description:** Postsecondary admissions role for academic talent discovery, engagement opportunities, and institutional pathways.
- **Signup pathway:** VERIFIED: `college-admissions` in `USER_PATHWAYS`.
- **Onboarding flow:** VERIFIED: `ROLE_ONBOARDING["college-admissions"]`; identity, institution details, criteria, engagement, network, agreement.
- **Verification requirements:** PARTIAL: official .edu email captured; institution approval workflow not verified.
- **Playbook Record type:** PARTIAL: `organization` can represent institution; admissions-specific type not found.
- **Scholar Record applicability:** MISSING: live scholar search/access workflow not verified.
- **Operating System route:** VERIFIED: `/admissions-os`.
- **Dashboard component:** PARTIAL: `app/admissions-os/page.tsx` renders the canonical shared role dashboard with an honest zero state; browser acceptance remains pending.
- **Navigation configuration:** VERIFIED: `ROLE_NAVIGATION["college-admissions"]` points to the distinct route.
- **Permission set:** PARTIAL: `university_partner` permissions fit, no admissions-specific kind found.
- **Data model(s):** PARTIAL: `profiles.onboarding_data`, Playbook Graph organization/verification/match tables.
- **Completion hook:** MISSING: no institution/admissions membership record creation on completion found.
- **Current implementation status:** PARTIAL.
- **Source files:** `lib/auth/userPathways.ts`; `lib/onboarding/roleOnboarding.ts`; `lib/onboarding/pathwayMap.ts`; `lib/navigation/roleNavigation.ts`; `lib/permissions/rolePermissions.ts`; `app/university-os/page.tsx`.

### Transition-Aged Youth
- **Description:** Youth/young adult pathway using scholar-like support with education, work, support context, and optional athletics.
- **Signup pathway:** VERIFIED: `transition-youth` in `USER_PATHWAYS`.
- **Onboarding flow:** VERIFIED: `ROLE_ONBOARDING["transition-youth"]`; scholar support, academic/goals, athlete profile, activities, network, agreement.
- **Verification requirements:** PARTIAL: email/profile status only; TAY-specific workflow not found.
- **Playbook Record type:** PARTIAL: no TAY enum; closest available type is `scholar`.
- **Scholar Record applicability:** PARTIAL: applicable if treated as scholar; onboarding creation not verified.
- **Operating System route:** VERIFIED: `/transition-youth-os`.
- **Dashboard component:** PARTIAL: `app/transition-youth-os/page.tsx` renders the canonical shared role dashboard with an honest zero state; browser acceptance remains pending.
- **Navigation configuration:** VERIFIED: `ROLE_NAVIGATION["transition-youth"]` points to the distinct route.
- **Permission set:** PARTIAL: no TAY-specific relationship kind found.
- **Data model(s):** PARTIAL: `profiles.onboarding_data`, Playbook Graph scholar-like tables, support relationships.
- **Completion hook:** MISSING: no TAY-specific record/link creation on completion found.
- **Current implementation status:** PARTIAL.
- **Source files:** `lib/auth/userPathways.ts`; `lib/onboarding/roleOnboarding.ts`; `lib/onboarding/pathwayMap.ts`; `lib/navigation/roleNavigation.ts`; `app/dashboard/page.tsx`.

### Employer
- **Description:** Workforce partner role for internships, work-based learning, hiring pathways, career exposure, and candidate review.
- **Signup pathway:** VERIFIED: `employer` in `USER_PATHWAYS`.
- **Onboarding flow:** MISSING: no `ROLE_ONBOARDING.employer`; pathway map lacks employer.
- **Verification requirements:** MISSING: employer verification workflow not found.
- **Playbook Record type:** PARTIAL: `organization` can represent employer; employer-specific type not found.
- **Scholar Record applicability:** MISSING: candidate access workflow not verified.
- **Operating System route:** PARTIAL: `/employer-os` navigation/dashboard exists, but onboarding pathway route is missing.
- **Dashboard component:** VERIFIED: `app/employer-os/page.tsx`.
- **Navigation configuration:** VERIFIED: `ROLE_NAVIGATION.employer`.
- **Permission set:** VERIFIED: `employer_partner` grants `view_verified_record`, `create_opportunities`, `review_candidates`.
- **Data model(s):** PARTIAL: Playbook Graph organization/opportunity model; no employer onboarding model found.
- **Completion hook:** MISSING: no employer organization/opportunity setup hook found.
- **Current implementation status:** MISSING.
- **Source files:** `lib/auth/userPathways.ts`; `lib/navigation/roleNavigation.ts`; `lib/permissions/rolePermissions.ts`; `app/employer-os/page.tsx`; `supabase/migrations/20260701_playbook_graph.sql`.

### Community Partner (`other`)
- **Description:** Community partner pathway with distinct OS identity; organization, review, and authority contracts remain incomplete.
- **Signup pathway:** VERIFIED: `other` in `USER_PATHWAYS`.
- **Onboarding flow:** VERIFIED: `ROLE_ONBOARDING.other`; identity, network, agreement.
- **Verification requirements:** PARTIAL: `/pending` reads verification status; manual review workflow not verified.
- **Playbook Record type:** MISSING: no `other` enum found.
- **Scholar Record applicability:** MISSING unless reassigned to scholar-like role; no evidence found.
- **Operating System route:** VERIFIED: `/community-partner-os`.
- **Dashboard component:** PARTIAL: `app/community-partner-os/page.tsx` renders the canonical shared role dashboard with an honest zero state; browser acceptance remains pending.
- **Navigation configuration:** VERIFIED: `ROLE_NAVIGATION.other` points to the distinct route.
- **Permission set:** MISSING: no `other` relationship kind found.
- **Data model(s):** PARTIAL: profile verification/onboarding columns only.
- **Completion hook:** MISSING: no review assignment or record creation hook found.
- **Current implementation status:** PARTIAL.
- **Source files:** `lib/auth/userPathways.ts`; `lib/onboarding/roleOnboarding.ts`; `lib/onboarding/pathwayMap.ts`; `lib/navigation/roleNavigation.ts`; `app/pending/page.tsx`; `supabase/migrations/202607070001_profile_onboarding_flow.sql`.

## Implementation reference table

| Wiring surface | Implementation location | Registry implication | Status |
| --- | --- | --- | --- |
| Signup definition | `lib/auth/userPathways.ts` (`USER_PATHWAYS`) and `app/login/page.tsx`. | Every role in the registry should have exactly one signup option or an explicit “not public signup” decision. | VERIFIED |
| Onboarding schema | `lib/onboarding/roleOnboarding.ts` (`ROLE_ONBOARDING`) and `app/start/page.tsx`. | Every signup role should have a matching onboarding schema unless intentionally routed to review/pending. Employer is currently missing. | PARTIAL |
| Pathway map | `lib/onboarding/pathwayMap.ts` (`PLAYBOOK_PATHWAYS`, `normalizeRole`, `getPathway`). | Every signup/onboarding role should have one canonical OS route. Employer is currently missing; coach/TAY/other are fallback/shared routes. | PARTIAL |
| Navigation | `lib/navigation/roleNavigation.ts` (`ROLE_NAVIGATION`, `getRoleNavigation`). | Navigation home should match the pathway OS route for the same role. Coach and other have inconsistencies with other route maps. | PARTIAL |
| Role destination helper | `lib/role-os/roleRoutes.ts` (`getRoleDestination`, `roleOptions`). | This should either be deprecated in favor of the registry or generated from the same role table. It currently uses different destinations for scholar and coach than the pathway map. | PARTIAL |
| Dashboard component | `app/*-os/page.tsx`, `app/dashboard/page.tsx`, and role dashboard components. | Each role should point to a dedicated dashboard or explicitly declare shared dashboard ownership. | PARTIAL |
| Permission mapping | `lib/permissions/rolePermissions.ts`. | Each relationship-capable role should map to a permission kind. Brand Partner, Coach, College Coach, Admissions, TAY, Other need explicit decisions. | PARTIAL |
| Data model | `supabase/migrations/20260701_playbook_graph.sql`, `20260704_scholar_athlete_os.sql`, `20260704_support_relationships.sql`, `202607070001_profile_onboarding_flow.sql`. | Each role should map to exactly one primary record type plus optional adjunct tables. Some roles share `organization`; TAY/Other lack explicit record types. | PARTIAL |
| Completion hook | `app/start/page.tsx`. | Completion currently updates `profiles`; registry should require per-role record creation/linking hooks. | MISSING |
| Verification workflow | Signup/profile metadata, `/pending`, onboarding fields, and future admin/review tools. | Registry should declare whether verification is email-only, self-attested, institution-approved, compliance-approved, or manually reviewed. Most approval workflows are not implemented. | PARTIAL |

## Required source-of-truth contract for future implementation

When this document is converted into code, each role row should become a typed object with at least these fields:

```ts
type RoleRegistryEntry = {
  role: string;
  label: string;
  signup: {
    public: boolean;
    definition: string;
  };
  onboarding: {
    schemaKey: string | null;
    requiredStepIds: string[];
  };
  routes: {
    osRoute: string;
    dashboardRoute: string;
    sharedRouteOwner?: string;
  };
  navigation: {
    key: string;
    home: string;
  };
  permissions: {
    relationshipKind: string | null;
    grants: string[];
  };
  records: {
    primaryRecordType: string | null;
    createsPlaybookRecordOnCompletion: boolean;
    createsScholarRecordOnCompletion: boolean;
    adjunctTables: string[];
  };
  verification: {
    mode: "email" | "self_attested" | "institution" | "compliance" | "manual_review" | "none";
    workflowLocation: string | null;
  };
  status: "VERIFIED" | "PARTIAL" | "MISSING" | "NOT VERIFIED";
};
```

## Synchronization checklist for adding or changing a role

1. Add/update the public signup role in `USER_PATHWAYS`, or explicitly mark it private/internal.
2. Add/update the role alias in `ROLE_ALIASES` if alternate role strings can arrive from auth metadata or legacy profiles.
3. Add/update the `PLAYBOOK_PATHWAYS` row and OS route.
4. Add/update `ROLE_ONBOARDING` steps, including which fields are required and which verification mode applies.
5. Add/update `ROLE_NAVIGATION` so navigation home matches the pathway OS route.
6. Add/update role destination helpers or remove duplicated route maps in favor of the registry.
7. Add/update permission mapping for the relationship/access model.
8. Add/update database record type mapping and any adjunct role tables.
9. Add/update onboarding completion hooks to create/link records, relationships, and verification requests.
10. Add/update dashboard route/component ownership and route guards.
11. Re-run the role OS and onboarding audits against the registry.
