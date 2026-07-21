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

Whenever possible, recommendations should be supported by verified evidence contained within the Scholar Record rather than subjective opinion.

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
├── Scholar Record
│
├── Roles
│
├── Relationships
│
├── Organizations
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
- Every Scholar Record belongs to exactly one Participant.
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