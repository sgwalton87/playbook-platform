# Opportunity Engine

## 03_PERSISTENCE_MODEL.md

Version: 2.0

Status: Canonical

Owner: Platform Core

Related Documents

- 01_CANONICAL_SPEC.md
- 02_COMPUTATIONAL_MODEL.md
- DATABASE_BLUEPRINT.md
- PARTICIPANT_RECORD_ENGINE.md
- KNOWLEDGE_GRAPH.md
- ENGINE_CONTRACT.md

---

# Purpose

This document defines the persistence architecture for the Opportunity Engine.

The Opportunity Engine persists computed opportunity projections that allow Participants, Organizations, Planning, and Compass to retrieve recommendations efficiently.

Canonical truth remains external.

Eligibility is computed.

Recommendations are projected.

---

# Philosophy

Persist projections.

Never duplicate truth.

Participants own development.

Organizations own opportunities.

Policies govern eligibility.

The Opportunity Engine computes fit.

---

# Persistence Model

```
Organizations

+

Participant Record

+

Knowledge Graph

+

Policies

↓

Opportunity Engine

↓

Opportunity Projections

↓

Read Models

↓

Planning

↓

Compass

↓

Participant Experience
```

Only computed projections are stored.

---

# Ownership

Owning Engine

Opportunity Engine

Owning Schema

opportunity

Aggregate Root

Opportunity

---

# Canonical Tables

opportunities

opportunity_categories

opportunity_types

opportunity_requirements

opportunity_policies

opportunity_deadlines

opportunity_matches

opportunity_match_scores

opportunity_recommendations

opportunity_rankings

opportunity_readiness

opportunity_signals

opportunity_pipelines

participant_applications

participant_application_documents

participant_offers

participant_waitlists

participant_bookmarks

participant_preferences

participant_notifications

opportunity_projection_metadata

opportunity_projection_history

opportunity_projection_queue

---

# Aggregate Structure

Opportunity

├── Eligibility Rules

├── Requirements

├── Policies

├── Deadlines

├── Matches

├── Rankings

├── Recommendations

├── Signals

├── Applications

├── Offers

├── Pipeline

└── Projection Metadata

---

# Primary Keys

Every table contains

id

created_at

updated_at

projection_version

engine_version

Canonical identifiers remain stable.

---

# Foreign Keys

Projection tables reference canonical entities.

Examples

participant_id

organization_id

opportunity_id

relationship_id

competency_id

evidence_id

plan_id

policy_id

No projection table owns canonical business truth.

---

# Opportunity Storage

Each Opportunity stores

Organization

Category

Type

Visibility

Status

Publication Date

Expiration Date

Location

Metadata

Opportunities remain organization-owned.

---

# Requirement Storage

Requirements include

Minimum GPA

Required Competencies

Residency

Citizenship

Enrollment

Grade Level

Portfolio Requirements

Transcript Requirements

Essay Requirements

Verification Requirements

Requirements remain declarative.

---

# Policy Storage

Policies define

Eligibility

Visibility

Priority Groups

Application Limits

Submission Windows

Review Rules

Decision Rules

Policies remain versioned.

---

# Match Storage

Matches include

Participant

Opportunity

Eligibility State

Readiness

Match Score

Confidence

Generated At

Projection Version

Matches are projections.

---

# Match Score Storage

Scores store multiple dimensions.

Examples

Eligibility Score

Readiness Score

Alignment Score

Relationship Score

Urgency Score

Impact Score

Financial Value

Development Value

Composite Score

Scores remain explainable.

---

# Recommendation Storage

Recommendations contain

Participant

Opportunity

Reason

Supporting Evidence

Confidence

Priority

Next Action

Deadline

Expected Benefit

Recommendations are disposable projections.

---

# Readiness Storage

Readiness stores

Overall Readiness

Missing Requirements

Supporting Competencies

Required Documents

Estimated Preparation

Updated At

Readiness continuously changes.

---

# Signal Storage

Signals include

Application Ready

Deadline Soon

