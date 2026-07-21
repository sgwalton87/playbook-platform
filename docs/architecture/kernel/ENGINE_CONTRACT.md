# Computation Model

Version: 1.0

Status: Canonical

Owner: Platform Architecture

Related Documents

- PLAYBOOK_STACK.md
- ENGINE_CONTRACT.md
- EVENT_CONTRACT.md
- STATE_MODEL.md
- SECURITY_MODEL.md
- AI_MODEL.md

---

# Purpose

The Computation Model defines how deterministic decisions are made throughout the Playbook platform.

Every meaningful business decision must originate from a Domain Engine operating on canonical data.

No user interface, API, AI system, or Operating System may independently compute business logic.

This document establishes the rules governing computation, ownership, explainability, and consistency across the platform.

---

# Philosophy

Playbook is a deterministic platform.

Every business decision should be:

- Repeatable
- Explainable
- Auditable
- Testable
- Policy-aware
- Permission-aware

Business logic belongs to Domain Engines.

AI assists.

It never decides.

---

# Core Principles

## Single Source of Truth

Every computation must originate from canonical entities.

No duplicate computation may exist outside the owning Engine.

---

## Deterministic Decisions

Given identical inputs, every Engine must produce identical outputs.

Business logic should never produce random outcomes.

---

## Explainability

Every decision must answer:

- Why?
- Which evidence?
- Which policy?
- Which rules?
- Which permissions?
- Which Engine?
- Which timestamp?

---

## Layered Computation

Higher layers consume lower layers.

Higher layers never replace lower-layer computation.

---

## Separation of Responsibility

Each Engine computes only within its bounded context.

No Engine computes another Engine's responsibilities.

---

# Computational Hierarchy

```
Human Development Domains

↓

Canonical Entities

↓

Domain Engines

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
```

Each layer builds upon the previous one.

No layer skips another.

---

# Decision Flow

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

Policy Evaluation

↓

Permission Evaluation

↓

Decision

↓

Event

↓

Next Engine
```

Every computation follows this lifecycle.

---

# Types of Computation

## Validation

Determines whether submitted information is structurally valid.

Examples:

- Required fields
- GPA format
- Date validation
- Duplicate prevention

Validation is deterministic.

---

## Verification

Determines whether evidence is trustworthy.

Examples:

- Transcript verified
- Coach verified
- Organization verified
- Financial document verified

Verification creates Evidence.

---

## Eligibility

Determines whether a Participant qualifies.

Examples:

- Scholarship eligibility
- Recruiting eligibility
- Course prerequisites
- Grant requirements
- Financial aid

Eligibility is owned by the Opportunity Engine.

---

## Ranking

Orders available results.

Examples:

- Scholarship ranking
- Mentor recommendations
- Internship relevance
- Opportunity priority

Ranking uses deterministic scoring.

---

## Planning

Determines what should happen next.

Inputs include:

- Goals
- Deadlines
- Opportunity scores
- Dependencies
- Participant preferences

Planning is owned by the Planning Engine.

---

## Recommendation

Recommendations communicate computed outcomes.

Recommendations are derived.

Recommendations are not business logic.

Compass explains recommendations.

---

## Prediction

Predictions estimate future outcomes.

Examples:

- Graduation readiness
- FAFSA completion risk
- Recruiting probability
- Financial readiness

Predictions must never replace deterministic decisions.

---

# Decision Matrix

Every Engine must maintain a Decision Matrix.

Each decision shall document:

| Decision | Engine | Inputs | Output | Explainable | Policy Driven |
|----------|--------|--------|--------|-------------|---------------|
| Opportunity Eligibility | Opportunity | Participant Record, Policies | Eligible / Not Eligible | Yes | Yes |
| Course Completion | Learning | Lessons, Assessments | Complete / Incomplete | Yes | No |
| Evidence Verification | Evidence | Submission | Verified / Rejected | Yes | Yes |
| Plan Priority | Planning | Opportunities, Goals | Ranked Plan | Yes | Yes |

No hidden business logic is permitted.

---

# Inputs

Computations may consume:

Participant

Participant Record

Evidence

Policies

Permissions

Relationships

Organizations

Context

Goals

Events

Configuration

Time

No computation should consume UI state.

---

# Outputs

Computations produce:

Decisions

Events

Evidence

Scores

Plans

Eligibility

Recommendations

Computed state

Outputs should never contain presentation formatting.

---

# Dependency Rules

The following dependencies are allowed:

Participant

↓

Evidence

↓

Participant Record

↓

Opportunity

↓

Planning

↓

Operating Systems

↓

Compass

The following are prohibited:

Compass computing business logic.

Operating Systems computing eligibility.

APIs computing permissions.

User interfaces computing policy decisions.

---

# Explainability Contract

Every computation must produce an explanation.

The explanation should identify:

Engine

Decision

Inputs

Rules

Policies

Permissions

Evidence

Timestamp

Version

This explanation must be reproducible.

---

# Policy Evaluation

Policies influence computation.

Policies never perform computation.

Engines request policy evaluations.

Policy outcomes become inputs.

---

# Permission Evaluation

Permissions determine access.

Permissions never determine business logic.

Engines consume permission decisions.

Permission computation remains centralized.

---

# Confidence Levels

Some computations produce confidence.

Examples:

Recommendation confidence

Prediction confidence

Matching confidence

Confidence is informational.

Confidence never replaces deterministic outcomes.

---

# AI Interaction

Compass consumes computation.

Compass may:

Summarize

Explain

Coach

Prioritize

Draft

Reflect

Compass may not:

Change computation

Override eligibility

Override permissions

Override policies

Invent business outcomes

---

# Failure Handling

Every computation must define:

Validation failures

Missing evidence

Permission denied

Policy conflicts

Timeout

Dependency unavailable

Failures must be deterministic.

---

# Performance Expectations

Computations should be:

Fast

Observable

Cached where appropriate

Replayable

Horizontally scalable

Long-running computations should execute asynchronously.

---

# Observability

Every computation records:

Engine

Decision

Latency

Inputs

Outputs

Policy evaluation

Permission evaluation

Version

Errors

Correlation ID

These records enable auditing and debugging.

---

# Testing Requirements

Every computation must support:

Unit testing

Integration testing

Replay testing

Policy testing

Permission testing

Regression testing

No computation may rely solely on manual verification.

---

# Future Expansion

The Computation Model should support:

Machine learning augmentation

Simulation engines

Scenario planning

Optimization algorithms

Real-time analytics

Distributed computation

Autonomous planning

Future technologies must remain consumers of deterministic computation rather than replacements.

---

# Relationship to the Playbook Stack

Human Development Domains

↓

Canonical Entities

↓

Domain Engines

↓

Deterministic Computation

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

Computation is the mechanism through which Domain Engines transform participant actions into trusted business outcomes.

---

# Definition of Done

A computation model is considered complete when:

✓ Ownership is documented.

✓ Inputs are defined.

✓ Outputs are defined.

✓ Policies are referenced.

✓ Permissions are referenced.

✓ Decision Matrix exists.

✓ Explainability is supported.

✓ Failure modes are documented.

✓ Performance expectations are defined.

✓ Observability requirements are documented.

✓ AI interactions are documented.

✓ Business logic remains deterministic.

Only then may implementation begin.