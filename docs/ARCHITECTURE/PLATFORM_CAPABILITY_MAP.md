# Playbook Platform Capability Map

## Purpose

Map current platform capabilities, role operating systems, intelligence, governance, and partner opportunities without claiming unverified implementation maturity.

## Ownership

Playbook Platform Architecture

## Last Updated

July 29, 2026

## Capability Layers

```text
Users and institutions
  -> Role Operating Systems
  -> Reusable Platform Applications
  -> Domain and Intelligence Capabilities
  -> Scholar Record, Trust, Events, Identity, Data
  -> PBOS Governance and Delivery Control Plane
```

## User Capabilities

| Capability Group | Representative Capabilities | Primary Record/Service | Maturity |
| --- | --- | --- | --- |
| Identity and access | Registration, login, profile, settings, invitations, verification | Auth identity, profile, relationship permissions | Partial; enterprise federation and provisioning absent |
| Learning and evidence | Courses, lessons, assignments, transcript, certificates, portfolio | Scholar Record and learning/evidence domains | Partial |
| Opportunity | Scholarships, internships, jobs, competitions, application workspaces | Opportunity domain and Scholar evidence | Partial |
| Career | Resume, portfolio, recommendations, career planning | Scholar Record projections and application workflows | Partial |
| Community and support | Feed, events, groups, mentorship, connections, messaging | Relationship, event, notification, moderation domains | Partial |
| Athletics | Recruiting, athlete profile, highlights, NIL | Scholar athletics evidence and role workflows | Partial |
| Financial empowerment | Planning, budgeting, investment education, insurance, tax education | Learning, opportunity, and governed content | Mostly constitutional/future |
| Operations | Calendar, tasks, documents, files, search | Shared application services | Mixed |
| Trust and safety | Reporting, blocking, muting, moderation, verification | Trust signals and moderation records | Partial |

## Role Operating Systems

| Operating System | Composed Capabilities | Boundary | Current Assessment |
| --- | --- | --- | --- |
| Scholar OS | Record, learning, opportunity, career, community, Compass | Scholar-controlled journey and evidence | Most mature role direction |
| Scholar Athlete OS | Scholar OS plus athletics, recruiting, NIL, financial education | Athletics-specific workflows without a duplicate record | Partial |
| Family OS | Visibility, support, consented monitoring, communication | Relationship-scoped support, not Scholar ownership | Partial |
| Mentor OS | Mentorship, messaging, goals, evidence support | Explicit relationship and scoped access | Partial |
| Educator OS | Learning support, transcript/evidence workflows, cohort insight | Institution and relationship-scoped | Incomplete authority/runtime proof |
| Employer OS | Opportunities, applications, verification, talent relationships | Employer-owned opportunity data and consented applicant data | Incomplete |
| District OS | Institution administration, analytics, policy, delegated roles | Tenant-scoped district operations | Not tenant-certified |
| University OS | Recruitment, admissions-related opportunity, verification, analytics | Institution-scoped higher-education operations | Not tenant-certified |
| Brand Partner OS | Campaigns, opportunities, rewards, partner reporting | Partner-scoped commercial capability | Experimental/partial |
| Athlete Abroad OS | International athletics, eligibility, mobility, support | Specialized role composition | Future/incomplete |

## Intelligence Engines

| Engine | Inputs | Outputs | Required Trust Controls | Maturity |
| --- | --- | --- | --- | --- |
| Compass | Authorized Scholar Record projection | Momentum, gaps, next-step guidance | Explanations, missing-data disclosure, version, human choice | Partial |
| Recommendation Engine | Evidence, preferences, eligibility, relationships | Ranked opportunities or actions | Provenance, fairness, confidence, correction, no auto-decision | Partial |
| Opportunity Intelligence | Scholar evidence and governed opportunity catalog | Eligibility/readiness reasons and application actions | Source freshness, hard-vs-inferred distinction, audit | Partial |
| Career Intelligence | Evidence, interests, learning and market sources | Scenario-based career pathways | Dated sources, alternatives, reversible choices | Partial |
| Scholarship Intelligence | Evidence and scholarship criteria | Eligibility, gaps, deadlines, optional actions | Verified sources and transparent criteria | Incomplete |
| Mentor Intelligence | Relationship graph and consented needs | Support gaps and candidate suggestions | Safety, relationship permissions, Scholar agency | Partial |
| Reporting and Analytics | Governed events and data projections | Operational and outcome reporting | Purpose limitation, aggregation, tenant scope, audit | Incomplete |

## Governance Systems

| Governance Capability | Authority | Current State |
| --- | --- | --- |
| Repository context | PBOS Context | Implemented, fail closed |
| Constitutional gate selection | Constitutional Planner | Implemented, deterministic |
| Objective handoff | Planning Handoff | Implemented, registered-objectives-only |
| Execution authorization | PBOS Authorization | Implemented, durable |
| Lifecycle promotion/completion | PBOS Lifecycle Governance | Implemented |
| Artifact ownership/reconciliation | PBOS Kernel and Reconciliation | Implemented |
| Volume certification/promotion | PBOS Constitution | Implemented framework |
| Interface measurement/certification | PBOS Interface Certification | Framework implemented; evidence incomplete |
| Documentation governance | Canonical registry and governor | Implemented but currently permits misleading empty/status-conflicting sources |
| Product/application governance | Volumes 30 and 32 | Volume 30 blocked; Volume 32 documented |

## Partner Opportunities

| Partner Surface | Potential Value | Required Before External Use |
| --- | --- | --- |
| Institutional deployments | District/university operating environments | Tenant isolation, federation, provisioning, delegated admin, data contracts |
| Opportunity providers | Scholarship, job, internship, competition catalogs | Versioned ingestion API, source verification, freshness, moderation |
| Employers | Opportunity publishing and applicant workflows | Tenant scope, consent, audit, retention, fair-use controls |
| Learning providers | Courses, credentials, evidence | Credential verification, mapping, provenance, interoperability |
| Advisors and mentors | Support relationships and services | Vetting, safeguarding, scoped permissions, reporting |
| Technology partners | Identity, communications, analytics, AI | Integration contracts, DPA, observability, failure and data-exchange rules |
| Developers | Applications and extensions | Public APIs, SDKs, sandbox, app review, extension isolation |
| Marketplace partners | Reusable capabilities and content | Commercial governance, certification, versioning, revocation, support |

## Platform Boundary Decision

Playbook should expose stable business capabilities, not internal tables or route implementations. External partners must integrate through versioned, tenant-aware, permission-aware contracts with audit and revocation. No marketplace or extension model should precede enterprise tenant, security, and operability certification.
