# Planning Engine

## 03_PERSISTENCE_MODEL.md

Version: 2.0

Status: Canonical

Owner: Platform Core

Related Documents

- 01_CANONICAL_SPEC.md
- 02_COMPUTATIONAL_MODEL.md
- DATABASE_BLUEPRINT.md
- OPPORTUNITY_ENGINE.md
- PARTICIPANT_RECORD_ENGINE.md
- KNOWLEDGE_GRAPH.md
- ENGINE_CONTRACT.md

---

# Purpose

This document defines the persistence architecture for the Planning Engine.

The Planning Engine stores personalized development plans, execution state, scheduling information, progress projections, and planning history.

Canonical truth remains in the Evidence Engine.

Plans remain reproducible.

---

# Philosophy

Persist plans.

Persist execution.

Never duplicate truth.

Evidence remains canonical.

Plans remain participant-owned.

Planning remains adaptive.

---

# Persistence Model

```
Participant Record

+

Opportunity Engine

+

Knowledge Graph

↓

Planning Engine

↓

Plans

↓

Schedules

↓

Progress

↓

Read Models

↓

Compass

↓

Participant Experience
```

Only planning projections are persisted.

---

# Ownership

Owning Engine

Planning Engine

Owning Schema

planning

Aggregate Root

Plan

---

# Canonical Tables

plans

plan_versions

plan_snapshots

plan_templates

plan_goals

plan_objectives

plan_milestones

plan_actions

plan_dependencies

plan_habits

plan_schedules

plan_calendar_events

plan_progress

plan_risks

plan_reflections

plan_adjustments

plan_success_metrics

plan_recommendations

plan_signals

plan_projection_metadata

plan_projection_history

plan_projection_queue

---

# Aggregate Structure

Plan

├── Goals

├── Objectives

├── Milestones

├── Actions

├── Dependencies

├── Habits

├── Schedule

├── Progress

├── Risks

├── Reflections

├── Signals

├── Snapshots

└── Projection Metadata

---

# Primary Keys

Every table includes

id

participant_id

created_at

updated_at

projection_version

engine_version

Canonical identifiers never change.

---

# Foreign Keys

Planning tables reference canonical entities.

Examples

participant_id

goal_id

objective_id

milestone_id

action_id

opportunity_id

organization_id

relationship_id

evidence_id

plan_id

No planning table owns canonical truth.

---

# Plan Storage

Plans store

Category

Status

Priority

Current Stage

Created By

Generated At

Updated At

Active Version

Plans remain living projections.

---

# Goal Storage

Goals contain

Name

Description

Target Date

Priority

Current Progress

Related Opportunities

Related Competencies

Goals remain participant-owned.

---

# Objective Storage

Objectives store

Goal

Description

Completion State

Progress

Dependencies

Estimated Duration

Objectives support measurable outcomes.

---

# Milestone Storage

Milestones include

Objective

Expected Completion

Completion Date

Status

Evidence Produced

Milestones remain deterministic.

---

# Action Storage

Actions store

Milestone

Title

Description

Status

Priority

Estimated Duration

Scheduled Date

Completed Date

Supporting Resources

Actions remain executable units.

---

# Dependency Storage

Dependencies store

Source Action

Target Action

Dependency Type

Critical Path

Ordering Rule

Dependencies remain acyclic.

---

# Habit Storage

Habits include

Frequency

Cadence

Current Streak

Completion Rate

Evidence Generated

Habit history remains longitudinal.

---

# Schedule Storage

Schedules include

Planned Date

Estimated Duration

Calendar Reference

Time Zone

Availability Constraints

Reschedule History

Schedules remain adaptive.

---

# Progress Storage

Progress stores

Completion %

Milestones Complete

Actions Complete

Evidence Generated

Readiness

Momentum

Trend

Progress remains computed.

---

# Risk Storage

Risks include

Risk Type

Severity

Probability

Mitigation Strategy

Detected At

Resolved At

Risks remain projections.

---

# Reflection Storage

Reflections contain

Participant Notes

Lessons Learned

Challenges

Wins

Created At

Visibility

Reflections remain participant-authored context.

---

# Success Metrics

Metrics include

Completion Rate

Goal Achievement

Time to Completion

