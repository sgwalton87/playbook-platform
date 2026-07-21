# Participant Record Engine

## 04_RUNTIME_MODEL.md

Version: 2.0

Status: Canonical

Owner: Platform Core

Related Documents

- 01_CANONICAL_SPEC.md
- 02_COMPUTATIONAL_MODEL.md
- 03_PERSISTENCE_MODEL.md
- ENGINE_CONTRACT.md
- EVENT_CONTRACT.md
- KNOWLEDGE_GRAPH.md

---

# Purpose

This document defines the runtime behavior of the Participant Record Engine.

It describes how the engine operates in production, responds to events, computes projections, recovers from failure, and scales across millions of Participants.

---

# Runtime Philosophy

The Participant Record Engine is reactive.

It does not poll.

It does not own user interactions.

It reacts to canonical Events.

Every projection is event-driven.

---

# Runtime Responsibilities

Subscribe to Events

Traverse the Knowledge Graph

Compute projections

Publish projections

Cache results

Maintain snapshots

Support replay

Recover from failures

Expose read APIs

Never mutate Evidence

---

# Runtime Architecture

```
Evidence Engine

↓

Event Bus

↓

Participant Record Engine

↓

Knowledge Graph

↓

Projection Workers

↓

Participant Record

↓

Opportunity Engine

↓

Planning Engine

↓

Compass
```

The engine exists between Evidence and Opportunity.

---

# Runtime Components

## Event Subscriber

Receives canonical Events.

Examples

EvidencePublished

EvidenceArchived

EvidenceVersionCreated

RelationshipUpdated

OrganizationMembershipChanged

ParticipantCreated

PolicyUpdated

---

## Graph Resolver

Traverses the Knowledge Graph.

Determines affected:

Competencies

Profiles

Timelines

Snapshots

Growth Indicators

Opportunity Signals

Only impacted graph regions are traversed.

---

## Projection Worker

Responsible for rebuilding projections.

Supports

Incremental updates

Partial rebuilds

Full participant rebuilds

Replay processing

Projection workers are stateless.

---

## Snapshot Worker

Creates immutable historical snapshots.

Examples

Graduation

Recruiting Season

College Application

Program Completion

Snapshots execute asynchronously.

---

## Cache Manager

Maintains projection cache.

Examples

Dashboard

Transcript

Portfolio

Competencies

Growth Indicators

Caches expire automatically.

Caches never become authoritative.

---

## Read API

Exposes Participant Record data.

Examples

GET /participant-record

GET /timeline

GET /competencies

GET /portfolio

GET /transcript

GET /growth

Read APIs never perform computation.

---

# Event Subscriptions

Primary subscriptions include:

EvidencePublished

EvidenceUpdated

EvidenceArchived

EvidenceVisibilityChanged

ParticipantCreated

ParticipantMerged

RelationshipUpdated

OrganizationMembershipChanged

CompetencyDefinitionUpdated

PolicyUpdated

GraphUpdated

Only subscribed Events trigger computation.

---

# Event Processing Pipeline

```
Event Received

↓

Validate Event

↓

Load Participant

↓

Resolve Graph

↓

Determine Impact

↓

Queue Projection

↓

Compute Projection

↓

Persist Projection

↓

Publish Projection Event
```

Processing must be deterministic.

---

# Incremental Processing

Small Events trigger localized updates.

Example

EvidencePublished

↓

Leadership Competency

↓

Leadership Profile

↓

Participant Record

↓

Opportunity Signals

↓

Planning Signals

Entire records are not rebuilt unnecessarily.

---

# Full Rebuild Processing

Executed when:

Engine upgraded

Policy changed

Knowledge Graph changed

Participant merged

Recovery required

Pipeline

```
Participant

↓

Load All Evidence

↓

Load Graph

↓

Compute Everything

↓

Publish Record

↓

Publish Signals
```

---

# Queue Strategy

Separate queues exist for:

Projection Queue

Snapshot Queue

Replay Queue

Maintenance Queue

Dead Letter Queue

Queues support horizontal scaling.

---

# Worker Scaling

Workers are stateless.

Additional workers may be added without changing business logic.

Scaling occurs by:

Participant volume

Event throughput

Projection complexity

Background workload

---

# Concurrency

Participant projections execute serially.

Different Participants may compute concurrently.

Example

Participant A

Worker 1

Participant B

Worker 2

Participant C

Worker 3

This prevents projection conflicts.

---

# Replay Support

Every projection supports replay.

Replay process

Historical Events

↓

Replay Queue

↓

Projection Workers

↓

Participant Record

↓

Validation

Replay guarantees deterministic reconstruction.

---

# Recovery

Failures are recoverable.

Recovery steps

Replay Events

↓

Rebuild Graph

↓

Recompute Record

↓

Validate Projection

↓

Resume Processing

No manual data repair should be required.

---

# Failure Handling

Projection Failure

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

Failures never corrupt canonical data.

---

# Idempotency

Every Event contains

Event ID

Correlation ID

Causation ID

Projection Version

Duplicate Events are ignored.

Repeated processing produces identical results.

---

# API Surface

Public APIs

Get Participant Record

Get Timeline

Get Transcript

Get Portfolio

Private APIs

Refresh Projection

Rebuild Record

Replay Participant

Create Snapshot

Internal APIs require elevated authorization.

---

# Observability

Metrics include

Projection latency

Queue depth

Replay duration

Cache hit rate

Graph traversal time

Projection failures

Worker utilization

Snapshot duration

All metrics are time-series.

---

# Logging

Every projection logs

Participant

Projection Version

Engine Version

Event

Duration

Result

Correlation ID

Logs remain structured.

---

# Health Checks

The engine exposes

Liveness

Readiness

Queue Status

Replay Status

Worker Status

Cache Status

Graph Status

---

# Security

Runtime honors

Identity

Relationships

Organizations

Policies

Permissions

Consent

No runtime optimization bypasses authorization.

---

# Runtime Events Published

ParticipantRecordUpdated

TimelineUpdated

CompetencyProfileUpdated

GrowthIndicatorsUpdated

TranscriptUpdated

PortfolioUpdated

SnapshotCreated

ProjectionCompleted

ProjectionFailed

ReplayCompleted

---

# Deployment

Supports

Blue/Green

Rolling Updates

Replay Validation

Versioned Workers

Projection Compatibility

No downtime required.

---

# Disaster Recovery

Recover

Events

↓

Knowledge Graph

↓

Evidence

↓

Participant Record

↓

Caches

↓

Read Models

Evidence remains the source of truth.

---

# Runtime Invariants

Workers are stateless.

Events are immutable.

Projections are deterministic.

Evidence is canonical.

Queues are replayable.

Failures are recoverable.

Participant Records remain reproducible.

Caches are disposable.

Runtime never owns business truth.

---

# Definition of Done

✓ Runtime components exist.

✓ Event subscriptions defined.

✓ Projection pipeline documented.

✓ Replay supported.

✓ Recovery documented.

✓ Worker scaling defined.

✓ API surface documented.

✓ Observability exists.

✓ Health checks exist.

✓ Deployment strategy defined.

✓ Runtime invariants enforced.

Only then may implementation begin.

---

# Closing Principle

The Participant Record Engine exists to ensure that every verified experience becomes part of a Participant's lifelong story.

No matter how the platform evolves, every record can always be reconstructed from immutable Evidence and the Knowledge Graph.

The runtime is temporary.

The Participant's story is permanent.