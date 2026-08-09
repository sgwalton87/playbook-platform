# User Journeys

> Canonical owner: Playbook Product and Experience
> Governed source revision: `d65e26040d88cde355102c314e3f5f3e1f577b61`
> Compiled from `docs/GOVERNANCE/ROLE_REGISTRY.md`, `docs/ONBOARDING_ROLE_OS_SPRINT_MAP.md`, and `docs/design/CANONICAL_ROUTE_MAP.md`.
> This topology records intended behavior and known gaps. It is not implementation or acceptance evidence.

## Global journey contract

Every role journey follows one governed state sequence: public discovery → authentication → role selection → role-specific onboarding → verification/consent → canonical record projection → permission-scoped OS landing → role action → durable outcome → recovery and sign-out.

A journey remains incomplete when any source field below is PARTIAL, MISSING, or NOT VERIFIED. PBOS must bind each step to implementation, desktop/mobile acceptance, accessibility, security, and durable-data evidence before product certification.

## Role journey index

| Role | Signup | Onboarding | OS landing | Permissions | Verification | Current status |
| --- | --- | --- | --- | --- | --- | --- |
| Scholar | VERIFIED: scholar signup option. | VERIFIED: ROLE_ONBOARDING.scholar. | VERIFIED: /dashboard in pathway map and navigation. | VERIFIED: scholar relationship permissions. | PARTIAL: email status exists; no role-specific verification required/found. | PARTIAL |
| Scholar-Athlete | VERIFIED: scholar-athlete signup option. | VERIFIED: ROLE_ONBOARDING["scholar-athlete"]. | VERIFIED: /scholar-athlete-os. | PARTIAL: no dedicated relationship kind; scholar-like support model only. | PARTIAL: athletic compliance fields exist; no approval workflow verified. | PARTIAL |
| Brand Partner | VERIFIED: brand-partner signup option. | VERIFIED: ROLE_ONBOARDING["brand-partner"]. | VERIFIED: /brand-partner-os. | MISSING: no brand-partner relationship kind or permission map found. | PARTIAL: NIL/compliance acknowledgement fields exist; no review queue verified. | PARTIAL |
| Family | VERIFIED: family signup option. | VERIFIED: ROLE_ONBOARDING.family. | VERIFIED: /family-os. | VERIFIED: parent_guardian relationship permissions. | PARTIAL: invite/dependent fields exist; no consent/approval workflow verified. | PARTIAL |
| Mentor | VERIFIED: mentor signup option. | VERIFIED: ROLE_ONBOARDING.mentor. | VERIFIED: /mentor-os. | VERIFIED: mentor relationship permissions. | MISSING: no mentor eligibility/background/approval workflow found. | PARTIAL |
| Educator | VERIFIED: educator signup option. | VERIFIED: ROLE_ONBOARDING.educator. | VERIFIED: /educator-os. | VERIFIED: educator relationship permissions. | PARTIAL: official school email captured; no institutional approval workflow verified. | PARTIAL |
| High School Coach | VERIFIED: coach signup option. | VERIFIED: ROLE_ONBOARDING.coach. | PARTIAL: pathway/navigation route to /mentor-os, while role destination helper maps coach-like roles to /educator-os. | MISSING: no coach-specific relationship kind; role destination helper groups coach with educator. | PARTIAL: official school email captured; no approval workflow verified. | PARTIAL |
| College Coach / Recruiter | VERIFIED: college-coach signup option. | VERIFIED: ROLE_ONBOARDING["college-coach"]. | VERIFIED/PARTIAL: /university-os is wired, but not a dedicated Recruiting OS route. | PARTIAL: university partner permissions exist; no college-coach-specific kind found. | PARTIAL: institutional/NCAA fields captured; no approval workflow verified. | PARTIAL |
| College Admissions Officer | VERIFIED: college-admissions signup option. | VERIFIED: ROLE_ONBOARDING["college-admissions"]. | VERIFIED/PARTIAL: /university-os is wired, but not a dedicated Admissions OS route. | VERIFIED/PARTIAL: university partner permissions fit admissions; no admissions-specific kind found. | PARTIAL: official .edu email captured; no approval workflow verified. | PARTIAL |
| Transition-Aged Youth | VERIFIED: transition-youth signup option. | VERIFIED: ROLE_ONBOARDING["transition-youth"]. | VERIFIED/PARTIAL: /dashboard in pathway/navigation; no dedicated TAY OS route. | PARTIAL: no TAY-specific relationship kind; likely scholar permissions by fallback only. | PARTIAL: support/life-context fields captured through Scholar Support; no TAY verification workflow found. | PARTIAL |
| Employer | VERIFIED: employer signup option. | MISSING: no ROLE_ONBOARDING.employer entry found, so onboarding falls back to Scholar if requested directly. | PARTIAL/MISSING: navigation has /employer-os, but pathway map has no employer entry and auth completion may default elsewhere. | VERIFIED: employer_partner permissions exist. | MISSING: employer verification workflow not found. | MISSING |
| Other | VERIFIED: other signup option. | VERIFIED: ROLE_ONBOARDING.other. | VERIFIED/PARTIAL: pathway sends to /pending; navigation fallback sends to /dashboard. | MISSING: no other relationship kind or permissions found. | PARTIAL: pending page exists, but review workflow is not verified. | PARTIAL |
| High School Counselor | MISSING: no canonical signup contract is declared. | MISSING: no role-specific onboarding implementation is declared. | /educator-os | MISSING: least-privilege authority contract is not accepted. | MISSING: role verification and consent are not accepted. | MISSING |
| Athlete Abroad enrollment | MISSING: no canonical signup contract is declared. | MISSING: no role-specific onboarding implementation is declared. | /athlete-abroad-os | MISSING: least-privilege authority contract is not accepted. | MISSING: role verification and consent are not accepted. | MISSING |
| District / School Administrator | MISSING: no canonical signup contract is declared. | MISSING: no role-specific onboarding implementation is declared. | /district-os | MISSING: least-privilege authority contract is not accepted. | MISSING: role verification and consent are not accepted. | MISSING |