Evidence Generated

Competencies Developed

Opportunity Outcomes

Metrics support analytics.

---

# Recommendation Storage

Planning recommendations include

Reason

Suggested Action

Priority

Expected Benefit

Supporting Opportunity

Supporting Evidence

Recommendations remain disposable.

---

# Signal Storage

Signals include

Upcoming Deadline

Overdue Action

Plan Adjustment

Risk Increased

Goal Achieved

Milestone Ready

Signals expire automatically.

---

# Projection Metadata

Every projection stores

Projection Version

Engine Version

Knowledge Graph Version

Policy Version

Generated At

Source Event

Correlation ID

Projection Hash

Projections remain reproducible.

---

# Projection History

History records

Plan Generation

Plan Adjustment

Schedule Changes

Priority Changes

Replay

Policy Changes

Relationship Changes

History remains immutable.

---

# Read Models

Optimized read models include

Participant Dashboard

Today's Plan

Weekly Plan

Monthly Roadmap

Mentor Dashboard

Advisor Dashboard

Parent Dashboard

Organization Dashboard

Read models remain disposable.

---

# Materialized Views

Materialized views support

Upcoming Deadlines

Participant Progress

Completion Rates

Goal Analytics

Habit Analytics

Organization Analytics

Views may be rebuilt.

---

# Search

Search indexes support

Goals

Objectives

Milestones

Actions

Opportunities

Organizations

Competencies

Deadlines

Search never changes plan computation.

---

# Caching

Cached projections include

Today's Tasks

Weekly Schedule

Plan Progress

Upcoming Milestones

Recommendations

Signals

Caches remain disposable.

---

# Event Persistence

Every projection stores

Source Event

Replay Version

Projection Version

Correlation ID

Replay Timestamp

Planning supports deterministic replay.

---

# Rebuild Strategy

Incremental

```
Evidence

↓

Participant Record

↓

Opportunity

↓

Affected Plan

↓

Updated Schedule

↓

Updated Progress
```

Full rebuild

```
Participant Record

↓

Knowledge Graph

↓

Goals

↓

Opportunities

↓

Entire Planning Graph

↓

Schedules

↓

Signals

↓

Compass
```

Outputs remain identical.

---

# Versioning

Plan versions remain immutable.

Updates create new versions.

Historical plans remain recoverable.

Snapshots preserve important milestones.

---

# Archival

Completed plans

Archived plans

Superseded plans

Historical plans

Planning history is never deleted.

---

# Security

Every table supports Row-Level Security.

Authorization evaluates

Identity

Relationships

Organizations

Policies

Consent

Visibility

Planning never bypasses authorization.

---

# Audit

Every projection records

Source Event

Projection Version

Engine Version

Timestamp

Knowledge Graph Version

Policy Version

Projection Hash

Correlation ID

Audit history remains immutable.

---

# Infrastructure

Recommended implementation

PostgreSQL

Supabase

JSONB

GIN Indexes

Materialized Views

Background Workers

LISTEN / NOTIFY

Event Queue

Infrastructure remains replaceable.

---

# Performance Goals

Today's Plan

<50ms

Plan retrieval

<100ms

Incremental update

<500ms

Full participant rebuild

<5 seconds

Bulk organization recomputation

Background processing

Correctness always precedes speed.

---

# Domain Invariants

Plans remain participant-owned.

Goals remain measurable.

Actions remain executable.

Progress remains computed.

Schedules remain adaptive.

History remains immutable.

Projection tables never own business truth.

Evidence remains canonical.

Outputs remain reproducible.

---

# Definition of Done

✓ Canonical tables defined.

✓ Aggregate persistence defined.

✓ Schedule storage defined.

✓ Progress storage defined.

✓ Recommendation storage defined.

✓ Read models defined.

✓ Search strategy defined.

✓ Caching strategy defined.

✓ Rebuild strategy defined.

✓ Security defined.

✓ Audit defined.

✓ Infrastructure independence maintained.

Only then may implementation begin.

---

# Closing Principle

The Planning Engine persists the evolving roadmap of participant development.

It stores personalized plans, execution state, and progress while preserving the fundamental architectural principle that truth lives in Evidence and every plan can always be regenerated from canonical participant development.