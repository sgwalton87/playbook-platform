# State Model

Version: 1.0

Status: Canonical

Owner: Platform Architecture

Related Documents

- PLAYBOOK_STACK.md
- ENGINE_CONTRACT.md
- EVENT_CONTRACT.md
- COMPUTATION_MODEL.md
- SECURITY_MODEL.md
- AI_MODEL.md

---

# Purpose

The State Model defines the canonical lifecycle of entities throughout the Playbook platform.

Every canonical entity must have an explicit lifecycle.

States represent the current condition of an entity.

State transitions represent deterministic business events.

No entity may contain arbitrary or undocumented status values.

---

# Philosophy

Everything has a lifecycle.

Participants.

Evidence.

Organizations.

Relationships.

Courses.

Applications.

Opportunities.

Plans.

Businesses.

Competitions.

Every lifecycle must be:

- Deterministic
- Explainable
- Auditable
- Versioned
- Recoverable

---

# Guiding Principles

1. Every entity owns exactly one lifecycle.

2. States are mutually exclusive.

3. State transitions are deterministic.

4. Every transition produces an Event.

5. State changes are auditable.

6. Historical states are preserved.

7. State transitions may never bypass business rules.

---

# Canonical State Lifecycle

The majority of platform entities follow this generalized lifecycle.

```
Draft

↓

Pending

↓

Active

↓

Completed

↓

Historical

↓

Archived
```

Each Domain Engine may specialize this lifecycle while preserving deterministic transitions.

---

# State Definitions

## Draft

Entity has been created but is incomplete.

Characteristics:

- Editable
- Not visible
- No downstream processing

Examples:

Course draft

Opportunity draft

Business draft

Application draft

---

## Pending

Entity awaits validation or approval.

Characteristics:

- Awaiting review
- Awaiting verification
- Awaiting policy evaluation

Examples:

Evidence awaiting verification

Guardian approval

Application review

Organization invitation

---

## Active

Entity is operational.

Characteristics:

- Fully usable
- Visible according to permissions
- Generates Events

Examples:

Published Opportunity

Active Course

Current Membership

Verified Evidence

---

## Completed

Business process has concluded.

Characteristics:

- Immutable
- Historical
- Generates Evidence

Examples:

Completed Course

Completed Program

Completed Competition

Completed Plan

---

## Historical

Entity remains available for historical reference.

Characteristics:

- Read-only
- Searchable
- Auditable

Historical records remain part of the Participant Record.

---

## Archived

Entity is no longer active.

Characteristics:

- Hidden from standard workflows
- Retained for compliance
- Recoverable if permitted

Archiving never deletes canonical history.

---

# State Transition Rules

All transitions must satisfy:

Business validation

Policy evaluation

Permission evaluation

Audit logging

Event publication

Transitions must be deterministic.

---

# Generic State Machine

```
Draft
   │
   ▼
Pending
   │
   ▼
Active
   │
   ├──────────────┐
   ▼              │
Completed         │
   │              │
   ▼              │
Historical        │
   │              │
   ▼              │
Archived ◄────────┘
```

Reverse transitions require explicit business rules.

---

# Participant Lifecycle

```
Registered

↓

Verified

↓

Active

↓

Inactive

↓

Archived
```

Participant history is permanent.

Participants are never deleted.

---

# Relationship Lifecycle

```
Invited

↓

Pending

↓

Accepted

↓

Active

↓

Ended

↓

Historical
```

Relationship history remains permanent.

---

# Organization Membership Lifecycle

```
Invited

↓

Pending

↓

Active

↓

Suspended

↓

Ended

↓

Historical
```

Membership history is auditable.

---

# Evidence Lifecycle

```
Captured

↓

Submitted

↓

Pending Verification

↓

Verified

↓

Attached to Participant Record

↓

Historical
```

Evidence is append-only.

Verification creates immutable history.

---

# Opportunity Lifecycle

```
Draft

↓

Published

↓

Open

↓

Matched

↓

Applied

↓

Review

↓

Awarded

↓

Completed

↓

Archived
```

