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
├── Operating Systems
│
├── Modules
│
├── Permissions
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