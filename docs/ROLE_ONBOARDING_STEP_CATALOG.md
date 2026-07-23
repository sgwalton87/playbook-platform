# Role Onboarding Step Catalog

**Authority:** This is the product-readable catalog for `lib/onboarding/roleOnboarding.ts`. The code registry remains the executable source of truth.

**Record model:** Every pathway updates one canonical Playbook Record. A role changes the questions, verification, relationships, permissions, OS projection, and navigation—not who owns the record.

**Network model:** Starting Five is the learner-facing presentation of the canonical Support Network. Both learner and supporter onboarding save one `support_network` collection and use the same invitations, relationships, and permission system. Legacy `starting_five` and `invite_supporters` values are migrated into that collection when a profile loads.

## Shared journey

1. Home page **Sign up** opens `/role-select`.
2. A role card opens `/start?first=1&role=<role>` directly.
3. The user creates an account inside the onboarding shell or resumes an existing session.
4. The selected role's steps render in the same premium, mobile-safe shell.
5. Every pathway begins with Identity and ends with the User Agreement. Learner-owned pathways build a Starting Five; support and institutional roles receive the invitation-based Support Network step.
6. Successful completion saves the canonical record, fires the profile celebration, and opens the mandatory role-aware tutorial.
7. Finishing the tutorial opens the role's OS destination.

Returning users can sign in from the home page or role-selection header without restarting onboarding.

## Exact pathway map

| # | Public role | Ordered onboarding steps | Role-specific information | Destination |
| --- | --- | --- | --- | --- |
| 01 | Scholar | Identity → Support Data → Academic Baseline → Future Vision → Activities → Starting Five → User Agreement | optional support demographics, school/district, grade/GPA, college and career goals, activities, five trusted-adult slots | Scholar OS `/dashboard` |
| 02 | Scholar-Athlete | Identity → Support Data → Academic Baseline → Athletic Profile → Recruiting Goals → Activities → Starting Five → User Agreement | Scholar foundation plus sport, team, position, stats/honors, division, film, eligibility, NIL interests and five trusted adults | Scholar-Athlete OS `/scholar-athlete-os` |
| 03 | Transition-Aged Youth | Identity → Support Data → Academic Baseline → Future Vision → Athletic Profile → Activities → Starting Five → User Agreement | education/work stage, support context, future plans, optional athletics and five trusted adults | TAY OS `/tay-os` |
| 04 | Parent / Guardian | Identity → Scholar Support → Support Network → User Agreement | relationship, scholar invite, household, communication method and support focus | Family OS `/family-os` |
| 05 | Mentor | Identity → Guidance Profile → Support Network → User Agreement | organization, expertise, age groups, availability, format and recommendation preference | Mentor OS `/mentor-os` |
| 06 | Teacher / Educator | Identity → Educator Verification → Support Network → User Agreement | school/district, subjects, official email, student connections and support focus | Educator OS `/educator-os` |
| 07 | High School Counselor | Identity → Institution Verification → Caseload & Programs → Workflow Preferences → Support Network → User Agreement | official school identity, grade levels, caseload size, supported programs, priority workflows and connection rules | Counselor experience `/educator-os` |
| 08 | High School Coach | Identity → School Verification → Coaching Details → Athlete Advocacy → Support Network → User Agreement | school, official email, sport, coaching role, experience, roster, film and recommendation intent | Coach experience `/educator-os` |
| 09 | College Coach / Recruiter | Identity → Institution Verification → Recruiting Scope → Contact & Compliance → Support Network → User Agreement | institution/division, sport/positions, recruiting geography/classes, contact and compliance boundaries | Recruiting experience `/university-os` |
| 10 | College Admissions | Identity → Institution Verification → Admissions Criteria → Engagement Boundaries → Support Network → User Agreement | institution/department, territory, academic criteria, populations and contact boundaries | Admissions experience `/university-os` |
| 11 | Brand Partner | Identity → Partnership Profile → Compliance → Support Network → User Agreement | organization/category, goals, audience, budget, campaign types, NIL acknowledgement and approval contact | Brand Partner OS `/brand-partner-os` |
| 12 | Employer / Workforce Partner | Identity → Organization Verification → Opportunity Design → Youth Safety & Contact → Support Network → User Agreement | organization, official contact, opportunity types, sectors, ages, geography, compensation and safeguards | Employer OS `/employer-os` |
| 13 | District / School Administrator | Identity → Authority Verification → Implementation Scope → Data & Permissions → Support Network → User Agreement | institution/authority, rollout scope, schools, volume, goals, roster method, agreements and permission owners | District OS `/district-os` |
| 14 | Athlete Abroad | Identity → Support Data → Academic Baseline → Athletic Profile → Recruiting Goals → International Goals → Travel & Eligibility Readiness → Starting Five → User Agreement | canonical scholar-athlete record plus countries, abroad goal/timing, languages, passport, travel, guardian, readiness needs and five trusted adults | Athlete Abroad OS `/athlete-abroad-os` |

## Completion status and release gates

| Layer | Status | Evidence / remaining gate |
| --- | --- | --- |
| Public role inventory | Built locally | 14 public roles are registered and visible to role selection. |
| Role-specific step schemas | Built locally | All 14 roles have explicit sequences; no public role falls back silently to Scholar. |
| Route and OS mapping | Built locally | Every role has one onboarding entry and one declared OS destination. |
| Shared shell and mobile recovery | Built locally | Premium `/start` shell, account checkpoint, timeout recovery, and direct role links are present. |
| Schema contract tests | Passing locally | Tests assert 14 pathways, sequence boundaries, unique step IDs, aliases, and missing-role coverage. |
| Persistence and canonical projection | Release validation required | Verify every new field persists, resumes, and projects without creating duplicate records. |
| Relationship permissions and RLS | Release validation required | Validate guardian, mentor, educator, counselor, coach, recruiter, employer, and administrator scopes. |
| Verification workflows | Release validation required | Institutional/organization verification states require end-to-end approval and denial tests. |
| Mobile and browser E2E | Release validation required | Complete role-by-role journeys on iPhone Chrome/Safari and desktop before promotion. |
| Production release | Not authorized | Keep changes on the review branch until desktop review and explicit merge approval. |

## Definition of complete

A role is production-complete only when selection, account creation, step validation, autosave/resume, canonical persistence, relationship permissions, agreement capture, completion redirect, OS navigation, mobile recovery, and end-to-end tests all pass. A visible form alone is not a completed onboarding pathway.