## Scholar

1. **Discover and sign up:** VERIFIED: scholar signup option.
2. **Complete role onboarding:** VERIFIED: ROLE_ONBOARDING.scholar.
3. **Satisfy verification and consent:** PARTIAL: email status exists; no role-specific verification required/found.
4. **Create or connect the canonical Playbook Record:** PARTIAL: data model exists; onboarding completion does not create record.
5. **Create or connect the Scholar Record projection:** PARTIAL: record/portfolio assembly exists outside onboarding; no onboarding-created row verified.
6. **Enter the permission-scoped OS:** VERIFIED: /dashboard in pathway map and navigation.
7. **Render the canonical dashboard:** VERIFIED: app/dashboard/page.tsx.
8. **Enforce role authority:** VERIFIED: scholar relationship permissions.
9. **Persist the canonical record type:** VERIFIED: scholar Playbook Graph enum.
10. **Prove the outcome:** exact-revision desktop/mobile journey, durable data, authority denial, accessibility, security, recovery, and independent validation evidence are required.

**Current source status:** PARTIAL

## Scholar-Athlete

1. **Discover and sign up:** VERIFIED: scholar-athlete signup option.
2. **Complete role onboarding:** VERIFIED: ROLE_ONBOARDING["scholar-athlete"].
3. **Satisfy verification and consent:** PARTIAL: athletic compliance fields exist; no approval workflow verified.
4. **Create or connect the canonical Playbook Record:** PARTIAL: model supports it; onboarding completion does not create record.
5. **Create or connect the Scholar Record projection:** PARTIAL: Scholar Record builder exists outside onboarding.
6. **Enter the permission-scoped OS:** VERIFIED: /scholar-athlete-os.
7. **Render the canonical dashboard:** VERIFIED: app/scholar-athlete-os/page.tsx and ScholarAthleteDashboard.
8. **Enforce role authority:** PARTIAL: no dedicated relationship kind; scholar-like support model only.
9. **Persist the canonical record type:** VERIFIED: scholar_athlete Playbook Graph enum plus athlete tables.
10. **Prove the outcome:** exact-revision desktop/mobile journey, durable data, authority denial, accessibility, security, recovery, and independent validation evidence are required.

**Current source status:** PARTIAL

## Brand Partner

