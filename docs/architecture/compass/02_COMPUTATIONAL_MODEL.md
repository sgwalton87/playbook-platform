# Compass

## 02_COMPUTATIONAL_MODEL.md

Version: 2.0

Status: Canonical

Owner: Platform Core

Related Documents

- 01_CANONICAL_SPEC.md
- PLAYBOOK_STACK.md
- KNOWLEDGE_GRAPH.md
- EVIDENCE_ENGINE.md
- PARTICIPANT_RECORD_ENGINE.md
- OPPORTUNITY_ENGINE.md
- PLANNING_ENGINE.md
- COMPUTATION_MODEL.md

---

# Purpose

This document defines how Compass transforms platform state into personalized participant guidance.

Compass performs orchestration.

It never owns canonical business logic.

It continuously assembles context from every engine to produce a unified participant experience.

---

# Philosophy

Compass does not calculate truth.

Compass explains truth.

Compass does not decide.

Compass assists decision-making.

Compass is the conductor.

The engines perform the music.

---

# Inputs

Compass consumes outputs from platform engines.

Primary inputs include

Participant Record

Evidence Timeline

Opportunity Recommendations

Planning Outputs

Knowledge Graph

Relationships

Organizations

Participant Preferences

Calendar

Notifications

Signals

Conversation History

Current Session Context

System State

Compass never consumes raw database tables directly.

---

# Outputs

Compass produces

Daily Briefings

Weekly Reviews

Conversation Responses

Prioritized Actions

Explanations

Recommendations

Contextual Alerts

Progress Summaries

Goal Summaries

Decision Support

Learning Summaries

Relationship Suggestions

Navigation Guidance

Reflection Prompts

Compass outputs remain advisory.

---

# Orchestration Pipeline

```
Participant Context

↓

Load Current State

↓

Retrieve Engine Outputs

↓

Resolve Context

↓

Determine Intent

↓

Prioritize Information

↓

Generate Guidance

↓

Present Experience

↓

Await Participant Interaction

↓

Repeat
```

Compass never bypasses engine contracts.

---

# Context Resolution

Compass builds a unified participant context.

Sources include

Current Goals

Current Plans

Current Opportunities

Current Relationships

Recent Evidence

Current Organizations

Recent Activity

Upcoming Deadlines

Current Risks

Current Momentum

Context is ephemeral.

It is never canonical.

---

# Intent Resolution

Compass identifies participant intent.

Examples

Learn

Plan

Apply

Reflect

Explore

Search

Review

Prepare

Celebrate

Connect

Intent determines orchestration.

---

# Information Prioritization

Compass ranks information by

Urgency

Importance

Participant Goals

Opportunity Impact

Planning Priority

Relationship Relevance

Calendar Timing

Risk

Participant Preferences

No information is permanently hidden.

---

# Daily Briefing Generation

Daily Briefings include

Today's Priorities

Upcoming Deadlines

Recommended Actions

New Opportunities

Progress Updates

Risks

Relationship Reminders

Estimated Time Required

Every briefing is personalized.

---

# Weekly Review Generation

Weekly Reviews summarize

Evidence Added

Goals Advanced

Plans Completed

Opportunities Gained

Competencies Developed

Relationships Strengthened

Momentum

Upcoming Focus Areas

Weekly Reviews explain progress.

---

# Recommendation Composition

Compass assembles recommendations from

Opportunity Engine

Planning Engine

Participant Record

Knowledge Graph

Recommendations retain links to their source engines.

Compass never invents recommendations.

---

# Explanation Generation

Every explanation references

Supporting Evidence

Competencies

Opportunities

Plans

Policies

Relationships

Example

Why was this scholarship recommended?

↓

Eligibility

↓

Leadership Evidence

↓

Current GPA

↓

Financial Need

↓

Application Deadline

Compass explains.

The Opportunity Engine computed.

---

# Conversation Composition

Conversation responses combine

Current Context

Conversation History

Engine Outputs

Participant Preferences

Organizational Context

Relationship Context

Conversation never modifies canonical state.

---

# Reflection Generation

Compass encourages reflection.

Examples

What did you learn this week?

What challenge are you facing?

What accomplishment are you proud of?

Reflection remains participant-authored.

---

# Navigation Computation

Compass determines

Next Screen

Relevant Dashboard

Suggested Workflow

Helpful Resources

Priority Notifications

Navigation adapts continuously.

---

# Relationship Recommendations

Compass may recommend

Meeting Mentor

Contact Coach

Ask Teacher

Reach Out to Alumni

Schedule Advisor

Relationship suggestions originate from engine outputs.

---

# Calendar Awareness

Compass understands

School Calendar

Athletic Calendar

Application Deadlines

Organization Events

Personal Schedule

Planning Schedule

Calendar context influences recommendations.

---

# Signal Aggregation

Compass aggregates signals from

Evidence

Participant Record

Opportunity

Planning

Organizations

Relationships

Signals are ranked before presentation.

---

# Cross-Engine Coordination

Compass coordinates

Evidence

↓

Participant Record

↓

Opportunity

↓

Planning

↓

Participant Experience

Compass never changes engine outputs.

---

# Adaptation

Compass continuously adapts when

Evidence changes

Plans change

Goals change

Relationships change

Organizations change

Calendar changes

Preferences change

Adaptation remains deterministic.

---

# Personalization

Personalization considers

Goals

Preferences

History

Current Stage

Organizations

Relationships

Learning Style

Communication Preferences

Personalization never changes canonical truth.

---

# Explainability

Every recommendation answers

Why now?

Why me?

Why this action?

What evidence supports this?

What happens next?

Explainability is mandatory.

---

# AI Responsibilities

AI may

Summarize

Explain

Coach

Prioritize

Clarify

Teach

Translate

Forecast

Generate reflections

Organize information

AI may never

Modify Evidence

Alter Participant Records

Change Opportunity Rankings

Override Plans

Approve eligibility

Change policies

Replace participant autonomy

---

# Commands

GenerateDailyBriefing

GenerateWeeklyReview

ExplainRecommendation

PrioritizeToday

GenerateReflection

AnswerQuestion

RefreshContext

GenerateSummary

---

# Events Published

DailyBriefingGenerated

WeeklyReviewGenerated

RecommendationExplained

ReflectionSuggested

ParticipantQuestionAnswered

ContextUpdated

ConversationCompleted

NavigationUpdated

---

# Queries

GetToday

GetOverview

GetSummary

GetConversationContext

GetRecommendations

GetProgress

GetMomentum

GetDeadlines

GetRisks

Queries never mutate platform state.

---

# Domain Invariants

Compass owns no canonical data.

Compass never computes business truth.

Compass never bypasses engine contracts.

Context remains ephemeral.

Recommendations remain explainable.

AI remains advisory.

Participants remain autonomous.

Every output remains traceable to engine sources.

---

# Definition of Done

✓ Inputs defined.

✓ Outputs defined.

✓ Context model defined.

✓ Intent resolution defined.

✓ Briefing generation defined.

✓ Weekly review generation defined.

✓ Recommendation composition defined.

✓ Explanation model defined.

✓ Conversation model defined.

✓ Personalization defined.

✓ AI boundaries defined.

✓ Domain invariants enforced.

Only then may implementation begin.

---

# Closing Principle

Compass transforms platform intelligence into participant understanding.

It continuously gathers context, coordinates engine outputs, prioritizes what matters most, and presents personalized guidance that helps participants move confidently toward meaningful growth.

Compass does not replace the platform.

It makes the platform understandable.