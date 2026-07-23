# Role-Specific Onboarding Blueprint

**Exact step catalog:** `docs/ROLE_ONBOARDING_STEP_CATALOG.md`

Every pathway writes to one canonical Playbook Record. Roles change the questions, verification, relationships, permissions, navigation, and OS projection—not record ownership.

## Entry and account sequence

1. Homepage signup opens role selection.
2. Selecting a role opens `/start` immediately.
3. A logged-out visitor completes the secure account checkpoint inside the onboarding experience.
4. Email confirmation or Google authentication returns to `/start` with the selected role preserved.
5. The shared premium shell renders the role-specific steps below.
6. Completion projects the canonical record into the correct role OS.

The standalone `/login` page is reserved for returning users and recovery. It is not the primary new-user signup journey.

## Pathway plans

| Role | Unique information collected | Verification / relationship | OS projection |
| --- | --- | --- | --- |
| Scholar | support context, academic baseline, future goals, activities, support network | email, optional trusted supporters | Scholar OS |
| Scholar-Athlete | Scholar foundation plus sport, team, position, stats, recruiting, eligibility, film, and NIL interests | email, later coach/eligibility evidence | Scholar-Athlete OS |
| Transition-Aged Youth | support context, education/work stage, goals, optional athletics, activities, trusted network | email, consent-aware support relationships | TAY/Scholar OS |
| Parent / Guardian | scholar relationship, invite code, household context, communication and support focus | scholar invitation or relationship verification | Family OS |
| Mentor | organization, expertise, age groups, availability, format, recommendation preferences | identity and relationship/invite verification | Mentor OS |
| Teacher / Educator | school/district, subjects, official email, student relationships, support permissions | institutional email and scoped student access | Educator OS |
| High School Counselor | school/district, official email, caseload, programs, milestones and connection workflow | institutional email and scoped caseload access | Counselor experience in Educator OS |
| High School Coach | school, official email, sport, coaching role, roster size, film/recommendation intent | institutional verification and roster scope | Coach/Educator OS |
| College Coach / Recruiter | institution, conference/division, sport/positions, recruiting radius/classes, contact and compliance | institutional authorization | Recruiting experience in University OS |
| College Admissions | institution/department, territory, academic criteria, student populations, engagement boundaries | official institutional email | Admissions experience in University OS |
| Brand Partner | organization/category, partnership goals, audience, budget, campaign types, NIL/compliance contacts | organization and compliance review | Brand Partner OS |
| Employer / Workforce Partner | organization, opportunity types, eligibility, geography, compensation, contact boundaries | organization verification | Employer OS |
| District / School Administrator | institution, district, authority, schools/rosters, data-sharing and permission scope | provisioned institutional access | District OS |
| Athlete Abroad | Scholar-Athlete foundation plus countries, international goal, languages, passport, travel, guardian and readiness needs | identity, guardian/age-aware support and later program verification | Athlete Abroad OS |

## Build sequence

- OR-003 completes and validates Scholar, Scholar-Athlete, and Transition-Aged Youth.
- OR-004 completes Family and Mentor relationships and consent.
- OR-005 completes Educator, Counselor, Coach, and District verification and scopes.
- OR-006 completes College Coach/Recruiter and Admissions compliance paths.
- OR-007 completes Brand Partner and Employer opportunity paths.
- OR-008 validates the permission matrix, RLS, agreements, analytics, emails, invitations, and role-by-role E2E journeys.
