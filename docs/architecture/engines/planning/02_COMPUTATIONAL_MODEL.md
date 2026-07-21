# Planning Engine

## 02_COMPUTATIONAL_MODEL.md

Version: 2.0

Status: Canonical

Owner: Platform Core

Related Documents

- 01_CANONICAL_SPEC.md
- OPPORTUNITY_ENGINE.md
- PARTICIPANT_RECORD_ENGINE.md
- EVIDENCE_ENGINE.md
- KNOWLEDGE_GRAPH.md
- COMPUTATION_MODEL.md
- EVENT_CONTRACT.md

---

# Purpose

This document defines how the Planning Engine computes personalized plans, sequences participant actions, adapts to change, and continuously guides participant development.

Planning is deterministic.

Every recommendation must be explainable.

---

# Philosophy

Planning is continuous.

Plans evolve.

Participants grow.

Opportunities change.

Planning adapts.

The Planning Engine computes the most effective pathway from a participant's current state to a desired future state.

---

# Inputs

The Planning Engine consumes canonical inputs.

Primary inputs include

Participant Record

Knowledge Graph

Verified Evidence

Opportunity Recommendations

Participant Goals

Organization Requirements

Deadlines

Policies

Relationships

Participant Preferences

Current Progress

Calendar Availability

Time

No manual task ordering overrides engine computation.

---

# Outputs

The engine produces

Plans

Objectives

Milestones

Actions

Dependencies

Priorities

Schedules

Planning Signals

Progress

Risk Assessments

Success Predictions

Adaptive Recommendations

All outputs remain deterministic.

---

# Planning Pipeline

```
Participant Record

↓

Participant Goals

↓

Opportunity Recommendations

↓

Determine Desired Outcomes

↓

Identify Required Competencies

↓

Identify Missing Requirements

↓

Generate Objectives

↓

Generate Milestones

↓

Generate Actions

↓

Sequence Dependencies

↓

Prioritize

↓

Publish Plan

↓

Monitor Progress

↓

Continuously Adapt
```

Planning is iterative.

---

# Goal Computation

Goals originate from

Participant

Organization

Accepted Opportunity

Mentor

Advisor

Compass Suggestions

Examples

Attend UC Berkeley

Earn NCAA Scholarship

Launch Business

Become Teacher

Serve on School Board

Goals establish direction.

---

# Objective Generation

Objectives decompose goals.

Example

Goal

Attend UCLA

↓

Objectives

Raise GPA

Complete FAFSA

Submit Application

Earn Leadership Evidence

Request Recommendations

Objectives remain measurable.

---

# Competency Gap Analysis

The engine identifies

Current Competencies

↓

Required Competencies

↓

Missing Competencies

↓

Development Plan

Gap analysis is evidence-driven.

---

# Milestone Generation

Milestones represent major progress checkpoints.

Examples

Essay Complete

FAFSA Submitted

Transcript Uploaded

SAT Completed

Highlight Reel Published

Internship Secured

Milestones are automatically generated.

---

# Action Generation

Actions are generated from milestones.

Example

Milestone

Complete FAFSA

↓

Actions

Create FSA ID

Gather Tax Documents

Invite Contributor

Complete FAFSA

Review Submission

Actions are concrete.

---

# Dependency Resolution

The engine computes prerequisite relationships.

Example

Request Transcript

↓

Receive Transcript

↓

Submit Application

↓

Application Review

Dependencies guarantee proper sequencing.

---

# Priority Computation

Priority is computed using

Deadline Urgency

Opportunity Importance

Dependency Weight

Development Impact

Estimated Effort

Relationship Availability

Participant Capacity

Risk

No single factor determines priority.

---

# Schedule Generation

The engine computes schedules using

Deadlines

Availability

Estimated Duration

Dependencies

Participant Preferences

Time Zones

Academic Calendars

Athletic Seasons

Schedules remain adaptive.

---

# Capacity Computation

The engine estimates participant workload.

Factors include

Current Tasks

School

Sports

Employment

Family Responsibilities

Existing Plans

Capacity influences pacing.

---

# Adaptive Planning

Plans change when

Evidence Changes

Goals Change

Opportunities Change

Deadlines Change

Participant Capacity Changes

Policies Change

Relationships Change

Adaptation is continuous.

---

# Progress Computation

Progress measures

Actions Completed

Milestones Completed

Competencies Earned

Evidence Generated

Goal Completion

Consistency

Progress is computed—not manually estimated.

