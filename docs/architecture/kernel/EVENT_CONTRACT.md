# Event Contract

Version: 1.0

Status: Canonical

Owner: Platform Architecture

Related Documents

- PLAYBOOK_STACK.md
- ENGINE_CONTRACT.md
- COMPUTATION_MODEL.md
- STATE_MODEL.md
- SECURITY_MODEL.md
- AI_MODEL.md

---

# Purpose

The Event Contract defines the canonical communication protocol between Domain Engines within the Playbook platform.

Events are immutable records of facts that have occurred.

Domain Engines communicate by publishing and consuming Events rather than directly invoking one another.

This architecture enables:

- Loose coupling
- Deterministic computation
- Replayable history
- Explainable workflows
- Event sourcing
- Scalable integrations
- Auditability
- Independent engine evolution

Every Domain Engine MUST conform to this specification.

---

# Philosophy

Playbook is an event-driven platform.

Participant actions create Commands.

Commands invoke Domain Engines.

Domain Engines compute deterministic decisions.

Those decisions produce immutable Events.

Events become the language of the platform.

No Engine should require knowledge of another Engine's internal implementation.

---

# Guiding Principles

1. Commands express intent.

2. Events express facts.

3. Facts are immutable.

4. Every meaningful business decision produces an Event.

5. Events are versioned.

6. Events are replayable.

7. Events are auditable.

8. Events are idempotent.

9. Events are traceable.

10. Engines communicate through Events rather than implementation details.

---

# Platform Flow

```
Participant

↓

Participant Action

↓

Command

↓

Domain Engine

↓

Business Decision

↓

Canonical Event

↓

Event Bus

↓

Subscribed Engines

↓

New Business Decisions

↓

New Events
```

Events create a continuous chain of deterministic computation throughout the platform.

---

# Commands vs Events

## Commands

Commands express requested actions.

Examples:

- EnrollParticipant
- CompleteLesson
- SubmitEvidence
- PublishOpportunity
- VerifyEvidence
- CreateRelationship
- JoinOrganization
- SubmitApplication

Commands may succeed or fail.

Commands are requests.

---

## Events

Events express completed facts.

Examples:

- ParticipantEnrolled
- LessonCompleted
- EvidenceSubmitted
- EvidenceVerified
- RelationshipCreated
- OrganizationJoined
- OpportunityPublished
- ApplicationSubmitted
- PlanUpdated

Events never represent intent.

Events represent reality.

---

# Event Lifecycle

```
Participant Action

↓

Command

↓

Domain Engine

↓

Validation

↓

Business Rules

↓

Decision

↓

Canonical Event

↓

Event Bus

↓

Subscribed Engines

↓

Additional Decisions

↓

Additional Events
```

Every Event originates from a completed business decision.

---

# Canonical Event Definition

Every Event MUST contain the following metadata.

## Event Name

Past-tense business fact.

Example:

EvidenceVerified

---

## Category

Examples:

Identity

Participant

Relationship

Organization

Learning

Evidence

Athletics

Community

Entrepreneurship

Financial

Opportunity

Planning

Platform

System

---

## Version

Semantic version of the Event schema.

Example:

1.0

---

## Producer

The Engine responsible for publishing the Event.

Example:

Evidence Engine

---

## Consumers

Known subscribers.

Examples:

Participant Record Engine

Opportunity Engine

Planning Engine

Compass

Analytics

Search

---

## Aggregate Root

Aggregate responsible for the Event.

Examples:

Participant

Opportunity

Course

Organization

Relationship

Venture

---

## Event ID

Globally unique identifier.

---

## Correlation ID

Associates multiple Events belonging to the same workflow.

---

## Causation ID

Identifies the Event or Command that produced the current Event.

---

## Timestamp

Canonical UTC timestamp.

---

## Payload

Business-specific data.

Payloads should contain only necessary business information.

---

## Metadata

Optional implementation metadata.

Examples:

Version

Source

Region

Environment

---

## Privacy Classification

Required.

Examples:

Public

Organization

Restricted

Confidential

Guardian

Minor Protected

---

# Event Naming Rules

Events MUST satisfy the following conventions.

Use:

Past tense.

Examples:

ParticipantCreated

ParticipantUpdated

LessonCompleted

EvidenceVerified

OpportunityPublished

ApplicationSubmitted

PlanUpdated

AwardGranted

CertificateIssued

Do NOT use:

CreateParticipant

CompleteLesson

VerifyEvidence

PublishOpportunity

Those are Commands.

---

# Event Categories

## Identity

Authentication

Verification

Sessions

Credential changes

---

## Participant

Profile updates

Record updates

Participant lifecycle

---

## Relationship

Connections

Mentorship

Guardian

Coach

Advisor

