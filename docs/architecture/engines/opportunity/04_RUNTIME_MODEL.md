# Opportunity Engine

## 04_RUNTIME_MODEL.md

Version: 2.0

Status: Canonical

Owner: Platform Core

Related Documents

- 01_CANONICAL_SPEC.md
- 02_COMPUTATIONAL_MODEL.md
- 03_PERSISTENCE_MODEL.md
- PARTICIPANT_RECORD_ENGINE.md
- PLANNING_ENGINE.md
- KNOWLEDGE_GRAPH.md
- EVENT_CONTRACT.md

---

# Purpose

This document defines the runtime behavior of the Opportunity Engine.

It describes how Opportunities are evaluated, matched, ranked, recommended, updated, replayed, and synchronized across the Playbook ecosystem.

The Opportunity Engine continuously reacts to participant growth and organizational changes.

---

# Runtime Philosophy

The Opportunity Engine never waits for Participants to search.

It continuously evaluates opportunity readiness.

Every new piece of Evidence may change participant opportunity.

Every new Opportunity may change participant recommendations.

The engine is proactive.

---

# Runtime Responsibilities

Subscribe to Events

Evaluate Eligibility

Compute Readiness

Generate Matches

Rank Opportunities

Generate Recommendations

Maintain Pipelines

Publish Signals

Notify Planning

Support Replay

Recover from Failure

Expose Read APIs

Never modify canonical Evidence

---

# Runtime Architecture

```
Organizations

↓

Opportunity Catalog

↓

Opportunity Engine

↑             ↓

Participant Record

↓

Knowledge Graph

↓

Matching Workers

↓

Recommendation Workers

↓

Planning Engine

↓

Compass

↓

Participant Experience
```

The Opportunity Engine continuously connects participant development with organizational opportunity.

---

# Runtime Components

## Opportunity Subscriber

Receives Opportunity Events.

Examples

OpportunityPublished

OpportunityUpdated

OpportunityArchived

DeadlineUpdated

PolicyUpdated

OrganizationUpdated

---

## Participant Subscriber

Receives participant Events.

Examples

ParticipantRecordUpdated

EvidencePublished

CompetencyUpdated

GrowthIndicatorsUpdated

TranscriptUpdated

PortfolioUpdated

RelationshipUpdated

---

## Eligibility Worker

Evaluates participant eligibility.

Computes

Eligible

Conditionally Eligible

Nearly Eligible

Not Eligible

Expired

Workers remain stateless.

---

## Matching Worker

Determines participant fit.

Consumes

Participant Record

Knowledge Graph

Policies

Relationships

Goals

Preferences

Produces

Opportunity Matches

---

## Ranking Worker

Ranks eligible opportunities.

Consumes

Match Scores

Readiness

Deadlines

Relationships

Priority Rules

Produces

Ranked Recommendations

---

## Recommendation Worker

Generates participant-facing recommendations.

Produces

Opportunity Cards

Reasons

Confidence

Supporting Evidence

Next Actions

Estimated Preparation

Deadline Information

---

## Signal Worker

Creates participant signals.

Examples

Application Ready

Deadline Soon

New Match

Relationship Available

Offer Received

Missing Requirement

Signals are ephemeral.

---

## Pipeline Worker

Maintains participant opportunity pipelines.

Examples

College

Career

Scholarships

Athletics

Founder

Leadership

Financial Aid

Each pipeline updates independently.

---

## Planning Connector

Produces Planning Signals.

Examples

Upload Transcript

Complete FAFSA

Earn Leadership Badge

Attend Recruiting Event

Request Recommendation Letter

Planning consumes these signals.

---

## Cache Manager

Maintains

Recommendations

Signals

Readiness

Pipelines

Applications

Offers

Caches remain disposable.

---

## Read API

Public endpoints

GET /recommendations

GET /matches

GET /pipelines

GET /applications

GET /offers

GET /signals

GET /readiness

Read APIs never perform computation.

---

# Runtime Event Subscriptions

Primary subscriptions

EvidencePublished

ParticipantRecordUpdated

CompetencyUpdated

TranscriptUpdated

PortfolioUpdated

RelationshipUpdated

OpportunityPublished

OpportunityUpdated

PolicyUpdated

DeadlineUpdated

OrganizationUpdated

ParticipantGoalUpdated

PreferenceUpdated

Only subscribed Events trigger computation.

---

# Runtime Processing Pipeline

```
Event Received

↓

Validate Event

↓

Determine Impact

↓

Load Participant

↓

Load Opportunity Set

↓

Eligibility Evaluation

↓

Readiness Computation

↓

Ranking

↓

Recommendation Generation

↓

Planning Signals

↓

Persist Projections

↓

Publish Events
```

Every stage remains deterministic.

---

# Incremental Processing

Most Events trigger localized recomputation.

Example

Evidence Published

↓

Leadership Competency Updated

↓

Leadership Scholarships

↓

