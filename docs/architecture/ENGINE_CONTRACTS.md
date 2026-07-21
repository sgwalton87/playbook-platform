# Engine Contracts

Each engine owns exactly one domain.

## Identity Engine

Owns

- Authentication
- Verification
- Roles
- Permissions

Produces

- Identity

Consumes

- Nothing

---

## Participant Record Engine

Owns

- Personal Profile
- Academic Profile
- Athletic Profile
- Goals
- Interests
- Activities

Produces

- Living Participant Record

Consumes

- Identity

---

## Evidence Engine

Owns

- Transcript
- Resume
- Certificates
- Awards
- Portfolio

Produces

- Verified Evidence

Consumes

- Participant Record

---

## Academic Intelligence Engine

Produces

- GPA Analysis
- Graduation Progress
- A-G Readiness
- FAFSA Readiness

Consumes

- Evidence
- Participant Record

---

## Athletics Engine

Produces

- Recruiting Profile
- Performance Summary

Consumes

- Participant Record

---

## Learning Engine

Produces

- Skill Progress
- Mastery
- XP
- Certificates

Consumes

- Participant Record

---

## Opportunity Engine

Produces

- Scholarship Matches
- Internship Matches
- College Matches
- Career Matches

Consumes

- Participant Record
- Evidence
- Learning

---

## Relationship Engine

Produces

- Support Network
- Mentorship
- Community

Consumes

- Participant Record

---

## Economy Engine

Produces

- Coins
- Rewards
- Marketplace

Consumes

- Learning
- Community

---

## Planning Engine

Produces

- Plans
- Milestones
- Roadmaps

Consumes

- Every engine

---

## Compass Engine

Produces

- Personalized Journey
- Daily Priorities
- Next Best Action

Consumes

- Every engine

