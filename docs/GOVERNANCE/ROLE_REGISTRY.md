# Role Registry

> Canonical registry for all Playbook Platform roles.

**Status:** Draft

This document serves as the single source of truth for role definitions, onboarding, operating systems, permissions, routing, and record creation.

The contents of this file are generated and maintained through repository inspection and verified implementation.

# Role Registry

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
| High School Coach | VERIFIED: `coach` signup option. | VERIFIED: `ROLE_ONBOARDING.coach`. | PARTIAL: pathway/navigation route to `/mentor-os`, while role destination helper maps coach-like roles to `/educator-os`. | PARTIAL: no dedicated dashboard; uses Mentor OS label/route in navigation. | MISSING: no coach-specific relationship kind; role destination helper groups coach with educator. | VERIFIED: `coach` Playbook Graph enum. | PARTIAL: model supports coach records; onboarding completion does not create record. | MISSING: athlete/scholar roster relationship workflow not found. | PARTIAL: official school email captured; no approval workflow verified. | PARTIAL |
| College Coach / Recruiter | VERIFIED: `college-coach` signup option. | VERIFIED: `ROLE_ONBOARDING["college-coach"]`. | VERIFIED/PARTIAL: `/university-os` is wired, but not a dedicated Recruiting OS route. | PARTIAL: uses University OS dashboard, not a dedicated recruiting dashboard. | PARTIAL: university partner permissions exist; no college-coach-specific kind found. | VERIFIED/PARTIAL: `organization` enum can represent institution; no college-coach enum found. | PARTIAL: model supports organization records; onboarding completion does not create record. | MISSING: access to Scholar-Athlete Records not wired to verified recruiting workflow. | PARTIAL: institutional/NCAA fields captured; no approval workflow verified. | PARTIAL |
| College Admissions Officer | VERIFIED: `college-admissions` signup option. | VERIFIED: `ROLE_ONBOARDING["college-admissions"]`. | VERIFIED/PARTIAL: `/university-os` is wired, but not a dedicated Admissions OS route. | PARTIAL: uses University OS dashboard, not a dedicated admissions dashboard. | VERIFIED/PARTIAL: university partner permissions fit admissions; no admissions-specific kind found. | VERIFIED/PARTIAL: `organization` enum can represent institution; no admissions enum found. | PARTIAL: model supports organization records; onboarding completion does not create record. | MISSING: scholar search/access is not wired to admissions criteria workflow. | PARTIAL: official .edu email captured; no approval workflow verified. | PARTIAL |
| Transition-Aged Youth | VERIFIED: `transition-youth` signup option. | VERIFIED: `ROLE_ONBOARDING["transition-youth"]`. | VERIFIED/PARTIAL: `/dashboard` in pathway/navigation; no dedicated TAY OS route. | PARTIAL: uses Scholar dashboard. | PARTIAL: no TAY-specific relationship kind; likely scholar permissions by fallback only. | PARTIAL: no TAY enum; closest Playbook Graph type is `scholar`. | PARTIAL: model can likely use scholar record; onboarding completion does not create it. | PARTIAL: Scholar Record concepts apply; TAY-specific record not verified. | PARTIAL: support/life-context fields captured through Scholar Support; no TAY verification workflow found. | PARTIAL |
| Employer | VERIFIED: `employer` signup option. | MISSING: no `ROLE_ONBOARDING.employer` entry found, so onboarding falls back to Scholar if requested directly. | PARTIAL/MISSING: navigation has `/employer-os`, but pathway map has no `employer` entry and auth completion may default elsewhere. | VERIFIED: `app/employer-os/page.tsx` exists. | VERIFIED: `employer_partner` permissions exist. | VERIFIED/PARTIAL: `organization` enum fits employer records; no employer-specific enum found. | PARTIAL: model supports organization records; onboarding completion does not create record. | MISSING: not applicable except candidates; no access workflow verified. | MISSING: employer verification workflow not found. | MISSING |
| Other | VERIFIED: `other` signup option. | VERIFIED: `ROLE_ONBOARDING.other`. | VERIFIED/PARTIAL: pathway sends to `/pending`; navigation fallback sends to `/dashboard`. | PARTIAL: no dedicated dashboard; fallback Playbook navigation/dashboard. | MISSING: no `other` relationship kind or permissions found. | MISSING: no `other` Playbook Graph enum. | MISSING: no record creation found. | MISSING: not applicable unless later assigned a scholar-like role. | PARTIAL: pending page exists, but review workflow is not verified. | PARTIAL |

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
