# ADR-0007: Universal Opportunity Engine

Status: Accepted

Date: 2026-07-20

Owners:
Platform Architecture

---

# Context

Traditional education, workforce, recruiting, and entrepreneurship platforms treat opportunities as separate domains.

Examples include:

- Scholarship platforms
- Internship platforms
- Job boards
- Athletic recruiting systems
- Fellowship portals
- Grant management systems
- Accelerator applications
- Volunteer matching
- Mentorship programs

Each system requires participants to repeatedly recreate profiles, upload duplicate evidence, and manually search for opportunities.

This fragmentation creates unnecessary barriers and prevents participants from realizing the full value of their verified achievements.

---

# Decision

Playbook shall adopt a Universal Opportunity Engine.

The Opportunity Engine becomes a first-class bounded context responsible for discovering, evaluating, matching, recommending, and tracking all meaningful opportunities available to a Participant throughout their lifetime.

Opportunity is elevated to a core platform capability rather than being implemented separately by individual modules.

---

# Opportunity Definition

An Opportunity is any structured experience, resource, position, award, relationship, program, or pathway that may advance a Participant's educational, professional, athletic, entrepreneurial, financial, civic, or personal development.

Opportunity types include, but are not limited to:

- Scholarships
- Grants
- Fellowships
- Internships
- Employment
- Apprenticeships
- Recruiting
- College Admissions
- University Programs
- Research Opportunities
- Accelerators
- Incubators
- Venture Funding
- Pitch Competitions
- Conferences
- Leadership Programs
- Volunteer Service
- Board Service
- Speaking Engagements
- Mentorship
- Coaching
- Certifications
- Awards

Future opportunity categories may be added without altering the canonical Opportunity model.

---

# Architectural Model

Participant

↓

Participant Record

↓

Evidence

↓

Opportunity Engine

↓

Compass AI

↓

Participant Action

↓

Outcome

↓

New Evidence

↓

Participant Record

The platform continuously converts verified evidence into new opportunities.

---

# Guiding Principle

Participants should not be responsible for discovering every opportunity manually.

The platform should proactively identify relevant opportunities based on verified evidence, participant goals, preferences, permissions, and organizational relationships.

---

# Consequences

Positive

- One matching engine serves every opportunity type.
- Reduced duplicate profile creation.
- Stronger AI recommendations.
- Lifelong continuity.
- Unified analytics.
- Consistent application workflow.
- Shared eligibility framework.
- Easier integrations.

Trade-offs

- Opportunity Engine becomes a strategic platform dependency.
- Requires a flexible eligibility model.
- Requires high-quality evidence and permission evaluation.

These trade-offs are accepted because they substantially improve participant outcomes and reduce long-term platform complexity.

---

# Status

Accepted.

This ADR establishes the Universal Opportunity Engine as a foundational architectural capability of the Playbook platform.