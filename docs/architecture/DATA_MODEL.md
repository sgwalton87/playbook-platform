# Playbook Canonical Data Model
Version: 1.0.0
Status: Draft
Owner: Platform Architecture
Document Type: Canonical Architecture
Last Updated: 2026-07-20

---

# Purpose

The Playbook Canonical Data Model establishes the authoritative language and conceptual architecture of the Playbook platform.

This document defines **what the platform is**, not how individual features are implemented.

Every database schema, API, service, operating system, AI workflow, integration, and user experience must conform to the concepts defined herein.

This document is intentionally technology-agnostic.

It defines the domain.

The database blueprint defines persistence.

Specifications define behavior.

Engineering defines implementation.

---

# Relationship to Other Documents

This document exists within the following hierarchy.

```text
Playbook Constitution
        │
        ▼
Canonical Data Model
        │
        ▼
Playbook Operating System
        │
        ▼
Engine Specifications
        │
        ▼
Database Blueprint
        │
        ▼
Production Implementation
```

The Constitution establishes the philosophical and governance framework for the Playbook ecosystem.

The Canonical Data Model establishes the language and conceptual architecture of the platform.

The Playbook Operating System describes how participants experience the platform through role-specific operating systems.

Specifications define the required behavior of platform engines, services, and user experiences.

The Database Blueprint translates the canonical architecture into a physical persistence model.

Production implementation consists of source code, infrastructure, integrations, artificial intelligence, and operational services that implement the architecture.

Each layer depends upon the layers above it.

No implementation should redefine concepts established within this document.

---

# Intended Audience

This document is written for multiple audiences.

## Founders

To ensure the long-term vision of Playbook remains consistent regardless of future staff, vendors, or leadership.

## Product

To ensure every feature is designed using a shared language and consistent mental model.

## Engineering

To provide the canonical domain model from which databases, APIs, services, and user interfaces are implemented.

## Artificial Intelligence

Playbook AI systems, including Compass AI and future intelligent agents, must reference these canonical definitions when reasoning about participants, permissions, relationships, opportunities, and recommendations.

---

# Philosophy

Playbook is not a student information system.

Playbook is not a learning management system.

Playbook is not a recruiting platform.

Playbook is not a social network.

Playbook is a lifelong operating system for human potential.

The platform exists to help participants discover, develop, demonstrate, and deploy their gifts throughout every stage of life.

Every architectural decision should support this mission.

The architecture therefore centers on people—not institutions.

Schools change.

Teams change.

Employers change.

Organizations change.

Participants remain.

For this reason, identity is the foundation of the architecture.

Everything else is layered upon identity.

---

# Architectural Philosophy

Playbook is designed according to six foundational architectural principles.

## Human-Centered Architecture

The participant is the primary entity of the system.

Every other entity exists to support participant growth.

---

## Lifelong Continuity

The platform should support participants from childhood through adulthood without requiring them to create a new identity or abandon historical records.

---

## Composable Capabilities

Platform capabilities should be assembled from reusable modules rather than duplicated for each operating system.

---

## Context-Driven Experiences

Participants should interact with the platform according to their active context rather than maintaining separate accounts.

---

## Relationship-Based Trust

Permissions are established through verified relationships rather than through assumptions about titles alone.

---

## Evidence Before Opinion

Whenever possible, recommendations should be supported by verified evidence contained within the Participant Record rather than subjective opinion.

---

# Canonical Language

Every term defined within this document has exactly one meaning.

Future documentation must reference these definitions.

Competing definitions are prohibited.

When a concept evolves, this document must be updated first.

Only after this document has been amended may downstream specifications or implementations be updated.

This rule ensures that every engineer, designer, product manager, administrator, and AI agent shares the same vocabulary.

---

# Canonical Entity Hierarchy

The Playbook ecosystem is organized around a hierarchy of conceptual entities.

```text
Participant
│
├── Identity
│
├── Participant Record
│
├── Relationships
│
├── Organizations
│
├── Roles
│
├── Context
│
├── Policies
│
├── Permissions
│
├── Operating Systems
│
├── Modules
│
├── Evidence
│
└── Opportunities
```

The Participant is the root of the domain model.

Every other concept ultimately exists to support or describe a participant.

No entity may exist independently if it cannot ultimately be associated with one or more participants.

This principle keeps the platform participant-centered regardless of future expansion into new industries, organizations, or services.

---

# Participant

## Definition

A Participant is any human being represented within the Playbook ecosystem.

The Participant is the root entity of the canonical domain model.

Every identity, record, relationship, role, permission, opportunity, achievement, and interaction ultimately belongs to one or more participants.

Participants are never defined by a single institution, employer, school, sports organization, or role.

Playbook recognizes that people evolve throughout their lives. The architecture must therefore support lifelong participation without requiring the creation of multiple identities.

---

## Participant Principles