1. **Discover and sign up:** VERIFIED: brand-partner signup option.
2. **Complete role onboarding:** VERIFIED: ROLE_ONBOARDING["brand-partner"].
3. **Satisfy verification and consent:** PARTIAL: NIL/compliance acknowledgement fields exist; no review queue verified.
4. **Create or connect the canonical Playbook Record:** PARTIAL: organization record type exists; onboarding completion does not create it.
5. **Create or connect the Scholar Record projection:** MISSING: not applicable except supported scholars; no partner-owned Scholar Record.
6. **Enter the permission-scoped OS:** VERIFIED: /brand-partner-os.
7. **Render the canonical dashboard:** VERIFIED: app/brand-partner-os/page.tsx.
8. **Enforce role authority:** MISSING: no brand-partner relationship kind or permission map found.
9. **Persist the canonical record type:** VERIFIED/PARTIAL: organization Playbook Graph enum fits partner records; no brand-specific enum found.
10. **Prove the outcome:** exact-revision desktop/mobile journey, durable data, authority denial, accessibility, security, recovery, and independent validation evidence are required.

**Current source status:** PARTIAL

## Family

1. **Discover and sign up:** VERIFIED: family signup option.
2. **Complete role onboarding:** VERIFIED: ROLE_ONBOARDING.family.
3. **Satisfy verification and consent:** PARTIAL: invite/dependent fields exist; no consent/approval workflow verified.
4. **Create or connect the canonical Playbook Record:** PARTIAL: model supports parent records; onboarding completion does not create record.
5. **Create or connect the Scholar Record projection:** MISSING: family should link to scholar record; link workflow not verified.
6. **Enter the permission-scoped OS:** VERIFIED: /family-os.
7. **Render the canonical dashboard:** VERIFIED: app/family-os/page.tsx.
8. **Enforce role authority:** VERIFIED: parent_guardian relationship permissions.
9. **Persist the canonical record type:** VERIFIED: parent Playbook Graph enum.
10. **Prove the outcome:** exact-revision desktop/mobile journey, durable data, authority denial, accessibility, security, recovery, and independent validation evidence are required.

**Current source status:** PARTIAL

## Mentor

1. **Discover and sign up:** VERIFIED: mentor signup option.
2. **Complete role onboarding:** VERIFIED: ROLE_ONBOARDING.mentor.
3. **Satisfy verification and consent:** MISSING: no mentor eligibility/background/approval workflow found.
4. **Create or connect the canonical Playbook Record:** PARTIAL: model supports mentor records; onboarding completion does not create record.
5. **Create or connect the Scholar Record projection:** MISSING: not applicable except assigned scholars; no link creation verified.
6. **Enter the permission-scoped OS:** VERIFIED: /mentor-os.
7. **Render the canonical dashboard:** VERIFIED: app/mentor-os/page.tsx.
8. **Enforce role authority:** VERIFIED: mentor relationship permissions.
9. **Persist the canonical record type:** VERIFIED: mentor Playbook Graph enum.
10. **Prove the outcome:** exact-revision desktop/mobile journey, durable data, authority denial, accessibility, security, recovery, and independent validation evidence are required.

**Current source status:** PARTIAL

## Educator

1. **Discover and sign up:** VERIFIED: educator signup option.
2. **Complete role onboarding:** VERIFIED: ROLE_ONBOARDING.educator.
3. **Satisfy verification and consent:** PARTIAL: official school email captured; no institutional approval workflow verified.
4. **Create or connect the canonical Playbook Record:** PARTIAL: model supports educator records; onboarding completion does not create record.
5. **Create or connect the Scholar Record projection:** MISSING: not applicable except supported scholars; no roster/cohort link creation verified.
6. **Enter the permission-scoped OS:** VERIFIED: /educator-os.
7. **Render the canonical dashboard:** VERIFIED: app/educator-os/page.tsx.
8. **Enforce role authority:** VERIFIED: educator relationship permissions.
9. **Persist the canonical record type:** VERIFIED: educator Playbook Graph enum.
10. **Prove the outcome:** exact-revision desktop/mobile journey, durable data, authority denial, accessibility, security, recovery, and independent validation evidence are required.

**Current source status:** PARTIAL

## High School Coach

