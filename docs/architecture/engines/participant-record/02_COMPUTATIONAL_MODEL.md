# Participant Record Engine

## 02_COMPUTATIONAL_MODEL.md

Version: 2.0

Status: Canonical

Owner: Platform Core

Related Documents

- 01_CANONICAL_SPEC.md
- COMPUTATION_MODEL.md
- KNOWLEDGE_GRAPH.md
- EVIDENCE_ENGINE.md
- EVENT_CONTRACT.md

---

# Purpose

This document defines how the Participant Record Engine transforms verified Evidence into a canonical Participant Record.

The engine never accepts manual edits.

Everything is computed.

---

# Philosophy

The Participant Record is never written.

It is projected.

Evidence is truth.

The Record is computation.

---

# Inputs

The Participant Record Engine consumes only canonical inputs.

Primary inputs include:

Verified Evidence

Knowledge Graph

Participant Identity

Relationships

Organizations

Policies

Competencies

Events

No UI input directly modifies a Participant Record.

---

# Outputs

The engine produces:

Participant Record

Timeline

Competency Profile

Achievement Profile

Domain Profiles

Growth Indicators

Snapshots

Portfolio Registry

Transcript Registry

Opportunity Signals

Planning Signals

All outputs are projections.

---

# Computation Pipeline

```
Evidence Published

↓

Knowledge Graph Updated

↓

Relevant Nodes Identified

↓

Competencies Computed

↓

Profiles Updated

↓

Timeline Updated

↓

Growth Indicators Updated

↓

Participant Record Projected

↓

Projection Published
```

Every stage is deterministic.

---

# Projection Rules

Participant Records are rebuilt from Evidence.

Never from user edits.

Every projection is reproducible.

Running the engine twice with identical inputs must produce identical outputs.

---

# Timeline Computation

Timeline entries are ordered by canonical event time.

Each entry references:

Evidence ID

Domain

Source

Organization

Competencies

Verification Status

Timeline never stores duplicate events.

---

# Competency Computation

Each competency is computed from supporting Evidence.

Example

Leadership

↓

Volunteer Leadership

Captain

Founder

Mentor

Teacher Assistant

Community Organizer

↓

Leadership Competency

Competencies accumulate over time.

---

# Competency Confidence

Confidence increases through:

Multiple Evidence items

Independent verification

Multiple organizations

Longitudinal consistency

Confidence never decreases because of missing data.

Only new verified Evidence changes confidence.

---

# Domain Profile Computation

Each human development domain produces a profile.

Examples

Academic Profile

Athletic Profile

Founder Profile

Career Profile

Leadership Profile

Financial Capability Profile

Community Profile

Each profile references canonical Evidence.

---

# Achievement Computation

Achievements summarize milestone Evidence.

Example

Evidence

↓

Graduation

↓

Achievement

Achievements never exist without Evidence.

---

# Growth Indicator Computation

Growth Indicators summarize long-term trends.

Examples

Leadership Growth

Consistency

Engagement

Innovation

Community Impact

Founder Development

Indicators use multiple Evidence items.

No single event determines an indicator.

---

# Record Snapshot Computation

Snapshots capture historical projections.

Examples

College Application

Recruiting Season

Graduation

End of Academic Year

Accelerator Completion

Snapshots are immutable.

---

# Portfolio Projection

Portfolios are filtered projections.

Scholar Portfolio

Athlete Portfolio

Founder Portfolio

Professional Portfolio

Creative Portfolio

Portfolios never own Evidence.

---

# Transcript Projection

Transcript entries originate from:

Learning

Credentials

Competencies

Programs

Courses

Transcript ordering is deterministic.

---

# Event Processing

The engine subscribes to:

EvidencePublished

EvidenceUpdated

EvidenceArchived

RelationshipUpdated

OrganizationMembershipChanged

CompetencyDefinitionUpdated

ParticipantCreated

Every relevant event triggers recomputation.

---

# Incremental Computation

Whenever possible, only affected projections are rebuilt.

Example

New Basketball Evidence

↓

Athletic Profile

↓

Leadership Competency

↓

Participant Record

Academic Profile remains unchanged.

---

# Full Rebuild

The engine supports complete reconstruction.

```
Participant

↓

All Evidence

↓

Knowledge Graph

↓

Recompute Everything

↓

Participant Record
```

This guarantees consistency.

---

# Knowledge Graph Traversal

The engine traverses graph relationships.

Example

Evidence

↓

Competency

↓

Domain

↓

Achievement

↓

Timeline

↓

Participant Record

Graph traversal remains deterministic.

---

# Conflict Resolution

Conflicting Evidence never overwrites history.

Instead

Evidence A

Evidence B

↓

Verification

↓

Confidence

↓

Projection

History remains intact.

---

# Versioning

Every projection includes:

Projection Version

Engine Version

Computation Version

Timestamp

Source Event

Correlation ID

This supports reproducibility.

---

# Performance

The engine favors:

Incremental recomputation

Projection caching

Graph traversal optimization

Event-driven updates

Canonical correctness takes precedence over speed.

---

# Commands

RefreshParticipantRecord

CreateSnapshot

RebuildParticipantRecord

PublishPortfolio

GenerateTranscript

Commands initiate computation.

---

# Events Published

ParticipantRecordUpdated

CompetencyProfileUpdated

GrowthIndicatorUpdated

SnapshotCreated

PortfolioUpdated

TranscriptUpdated

ProjectionCompleted

---

# Queries

GetParticipantRecord

GetCompetencyProfile

GetTimeline

GetGrowthIndicators

GetSnapshots

GetTranscript

GetPortfolio

Queries never modify state.

---

# Security

Every computation honors:

Identity

Relationships

Organizations

Policies

Permissions

Consent

No projection bypasses authorization.

---

# Domain Invariants

The Participant Record is always computed.

Evidence remains canonical.

Projections are reproducible.

Snapshots are immutable.

History is never lost.

Competencies require supporting Evidence.

Portfolios reference Evidence.

Timeline entries are chronological.

Every projection is explainable.

---

# Definition of Done

✓ Inputs are defined.

✓ Outputs are defined.

✓ Projection pipeline exists.

✓ Competency computation exists.

✓ Timeline computation exists.

✓ Snapshot computation exists.

✓ Incremental rebuild strategy exists.

✓ Full rebuild strategy exists.

✓ Event subscriptions exist.

✓ Graph traversal exists.

✓ Security model exists.

✓ Domain invariants are enforced.

Only then may implementation begin.

---

# Closing Principle

The Participant Record Engine does not create truth.

It continuously transforms verified, connected Evidence into an accurate, explainable, and lifelong representation of participant development.

The record is never authored.

It is always computed.s