Parent

---

## Organization

Membership

Invitations

Departments

Teams

Programs

---

## Learning

Courses

Lessons

Assignments

Programs

Certificates

Badges

---

## Evidence

Verification

Normalization

Storage

Historical records

---

## Athletics

Competition

Performance

Recruiting

Eligibility

Highlights

---

## Community

Posts

Events

Messages

Membership

Announcements

---

## Entrepreneurship

Ventures

Pitches

Milestones

Investments

Accelerators

---

## Financial

Budgets

Financial goals

Literacy achievements

Scholarships

Assets

---

## Opportunity

Matching

Publishing

Applications

Awards

Deadlines

---

## Planning

Goals

Plans

Recommendations

Priorities

Reminders

---

## Platform

Configuration

Maintenance

Feature flags

---

## System

Internal operational Events.

---

# Event Invariants

Every Event MUST satisfy the following invariants.

Immutable

Versioned

Ordered

Replayable

Auditable

Traceable

Idempotent

Serializable

Observable

Recoverable

Events represent facts.

Facts never change.

---

# Event Consumers

Engines subscribe only to Events relevant to their bounded context.

Example:

Learning Engine

Produces:

LessonCompleted

Consumes:

ParticipantCreated

---

Evidence Engine

Produces:

EvidenceVerified

Consumes:

LessonCompleted

CompetitionCompleted

CertificateIssued

---

Participant Record Engine

Produces:

ParticipantRecordUpdated

Consumes:

EvidenceVerified

BadgeIssued

CertificateIssued

---

Opportunity Engine

Produces:

OpportunityMatched

Consumes:

ParticipantRecordUpdated

OrganizationJoined

GoalUpdated

OpportunityPublished

---

Planning Engine

Produces:

PlanUpdated

Consumes:

OpportunityMatched

DeadlineChanged

ParticipantGoalUpdated

---

Compass

Consumes:

Everything necessary for participant guidance.

Compass does not own Events.

Compass reacts to Events.

---

# Event Ordering

Ordering guarantees apply within a single Aggregate Root.

Ordering is not guaranteed across unrelated Aggregates.

Consumers should tolerate eventual consistency.

---

# Event Versioning

Events evolve.

Events are never modified.

New schema versions are introduced through semantic versioning.

Version changes should remain backward compatible whenever possible.

Deprecated versions should include migration guidance.

---

# Event Replay

Events must support replay.

Replay allows:

Rebuilding search indexes

Recomputing analytics

Rebuilding projections

Recovering failures

Testing new Engines

Reconstructing historical state

Replay must produce deterministic outcomes.

---

# Failure Handling

Consumers must handle:

Duplicate Events

Out-of-order Events

Missing Events

Temporary failures

Retries

Dead-letter queues

Poison messages

Timeouts

Failures should never corrupt canonical history.

---

# Event Delivery

Delivery guarantees should support:

At least once delivery.

Consumers must therefore implement idempotent processing.

Duplicate Events must not produce duplicate business outcomes.

---

# Event Security

Events inherit the security classification of their Aggregate.

Consumers must evaluate:

Policies

Permissions

Consent

Privacy

Before exposing Event information.

Publication does not imply visibility.

---

# Event Retention

Canonical Events are permanent.

Events are append-only.

Historical Events are never deleted.

Retention policies may archive storage but not alter historical facts.

---

# Observability

Every Event publication should record:

Event ID

Producer

Timestamp

Latency

Processing duration

Retry count

Consumer status

Failure status

Observability enables deterministic debugging.

---

# AI Consumption

Compass consumes Events.

Compass never publishes canonical business Events.

Compass may generate conversational artifacts.

Conversational artifacts are not canonical Events.

AI never replaces deterministic business workflows.

---

# Operating System Consumption

Operating Systems consume Event projections rather than raw Event streams.

Examples:

Scholar OS

Founder OS

Coach OS

Mentor OS

Advisor OS

Recruiter OS

Parent OS

Administrator OS

Operating Systems remain presentation layers.

---

# Relationship to the Playbook Stack

Human Development Domains

↓

Canonical Entities

↓

Domain Engines

↓

Canonical Events

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

Events are the communication layer connecting deterministic Engines throughout the platform.

---

# Definition of Done

An Event Contract is considered complete when:

✓ Event name follows canonical conventions.

✓ Producer is identified.

✓ Consumers are documented.

✓ Aggregate ownership is explicit.

✓ Payload is defined.

✓ Version is assigned.

✓ Privacy classification exists.

✓ Replay behavior is documented.

✓ Failure handling is documented.

✓ Observability requirements are defined.

✓ Security requirements are documented.

✓ AI interactions are documented.

✓ Event lifecycle is deterministic.

Only then may implementation begin.