### Participants Are Permanent

Once created, a participant represents a lifelong individual within the platform.

Participant records are never recycled or reassigned.

Deletion of a participant should be exceptionally rare and governed by legal, privacy, and compliance policies.

---

### Participants Own Their Journey

The participant—not an organization—is the center of the ecosystem.

Schools contribute.

Parents contribute.

Mentors contribute.

Coaches contribute.

Employers contribute.

Community organizations contribute.

None of these entities owns the participant.

---

### Participants May Evolve

Over time, a participant may become:

- Scholar
- Scholar-Athlete
- Parent
- Guardian
- Mentor
- Coach
- Teacher
- Counselor
- Recruiter
- College Admissions Officer
- Employer
- Internship Supervisor
- Financial Advisor
- Entrepreneur
- Founder
- Organization Administrator
- Community Leader

The platform must support this evolution without requiring a new account.

Identity remains constant while capabilities expand.

---

### Participants May Hold Multiple Roles

A participant may hold multiple active roles simultaneously.

Examples include:

- Parent and Mentor
- Founder and Financial Advisor
- Coach and Teacher
- Scholar and Entrepreneur
- Scholar-Athlete and Community Leader

Roles are additive rather than exclusive.

The system should never assume that assigning one role removes another unless explicitly configured to do so.

---

### Participants May Belong to Multiple Organizations

Participants may simultaneously belong to multiple organizations.

Examples include:

- High School
- Community College
- University
- Athletic Club
- Travel Team
- Nonprofit
- Employer
- Scholarship Program
- Professional Association

Membership within an organization does not alter participant identity.

---

### Participants Operate Within Context

Although a participant may hold many roles, they interact with the platform through one active context at a time.

For example, the same participant may switch between:

- Founder Workspace
- Parent Operating System
- Scholar Dashboard
- Mentor Workspace
- Organization Administration

Changing context changes the experience presented by the platform.

It does not create a new participant.

---

## Participant Lifecycle

Every participant progresses through a lifecycle managed by the Activation Engine.

A simplified lifecycle consists of:

```text
Invited
    │
Registered
    │
Verified
    │
Activating
    │
Platform Ready
    │
Active
    │
Dormant
    │
Archived
```

Additional implementation states may exist within downstream specifications, but every state must map back to this canonical lifecycle.

---

## Participant Responsibilities

Participants are responsible for maintaining the accuracy of information they directly control.

This includes, where applicable:

- personal profile information
- goals
- preferences
- portfolio artifacts
- applications
- privacy settings
- notification preferences

Organizations may contribute information to a participant's record only within the permissions granted by the participant or by applicable law.

---

## Participant Invariants

The following statements must always remain true.

- Every Playbook Identity belongs to exactly one Participant.
- Every Participant Record belongs to exactly one Participant.
- Every Role assignment references a Participant.
- Every Relationship references one or more Participants.
- Every Opportunity engagement references one or more Participants.
- Every Evidence artifact ultimately traces back to one or more Participants.

Violation of these invariants represents a defect in the architecture.

---

## Architectural Implications

Because the Participant is the root entity:

- APIs should resolve actions through participant identity whenever possible.
- Permissions should ultimately evaluate participant relationships.
- Reporting should aggregate around participants before organizations.
- Artificial intelligence should reason about participant growth rather than organizational ownership.
- Future modules should extend participant capabilities instead of introducing competing identity models.

This principle ensures that Playbook remains a lifelong platform rather than a collection of disconnected applications.

---

# Playbook Identity

## Definition

A Playbook Identity is the permanent digital identity assigned to exactly one Participant.

It provides the stable reference through which authentication, authorization, system services, and platform interactions are managed.

Identity is not the participant.

Identity represents the participant within the Playbook ecosystem.

---

## Purpose

The purpose of the Playbook Identity is to provide a single, lifelong digital identity that survives changes in:

- schools
- employers
- organizations
- email addresses
- phone numbers
- usernames
- authentication providers
- geographic location
- role assignments

A participant's identity should never require recreation simply because their life changes.

---

## Identity Principles

### One Identity Per Participant

Every participant possesses exactly one Playbook Identity.

Duplicate identities are prohibited.

When duplicate accounts are discovered, they should be merged according to the Identity Merge Specification rather than maintained independently.

---

### Identity Is Permanent

Identity never expires.

Identity is retained throughout the participant's lifetime unless legal deletion requirements require permanent removal.

---

### Authentication Is Replaceable

Authentication methods are attached to an identity.

Authentication is not the identity itself.

Examples include:

- Email/password
- Google
- Apple
- Microsoft
- School SSO
- Passkeys
- Future authentication providers

Participants may replace authentication methods without affecting their identity.

---

### Usernames Are Mutable

Usernames are public presentation attributes.

They are not primary identifiers.

