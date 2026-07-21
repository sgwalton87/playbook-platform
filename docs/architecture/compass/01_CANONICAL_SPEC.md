# Compass

## 01_CANONICAL_SPEC.md

Version: 2.0

Status: Canonical

Owner: Platform Core

Related Documents

- PLAYBOOK_STACK.md
- KNOWLEDGE_GRAPH.md
- ENGINE_CONTRACT.md
- EVIDENCE_ENGINE.md
- PARTICIPANT_RECORD_ENGINE.md
- OPPORTUNITY_ENGINE.md
- PLANNING_ENGINE.md

---

# Purpose

Compass is the participant-facing orchestration layer of the Playbook platform.

It coordinates every engine, domain, organization, relationship, and participant interaction into a single, coherent experience.

Compass never owns business truth.

Compass never computes canonical records.

Compass makes the platform understandable, actionable, and personalized.

---

# Mission

Compass exists to help every participant understand:

Who they are becoming.

Where they are today.

Where they can go next.

How to get there.

---

# Philosophy

Participants should never need to understand platform architecture.

Participants interact with Compass.

Compass coordinates the platform.

The complexity belongs inside the system.

The simplicity belongs in the experience.

---

# Core Principles

## Orchestrator

Compass coordinates engines.

It does not replace them.

---

## Explainable

Every recommendation can be explained.

Every plan can be justified.

Every opportunity has reasoning.

Every participant can inspect why.

---

## Context Aware

Compass understands

Current goals

Current plans

Current opportunities

Current relationships

Current organizations

Current competencies

Current evidence

Current schedule

Current risks

Current momentum

---

## Participant First

Compass optimizes for participant growth.

Not organizational efficiency.

---

## Proactive

Compass does not wait for questions.

Compass surfaces

Opportunities

Risks

Deadlines

Achievements

Relationships

Recommendations

Preparation

---

## Adaptive

Compass changes as participants grow.

No two participant experiences should remain identical forever.

---

# Canonical Definition

Compass is the orchestration layer responsible for translating the outputs of platform engines into personalized participant guidance.

Compass coordinates.

Engines compute.

Participants decide.

---

# Responsibilities

Compass is responsible for

Personalized guidance

Cross-engine orchestration

Daily prioritization

Progress summaries

Natural language interaction

Notifications

Recommendations

Explanation

Context switching

Participant navigation

Conversation management

Decision support

Compass is not responsible for

Evidence verification

Eligibility computation

Participant records

Opportunity ranking

Planning computation

Authentication

Authorization

Those responsibilities belong elsewhere.

---

# Primary Inputs

Compass consumes

Participant Record

Opportunity Recommendations

Plans

Evidence Timeline

Knowledge Graph

Relationships

Organizations

Notifications

Signals

Calendar

Participant Preferences

Conversation Context

System State

---

# Primary Outputs

Compass produces

Daily Briefings

Weekly Reviews

Recommendations

Suggested Actions

Explanations

Summaries

Conversations

Alerts

Notifications

Navigation

Guided Experiences

Decision Support

Compass never creates canonical truth.

---

# Participant Questions

Compass should answer questions such as

What should I work on today?

Why is this scholarship recommended?

How close am I to my goal?

What changed this week?

What opportunities am I missing?

Which competency should I build next?

What is preventing me from qualifying?

What deadlines are approaching?

Who should I connect with?

What evidence should I collect?

---

# Organizational Questions

Organizations may ask

Which participants are becoming eligible?

Who needs intervention?

Which deadlines are at risk?

What trends exist?

Where are bottlenecks?

Compass answers using engine outputs.

---

# Interaction Modes

Dashboard

Conversation

Notifications

Timeline

Daily Agenda

Weekly Review

Goal Review

Planning Review

Opportunity Review

Reflection

Search

Voice

Future modalities may be added.

---

# Cross-Engine Coordination

Compass coordinates

Evidence Engine

↓

Participant Record Engine

↓

Opportunity Engine

↓

Planning Engine

↓

Participant Experience

Compass never bypasses engine contracts.

---

# AI Responsibilities

AI inside Compass may

Explain

Summarize

Prioritize

Recommend

Translate

Teach

Coach

Forecast

Clarify

Encourage reflection

AI may never

Modify canonical truth

Approve eligibility

Create evidence

Override plans

Override participant autonomy

Change organizational policy

---

# Domain Independence

Compass is domain-agnostic.

It works equally well across

Learning

Athletics

Entrepreneurship

Career

Financial Capability

Community

Research

Leadership

Wellness

Future domains

---

# Commands

GenerateDailyBriefing

GenerateWeeklyReview

ExplainRecommendation

SummarizeProgress

PrioritizeToday

GenerateReflection

AnswerParticipantQuestion

RefreshContext

---

# Events Published

BriefingGenerated

WeeklyReviewGenerated

RecommendationExplained

ParticipantQuestionAnswered

ReflectionSuggested

ConversationStarted

ConversationCompleted

CompassContextUpdated

---

# Queries

GetToday

GetOverview

GetRecommendations

GetProgress

GetDeadlines

GetRisks

GetMomentum

GetConversationContext

Queries never modify platform state.

---

# Domain Invariants

Compass owns no canonical data.

Compass never bypasses engines.

Compass explanations remain traceable.

Every recommendation references engine outputs.

Participants remain autonomous.

AI remains advisory.

Engine contracts remain intact.

---

# Definition of Done

✓ Purpose defined.

✓ Responsibilities defined.

✓ Inputs defined.

✓ Outputs defined.

✓ Interaction model defined.

✓ AI boundaries defined.

✓ Engine coordination defined.

✓ Commands documented.

✓ Events documented.

✓ Queries documented.

✓ Domain invariants enforced.

Only then may implementation begin.

---

# Closing Principle

Compass is not another engine.

It is the participant's guide through the Playbook ecosystem.

Evidence records the past.

Participant Records describe the present.

Opportunities reveal possibility.

Plans organize action.

Compass helps participants navigate all of it with clarity, confidence, and purpose.