1. **Discover and sign up:** VERIFIED: coach signup option.
2. **Complete role onboarding:** VERIFIED: ROLE_ONBOARDING.coach.
3. **Satisfy verification and consent:** PARTIAL: official school email captured; no approval workflow verified.
4. **Create or connect the canonical Playbook Record:** PARTIAL: model supports coach records; onboarding completion does not create record.
5. **Create or connect the Scholar Record projection:** MISSING: athlete/scholar roster relationship workflow not found.
6. **Enter the permission-scoped OS:** PARTIAL: pathway/navigation route to /mentor-os, while role destination helper maps coach-like roles to /educator-os.
7. **Render the canonical dashboard:** PARTIAL: no dedicated dashboard; uses Mentor OS label/route in navigation.
8. **Enforce role authority:** MISSING: no coach-specific relationship kind; role destination helper groups coach with educator.
9. **Persist the canonical record type:** VERIFIED: coach Playbook Graph enum.
10. **Prove the outcome:** exact-revision desktop/mobile journey, durable data, authority denial, accessibility, security, recovery, and independent validation evidence are required.

**Current source status:** PARTIAL

## College Coach / Recruiter

1. **Discover and sign up:** VERIFIED: college-coach signup option.
2. **Complete role onboarding:** VERIFIED: ROLE_ONBOARDING["college-coach"].
3. **Satisfy verification and consent:** PARTIAL: institutional/NCAA fields captured; no approval workflow verified.
4. **Create or connect the canonical Playbook Record:** PARTIAL: model supports organization records; onboarding completion does not create record.
5. **Create or connect the Scholar Record projection:** MISSING: access to Scholar-Athlete Records not wired to verified recruiting workflow.
6. **Enter the permission-scoped OS:** VERIFIED/PARTIAL: /university-os is wired, but not a dedicated Recruiting OS route.
7. **Render the canonical dashboard:** PARTIAL: uses University OS dashboard, not a dedicated recruiting dashboard.
8. **Enforce role authority:** PARTIAL: university partner permissions exist; no college-coach-specific kind found.
9. **Persist the canonical record type:** VERIFIED/PARTIAL: organization enum can represent institution; no college-coach enum found.
10. **Prove the outcome:** exact-revision desktop/mobile journey, durable data, authority denial, accessibility, security, recovery, and independent validation evidence are required.

**Current source status:** PARTIAL

## College Admissions Officer

1. **Discover and sign up:** VERIFIED: college-admissions signup option.
2. **Complete role onboarding:** VERIFIED: ROLE_ONBOARDING["college-admissions"].
3. **Satisfy verification and consent:** PARTIAL: official .edu email captured; no approval workflow verified.
4. **Create or connect the canonical Playbook Record:** PARTIAL: model supports organization records; onboarding completion does not create record.
5. **Create or connect the Scholar Record projection:** MISSING: scholar search/access is not wired to admissions criteria workflow.
6. **Enter the permission-scoped OS:** VERIFIED/PARTIAL: /university-os is wired, but not a dedicated Admissions OS route.
7. **Render the canonical dashboard:** PARTIAL: uses University OS dashboard, not a dedicated admissions dashboard.
8. **Enforce role authority:** VERIFIED/PARTIAL: university partner permissions fit admissions; no admissions-specific kind found.
9. **Persist the canonical record type:** VERIFIED/PARTIAL: organization enum can represent institution; no admissions enum found.
10. **Prove the outcome:** exact-revision desktop/mobile journey, durable data, authority denial, accessibility, security, recovery, and independent validation evidence are required.

**Current source status:** PARTIAL

## Transition-Aged Youth

1. **Discover and sign up:** VERIFIED: transition-youth signup option.
2. **Complete role onboarding:** VERIFIED: ROLE_ONBOARDING["transition-youth"].
3. **Satisfy verification and consent:** PARTIAL: support/life-context fields captured through Scholar Support; no TAY verification workflow found.
4. **Create or connect the canonical Playbook Record:** PARTIAL: model can likely use scholar record; onboarding completion does not create it.
5. **Create or connect the Scholar Record projection:** PARTIAL: Scholar Record concepts apply; TAY-specific record not verified.
6. **Enter the permission-scoped OS:** VERIFIED/PARTIAL: /dashboard in pathway/navigation; no dedicated TAY OS route.
7. **Render the canonical dashboard:** PARTIAL: uses Scholar dashboard.
8. **Enforce role authority:** PARTIAL: no TAY-specific relationship kind; likely scholar permissions by fallback only.
9. **Persist the canonical record type:** PARTIAL: no TAY enum; closest Playbook Graph type is scholar.
10. **Prove the outcome:** exact-revision desktop/mobile journey, durable data, authority denial, accessibility, security, recovery, and independent validation evidence are required.