Opportunity lifecycle is owned by the Opportunity Engine.

---

# Application Lifecycle

```
Started

↓

Submitted

↓

Under Review

↓

Decision Pending

↓

Accepted

↓

Declined

↓

Withdrawn

↓

Historical
```

Applications remain searchable.

---

# Course Lifecycle

```
Draft

↓

Published

↓

Enrollment Open

↓

Active

↓

Completed

↓

Archived
```

---

# Enrollment Lifecycle

```
Invited

↓

Enrolled

↓

In Progress

↓

Completed

↓

Withdrawn
```

---

# Certificate Lifecycle

```
Generated

↓

Issued

↓

Verified

↓

Historical
```

Certificates remain permanent.

---

# Badge Lifecycle

```
Earned

↓

Issued

↓

Displayed

↓

Historical
```

Badges contribute to the Participant Record.

---

# Venture Lifecycle

```
Idea

↓

Formation

↓

Operating

↓

Growth

↓

Mature

↓

Exited

↓

Historical
```

Legal status changes do not reset Venture history.

---

# Competition Lifecycle

```
Scheduled

↓

Open

↓

Active

↓

Completed

↓

Historical
```

---

# Recruiting Lifecycle

```
Profile Created

↓

Visible

↓

Interest Expressed

↓

Evaluation

↓

Offer

↓

Committed

↓

Historical
```

---

# Plan Lifecycle

```
Generated

↓

Active

↓

In Progress

↓

Completed

↓

Revised

↓

Historical
```

Plans may be regenerated.

Historical plans remain immutable.

---

# Allowed Transitions

Every Domain Engine must explicitly document:

Allowed transitions

Forbidden transitions

Automatic transitions

Manual transitions

Scheduled transitions

---

# Transition Validation

Before every transition:

Validate entity.

Evaluate policies.

Evaluate permissions.

Check invariants.

Publish Events.

Record audit.

If validation fails, no transition occurs.

---

# State Ownership

Only the owning Domain Engine may change state.

Examples:

Learning Engine owns Course state.

Evidence Engine owns Evidence state.

Opportunity Engine owns Opportunity state.

Planning Engine owns Plan state.

Compass never changes state.

Operating Systems never change state.

---

# Audit Requirements

Every transition records:

Transition ID

Timestamp

Actor

Engine

Previous State

New State

Reason

Policy

Permission

Correlation ID

Audit history is immutable.

---

# Event Integration

Every successful transition publishes at least one Event.

Examples:

EvidenceVerified

OpportunityPublished

CourseCompleted

PlanUpdated

RelationshipAccepted

State changes without Events are prohibited.

---

# Recovery

Recovery procedures must exist for:

Interrupted transitions

Failed workflows

Partial completion

Timeouts

Duplicate processing

Recovery must never violate canonical history.

---

# Security Considerations

State visibility depends upon:

Permissions

Policies

Consent

Organization

Relationship

Context

State existence does not imply visibility.

---

# AI Interaction

Compass consumes state.

Compass explains state.

Compass summarizes state.

Compass may not directly modify state.

Only Domain Engines perform state transitions.

---

# Future Expansion

The State Model should support:

Workflow automation

Distributed processing

Event sourcing

Saga orchestration

Long-running processes

Offline synchronization

External integrations

---

# Relationship to the Playbook Stack

Human Development Domains

↓

Canonical Entities

↓

Domain Engines

↓

State Transitions

↓

Events

↓

Participant Record

↓

Opportunity Engine

↓

Planning Engine

↓

Operating Systems

↓

Compass

State defines where an entity exists within its lifecycle.

Events communicate state changes.

---

# Definition of Done

A State Model is considered complete when:

✓ Every entity has a documented lifecycle.

✓ All states are defined.

✓ Transition rules are explicit.

✓ Ownership is documented.

✓ Audit requirements exist.

✓ Events are produced.

✓ Security considerations are documented.

✓ AI interactions are documented.

✓ Recovery procedures are defined.

✓ Historical state is preserved.

Only then may implementation begin.