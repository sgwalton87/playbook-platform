# Compass

## 03_RUNTIME_ORCHESTRATION.md

Version: 2.0

Status: Canonical

Owner: Platform Core

Related Documents

- 01_CANONICAL_SPEC.md
- 02_COMPUTATIONAL_MODEL.md
- PLAYBOOK_STACK.md
- ENGINE_CONTRACT.md
- EVENT_CONTRACT.md
- KNOWLEDGE_GRAPH.md
- EVIDENCE_ENGINE.md
- PARTICIPANT_RECORD_ENGINE.md
- OPPORTUNITY_ENGINE.md
- PLANNING_ENGINE.md

---

# Purpose

This document defines how Compass operates at runtime.

Compass continuously orchestrates the outputs of every platform engine to produce a coherent, personalized participant experience.

Compass owns orchestration.

Compass never owns business truth.

---

# Runtime Philosophy

Compass is always listening.

Compass is always adapting.

Compass never blocks participant progress.

Compass coordinates.

Engines compute.

Participants decide.

---

# Runtime Responsibilities

Compass is responsible for

- Building participant context
- Orchestrating engine outputs
- Managing conversations
- Delivering briefings
- Prioritizing recommendations
- Surfacing opportunities
- Coordinating notifications
- Maintaining session context
- Personalizing experiences
- Explaining platform decisions

Compass is **not** responsible for

- Computing eligibility
- Computing plans
- Verifying evidence
- Updating participant records
- Changing policies
- Modifying canonical data

---

# Runtime Architecture

```
Platform Events
        │
        ▼
 Event Bus
        │
        ▼
 Compass Runtime
        │
        ├──────────────┐
        │              │
        ▼              ▼
Context Builder   Conversation Manager
        │              │
        ▼              ▼
Recommendation   Briefing Generator
        │              │
        └──────┬───────┘
               ▼
 Experience Composer
               │
               ▼
 Participant
```

Compass remains stateless between events except for active conversation context.

---

# Runtime Components

## Event Listener

Subscribes to platform events.

Examples

EvidencePublished

ParticipantRecordUpdated

OpportunityMatched

PlanUpdated

RelationshipUpdated

OrganizationUpdated

NotificationCreated

CalendarUpdated

ConversationStarted

---

## Context Builder

Builds the participant's active context.

Context includes

Participant Record

Active Plans

Open Opportunities

Upcoming Deadlines

Relationships

Organizations

Momentum

Signals

Calendar

Preferences

Current Conversation

Context expires naturally.

---

## Conversation Manager

Maintains

Conversation History

Intent

Topic

Clarifications

Session State

Active Goals

Conversation state is temporary.

---

## Recommendation Manager

Aggregates recommendations from

Opportunity Engine

Planning Engine

Participant Record

Knowledge Graph

Recommendations remain linked to source engines.

---

## Briefing Generator

Produces

Morning Brief

Weekly Review

Monthly Progress Review

Goal Review

Opportunity Digest

Mentor Summary

Organization Summary

Each briefing is generated on demand or by scheduled events.

---

## Notification Coordinator

Coordinates

Push Notifications

Email

SMS

In-App Notifications

Digest Notifications

Notifications respect participant preferences.

---

## Experience Composer

Combines

Current Context

Conversation

Recommendations

Plans

Signals

Calendar

Into one participant experience.

---

## Session Manager

Tracks

Active Device

Session Duration

Conversation Context

Temporary Preferences

Navigation History

Sessions remain ephemeral.

---

## Analytics Collector

Measures

Feature Usage

Recommendation Acceptance

Conversation Quality

Navigation Paths

Response Time

Completion Rates

Analytics never modify platform state.

---

# Runtime Event Subscriptions

Compass subscribes to

EvidencePublished

EvidenceVerified

ParticipantRecordUpdated

OpportunityPublished

OpportunityMatched

PlanCreated

PlanUpdated

MilestoneCompleted

GoalCompleted

RelationshipCreated

OrganizationMembershipChanged

PolicyUpdated

CalendarUpdated

ConversationStarted

ConversationEnded

PreferenceChanged

---

# Runtime Processing Pipeline

```
Event Received

↓

Validate

↓

Build Context

↓

Retrieve Engine Outputs

↓

Determine Intent

↓

Compose Experience

↓

Generate Guidance

↓

Deliver Experience

↓

Await Next Event
```

Compass never directly invokes engine internals.

---

# Conversation Lifecycle

Conversation Started

↓

