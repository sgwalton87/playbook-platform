# Entrepreneurship Entities

Version: 1.0

Status: Canonical

Owner: Entrepreneurship Engine

Related Documents

- ../DATA_MODEL.md
- ../../DATABASE_BLUEPRINT.md
- FOUNDATION.md
- RELATIONSHIPS.md
- ORGANIZATIONS.md
- LEARNING.md
- COMMUNITY.md

---

# Purpose

The Entrepreneurship domain enables Participants to create, operate, grow, and steward ventures throughout their lifetime.

Entrepreneurship is treated as a lifelong learning and evidence-generating experience.

Business creation, leadership, innovation, and economic mobility become permanent components of the Participant Record.

---

# Canonical Entity Index

| Entity | Aggregate Root | Owner Engine |
|---------|----------------|--------------|
| Venture | Venture | Entrepreneurship Engine |
| Venture Profile | Venture | Entrepreneurship Engine |
| Founder Assignment | Venture | Entrepreneurship Engine |
| Team Member Assignment | Venture | Entrepreneurship Engine |
| Pitch | Venture | Entrepreneurship Engine |
| Pitch Competition | Program | Entrepreneurship Engine |
| Business Milestone | Venture | Entrepreneurship Engine |
| Business Artifact | Participant | Evidence Engine |
| Investor | Organization | Investment Engine |
| Investment Opportunity | Opportunity | Opportunity Engine |
| Accelerator | Program | Entrepreneurship Engine |
| Mentor Engagement | Participant | Mentorship Engine |

---

FIRST ARCHITECTURAL DESIGN 
Venture becomes the Aggregate Root.
Venture

Purpose:

Represents an entrepreneurial initiative regardless of legal status.

Examples:

Startup
Student Business
Nonprofit
Social Enterprise
Sole Proprietorship
LLC
Corporation
Cooperative

A Venture may evolve from an idea to an incorporated entity without losing historical continuity.

Participant
      │
      ▼
Founder Assignment
      │
      ▼
Venture
      │
      ├── Team Members
      ├── Milestones
      ├── Pitches
      ├── Artifacts
      ├── Funding
      └── Opportunities

---

ENTREPRENEURSHIP HIERARCHY
Participant
      │
      ▼
Founder Assignment
      │
      ▼
Venture
      │
      ├── Venture Profile
      ├── Team Member Assignments
      ├── Business Milestones
      ├── Business Artifacts
      ├── Pitches
      ├── Investment Opportunities
      └── Mentor Engagements

---