**Current source status:** PARTIAL

## Employer

1. **Discover and sign up:** VERIFIED: employer signup option.
2. **Complete role onboarding:** MISSING: no ROLE_ONBOARDING.employer entry found, so onboarding falls back to Scholar if requested directly.
3. **Satisfy verification and consent:** MISSING: employer verification workflow not found.
4. **Create or connect the canonical Playbook Record:** PARTIAL: model supports organization records; onboarding completion does not create record.
5. **Create or connect the Scholar Record projection:** MISSING: not applicable except candidates; no access workflow verified.
6. **Enter the permission-scoped OS:** PARTIAL/MISSING: navigation has /employer-os, but pathway map has no employer entry and auth completion may default elsewhere.
7. **Render the canonical dashboard:** VERIFIED: app/employer-os/page.tsx exists.
8. **Enforce role authority:** VERIFIED: employer_partner permissions exist.
9. **Persist the canonical record type:** VERIFIED/PARTIAL: organization enum fits employer records; no employer-specific enum found.
10. **Prove the outcome:** exact-revision desktop/mobile journey, durable data, authority denial, accessibility, security, recovery, and independent validation evidence are required.

**Current source status:** MISSING

## Other

1. **Discover and sign up:** VERIFIED: other signup option.
2. **Complete role onboarding:** VERIFIED: ROLE_ONBOARDING.other.
3. **Satisfy verification and consent:** PARTIAL: pending page exists, but review workflow is not verified.
4. **Create or connect the canonical Playbook Record:** MISSING: no record creation found.
5. **Create or connect the Scholar Record projection:** MISSING: not applicable unless later assigned a scholar-like role.
6. **Enter the permission-scoped OS:** VERIFIED/PARTIAL: pathway sends to /pending; navigation fallback sends to /dashboard.
7. **Render the canonical dashboard:** PARTIAL: no dedicated dashboard; fallback Playbook navigation/dashboard.
8. **Enforce role authority:** MISSING: no other relationship kind or permissions found.
9. **Persist the canonical record type:** MISSING: no other Playbook Graph enum.
10. **Prove the outcome:** exact-revision desktop/mobile journey, durable data, authority denial, accessibility, security, recovery, and independent validation evidence are required.

**Current source status:** PARTIAL

## High School Counselor

1. **Discover and sign up:** MISSING: no canonical signup contract is declared.
2. **Complete role onboarding:** MISSING: no role-specific onboarding implementation is declared.
3. **Satisfy verification and consent:** MISSING: role verification and consent are not accepted.
4. **Create or connect the canonical Playbook Record:** MISSING: durable Playbook Record projection is not accepted.
5. **Create or connect the Scholar Record projection:** MISSING: Scholar Record relationship is not accepted.
6. **Enter the permission-scoped OS:** /educator-os
7. **Render the canonical dashboard:** MISSING: High School Counselor OS behavior is not accepted.
8. **Enforce role authority:** MISSING: least-privilege authority contract is not accepted.
9. **Persist the canonical record type:** MISSING: canonical record ownership is not declared.
10. **Prove the outcome:** exact-revision desktop/mobile journey, durable data, authority denial, accessibility, security, recovery, and independent validation evidence are required.

**Current source status:** MISSING

## Athlete Abroad enrollment

1. **Discover and sign up:** MISSING: no canonical signup contract is declared.
2. **Complete role onboarding:** MISSING: no role-specific onboarding implementation is declared.
3. **Satisfy verification and consent:** MISSING: role verification and consent are not accepted.
4. **Create or connect the canonical Playbook Record:** MISSING: durable Playbook Record projection is not accepted.
5. **Create or connect the Scholar Record projection:** MISSING: Scholar Record relationship is not accepted.
6. **Enter the permission-scoped OS:** /athlete-abroad-os
7. **Render the canonical dashboard:** MISSING: Athletes Abroad Hub behavior is not accepted.
8. **Enforce role authority:** MISSING: least-privilege authority contract is not accepted.
9. **Persist the canonical record type:** MISSING: canonical record ownership is not declared.
10. **Prove the outcome:** exact-revision desktop/mobile journey, durable data, authority denial, accessibility, security, recovery, and independent validation evidence are required.

**Current source status:** MISSING