---

# Risk Assessment

The engine identifies risks.

Examples

Deadline Approaching

Low GPA

Missing Recommendation

No FAFSA

Portfolio Incomplete

Scheduling Conflict

Risk drives reprioritization.

---

# Readiness Computation

Readiness measures

Plan Completion

Competency Development

Required Documents

Evidence Strength

Relationship Support

Application Preparedness

Readiness continuously changes.

---

# Success Prediction

The engine estimates readiness for desired outcomes.

Dimensions include

Preparation

Evidence Quality

Historical Trends

Competency Alignment

Timeline

Relationship Strength

Prediction informs planning.

It never guarantees outcomes.

---

# Habit Computation

Recurring actions become habits.

Examples

Study

Exercise

Budget

Networking

Reflection

Practice

Habits support long-term development.

---

# Reflection Integration

Participant reflections may influence

Motivation

Preferences

Future pacing

Reflection never overrides evidence.

---

# Opportunity Feedback Loop

Accepted Opportunity

↓

Planning

↓

Completed Actions

↓

Evidence

↓

Participant Record

↓

New Opportunities

↓

Updated Plans

Planning is cyclical.

---

# Relationship Integration

Relationships contribute

Meetings

Feedback

Recommendations

Introductions

Accountability

Relationships strengthen execution.

---

# Organization Integration

Organizations provide

Deadlines

Events

Programs

Resources

Requirements

Planning consumes organizational inputs.

---

# Calendar Integration

Planning synchronizes

Academic Calendar

Athletic Calendar

Work Schedule

Family Commitments

Organization Events

Personal Availability

Planning remains time-aware.

---

# Incremental Computation

Small Events trigger localized updates.

Example

Transcript Uploaded

↓

Application Ready

↓

College Plan Updated

↓

Scholarship Plan Updated

Athletic Plan remains unchanged.

---

# Full Rebuild

When necessary

```
Participant Record

↓

Knowledge Graph

↓

Goals

↓

Opportunities

↓

Generate Plans

↓

Objectives

↓

Milestones

↓

Actions

↓

Priorities

↓

Schedules
```

Output must remain deterministic.

---

# Explainability

Every recommendation answers

Why this action?

Which opportunity requires it?

Which competency does it build?

Which evidence will it generate?

What happens if it is delayed?

Explainability is mandatory.

---

# AI Responsibilities

AI may

Prioritize actions

Estimate pacing

Explain plans

Suggest alternatives

Summarize progress

Detect overload

Recommend sequencing

AI may never

Override participant autonomy

Change deadlines

Alter evidence

Modify eligibility

Guarantee success

---

# Commands

GeneratePlan

GenerateObjectives

GenerateMilestones

GenerateActions

PrioritizePlan

SchedulePlan

UpdatePlan

RecalculatePlan

PausePlan

ResumePlan

ArchivePlan

GenerateReflection

---

# Events Published

PlanGenerated

ObjectiveCreated

MilestoneCreated

ActionCreated

PlanPrioritized

ScheduleGenerated

ProgressUpdated

PlanAdjusted

PlanningSignalGenerated

PlanCompleted

---

# Queries

GetPlan

GetObjectives

GetMilestones

GetActions

GetSchedule

GetProgress

GetRisks

GetReadiness

GetSuccessPrediction

Queries never mutate state.

---

# Domain Invariants

Plans support Opportunities.

Goals drive Objectives.

Objectives generate Milestones.

Milestones generate Actions.

Dependencies remain acyclic.

Progress is computed.

Scheduling remains adaptive.

Planning remains explainable.

Actions generate Evidence.

Plans remain participant-owned.

Outputs remain reproducible.

---

# Definition of Done

✓ Planning pipeline defined.

✓ Goal computation defined.

✓ Objective generation defined.

✓ Milestone generation defined.

✓ Action generation defined.

✓ Dependency resolution defined.

✓ Priority computation defined.

✓ Adaptive planning defined.

✓ Progress computation defined.

✓ Risk model defined.

✓ Readiness computation defined.

✓ Explainability enforced.

✓ AI boundaries defined.

✓ Domain invariants enforced.

Only then may implementation begin.

---

# Closing Principle

The Planning Engine transforms opportunity into execution.

It continuously computes the next best actions, adapts to participant growth, balances competing priorities, and guides lifelong development through personalized, explainable, and evidence-driven plans.

A plan is never merely a checklist.

It is a continuously evolving roadmap toward meaningful human advancement.