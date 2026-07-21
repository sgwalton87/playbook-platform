# Opportunity Engine

## 01_CANONICAL_SPEC.md

Version: 2.0

Status: Canonical

Owner: Platform Core

Related Documents

- PLAYBOOK_STACK.md
- DATABASE_BLUEPRINT.md
- ENGINE_CONTRACT.md
- EVENT_CONTRACT.md
- KNOWLEDGE_GRAPH.md
- EVIDENCE_ENGINE.md
- PARTICIPANT_RECORD_ENGINE.md

---

# Purpose

The Opportunity Engine continuously identifies, evaluates, prioritizes, and delivers opportunities that align with a Participant's verified development, competencies, aspirations, relationships, eligibility, and timing.

Rather than asking Participants to search endlessly for opportunities, the Opportunity Engine brings the right opportunities to the right participant at the right time.

---

# Mission

The Opportunity Engine exists to transform participant growth into participant advancement.

Its mission is to ensure that every verified experience has the potential to unlock meaningful opportunities throughout a participant's lifetime.

---

# Philosophy

Opportunity should be earned through demonstrated capability—not hidden behind information asymmetry.

Participants should spend their time preparing for opportunities, not searching for them.

Opportunities should be personalized, explainable, equitable, and actionable.

Every recommendation must be supported by transparent reasoning and verifiable evidence.

---

# Core Principles

## Participant-Centered

Opportunities exist for Participants.

Organizations publish opportunities.

The engine determines fit.

---

## Evidence-Driven

Recommendations are based on verified Evidence and computed Participant Records.

Self-reported information may inform recommendations but never overrides verified evidence.

---

## Explainable

Every opportunity recommendation must answer:

Why this opportunity?

Why now?

Why this participant?

---

## Continuous

Opportunity matching is never complete.

Every new piece of Evidence may unlock new opportunities.

---

## Policy-Aware

Eligibility is determined by policies.

Policies may originate from:

Organizations

Programs

Governments

Institutions

Employers

Platform Rules

---

## Goal-Oriented

Participant aspirations influence prioritization.

Goals never replace eligibility.

Goals refine opportunity selection.

---

## Time-Aware

An opportunity without proper timing is not actionable.

Deadlines, enrollment windows, recruiting periods, application cycles, and participant readiness all influence recommendations.

---

# Canonical Definition

An Opportunity is a structured possibility for participant advancement that is governed by eligibility, timing, policy, and organizational intent.

An Opportunity may be educational, athletic, entrepreneurial, professional, financial, civic, creative, or personal.

---

# Aggregate Root

Opportunity

All Opportunity-related entities derive from the Opportunity aggregate.

---

# Canonical Entities

Opportunity

Opportunity Category

Opportunity Type

Eligibility Rule

Requirement

Prerequisite

Qualification

Application

Application Stage

Submission

Offer

Acceptance

Declination

Waitlist

Invitation

Referral

Recommendation

Match

Ranking

Opportunity Signal

Opportunity Pipeline

Deadline

Milestone

Reviewer

Review Decision

Organization Posting

Opportunity Visibility

Opportunity Preference

Opportunity Bookmark

Opportunity Notification

Opportunity Outcome

---

# Opportunity Categories

Examples include:

Scholarships

Colleges

Universities

Internships

Apprenticeships

Jobs

Research Programs

Leadership Programs

Fellowships

Accelerators

Incubators

Competitions

Pitch Events

Grant Programs

Volunteer Opportunities

Community Service

Mentorship Programs

Athletic Recruiting

NIL Opportunities

Internships Abroad

Study Abroad

Professional Certifications

Creative Showcases

Government Programs

Financial Assistance

Housing Assistance

Emergency Aid

Networking Events

Public Office Appointments

Board Service

Youth Advisory Councils

Microgrants

Business Funding

The engine is category-agnostic.

---

# Opportunity Lifecycle

```
Opportunity Created

↓

Published

↓

Indexed

↓

Matched

↓

Ranked

↓

Recommended

↓

Viewed

↓

Applied

↓

Reviewed

↓

Decision

↓

Outcome

↓

Participant Record
```

Opportunities evolve throughout their lifecycle.

---

# Eligibility

Eligibility is determined through computation.

Eligibility may depend on:

Age

Grade Level

Enrollment Status

Academic Performance

Competencies

Citizenship

Residency

Athletic Status

Organization Membership

Relationships

Financial Need

Career Interests

Program Completion

Deadlines

Verification Status

Eligibility is dynamic.

---

# Opportunity Matching

Matching considers:

Verified Evidence

Participant Record

Knowledge Graph

Participant Goals

Participant Preferences

Eligibility

Relationships

Organizations

Timing

Policies

Current Readiness

No single factor determines a match.

---

# Ranking

Matched opportunities are prioritized using multiple dimensions.

Examples include:

Eligibility Confidence

Participant Readiness

Competency Alignment

Deadline Urgency

Goal Alignment