## District / School Administrator

1. **Discover and sign up:** MISSING: no canonical signup contract is declared.
2. **Complete role onboarding:** MISSING: no role-specific onboarding implementation is declared.
3. **Satisfy verification and consent:** MISSING: role verification and consent are not accepted.
4. **Create or connect the canonical Playbook Record:** MISSING: durable Playbook Record projection is not accepted.
5. **Create or connect the Scholar Record projection:** MISSING: Scholar Record relationship is not accepted.
6. **Enter the permission-scoped OS:** /district-os
7. **Render the canonical dashboard:** MISSING: District / School Administrator OS behavior is not accepted.
8. **Enforce role authority:** MISSING: least-privilege authority contract is not accepted.
9. **Persist the canonical record type:** MISSING: canonical record ownership is not declared.
10. **Prove the outcome:** exact-revision desktop/mobile journey, durable data, authority denial, accessibility, security, recovery, and independent validation evidence are required.

**Current source status:** MISSING

## Dependency-ordered delivery journeys

1. OR-001 — Canonical role registry and routing
2. OR-002 — Unified premium onboarding shell
3. OR-003 — Learner pathways
4. OR-004 — Family and trusted-support pathways
5. OR-005 — K–12 institutional pathways
6. OR-006 — College pathways
7. OR-007 — Opportunity partner pathways
8. OR-008 — Governance and release validation

## Supported product acceptance journeys