Load Context

↓

Resolve Intent

↓

Compose Response

↓

Participant Interaction

↓

Update Session Context

↓

Continue

↓

Conversation Ends

↓

Destroy Session Context

Canonical data remains untouched.

---

# Context Refresh

Context refreshes when

Evidence changes

Plan changes

Opportunity changes

Relationship changes

Calendar changes

Organization changes

Conversation changes

Preference changes

Only affected context is rebuilt.

---

# Recommendation Lifecycle

Engine Recommendation

↓

Compass Receives

↓

Context Evaluation

↓

Priority Assignment

↓

Presentation Decision

↓

Participant Interaction

↓

Feedback Recorded

Compass never changes recommendation scores.

---

# Notification Lifecycle

Signal Created

↓

Preference Evaluation

↓

Delivery Channel Selection

↓

Notification Generated

↓

Delivered

↓

Interaction Recorded

Notification history remains auditable.

---

# Queue Strategy

Independent queues

Context Queue

Conversation Queue

Briefing Queue

Notification Queue

Recommendation Queue

Analytics Queue

Maintenance Queue

Replay Queue

Dead Letter Queue

Queues scale independently.

---

# Concurrency

Participant sessions are isolated.

Multiple participant sessions execute concurrently.

Conversation state is participant-specific.

No shared mutable session state exists.

---

# Replay

Compass supports replay.

Replay

Historical Events

↓

Engine Outputs

↓

Context Reconstruction

↓

Experience Reconstruction

Replay never changes history.

---

# Recovery

Recovery process

Reload Engine Outputs

↓

Rebuild Context

↓

Restore Conversation (if available)

↓

Resume Experience

No canonical data requires restoration.

---

# Failure Handling

Worker Failure

↓

Retry

↓

Retry

↓

Dead Letter Queue

↓

Operator Alert

↓

Recovery

Participant state remains recoverable.

---

# Idempotency

Every event includes

Event ID

Correlation ID

Causation ID

Projection Version

Duplicate orchestration produces identical results.

---

# API Surface

Public APIs

GET /today

GET /overview

GET /recommendations

GET /briefing

GET /conversation

GET /notifications

GET /progress

GET /goals

GET /deadlines

Internal APIs

Refresh Context

Generate Briefing

Compose Experience

Replay Session

Clear Session

Administrative APIs require authorization.

---

# Observability

Metrics include

Context Build Time

Briefing Generation Time

Conversation Latency

Recommendation Delivery

Notification Latency

Session Duration

Queue Depth

Worker Utilization

---

# Logging

Each orchestration records

Participant

Session

Context Version

Intent

Duration

Source Events

Correlation ID

Logs remain structured.

---

# Health Checks

Expose

Liveness

Readiness

Conversation Status

Context Status

Queue Status

Worker Status

Notification Status

Analytics Status

---

# Security

Runtime evaluates

Identity

Relationships

Organizations

Permissions

Policies

Consent

Visibility

Compass never bypasses authorization.

---

# Runtime Events Published

ContextBuilt

BriefingGenerated

ExperienceComposed

ConversationStarted

ConversationEnded

RecommendationPresented

NotificationDelivered

ParticipantGuided

SessionExpired

ReplayCompleted

---

# Deployment

Supports

Rolling Deployments

Blue/Green Deployments

Session Migration

Zero Downtime

Versioned Runtime

Replay Validation

---

# Disaster Recovery

Recover

Engine Outputs

↓

Participant Context

↓

Conversation State

↓

Experience

↓

Continue Session

Compass remains fully reconstructable.

---

# Runtime Invariants

Compass owns no canonical data.

Context remains ephemeral.

Sessions remain isolated.

Conversations remain temporary.

Engine contracts are never bypassed.

Recommendations remain explainable.

Notifications respect participant preferences.

Compass remains stateless between sessions except for temporary conversation context.

---

# Definition of Done

✓ Runtime architecture defined.

✓ Runtime components documented.

✓ Event subscriptions defined.

✓ Conversation lifecycle defined.

✓ Context lifecycle defined.

✓ Notification lifecycle defined.

✓ Replay documented.

✓ Recovery documented.

✓ API surface defined.

✓ Observability defined.

✓ Security enforced.

Only then may implementation begin.

---

# Closing Principle

Compass is the living orchestration layer of the Playbook Human Development Operating System.

It continuously listens, understands, coordinates, and guides—transforming the outputs of specialized engines into a seamless participant experience without ever becoming the source of truth itself.