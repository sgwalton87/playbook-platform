# Opportunity Engine

## 02_COMPUTATIONAL_MODEL.md

Version: 2.0

Status: Canonical

Owner: Platform Core

Related Documents

- 01_CANONICAL_SPEC.md
- PARTICIPANT_RECORD_ENGINE.md
- EVIDENCE_ENGINE.md
- KNOWLEDGE_GRAPH.md
- COMPUTATION_MODEL.md
- EVENT_CONTRACT.md

---

# Purpose

This document defines how the Opportunity Engine computes opportunity eligibility, matching, ranking, prioritization, recommendations, and participant readiness.

The engine never guesses.

Every recommendation is explainable.

---

# Philosophy

The Opportunity Engine computes possibility.

It does not make decisions.

Organizations create Opportunities.

Participants pursue Opportunities.

The engine determines fit.

---

# Inputs

The Opportunity Engine consumes canonical data.

Primary inputs include:

Participant Record

Knowledge Graph

Verified Evidence

Organization Policies

Eligibility Rules

Participant Goals

Participant Preferences

Relationships

Opportunity Metadata

Deadlines

Current Time

Geographic Context

Availability

No UI action directly changes recommendations.

---

# Outputs

The engine produces:

Eligibility Results

Opportunity Matches

Opportunity Rankings

Recommendations

Readiness Scores

Missing Requirements

Opportunity Signals

Application Readiness

Pipeline Updates

Planning Signals

All outputs are deterministic projections.

---

# Computation Pipeline

```
Participant Record

↓

Knowledge Graph

↓

Load Available Opportunities

↓

Evaluate Eligibility

↓

Compute Readiness

↓

Compute Match Quality

↓

Rank Opportunities

↓

Generate Recommendations

↓

Publish Opportunity Signals

↓

Notify Planning Engine
```

Every stage is reproducible.

---

# Opportunity Discovery

Discovery determines which Opportunities should be evaluated.

Sources include:

Organizations

Universities

Scholarships

Employers

Accelerators

Government Programs

Community Organizations

Athletic Recruiting

Mentorship Networks

Discovery occurs before matching.

---

# Eligibility Computation

Each Opportunity defines eligibility rules.

Example

Age ≥ 16

California Resident

3.0 GPA

High School Senior

Leadership Evidence

Community Service

Financial Need

The engine evaluates every rule independently.

---

# Eligibility States

Every Opportunity returns one of:

Eligible

Conditionally Eligible

Nearly Eligible

Not Eligible

Expired

Unavailable

Eligibility is never binary when additional context exists.

---

# Readiness Computation

Readiness measures preparation.

Factors include:

Verified Competencies

Evidence Strength

Portfolio Completeness

Transcript Quality

Application Materials

Recommendations Available

Relationship Strength

Required Documents

Recent Activity

Planning Progress

Readiness changes continuously.

---

# Match Quality Computation

Match quality measures alignment.

Dimensions include:

Competency Alignment

Goal Alignment

Interest Alignment

Geographic Alignment

Organization Preference

Relationship Alignment

Career Alignment

Academic Alignment

Athletic Alignment

Founder Alignment

Financial Alignment

Development Alignment

Every dimension contributes independently.

---

# Opportunity Scoring

The engine computes an Opportunity Score.

Example dimensions

Eligibility

Readiness

Alignment

Urgency

Deadline

Impact

Growth Potential

Relationship Advantage

Historical Success

Policy Weight

The scoring model is transparent.

---

# Ranking Pipeline

```
Eligible Opportunities

↓

Opportunity Scores

↓

Policy Filters

↓

Priority Rules

↓

Ranked Opportunities
```

Ranking is deterministic.

---

# Recommendation Generation

Recommendations contain:

Opportunity

Reason

Readiness

Confidence

Supporting Evidence

Next Action

Estimated Effort

Deadline

Expected Benefit

Every recommendation explains itself.

---

# Recommendation Types

Immediate Action

Prepare Soon

Missing Requirement

Explore

Relationship Introduction

Application Reminder

Deadline Alert

Long-Term Goal

Recommendations adapt over time.

---

# Missing Requirement Detection

The engine identifies missing elements.

Examples

Missing Transcript

Missing Essay

No Recommendation Letter

Insufficient Leadership Evidence

Incomplete FAFSA

Expired Certification

Low GPA Requirement