Participants may change usernames without affecting relationships, permissions, evidence, or historical records.

---

### Contact Information Is Mutable

Email addresses, phone numbers, mailing addresses, and communication preferences may change throughout a participant's life.

Identity remains constant despite these changes.

---

## Identity Responsibilities

The Playbook Identity is responsible for:

- authentication
- account security
- account recovery
- notification routing
- session management
- public profile references
- API ownership
- audit attribution

Identity is not responsible for storing educational history, achievements, or relationships.

Those belong to downstream canonical entities.

---

## Identity Invariants

The following statements must always remain true.

- Every Identity belongs to exactly one Participant.
- Every Participant has exactly one Identity.
- Authentication providers attach to an Identity.
- Sessions authenticate an Identity.
- Audit logs reference an Identity.
- Public URLs reference an Identity.

These invariants establish Identity as the technical anchor of the platform.

---

## Architectural Implications

Identity should be referenced internally using immutable identifiers rather than mutable user-facing attributes.

Production systems should never rely on email addresses or usernames as primary foreign keys.

All services should resolve platform activity through the Playbook Identity before applying permissions, contexts, or operating systems.

This separation between Participant and Identity allows the platform to evolve authentication technologies without disrupting the participant's lifelong record.

---

# Participant Record

## Definition

The Participant Record is the canonical, lifelong record of a participant's growth, learning, achievements, experiences, relationships, and verified evidence within the Playbook ecosystem.

Every participant possesses exactly one Participant Record.

The Participant Record persists throughout the participant's lifetime regardless of changes in schools, employers, organizations, roles, or geographic location.

Unlike institutional records, the Participant Record is participant-centered rather than organization-centered.

---

## Purpose

The Participant Record exists to preserve the participant's complete developmental journey.

Rather than replacing previous records as a participant progresses through life, the Participant Record continuously expands to reflect new experiences, accomplishments, credentials, and relationships.

It serves as the authoritative source of truth for the participant's history within Playbook.

---

## Core Principles

### Lifelong Continuity

The Participant Record begins when a participant first joins Playbook and continues indefinitely.

Educational milestones, professional experiences, leadership roles, certifications, entrepreneurial ventures, and community service become chapters within a single continuous record.

---

### Institution Independence

Schools, colleges, employers, nonprofits, athletic organizations, and businesses contribute information to the Participant Record.

None of these organizations owns the record.

Participants retain the continuity of their record throughout life.

---

### Evidence-Centered

Every meaningful achievement within the Participant Record should, whenever possible, be supported by evidence.

Examples include:

- transcripts
- certificates
- badges
- portfolios
- applications
- recommendation letters
- evaluations
- videos
- publications
- athletic statistics
- recruiting profiles
- financial literacy milestones
- volunteer hours
- employment history

Evidence increases trustworthiness and enables intelligent recommendations throughout the platform.

---

### Progressive Growth

The Participant Record is additive.

Historical information should not be discarded simply because a participant enters a new stage of life.

Instead, the record grows over time, preserving a complete developmental history.

---

## Domains

The Participant Record may contain information spanning multiple domains.

### Education

Academic history

Courses

Transcripts

Degrees

Academic plans

Assessments

FAFSA progress

A-G completion

College applications

Scholarships

---

### Athletics

Sports history

Teams

Performance metrics

Recruiting information

Highlight videos

Athletic achievements

Physical measurements

Training history

---

### Career

Internships

Employment

Professional certifications

Licenses

References

Career interests

Career milestones

---

### Leadership

Organizations

Board service

Student government

Volunteer leadership

Community organizing

Public speaking

Projects

---

### Entrepreneurship

Businesses

Startups

Products

Patents

Pitch competitions

Business plans

Revenue milestones

Investor relationships

---

### Financial Capability

Financial education

Certificates

Budgeting achievements

Investment education

Credit education

Tax education

Financial wellness milestones

---

### Personal Development

Goals

Strengths

Interests

Values

Growth reflections

Coaching milestones

Mentorship history

---

## Record Views

The Participant Record is canonical.

Different operating systems present specialized views of the same record.

Examples include:

- Scholar Profile
- Scholar-Athlete Profile
- Parent Dashboard
- Mentor Workspace
- Founder Workspace
- Recruiter View
- Organization Administration

These experiences present different perspectives of the same underlying record.

No duplicate records should exist.

---

## Ownership

Participants own the continuity of their Participant Record.

Organizations may contribute information only within authorized permissions.

Participants may grant or revoke access according to platform policies, legal requirements, and consent agreements.

---

## Participant Record Invariants

The following statements must always remain true.

- Every Participant has exactly one Participant Record.
- Every Participant Record belongs to exactly one Participant.
- Every Evidence artifact references a Participant Record.
- Every Opportunity engagement references a Participant Record.
- Every Achievement references a Participant Record.
- Historical information is additive rather than destructive.
- Participant Record identifiers are immutable.

