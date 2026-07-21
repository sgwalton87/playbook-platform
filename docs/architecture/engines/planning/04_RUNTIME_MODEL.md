# Planning Engine

## 04_RUNTIME_MODEL.md

Version: 2.0

Status: Canonical

Owner: Platform Core

Related Documents

- 01_CANONICAL_SPEC.md
- 02_COMPUTATIONAL_MODEL.md
- 03_PERSISTENCE_MODEL.md
- OPPORTUNITY_ENGINE.md
- PARTICIPANT_RECORD_ENGINE.md
- KNOWLEDGE_GRAPH.md
- EVENT_CONTRACT.md

---

# Purpose

This document defines the runtime behavior of the Planning Engine.

It describes how plans are generated, updated, scheduled, monitored, replayed, and adapted throughout a participant's lifetime.

The Planning Engine continuously orchestrates participant execution.

---

# Runtime Philosophy

Planning is never static.

Plans respond to participant growth.

Plans respond to opportunity.

Plans respond to life.

Every completed action creates new evidence.

Every new piece of evidence may change future plans.

Planning is continuous orchestration.

---

# Runtime Responsibilities

Subscribe to Events

Generate Plans

Generate Objectives

Generate Milestones

Generate Actions

Schedule Activities

Compute Priorities

Track Progress

Assess Risks

Adapt Plans

Publish Planning Signals

Notify Compass

Support Replay

Recover from Failure

Expose Read APIs

Never modify canonical Evidence

---

# Runtime Architecture

```
Participant Record

↓

Opportunity Engine

↓

Planning Engine

↓

Planning Workers

↓

Plan Store

↓

Compass

↓

Participant Experience

↓

Evidence Engine
```

Planning sits between Opportunity and participant execution.

---

# Runtime Components

## Goal Worker

Creates and updates participant goals.

Sources include

Participant

Opportunity

Organization

Mentor

Compass

Goals remain participant-owned.

---

## Objective Worker

Computes measurable objectives.

Consumes

Goals

Opportunities

Competencies

Produces

Objectives

---

## Milestone Worker

Generates milestones.

Examples

FAFSA Submitted

Essay Completed

Leadership Badge Earned

Portfolio Published

Milestones remain deterministic.

---

## Action Worker

Produces executable actions.

Examples

Upload Transcript

Attend Workshop

Meet Advisor

Write Essay

Complete Course

Actions remain atomic.

---

## Dependency Worker

Maintains dependency graph.

Examples

FAFSA

↓

Financial Aid

↓

Scholarship Applications

Dependency graph remains acyclic.

---

## Scheduling Worker

Computes schedules using

Deadlines

Availability

Dependencies

Capacity

Preferences

Schedules continuously adapt.

---

## Progress Worker

Computes

Completion

Momentum

Readiness

Consistency

Evidence Generated

Progress remains computed.

---

## Risk Worker

Continuously evaluates

Missed Deadlines

Scheduling Conflicts

Missing Documents

Capacity Overload

Eligibility Risk

Risk influences reprioritization.

---

## Adaptation Worker

Monitors

Evidence

Goals

Opportunities

Relationships

Policies

Participant Capacity

Plans automatically evolve.

---

## Signal Worker

Produces planning signals.

Examples

Today's Priority

Upcoming Deadline

Action Overdue

Milestone Ready

Goal Completed

Risk Increased

Signals are ephemeral.

---

## Calendar Connector

Synchronizes with

Academic Calendar

Athletic Calendar

Organization Events

Participant Availability

Planning remains calendar-aware.

---

## Cache Manager

Maintains

Today's Plan

Weekly Plan

Progress

Upcoming Milestones

Recommendations

Signals

Caches remain disposable.

---

## Read API

Public endpoints

GET /plans

GET /goals

GET /objectives

GET /milestones

GET /actions

GET /schedule

GET /progress

GET /risks

GET /signals

Read APIs never compute plans.

---

# Runtime Event Subscriptions

Primary subscriptions

ParticipantRecordUpdated

OpportunityRanked

RecommendationGenerated

EvidencePublished

GoalUpdated

RelationshipUpdated

PolicyUpdated