Missing Portfolio

These become Planning inputs.

---

# Relationship Computation

Relationships increase discoverability.

Examples

Coach Referral

Professor Recommendation

Mentor Connection

Alumni Network

Employer Contact

Board Member

Community Leader

Relationships never override eligibility.

---

# Policy Evaluation

Policies influence:

Visibility

Eligibility

Deadlines

Application Limits

Priority Groups

Required Documents

Review Processes

Policies remain external to computation.

---

# Deadline Computation

Every Opportunity has time awareness.

Signals include:

Opens Soon

Open

Closing Soon

Closed

Rolling Admission

Priority Deadline

Final Deadline

Expired

Deadlines continuously affect rankings.

---

# Opportunity Signals

Signals include:

New Match

Improved Match

Application Ready

Deadline Soon

Relationship Available

Offer Received

Waitlist Updated

Application Missing Information

Recommendation Improved

Signals trigger participant engagement.

---

# Pipeline Computation

Each participant maintains multiple pipelines.

Examples

College

Career

Scholarships

Athletics

Entrepreneurship

Leadership

Financial Aid

Each pipeline computes independently.

---

# Feedback Loop

Every participant action informs future computation.

Example

Applied

↓

Accepted

↓

Evidence Created

↓

Participant Record Updated

↓

Opportunity Rankings Updated

Growth continuously improves recommendations.

---

# Planning Integration

The engine produces Planning Signals.

Examples

Complete FAFSA

Improve GPA

Request Recommendation

Upload Highlight Reel

Complete Financial Literacy Course

Earn Leadership Badge

Attend Recruiting Event

Planning converts opportunity gaps into action plans.

---

# Incremental Computation

New Evidence only recomputes affected Opportunities.

Example

Leadership Badge Earned

↓

Leadership Competency Updated

↓

Scholarships Re-ranked

↓

Leadership Programs Updated

↓

Mentorship Opportunities Updated

Career Opportunities unaffected.

---

# Full Rebuild

When required:

```
Participant Record

↓

Knowledge Graph

↓

All Opportunities

↓

Eligibility

↓

Scoring

↓

Ranking

↓

Recommendations

↓

Signals
```

The output must always be identical.

---

# Explainability

Every recommendation must answer:

Why this Opportunity?

Why now?

Which Evidence supports it?

Which Competencies contributed?

What remains to qualify?

Explainability is mandatory.

---

# AI Responsibilities

AI may:

Explain recommendations

Summarize opportunities

Generate application checklists

Suggest preparation

Identify common themes

Estimate readiness

AI may never:

Override eligibility

Invent requirements

Alter rankings

Modify policies

Approve applications

---

# Commands

EvaluateEligibility

ComputeReadiness

RankOpportunities

GenerateRecommendations

RefreshMatches

UpdateOpportunityPipeline

GenerateSignals

NotifyPlanningEngine

---

# Events Published

ParticipantMatched

EligibilityComputed

OpportunityRanked

RecommendationGenerated

OpportunitySignalGenerated

ReadinessUpdated

PlanningSignalGenerated

OpportunityPipelineUpdated

---

# Queries

GetMatches

GetRecommendations

GetReadiness

GetEligibility

GetOpportunityScore

GetPipeline

GetSignals

Queries never mutate state.

---

# Domain Invariants

Eligibility is computed.

Readiness is dynamic.

Ranking is deterministic.

Policies remain external.

Relationships enhance but never replace qualification.

Recommendations are explainable.

Participant actions generate new computation.

Every Opportunity belongs to an Organization.

Outputs remain reproducible.

---

# Definition of Done

✓ Inputs defined.

✓ Outputs defined.

✓ Eligibility model defined.

✓ Readiness model defined.

✓ Matching model defined.

✓ Ranking model defined.

✓ Recommendation model defined.

✓ Pipeline model defined.

✓ Planning integration defined.

✓ Incremental rebuild strategy defined.

✓ Full rebuild strategy defined.

✓ Explainability enforced.

✓ AI boundaries defined.

✓ Domain invariants enforced.

Only then may implementation begin.

---

# Closing Principle

The Opportunity Engine continuously transforms verified participant development into meaningful possibilities.

It does not simply recommend opportunities.

It computes the next best opportunities, explains why they matter, identifies what remains to qualify, and ensures that every participant always knows their next step toward advancement.