---

## Architectural Implications

The Participant Record serves as the primary knowledge source for:

- Compass AI
- Opportunity Matching
- Scholarship Discovery
- Recruiting Intelligence
- Career Planning
- Course Recommendations
- Certificate Generation
- Transcript Generation
- Portfolio Assembly
- Analytics
- Longitudinal Reporting

Future platform capabilities should extend the Participant Record rather than introduce competing records for specific life stages.

The Participant Record is the heart of the Playbook ecosystem.

---

# Relationships

## Definition

A Relationship is a verified connection between two or more Participants, or between a Participant and an Organization, that establishes trust, responsibility, collaboration, or oversight within the Playbook ecosystem.

Relationships define *who* a participant is connected to.

Relationships do not define *what* a participant can do.

Capabilities are assigned through Roles.

Scope is established through Relationships.

Permissions are computed from the combination of Relationships, Roles, Context, and Organizational Membership.

---

## Purpose

Relationships exist to model the real-world network surrounding every participant.

No participant develops in isolation.

Playbook recognizes that growth is supported through families, educators, mentors, coaches, peers, employers, organizations, and communities.

The Relationship model provides the canonical representation of these trusted connections.

---

## Core Principles

### Relationship First

Relationships establish trust before permissions are granted.

A role alone is insufficient to authorize access to participant information.

For example:

A participant may hold the role of Coach.

That role does not automatically grant access to every Scholar.

Access is granted only when a verified coaching relationship exists.

---

### Relationships Are Explicit

Relationships should never be inferred solely from shared organizations or matching attributes.

Every meaningful relationship should be explicitly created, verified, or accepted through platform workflows.

---

### Relationships Are Directional

Some relationships are reciprocal.

Others are directional.

Examples:

Scholar ↔ Mentor

Parent → Child

Coach → Athlete

Teacher → Student

Recruiter → Prospect

Organization → Member

Direction determines responsibility, visibility, and workflow behavior.

---

### Relationships Have Lifecycle

Relationships evolve over time.

Typical lifecycle:

```text
Invited
    │
Requested
    │
Pending Verification
    │
Active
    │
Paused
    │
Expired
    │
Archived
```

Historical relationships remain part of the Participant Record unless legal or privacy requirements dictate otherwise.

---

## Relationship Categories

Examples include, but are not limited to:

### Family

- Parent
- Guardian
- Sibling
- Relative

### Education

- Teacher
- Counselor
- Academic Advisor
- Tutor

### Athletics

- Coach
- Assistant Coach
- Trainer
- Recruiter
- Teammate

### Mentorship

- Mentor
- Mentee
- Career Coach
- Executive Coach

### Professional

- Employer
- Manager
- Internship Supervisor
- Colleague

### Entrepreneurship

- Founder
- Co-Founder
- Investor
- Advisor
- Board Member

### Community

- Volunteer Coordinator
- Organization Leader
- Faith Leader
- Community Partner

These categories may expand as the platform evolves.

---

## Relationship Attributes

A relationship may contain metadata including:

- relationship type
- status
- start date
- end date
- verification status
- verification source
- organization
- notes
- visibility level
- communication preferences
- permissions granted

Additional attributes may be introduced through downstream specifications.

---

## Ownership

Relationships belong to the participants involved.

Organizations may facilitate relationship creation but do not own participant relationships.

Participants retain continuity of their relationship history throughout their lifetime.

---

## Relationship Invariants

The following statements must always remain true.

- Every Relationship references one or more Participants.
- Every Relationship has a defined type.
- Every Relationship has a lifecycle state.
- Every Relationship may be verified.
- Historical Relationships are retained unless legally removed.
- Relationships do not directly grant permissions.

---

## Relationship Graph

Collectively, Relationships form the participant's trusted network.

The Relationship Graph enables:

- mentorship discovery
- support network visualization
- collaboration
- referrals
- introductions
- opportunity routing
- communication pathways
- organizational insights

The Relationship Graph is one of the foundational intelligence layers of the Playbook platform.

---

## Architectural Implications

Relationships define scope.

Roles define capability.

Context defines experience.

Permissions are computed from all three.

This separation prevents over-permissioning while allowing participants to safely participate in multiple organizations and communities throughout their lifetime.

No feature should grant participant access solely because of a role assignment.

Relationship-aware authorization is a foundational architectural requirement of Playbook.

---

# Organizations

## Definition

An Organization is a structured entity that participates in the development, support, governance, employment, education, mentorship, or advancement of Participants within the Playbook ecosystem.

Organizations do not own Participants.

Organizations provide environments in which Participants learn, work, compete, collaborate, lead, and grow.

Organizations may contribute information to Participant Records only within authorized permissions.

---

## Purpose

Organizations provide the institutional context in which participant activity occurs.

