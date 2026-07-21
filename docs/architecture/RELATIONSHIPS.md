# Relationships

Version: 1.0

Status: Canonical

Owner: Platform Architecture

Related Documents

- FOUNDATION.md
- ORGANIZATIONS.md
- SECURITY_MODEL.md
- PLAYBOOK_STACK.md
- ENGINE_CONTRACT.md

---

# Purpose

Relationships define trust between Participants.

Relationships determine how Participants collaborate, mentor, coach, recruit, educate, supervise, advise, support, and interact throughout the Playbook ecosystem.

Relationships are first-class canonical entities.

Relationships are not permissions.

Relationships are not roles.

Relationships provide trusted context used by Policies to compute authorization.

---

# Philosophy

Identity answers:

Who are you?

Relationships answer:

Who do you know?

Organizations answer:

Where do you belong?

Roles answer:

What responsibilities do you have?

Policies answer:

What rules apply?

Permissions answer:

What are you allowed to do?

---

# Relationship Principles

Relationships establish trust.

Relationships never grant permissions directly.

Relationships may exist independently of Organizations.

Relationships may span Organizations.

Relationships are versioned.

Relationships are auditable.

Relationships have lifecycles.

Relationships always involve Participants.

---

# Canonical Definition

A Relationship represents a trusted connection between two or more Participants for a defined purpose.

Every Relationship has:

Purpose

Participants

Type

Lifecycle

Scope

Trust

Policies

History

---

# Relationship Components

Relationship ID

Relationship Type

Participants

Created Date

Status

Trust Level

Scope

Organization Context (optional)

Start Date

End Date (optional)

Verification Status

Policies

Audit History

Metadata

---

# Relationship Types

## Family

Parent

Guardian

Grandparent

Sibling

Relative

Emergency Contact

---

## Education

Teacher

Counselor

Principal

Academic Advisor

Tutor

Professor

Teaching Assistant

---

## Athletics

Coach

Assistant Coach

Trainer

Recruiter

Scout

Athletic Director

Teammate

Captain

---

## Mentorship

Mentor

Mentee

Peer Mentor

Executive Coach

Career Coach

Leadership Coach

---

## Entrepreneurship

Founder

Co-Founder

Advisor

Investor

Accelerator Director

Incubator Mentor

Board Member

Business Partner

---

## Professional

Manager

Supervisor

Employee

Employer

Colleague

Consultant

Client

Reference

---

## Community

Volunteer

Community Leader

Faith Leader

Case Manager

Program Director

Social Worker

Youth Advocate

---

## Platform

Administrator

Moderator

Support Specialist

Content Reviewer

---

# Cardinality

One-to-One

Participant ↔ Parent

Participant ↔ Mentor

Participant ↔ Advisor

One-to-Many

Teacher → Students

Coach → Athletes

Founder → Team Members

Many-to-Many

Participants ↔ Organizations

Participants ↔ Teams

Participants ↔ Communities

Participants ↔ Ventures

---

# Trust Levels

Pending

Verified

Trusted

Institution Verified

Government Verified

Platform Verified

Historical

Revoked

Trust level influences policy evaluation.

Trust level does not independently grant access.

---

# Verification

Relationships may require verification.

Examples:

Parent verification

Coach verification

Teacher verification

Employer verification

Guardian verification

Government verification

Verification methods may include:

Invitation

Email

Institution approval

Document review

Platform administrator

External integration

---

# Relationship Scope

Relationships may exist within:

Platform

Organization

Program

Team

Department

Cohort

Community

Event

Relationships may also exist globally.

---

# Lifecycle

Requested

↓

Invited

↓

Pending

↓

Accepted

↓

Verified

↓

Active

↓

Inactive

↓

Ended

↓

Historical

Relationships are never deleted.

---

# Delegation

Certain Relationships may delegate authority.

Examples:

Guardian

Parent

Administrator

Organization Owner

Delegation is governed by Policy.

Delegation is auditable.

Delegation is revocable.

---

# Relationship Network

Participant

↓

Parent

↓

Guardian

↓

Mentor

↓

Coach

↓

Teacher

↓

Advisor

↓

Recruiter

↓

Employer

↓

Investor

↓

Founder

↓

Community

Participants may belong to multiple relationship networks simultaneously.

---

# Organizational Context

Relationships may exist:

Inside an Organization

Across Organizations

Outside Organizations

Organizations never own Relationships.

Organizations provide context.

---

# Privacy

Relationships are subject to:

Consent

Policies

Permissions

Organization rules

Minor protections

Legal requirements

Relationship visibility is computed.

---

# Audit

Every Relationship records:

Creation

Acceptance

Verification

Changes

Delegation

Termination

Policy evaluations

Permission decisions

Historical versions

Audit history is immutable.

---

# Security

Relationships contribute to:

Trust evaluation

Guardian permissions

FERPA

COPPA

Mentorship

Recruiting

Parent visibility

Administrative delegation

Relationships never bypass Security Policies.

---

# AI

Compass consumes Relationships.

Compass may:

Explain relationships

Recommend mentors

Recommend advisors

Recommend collaborators

Compass may not create or modify Relationships.

Only the Relationship Engine may manage Relationships.

---

# Examples

Example 1

Scholar ← Mentor

Mentor may coach.

Mentor may not edit transcripts unless permitted by Policy.

---

Example 2

Scholar ← Parent

Parent may view progress.

Parent access depends on participant age, consent, and applicable policies.

---

Example 3

Founder ← Investor

Investor may review venture milestones.

Investor may not access private participant information without authorization.

---

Example 4

Athlete ← Coach

Coach may verify athletic performance.

Verification creates Evidence.

Evidence updates the Participant Record.

---

# Domain Invariants

Relationships are append-only.

Relationships are auditable.

Relationships always involve Participants.

Relationships have a lifecycle.

Relationships establish trust.

Relationships never directly grant permissions.

Trust is evaluated through Policy.

Authorization is computed.

---

# Relationship to the Playbook Stack

Participant

↓

Relationship

↓

Trust

↓

Policy

↓

Permission

↓

Platform Experience

Relationships provide the trust graph that connects Participants throughout the platform.

---

# Definition of Done

A Relationship architecture is complete when:

✓ Relationship types are documented.

✓ Lifecycle is defined.

✓ Trust model exists.

✓ Verification process is documented.

✓ Scope is defined.

✓ Delegation rules exist.

✓ Privacy is documented.

✓ Audit requirements exist.

✓ Security integration exists.

✓ AI interaction is documented.

✓ Domain invariants are enforced.

Only then may implementation begin.