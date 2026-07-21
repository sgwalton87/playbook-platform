# Planning Engine

## 01_CANONICAL_SPEC.md

Version: 2.0

Status: Canonical

Owner: Platform Core

Related Documents

- PLAYBOOK_STACK.md
- DATABASE_BLUEPRINT.md
- KNOWLEDGE_GRAPH.md
- EVIDENCE_ENGINE.md
- PARTICIPANT_RECORD_ENGINE.md
- OPPORTUNITY_ENGINE.md
- ENGINE_CONTRACT.md
- EVENT_CONTRACT.md

---

# Purpose

The Planning Engine transforms Opportunities, participant aspirations, and verified development into personalized, adaptive plans that guide lifelong growth.

Rather than simply telling Participants what opportunities exist, the Planning Engine determines the sequence of actions required to successfully achieve them.

---

# Mission

The Planning Engine exists to convert possibility into progress.

Every recommendation should become an achievable plan.

Every plan should produce meaningful growth.

Every completed plan should generate new Evidence.

---

# Philosophy

Plans are living.

Goals evolve.

People grow.

Planning is continuous.

Planning should reduce uncertainty while preserving participant autonomy.

Participants own their plans.

Organizations contribute milestones.

Compass assists.

The engine coordinates.

---

# Core Principles

## Participant-Owned

Plans belong to Participants.

Organizations may contribute requirements.

Mentors may recommend actions.

Only Participants ultimately own their developmental journey.

---

## Opportunity-Driven

Plans exist because Opportunities exist.

Without Opportunity there is no purpose for planning.

Planning always traces back to meaningful advancement.

---

## Evidence-Aware

Completed work generates Evidence.

Evidence updates the Participant Record.

The Participant Record updates Opportunities.

Opportunities update Plans.

Planning is cyclical.

---

## Adaptive

Plans continuously adjust as Participants grow.

Plans are never static documents.

---

## Explainable

Every action should answer:

Why am I doing this?

Which Opportunity does this support?

What Evidence will it create?

---

## Longitudinal

Planning spans years.

Participants may maintain plans for:

This week

This semester

This season

High school

College

Career

Life

---

# Canonical Definition

A Plan is a structured sequence of actions designed to prepare a Participant for one or more Opportunities while supporting long-term development.

---

# Aggregate Root

Plan

All planning entities derive from the Plan aggregate.

---

# Canonical Entities

Plan

Goal

Objective

Milestone

Action

Task

Habit

Routine

Checkpoint

Dependency

Priority

Timeline

Calendar Event

Deadline

Recommendation

Preparation Item

Progress

Progress Update

Reflection

Adjustment

Obstacle

Risk

Achievement Target

Success Metric

Reminder

Planning Signal

Plan Template

Plan Version

Plan Snapshot

---

# Plan Categories

Examples include

College Admission

Scholarship Preparation

Athletic Recruiting

Career Development

Entrepreneurship

Leadership

Financial Capability

Community Impact

Certification

Research

Graduate School

Business Launch

Public Office

Creative Portfolio

Personal Development

Participants may have multiple active plans simultaneously.

---

# Planning Lifecycle

```
Opportunity

↓

Plan Created

↓

Goals Defined

↓

Objectives Identified

↓

Milestones Generated

↓

Actions Scheduled

↓

Participant Progress

↓

Evidence Generated

↓

Participant Record Updated

↓

Opportunities Updated

↓

Plan Adjusted
```

Planning never truly ends.

---

# Goals

Goals define desired outcomes.

Examples

Earn admission to UCLA

Receive NCAA offer

Launch nonprofit

Complete FAFSA

Secure internship

Goals provide direction.

---

# Objectives

Objectives break Goals into measurable achievements.

Example

Goal

Attend Stanford

Objectives

Raise GPA

Complete SAT

Finish FAFSA

Obtain recommendations

Complete essays

---

# Milestones

Milestones represent major checkpoints.

Examples

Application Submitted

Scholarship Essay Complete

Highlight Reel Uploaded

Leadership Badge Earned

Accepted into Program

Milestones are measurable.

---

# Actions

Actions are concrete participant activities.

Examples

Request Transcript

Meet Counselor

Attend Workshop

Upload Resume

Write Essay

Practice Interview

Volunteer

Complete Course

Actions produce Evidence.

---

# Habits

Habits support long-term development.

Examples