Examples include educational institutions, employers, athletic organizations, nonprofits, businesses, government agencies, scholarship providers, community organizations, and other structured groups.

Organizations are contributors to participant development.

They are never the center of the platform.

Participants remain the canonical entity.

---

## Core Principles

### Organizations Are Independent Entities

Every organization possesses its own identity independent of its members.

Organizations may continue to exist even as participants join, leave, or change roles.

Likewise, participants may continue throughout life while changing organizations many times.

---

### Organizations Do Not Own Participants

Participant identity, Participant Records, evidence, achievements, and historical experiences remain participant-centered.

Organizations contribute verified information.

Ownership remains with the participant and the platform's governance model.

---

### Organizations Enable Context

Organizations provide one source of operational context.

Examples include:

- Oakland Unified School District
- University of California, Berkeley
- Oakland Roots SC
- Education Justice Academy
- Playbook Series
- Bulletproof Financial Group

When a participant enters an organization, they may gain access to one or more organization-specific operating systems.

---

### Organizations Host Roles

Roles are assigned within organizational context.

Examples:

A participant may simultaneously be:

• Scholar at Skyline High School

• Coach at Oakland Dynamites AAU

• Founder of Playbook Series

• Mentor for Education Justice Academy

The participant remains one individual while operating across multiple organizations.

---

### Organizations May Collaborate

Organizations may establish partnerships that enable shared opportunities, referrals, data exchange, and collaborative programs.

Partnerships should never bypass participant consent requirements.

---

## Organization Categories

Organizations may belong to one or more categories.

Examples include:

### Education

- Elementary School
- Middle School
- High School
- Community College
- University
- Trade School

---

### Athletics

- High School Team
- College Team
- AAU Program
- Club
- Professional Team
- League

---

### Government

- School District
- City
- County
- State Agency
- Federal Agency

---

### Business

- Startup
- Corporation
- Small Business
- Consulting Firm

---

### Nonprofit

- Foundation
- Community Organization
- Scholarship Provider
- Advocacy Organization

---

### Professional

- Licensing Board
- Professional Association
- Certification Body

---

Additional organization categories may be introduced through future specifications.

---

## Organization Attributes

Organizations may maintain canonical information including:

- legal name
- public name
- organization type
- industry
- website
- branding
- contact information
- locations
- accreditation
- verification status
- memberships
- partnerships
- active programs
- operating systems
- available opportunities

---

## Membership

Participants interact with organizations through Membership.

Membership is distinct from employment, enrollment, or role assignment.

Membership establishes the participant's association with the organization.

Roles determine capability.

Relationships determine trust.

Context determines experience.

---

## Organization Invariants

The following statements must always remain true.

- Every Organization possesses exactly one Organization Identity.
- Organizations never own Participants.
- Organizations may contain many Participants.
- Participants may belong to many Organizations.
- Organizations may expose multiple Operating Systems.
- Organizations may publish Opportunities.
- Organizations may contribute verified Evidence.
- Organizations may define Programs.
- Organizations may define Workspaces.

---

## Organizational Graph

Collectively, organizations form an ecosystem connected through participants, partnerships, and opportunities.

This graph enables:

- opportunity discovery
- cross-organization collaboration
- referral pathways
- mentorship ecosystems
- recruiting pipelines
- scholarship ecosystems
- workforce development
- community engagement

The Organizational Graph serves as one of the platform's primary intelligence networks.

---

## Architectural Implications

Organizations provide structure.

Participants provide continuity.

Relationships provide trust.

Roles provide capability.

Context provides experience.

Permissions emerge from the interaction of all five.

Organizations therefore function as environments within which participant growth occurs rather than containers that own participant identity.

This distinction preserves lifelong continuity while enabling unlimited organizational participation throughout a participant's life.

---

# Roles

## Definition

A Role is a reusable capability bundle assigned to a Participant within one or more organizational contexts.

Roles define what a Participant is authorized to do.

Roles do not define who a Participant may act upon.

Roles never establish trust.

Roles never establish ownership.

Roles grant capabilities.

Relationships establish scope.

Organizations establish environment.

Context determines experience.

Permissions are computed from all four.

---

## Purpose

Roles allow Participants to contribute to the Playbook ecosystem in different capacities throughout their lifetime.

Participants frequently hold multiple simultaneous roles.

Examples include:

- Scholar
- Scholar-Athlete
- Parent
- Guardian
- Teacher
- Coach
- Mentor
- Recruiter
- Founder
- Employer
- Financial Advisor
- Counselor
- Organization Administrator

Rather than creating separate user accounts for each responsibility, Playbook allows one Participant to accumulate multiple Roles over time.

---

## Core Principles

### Roles Are Capabilities

Roles represent capability bundles.

A Coach Role grants coaching capabilities.

A Mentor Role grants mentoring capabilities.