Leadership Fellowships

↓

Leadership Pipelines

↓

Planning Signals

Career Opportunities remain unchanged.

---

# Opportunity Publication

When Organizations publish Opportunities

Opportunity Published

↓

Policy Loaded

↓

Eligible Participants Identified

↓

Match Queue

↓

Recommendations Generated

↓

Signals Published

The engine computes participant impact automatically.

---

# Full Participant Rebuild

Executed when

Participant Merge

Knowledge Graph Upgrade

Policy Changes

Engine Upgrade

Replay

Pipeline

```
Participant Record

↓

Knowledge Graph

↓

Evaluate Every Opportunity

↓

Generate Matches

↓

Rank

↓

Recommendations

↓

Signals

↓

Planning
```

---

# Full Opportunity Rebuild

Executed when

Opportunity Updated

Eligibility Changed

Policy Updated

Organization Updated

Pipeline

```
Opportunity

↓

Policies

↓

Eligible Participants

↓

Ranking

↓

Recommendations

↓

Signals

↓

Planning
```

---

# Queue Strategy

Independent queues

Eligibility Queue

Matching Queue

Ranking Queue

Recommendation Queue

Pipeline Queue

Replay Queue

Maintenance Queue

Dead Letter Queue

Queues support horizontal scaling.

---

# Concurrency

Participant recommendations execute serially.

Separate participants execute concurrently.

Organizations process independently.

Recommendation ordering remains deterministic.

---

# Replay

Supports complete replay.

Replay

Historical Events

↓

Knowledge Graph

↓

Participant Record

↓

Opportunity Engine

↓

Planning

↓

Validation

Replay always reproduces identical recommendations.

---

# Recovery

Failures recover using replay.

Replay Events

↓

Recompute Eligibility

↓

Recompute Rankings

↓

Recompute Recommendations

↓

Validate

↓

Resume Processing

Canonical data remains untouched.

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

Alert

↓

Operator Review

Failures never corrupt projections.

---

# Idempotency

Every Event contains

Event ID

Correlation ID

Causation ID

Projection Version

Duplicate Events produce identical outputs.

Repeated computation never changes results.

---

# API Surface

Public

Recommendations

Matches

Readiness

Applications

Offers

Signals

Deadlines

Pipelines

Internal

Replay Participant

Replay Opportunity

Refresh Recommendations

Refresh Pipelines

Recompute Rankings

Generate Signals

Administrative APIs require elevated permissions.

---

# Observability

Metrics

Recommendation latency

Eligibility latency

Queue depth

Ranking duration

Replay duration

Worker utilization

Cache hit rate

Pipeline generation time

Signal generation time

Metrics remain time-series.

---

# Logging

Every recommendation logs

Participant

Opportunity

Projection Version

Reason

Duration

Confidence

Source Event

Correlation ID

Logs remain structured.

---

# Health Checks

Expose

Liveness

Readiness

Queue Status

Replay Status

Worker Status

Pipeline Status

Cache Status

Recommendation Status

---

# Security

Runtime evaluates

Identity

Relationships

Organizations

Policies

Permissions

Consent

Visibility

No runtime optimization bypasses authorization.

---

# Runtime Events Published

ParticipantMatched

EligibilityComputed

RecommendationGenerated

OpportunityRanked

OpportunitySignalGenerated

PipelineUpdated

PlanningSignalGenerated

OfferReceived

OfferAccepted

ApplicationSubmitted

ReplayCompleted

RecommendationExpired

---

# Deployment

Supports

Rolling Updates

Blue/Green Deployments

Replay Validation

Versioned Workers

Projection Compatibility

Zero Downtime

---

# Disaster Recovery

Recover

Opportunity Catalog

↓

Policies

↓

Participant Record

↓

Knowledge Graph

↓

Opportunity Engine

↓

Recommendations

↓

Planning

↓

Caches

Everything remains reconstructable.

---

# Runtime Invariants

Workers remain stateless.

Recommendations remain projections.

Eligibility remains computed.

Policies remain authoritative.

Queues remain replayable.

Events remain immutable.

Failures remain recoverable.

Recommendations remain reproducible.

Caches remain disposable.

The Opportunity Engine never owns business truth.

---

# Definition of Done

✓ Runtime components defined.

✓ Event subscriptions documented.

✓ Processing pipeline defined.

✓ Incremental updates supported.

✓ Full rebuild strategy defined.

✓ Replay supported.

✓ Recovery documented.

✓ Queue architecture defined.

✓ API surface defined.

✓ Observability defined.

✓ Security enforced.

✓ Runtime invariants documented.

Only then may implementation begin.

---

# Closing Principle

The Opportunity Engine exists to ensure that participant growth is continuously translated into meaningful advancement.

It never waits for participants to search.

It continuously evaluates readiness, discovers possibility, explains opportunity, and connects every participant with the next best step toward their future.

Opportunity is not static.

It is continuously computed.