New Match

Improved Match

Offer Received

Missing Requirement

Relationship Available

Signals expire automatically.

---

# Pipeline Storage

Participants maintain multiple pipelines.

Examples

College

Career

Scholarships

Athletics

Entrepreneurship

Leadership

Financial Aid

Each pipeline stores

Current Stage

Priority

Progress

Upcoming Actions

Pipelines remain projections.

---

# Application Storage

Applications include

Opportunity

Participant

Current Stage

Submitted Documents

Status

Review Progress

Decision

Applications represent participant activity.

---

# Offer Storage

Offers include

Organization

Opportunity

Participant

Offer Date

Expiration

Decision

Conditions

Accepted At

Rejected At

Offers originate from organizations.

---

# Bookmark Storage

Bookmarks contain

Participant

Opportunity

Created At

Reminder Preferences

Bookmarks never affect rankings.

---

# Preference Storage

Preferences include

Geography

Career Interests

Majors

Sports

Industries

Opportunity Types

Notification Preferences

Preferences influence ranking—not eligibility.

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

All projections remain reproducible.

---

# Projection History

Projection history records

Eligibility Changes

Ranking Changes

Recommendation Changes

Policy Changes

Relationship Changes

Replay Events

History supports auditing.

---

# Read Models

Optimized read models include

Recommended Opportunities

Application Dashboard

Scholarship Dashboard

Recruiting Dashboard

Career Dashboard

Mentorship Dashboard

Organization Dashboard

Advisor Dashboard

Read models are disposable.

---

# Materialized Views

Materialized views support

Top Opportunities

Recently Qualified

Upcoming Deadlines

Applications

Acceptance Rates

Program Analytics

Recruitment Analytics

Views may be rebuilt.

---

# Search

Search indexes support

Keywords

Categories

Organizations

Competencies

Locations

Majors

Sports

Industries

Opportunity Types

Search never determines ranking.

---

# Caching

Cached projections include

Recommendations

Readiness

Pipelines

Deadlines

Signals

Applications

Offers

Caches remain disposable.

---

# Event Persistence

Every projection stores

Source Event

Event Version

Replay Status

Replay Timestamp

Projection Version

Every recommendation supports replay.

---

# Rebuild Strategy

Incremental

```
New Evidence

↓

Participant Record

↓

Affected Opportunities

↓

Updated Recommendations

↓

Planning Signals
```

Full rebuild

```
Participant

↓

Participant Record

↓

Knowledge Graph

↓

All Opportunities

↓

Eligibility

↓

Ranking

↓

Recommendations

↓

Signals
```

Outputs remain identical.

---

# Versioning

Projection versions are immutable.

Policy updates create new versions.

Ranking updates create new versions.

Historical recommendations remain available.

---

# Archival

Recommendations expire.

Applications remain historical.

Offers remain historical.

Opportunity history is never destroyed.

Historical projections support analytics.

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

No recommendation bypasses authorization.

---

# Audit

Every projection records

Source Event

Projection Version

Policy Version

Knowledge Graph Version

Timestamp

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

Recommendation retrieval

<100ms

Incremental update

<500ms

Full participant recomputation

<5 seconds

Bulk organization recomputation

Background processing

Correctness always precedes performance.

---

# Domain Invariants

Organizations own Opportunities.

Participants own Applications.

Policies govern eligibility.

Recommendations remain projections.

Readiness is computed.

Rankings are deterministic.

Signals are ephemeral.

History is preserved.

Projection tables never own business truth.

---

# Definition of Done

✓ Persistence model defined.

✓ Canonical tables defined.

✓ Projection metadata exists.

✓ Match storage defined.

✓ Recommendation storage defined.

✓ Pipeline storage defined.

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

The Opportunity Engine persists computed pathways to advancement—not the advancement itself.

Every recommendation, ranking, readiness score, and signal can be regenerated from canonical Opportunities, Participant Records, Policies, and the Knowledge Graph.

Truth remains distributed.

Opportunity is continuously computed.