Read Daily

Exercise

Journal

Practice Coding

Budget Weekly

Study Two Hours

Habits improve readiness.

---

# Dependencies

Some actions depend on others.

Example

Submit FAFSA

↓

Financial Aid Eligibility

↓

Scholarship Application

Dependencies ensure proper sequencing.

---

# Progress

Progress measures advancement.

Progress may include

Completion

Readiness

Consistency

Evidence Generated

Milestones Achieved

Progress is continuously computed.

---

# Reflections

Participants may record

Lessons Learned

Challenges

Wins

Feedback

Reflection becomes optional participant-owned context.

Reflection never replaces Evidence.

---

# Obstacles

Plans may identify

Missing Documents

Time Constraints

Financial Barriers

Transportation

Academic Gaps

Missing Relationships

Obstacles inform future recommendations.

---

# Risks

Risks estimate potential blockers.

Examples

Missed Deadline

Incomplete Portfolio

Eligibility Loss

GPA Decline

Expired Certification

Risks influence planning priority.

---

# Success Metrics

Every Plan defines measurable success.

Examples

Application Submitted

Acceptance Received

Scholarship Awarded

Internship Secured

Business Registered

Certification Earned

Success Metrics remain outcome-focused.

---

# Plan Templates

Templates accelerate planning.

Examples

UC Admissions Plan

NCAA Recruiting Plan

FAFSA Completion Plan

Founder Launch Plan

Graduate School Plan

Templates remain customizable.

---

# Relationship Integration

Relationships support planning.

Examples

Mentor Check-ins

Coach Feedback

Teacher Recommendations

Advisor Meetings

Parent Support

Relationships improve execution.

---

# Organization Integration

Organizations contribute

Deadlines

Requirements

Events

Programs

Resources

Organizations inform plans.

Participants own them.

---

# Opportunity Integration

The Opportunity Engine generates planning inputs.

Examples

Missing Requirement

Deadline

Application Ready

Relationship Available

Readiness Gap

Planning converts these into actions.

---

# Participant Record Integration

Completed actions generate Evidence.

Evidence updates

Participant Record

Competencies

Growth Indicators

Timeline

Planning continuously improves participant development.

---

# Compass Responsibilities

Compass may

Prioritize tasks

Explain actions

Reorder schedules

Recommend pacing

Detect overload

Estimate completion

Compass may never

Complete participant work

Override participant autonomy

Alter verified Evidence

Change organizational deadlines

---

# Commands

CreatePlan

GeneratePlan

UpdatePlan

CompleteAction

CompleteMilestone

AdjustTimeline

PausePlan

ResumePlan

ArchivePlan

GenerateReflection

RefreshPlan

---

# Events Published

PlanCreated

PlanUpdated

MilestoneCompleted

ActionCompleted

GoalAchieved

ProgressUpdated

ReflectionCreated

PlanningSignalGenerated

PlanAdjusted

PlanArchived

---

# Queries

GetPlan

GetGoals

GetObjectives

GetMilestones

GetActions

GetProgress

GetTimeline

GetReflections

GetPlanningSignals

Queries never modify state.

---

# Domain Invariants

Plans belong to Participants.

Plans support Opportunities.

Actions produce Evidence.

Progress is computed.

Plans remain adaptive.

Goals drive Objectives.

Objectives drive Milestones.

Milestones drive Actions.

Planning remains explainable.

Planning never bypasses Opportunity or Evidence.

---

# Definition of Done

✓ Plan aggregate defined.

✓ Canonical entities established.

✓ Lifecycle documented.

✓ Goals defined.

✓ Objectives defined.

✓ Milestones defined.

✓ Actions defined.

✓ Habits defined.

✓ Dependencies defined.

✓ Progress model defined.

✓ Reflection model defined.

✓ Relationship integration documented.

✓ Organization integration documented.

✓ Opportunity integration documented.

✓ Participant Record integration documented.

✓ Commands documented.

✓ Events documented.

✓ Queries documented.

✓ AI boundaries established.

✓ Domain invariants enforced.

Only then may implementation begin.

---

# Closing Principle

The Planning Engine transforms opportunities into action.

It exists to ensure that every Participant always knows their next meaningful step, why it matters, and how completing it contributes to lifelong growth.

Plans are not checklists.

They are living pathways that continuously evolve as Participants learn, grow, and unlock new opportunities.