# Athletics Entities

Version: 1.0

Status: Canonical

Owner: Athletics Engine

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

The Athletics domain manages athletic participation, performance, eligibility, recruiting, team membership, competition history, and verified athletic evidence throughout a Participant's lifetime.

Athletics extends the Participant Record.

It does not replace it.

Athletic accomplishments are treated as verified evidence alongside academic, leadership, entrepreneurial, and career achievements.

---

# Canonical Entity Index

| Entity | Aggregate Root | Owner Engine |
|---------|----------------|--------------|
| Athlete Profile | Participant | Athletics Engine |
| Sport | Platform | Athletics Engine |
| Season | Organization | Athletics Engine |
| Team | Organization | Athletics Engine |
| Roster | Team | Athletics Engine |
| Competition | Athletics | Athletics Engine |
| Performance | Participant | Athletics Engine |
| Statistic | Performance | Athletics Engine |
| Highlight | Participant | Media Engine |
| Recruiting Profile | Participant | Recruiting Engine |
| College Interest | Participant | Recruiting Engine |
| Recruiter Evaluation | Participant | Recruiting Engine |
| Eligibility Record | Participant | Eligibility Engine |

---

FIRST ARCHITECTURAL DECISION
Participant
      │
      ▼
Athlete Profile
      │
      ├── Sports
      ├── Teams
      ├── Seasons
      ├── Performance
      ├── Highlights
      ├── Recruiting
      └── Eligibility

---

ATHLETICS HIERARCHY
Participant
      │
      ▼
Athlete Profile
      │
      ├── Sports
      ├── Teams
      │      └── Rosters
      ├── Seasons
      ├── Competitions
      │      ├── Performances
      │      └── Statistics
      ├── Highlights
      ├── Recruiting Profile
      │      ├── College Interests
      │      └── Recruiter Evaluations
      └── Eligibility Record