DeadlineUpdated

OrganizationUpdated

CalendarUpdated

AvailabilityUpdated

Only subscribed events trigger planning updates.

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

Load Existing Plan

↓

Generate Adjustments

↓

Recompute Priorities

↓

Update Schedule

↓

Update Progress

↓

Publish Signals

↓

Persist Plan
```

Every computation remains deterministic.

---

# Incremental Processing

Example

Leadership Badge Earned

↓

Leadership Competency Updated

↓

Leadership Plan Updated

↓

Scholarship Plan Updated

↓

Today's Tasks Updated

↓

Compass Notified

Career Plan remains unchanged.

---

# Full Plan Generation

Executed when

New Participant

New Goal

Accepted Opportunity

Major Policy Change

Participant Merge

Pipeline

```
Participant Record

↓

Knowledge Graph

↓

Goals

↓

Opportunities

↓

Objectives

↓

Milestones

↓

Actions

↓

Dependencies

↓

Schedule

↓

Signals
```

---

# Plan Adaptation

Plans automatically adapt when

Opportunity changes

Participant changes

Deadline changes

Capacity changes

Relationship changes

Evidence changes

Policy changes

Adaptation preserves completed history.

---

# Queue Strategy

Separate queues

Goal Queue

Objective Queue

Milestone Queue

Action Queue

Scheduling Queue

Progress Queue

Replay Queue

Maintenance Queue

Dead Letter Queue

Queues scale independently.

---

# Concurrency

Plans execute serially per participant.

Multiple participants compute concurrently.

Dependency ordering remains deterministic.

---

# Replay

Supports complete replay.

Replay

Historical Events

↓

Participant Record

↓

Opportunity Engine

↓

Planning Engine

↓

Validation

Replay produces identical plans.

---

# Recovery

Failures recover through replay.

Replay Events

↓

Recompute Plans

↓

Validate Schedule

↓

Resume Processing

Canonical evidence remains unchanged.

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

No participant history is lost.

---

# Idempotency

Every Event includes

Event ID

Correlation ID

Causation ID

Projection Version

Duplicate events never duplicate work.

---

# API Surface

Public

Plans

Goals

Progress

Milestones

Actions

Schedules

Signals

Risks

Internal

Replay Plan

Rebuild Participant Plans

Generate Plan

Refresh Schedule

Generate Signals

Administrative APIs require elevated permissions.

---

# Observability

Metrics

Plan generation time

Schedule generation time

Progress computation time

Queue depth

Worker utilization

Replay duration

Risk detection frequency

Signal generation time

Metrics remain time-series.

---

# Logging

Every plan update logs

Participant

Plan

Projection Version

Duration

Result

Source Event

Correlation ID

Logs remain structured.

---

# Health Checks

Expose

Liveness

Readiness

Queue Status

Worker Status

Replay Status

Schedule Status

Signal Status

Cache Status

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

Planning never bypasses authorization.

---

# Runtime Events Published

PlanGenerated

PlanUpdated

ObjectiveCreated

MilestoneCompleted

ActionCompleted

ProgressUpdated

RiskDetected

PlanningSignalGenerated

PlanAdjusted

ReplayCompleted

---

# Deployment

Supports

Rolling Updates

Blue/Green Deployments

Replay Validation

Versioned Workers

Zero Downtime

Projection Compatibility

---

# Disaster Recovery

Recover

Participant Record

↓

Knowledge Graph

↓

Opportunity Engine

↓

Planning Engine

↓

Plans

↓

Schedules

↓

Signals

↓

Compass

Everything remains reconstructable.

---

# Runtime Invariants

Workers remain stateless.

Plans remain participant-owned.

Planning remains deterministic.

Dependencies remain acyclic.

Queues remain replayable.

Events remain immutable.

Failures remain recoverable.

Schedules remain adaptive.

Caches remain disposable.

Planning never owns canonical truth.

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

The Planning Engine transforms opportunity into sustained execution.

It continuously guides participants toward meaningful advancement by adapting plans, sequencing actions, monitoring progress, and responding to change.

Plans are never static artifacts.

They are living systems that evolve with every experience, every opportunity, and every step of participant growth.