Relationship Strength

Historical Success

Organization Preference

Geographic Preference

Financial Impact

Development Value

Ranking is explainable.

---

# Recommendations

Recommendations are generated from ranked opportunities.

Recommendations include:

Opportunity

Reason

Supporting Evidence

Confidence

Next Action

Deadline

Expected Impact

Every recommendation is transparent.

---

# Applications

Applications are participant actions related to opportunities.

An application may include:

Documents

Evidence

Portfolio

Transcript

Certificates

Essays

Recommendations

Interviews

Applications remain connected to Opportunities.

---

# Offers

Organizations may extend:

Offers

Invitations

Conditional Offers

Admissions

Recruitment

Employment

Funding

Mentorship

Board Appointments

Offers represent organizational decisions.

---

# Outcomes

Possible outcomes include:

Accepted

Rejected

Withdrawn

Expired

Deferred

Completed

Successful outcomes generate new Evidence.

---

# Opportunity Signals

The engine continuously produces signals such as:

High Match

Deadline Approaching

New Eligibility

Recently Qualified

Relationship Referral Available

Profile Strength Improved

Application Ready

Missing Requirement

Signals drive participant engagement.

---

# Opportunity Pipelines

Participants maintain multiple pipelines simultaneously.

Examples:

College Pipeline

Career Pipeline

Athletics Pipeline

Founder Pipeline

Scholarship Pipeline

Leadership Pipeline

Financial Assistance Pipeline

Pipelines evolve independently.

---

# Relationships

Relationships influence opportunity discovery.

Examples:

Coach referrals

Mentor introductions

Faculty recommendations

Employer referrals

Alumni connections

Family support

Community advocates

Relationships strengthen opportunity access but do not replace eligibility.

---

# Organizations

Organizations create and manage opportunities.

Examples:

Universities

Employers

Foundations

Sports Organizations

Government Agencies

Nonprofits

Community Organizations

Businesses

Organizations define policies.

The engine computes participant fit.

---

# Integration with Evidence Engine

Evidence determines capability.

Capability influences eligibility.

Eligibility enables matching.

Matching generates recommendations.

---

# Integration with Participant Record Engine

The Participant Record provides:

Competencies

Achievements

Profiles

Growth Indicators

Timeline

Credentials

Opportunity matching never queries raw Evidence directly unless necessary.

---

# Integration with Planning Engine

Accepted opportunities generate Plans.

Missed opportunities generate preparation goals.

Upcoming deadlines influence planning priorities.

Planning and Opportunity continuously reinforce one another.

---

# AI Responsibilities

AI may:

Explain recommendations

Summarize requirements

Suggest improvements

Estimate readiness

Identify missing qualifications

Generate application checklists

AI may never:

Override eligibility

Create fake opportunities

Alter verified evidence

Approve applications

Replace organizational decisions

---

# Commands

PublishOpportunity

ArchiveOpportunity

MatchParticipant

RankOpportunities

GenerateRecommendations

SubmitApplication

UpdateApplication

WithdrawApplication

AcceptOffer

DeclineOffer

BookmarkOpportunity

RefreshOpportunityMatches

---

# Events Published

OpportunityPublished

ParticipantMatched

OpportunityRanked

RecommendationGenerated

ApplicationSubmitted

ApplicationUpdated

OfferReceived

OfferAccepted

OfferDeclined

OpportunityExpired

OpportunityCompleted

OpportunitySignalGenerated

---

# Queries

GetOpportunity

GetParticipantMatches

GetRecommendations

GetOpportunityPipeline

GetEligibility

GetApplicationStatus

GetDeadlines

GetOffers

GetSignals

Queries never modify state.

---

# Domain Invariants

Every Opportunity belongs to an Organization.

Eligibility is computed.

Recommendations are explainable.

Matching is deterministic.

Policies govern eligibility.

Deadlines influence ranking.

Applications belong to Participants.

Offers originate from Organizations.

Outcomes generate Evidence.

No Opportunity bypasses platform security.

---

# Definition of Done

✓ Opportunity aggregate defined.

✓ Canonical entities established.

✓ Lifecycle documented.

✓ Eligibility model defined.

✓ Matching process defined.

✓ Ranking process defined.

✓ Recommendation model defined.

✓ Relationship integration documented.

✓ Organization integration documented.

✓ Evidence integration documented.

✓ Participant Record integration documented.

✓ Planning integration documented.

✓ Commands documented.

✓ Events documented.

✓ Queries documented.

✓ AI boundaries established.

✓ Domain invariants enforced.

Only then may implementation begin.

---

# Closing Principle

The Opportunity Engine transforms verified participant growth into meaningful advancement.

It does not simply list opportunities.

It continuously discovers, evaluates, prioritizes, and delivers the next best opportunities for every participant based on evidence, readiness, relationships, and purpose.

The goal is not to help Participants find opportunities.

The goal is to ensure opportunities find the Participants who are ready for them.