| Journey ID | Canonical coverage |
| --- | --- |
| ONBOARDING-SCHOLAR | Scholar onboarding: discovery, authentication, durable role onboarding, verification, record projection, authority-scoped OS landing, recovery, desktop, and mobile. |
| ONBOARDING-SCHOLAR-ATHLETE | Scholar-Athlete onboarding: discovery, authentication, durable role onboarding, verification, record projection, authority-scoped OS landing, recovery, desktop, and mobile. |
| ONBOARDING-PARENT-GUARDIAN | Parent / Guardian onboarding: discovery, authentication, durable role onboarding, verification, record projection, authority-scoped OS landing, recovery, desktop, and mobile. |
| ONBOARDING-TEACHER-EDUCATOR | Teacher / Educator onboarding: discovery, authentication, durable role onboarding, verification, record projection, authority-scoped OS landing, recovery, desktop, and mobile. |
| ONBOARDING-HIGH-SCHOOL-COUNSELOR | High School Counselor onboarding: discovery, authentication, durable role onboarding, verification, record projection, authority-scoped OS landing, recovery, desktop, and mobile. |
| ONBOARDING-MENTOR | Mentor onboarding: discovery, authentication, durable role onboarding, verification, record projection, authority-scoped OS landing, recovery, desktop, and mobile. |
| ONBOARDING-HIGH-SCHOOL-COACH | High School Coach onboarding: discovery, authentication, durable role onboarding, verification, record projection, authority-scoped OS landing, recovery, desktop, and mobile. |
| ONBOARDING-COLLEGE-COACH-RECRUITER | College Coach / Recruiter onboarding: discovery, authentication, durable role onboarding, verification, record projection, authority-scoped OS landing, recovery, desktop, and mobile. |
| ONBOARDING-COLLEGE-ADMISSIONS | College Admissions onboarding: discovery, authentication, durable role onboarding, verification, record projection, authority-scoped OS landing, recovery, desktop, and mobile. |
| ONBOARDING-BRAND-PARTNER | Brand Partner onboarding: discovery, authentication, durable role onboarding, verification, record projection, authority-scoped OS landing, recovery, desktop, and mobile. |
| ONBOARDING-EMPLOYER | Employer / Workforce Partner onboarding: discovery, authentication, durable role onboarding, verification, record projection, authority-scoped OS landing, recovery, desktop, and mobile. |
| ONBOARDING-TRANSITION-AGED-YOUTH | Transition-Aged Youth onboarding: discovery, authentication, durable role onboarding, verification, record projection, authority-scoped OS landing, recovery, desktop, and mobile. |
| ONBOARDING-ATHLETES-ABROAD | Athlete Abroad enrollment: discovery, authentication, durable role onboarding, verification, record projection, authority-scoped OS landing, recovery, desktop, and mobile. |
| ONBOARDING-DISTRICT-SCHOOL-ADMIN | District / School Administrator onboarding: discovery, authentication, durable role onboarding, verification, record projection, authority-scoped OS landing, recovery, desktop, and mobile. |
| ONBOARDING-COMMUNITY-PARTNER | Community Partner onboarding: discovery, authentication, durable role onboarding, verification, record projection, authority-scoped OS landing, recovery, desktop, and mobile. |
| OS-SCHOLAR | Scholar OS at /dashboard: role-specific navigation, durable data, actions, authority denial, responsive design, accessibility, security, and recovery. |
| OS-SCHOLAR-ATHLETE | Scholar-Athlete OS at /scholar-athlete-os: role-specific navigation, durable data, actions, authority denial, responsive design, accessibility, security, and recovery. |
| OS-PARENT-GUARDIAN | Parent Guardian OS at /family-os: role-specific navigation, durable data, actions, authority denial, responsive design, accessibility, security, and recovery. |
| OS-TEACHER-EDUCATOR | Teacher Educator OS at /educator-os: role-specific navigation, durable data, actions, authority denial, responsive design, accessibility, security, and recovery. |
| OS-HIGH-SCHOOL-COUNSELOR | High School Counselor OS at /educator-os: role-specific navigation, durable data, actions, authority denial, responsive design, accessibility, security, and recovery. |
| OS-MENTOR | Mentor OS at /mentor-os: role-specific navigation, durable data, actions, authority denial, responsive design, accessibility, security, and recovery. |
| OS-HIGH-SCHOOL-COACH | High School Coach OS at /educator-os: role-specific navigation, durable data, actions, authority denial, responsive design, accessibility, security, and recovery. |
| OS-COLLEGE-COACH-RECRUITER | College Coach Recruiter OS at /university-os: role-specific navigation, durable data, actions, authority denial, responsive design, accessibility, security, and recovery. |
| OS-COLLEGE-ADMISSIONS | College Admissions OS at /university-os: role-specific navigation, durable data, actions, authority denial, responsive design, accessibility, security, and recovery. |
| OS-BRAND-PARTNER | Brand Partner OS at /brand-partner-os: role-specific navigation, durable data, actions, authority denial, responsive design, accessibility, security, and recovery. |
| OS-EMPLOYER | Employer OS at /employer-os: role-specific navigation, durable data, actions, authority denial, responsive design, accessibility, security, and recovery. |
| OS-FOUNDER | Founder OS at /founder: role-specific navigation, durable data, actions, authority denial, responsive design, accessibility, security, and recovery. |
| OS-ATHLETES-ABROAD | Athletes Abroad Hub at /athlete-abroad-os: role-specific navigation, durable data, actions, authority denial, responsive design, accessibility, security, and recovery. |
| OS-TRANSITION-AGED-YOUTH | Transition-Aged Youth OS at /dashboard: role-specific navigation, durable data, actions, authority denial, responsive design, accessibility, security, and recovery. |
| OS-DISTRICT-SCHOOL-ADMIN | District / School Administrator OS at /district-os: role-specific navigation, durable data, actions, authority denial, responsive design, accessibility, security, and recovery. |
| OS-COMMUNITY-PARTNER | Community Partner OS at /pending: role-specific navigation, durable data, actions, authority denial, responsive design, accessibility, security, and recovery. |
| OS-PLATFORM-ADMIN | Platform Administration OS at /admin: role-specific navigation, durable data, actions, authority denial, responsive design, accessibility, security, and recovery. |
| SCHOLAR-ONBOARDING-TO-DASHBOARD | Scholar onboarding and dashboard coverage. |
| TRANSCRIPT-TO-ACADEMIC-READINESS | Transcript to academic readiness. |
| READINESS-TO-OPPORTUNITY | Academic readiness to explainable opportunity matches. |
| OPPORTUNITY-TO-APPLICATION | Opportunity to durable application workspace and private documents. |
| APPLICATION-TO-AUTHORIZED-SUPPORT | Application to authorized support request. |
| AUTHORIZED-SUPPORT-MESSAGING | Support relationship to governed durable messaging. |
| EVENT-TO-ACKNOWLEDGED-NOTIFICATION | Domain events to idempotent notification and outbox journey. |

## Route coverage boundary

The current canonical route map declares 93 human-facing screen rows. Route existence does not prove journey completion; every required state must be connected to one or more role journeys and an approved design-canon ID.