A Founder Role grants organizational capabilities.

The role itself does not establish authority over specific Participants.

---

### Roles Are Additive

Participants may possess multiple simultaneous Roles.

Examples include:

Scholar + Entrepreneur

Parent + Mentor

Coach + Teacher

Founder + Financial Advisor

Organization Administrator + Recruiter

Capabilities are accumulated rather than replaced.

---

### Roles Are Contextual

Roles may exist within different Organizations.

Example:

Coach — Oakland Roots

Coach — Skyline High School

Coach — AAU Team

Each represents the same capability bundle operating within different environments.

---

### Roles Are Reusable

Capability definitions should be reusable across organizations.

Organizations should configure capabilities through policy rather than redefining Role behavior.

---

### Roles Are Independent of Identity

Changing Roles never changes Identity.

Identity is permanent.

Roles evolve throughout the participant's life.

---

## Capability Model

Every Role grants one or more capability groups.

Examples include:

### View

- View Profiles
- View Participant Records
- View Opportunities

### Create

- Create Courses
- Create Programs
- Create Events
- Create Organizations

### Review

- Review Applications
- Review Portfolios
- Review Evidence

### Manage

- Manage Organizations
- Manage Programs
- Manage Membership

### Coach

- Provide Feedback
- Approve Goals
- Track Progress

### Recruit

- Discover Talent
- Contact Prospects
- Build Recruiting Lists

Additional capability groups may be introduced through future specifications.

---

## Role Assignment

Role assignment should occur through controlled workflows.

Examples include:

Invitation

Organization Approval

Verification

Certification

Administrative Assignment

Election

Employment

Self-registration where appropriate

Assignments should be auditable.

---

## Role Lifecycle

Roles typically progress through:

```text
Available
    │
Assigned
    │
Active
    │
Suspended
    │
Expired
    │
Archived
```

Historical assignments remain part of the Participant Record.

---

## Role Invariants

The following statements must always remain true.

- Every Role references a Participant.
- Every Role references a Role Definition.
- Roles never directly grant permissions.
- Roles never establish Relationships.
- Roles may exist in multiple Organizations.
- Participants may hold multiple Roles simultaneously.

---

## Architectural Implications

Roles define capability.

Relationships define scope.

Organizations define environment.

Context defines experience.

Permissions are computed dynamically from these canonical entities.

This separation prevents role explosion, reduces authorization complexity, and enables lifelong participation across multiple organizations without creating duplicate identities or conflicting permission models.

---

# Context

## Definition

A Context represents the active operational perspective through which a Participant interacts with the Playbook platform at a given moment.

Context determines the participant's active experience by combining their Identity, Relationships, Organization Memberships, Roles, and current objectives into a single operational environment.

A Participant possesses one Identity but may operate within many Contexts throughout their lifetime.

Only one Context is active during a platform session unless explicitly designed otherwise.

---

## Purpose

The purpose of Context is to allow Participants to safely and efficiently perform different responsibilities without creating separate accounts or fragmenting their lifelong identity.

Rather than asking:

"Who are you?"

Playbook asks:

"How are you participating right now?"

This distinction allows a single Participant to seamlessly transition between different responsibilities while preserving continuity of identity and record.

---

## Core Principles

### Identity Remains Constant

Changing Context never changes Identity.

The authenticated Participant remains the same individual regardless of the experience currently being presented.

---

### Context Is Dynamic

Participants may switch Contexts during a session without logging out.

Changing Context updates:

- navigation
- operating system
- available modules
- permissions
- dashboards
- notifications
- recommendations
- Compass AI behavior

without creating a new account or session.

---

### Context Is Computed

Context is computed from canonical entities.

Inputs include:

- Identity
- Participant Record
- Active Roles
- Active Relationships
- Organization Membership
- Session State
- Feature Availability

No Context should be manually hard-coded into the user interface.

---

### Context Is Scoped

Every Context exists within a defined scope.

Examples include:

- Personal
- Organization
- Program
- Course
- Event
- Team
- Community

Scope determines the operational boundary of the active experience.

---

## Context Examples

Examples include:

### Scholar Context

Primary objectives:

- complete coursework
- discover opportunities
- build Participant Record
- connect with mentors

---

### Scholar-Athlete Context

Primary objectives:

- academic progress
- athletic development
- recruiting
- eligibility
- highlight management

---

### Parent Context

Primary objectives:

- monitor participant progress
- provide support
- communicate with organizations
- approve permissions

---

### Mentor Context

Primary objectives:

- guide participants
- review goals
- provide feedback
- monitor progress

---

### Founder Context

Primary objectives:

- manage organizations
- create programs
- analyze metrics
- publish opportunities

---

### Recruiter Context

Primary objectives:

- discover talent
- review participant records
- evaluate evidence
- communicate with prospects

---

## Context Lifecycle

Contexts typically progress through:

```text
Available
    │
Activated
    │
Active
    │
Inactive
    │
Archived
```

Participants may activate or deactivate contexts as their responsibilities evolve.

---

## Context Invariants

The following statements must always remain true.

- Every active Context belongs to exactly one Participant.
- A Participant may possess multiple available Contexts.
- Only one primary Context is active at a time unless otherwise specified.
- Context never changes Identity.
- Context never changes historical records.
- Context determines presentation, not ownership.

---

## Context Composition

A Context is computed from:

Participant

+

Identity

+

Participant Record

+

Relationships

+

Organizations

+

Roles

+

Current Scope

+

Platform Policies

+

Session State

The resulting Context determines the participant's operational experience.

---

## Architectural Implications

Context serves as the orchestration layer between canonical data and user experience.

Operating Systems do not determine Context.

Rather, Operating Systems are activated because a particular Context has been established.

This inversion ensures that user interfaces remain adaptive while the underlying architecture remains stable.

As new industries, organizations, and participant types are introduced, new Contexts may be created without requiring changes to the Participant, Identity, Participant Record, Relationship, Organization, or Role models.

Context therefore provides the extensibility mechanism for the Playbook platform.

---

# Policies

## Definition

A Policy is a versioned rule that defines the conditions under which a Participant may perform an action, access information, activate a capability, or interact with a resource within the Playbook ecosystem.

Policies express the platform's business, privacy, safety, governance, compliance, and organizational rules.

Policies do not represent the final authorization decision.

Permissions are the result of evaluating applicable Policies against the current Participant, Relationship, Organization, Role, Context, Resource, Consent, and system state.

---

## Purpose

Policies provide a consistent and auditable method for governing platform behavior.

Without a canonical Policy model, authorization rules become scattered across:

- database policies
- API routes
- user interfaces
- server actions
- background jobs
- artificial intelligence workflows
- organization settings
- individual features

Scattered rules create inconsistent behavior and security risk.

The Policy model ensures that the same governing rule can be evaluated consistently across every platform surface.

---

## Policy Principles

### Policies Express Rules

Policies define what must be true before an action is allowed, denied, limited, escalated, or reviewed.

Examples include:

- A guardian may approve consent for a minor with whom they have a verified guardian relationship.
- A mentor may comment on an assigned participant's goals but may not edit the participant's academic transcript.
- A recruiter may view evidence explicitly shared for recruiting purposes.
- An organization administrator may manage membership only within organizations they administer.
- A coach may view athletic information for athletes with whom they have an active coaching relationship.
- A participant may revoke optional data-sharing consent at any time.

---

### Policies Are Separate From Roles

Roles provide capability definitions.

Policies determine whether those capabilities may be exercised under current conditions.

A Participant may possess a capability through a Role while still being denied a specific action because the required Relationship, Organization, Context, Consent, or Resource condition is absent.

---

### Policies Are Context-Aware

The same Participant may receive different authorization decisions in different Contexts.

For example:

A Participant acting in Parent Context may review information for their verified child.

The same Participant acting in Mentor Context may only access information explicitly shared through a mentoring relationship.

Identity remains constant.

The applicable Policies change with Context.

---

### Policies Are Resource-Aware

Policies evaluate the specific resource involved in an action.

Resources may include:

- Participant Records
- profiles
- evidence
- goals
- courses
- programs
- opportunities
- applications
- messages
- organizations
- memberships
- reports
- financial information
- academic information
- athletic information
- consent records

Access to one resource does not imply access to another.

---

### Policies Are Action-Specific

Policies evaluate explicit actions.

Examples include:

- view
- create
- update
- delete
- publish
- approve
- reject
- invite
- assign
- export
- share
- comment
- verify
- archive
- administer

Broad permissions such as `manage_everything` should be avoided except for tightly controlled platform-level administration.

---

### Policies Are Versioned

Every Policy must possess a version.

When a Policy changes, the previous version should remain available for audit and historical interpretation.

Versioning allows the platform to determine which rule governed an action at a specific point in time.

---

### Policies Are Auditable

Policy evaluations that affect sensitive information or high-impact actions should be recorded.

An audit record should be capable of identifying:

- the Participant
- the authenticated Identity
- the active Context
- the requested action
- the target resource
- the applicable Policies
- the evaluation result
- the evaluation time
- the reason for the decision

---

### Policies Default to Least Privilege

When no Policy explicitly authorizes an action, the action should be denied.

Access must be granted intentionally.

Ambiguity must never result in broader access.

---

## Policy Sources

Policies may originate from several governance layers.

### Platform Policies

Rules that apply throughout Playbook.

Examples include:

- identity security
- minor protection
- prohibited conduct
- audit requirements
- platform administration
- data retention

---

### Legal and Regulatory Policies

Rules required by applicable law or regulation.

Examples may include:

- privacy rights
- educational record protections
- children's data protections
- consent requirements
- financial information restrictions
- accessibility obligations
- record retention

Legal interpretation belongs in dedicated compliance specifications.

---

### Organization Policies

Rules configured by an Organization within boundaries permitted by Playbook.

Examples include:

- program eligibility
- staff approval requirements
- workspace access
- application review procedures
- organizational communication rules

Organization Policies may restrict platform capabilities.

They may not override mandatory platform safety, privacy, or legal Policies.

---

### Program Policies

Rules applying to a specific Program, Course, Team, Cohort, Event, or Initiative.

Examples include:

- enrollment eligibility
- completion requirements
- attendance standards
- evidence submission rules
- certification requirements

---

### Participant Policies

Participant-controlled preferences and permissions where choice is legally and operationally available.

Examples include:

- profile visibility
- contact preferences
- evidence sharing
- opportunity preferences
- optional AI personalization
- notification settings

---

## Policy Evaluation Inputs

A Policy evaluation may consider:

- authenticated Identity
- acting Participant
- target Participant
- active Context
- active Role assignments
- active Relationships
- Organization Memberships
- resource ownership
- resource classification
- requested action
- Consent
- age or minor status
- verification status
- program enrollment
- geographic or jurisdictional requirements
- current lifecycle states
- time-based restrictions
- risk signals
- platform safety status

Only inputs necessary for the specific decision should be evaluated.

---

## Policy Outcomes

A Policy evaluation may produce one of several outcomes.

```text
Allow
Deny
Allow With Conditions
Require Consent
Require Verification
Require Approval
Require Escalation
Not Applicable
```

`Allow With Conditions` may require controls such as:

- redaction
- limited fields
- expiration
- read-only access
- organization scope
- relationship scope
- purpose limitation
- additional logging

---

## Policy Precedence

When multiple Policies apply, precedence must be deterministic.

The general order is:

```text
Legal and Safety Restrictions
        ↓
Platform Policies
        ↓
Participant Consent and Privacy Controls
        ↓
Organization Policies
        ↓
Program Policies
        ↓
Role Capabilities
        ↓
Default Deny
```

A lower-level Policy may further restrict access.

It may not weaken a higher-level mandatory restriction.

---

## Policy Conflicts

When Policies conflict, the more restrictive valid Policy should generally prevail.

Exceptions must be explicitly defined within a governing specification.

Policy conflicts must never be silently resolved through user-interface assumptions.

They must be resolved by the Policy evaluation layer.

---

## Sensitive Data Policies

Sensitive data requires purpose-specific access.

Examples may include:

- academic records
- financial information
- legal information
- health-related accommodations
- identity verification materials
- minor data
- private communications
- disciplinary information
- recruiting communications
- consent records

A general relationship or organization membership is insufficient to authorize access to every category of sensitive data.

Policies must evaluate data classification and intended purpose.

---

## Minor Protection Policies

Participants who are minors require additional safeguards.

Policies involving minors may require:

- verified guardian relationships
- age-appropriate experiences
- limited discoverability
- restricted direct messaging
- guardian approval
- organization verification
- enhanced audit logging
- controlled data sharing
- mandatory reporting workflows where legally required

The detailed rules belong in the Minor Protection and Consent Specifications.

---

## Artificial Intelligence Policies

AI systems must operate under the same Policy framework as human participants and platform services.

Compass AI and future agents may only access information authorized for the current purpose and Context.

AI Policies must govern:

- permitted data inputs
- purpose limitations
- recommendation boundaries
- sensitive-data handling
- human review requirements
- action authority
- explanation requirements
- audit attribution

An AI agent must never receive broader access than the Participant or service on whose behalf it operates.

---

## Policy Lifecycle

A Policy typically progresses through:

```text
Draft
    │
Under Review
    │
Approved
    │
Active
    │
Superseded
    │
Retired
```

Emergency suspension may occur when a Policy creates an identified security, legal, or safety risk.

---

## Policy Invariants

The following statements must always remain true.

- Every Policy has a defined scope.
- Every Policy has a version.
- Every Policy identifies applicable actions and resources.
- Every active Policy has an effective date.
- Policy evaluation is deterministic for equivalent inputs.
- Mandatory platform Policies cannot be weakened by Organization Policies.
- Absence of authorization results in denial.
- Sensitive actions are attributable through audit records.
- AI systems are governed by the same authorization framework as other actors.

---

## Architectural Implications

Policies are the canonical source of authorization rules.

User interfaces may hide unavailable actions for usability, but interface visibility is not authorization.

APIs, server actions, database access, background jobs, integrations, and AI agents must enforce the same applicable Policies.

No feature may treat a client-side role check as sufficient security.

Policy evaluation must occur within trusted execution boundaries.

Policies produce authorization decisions.

Permissions represent those evaluated decisions.

---