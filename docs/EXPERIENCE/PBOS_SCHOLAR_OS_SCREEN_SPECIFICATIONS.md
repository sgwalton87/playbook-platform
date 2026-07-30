# PBOS Scholar OS Screen Specifications

**Purpose:** Define the initial governed screen inventory and complete states.  
**Owner:** Playbook OS Product and Experience Architecture  
**Last Updated:** July 30, 2026

## Shared Contract

Every screen provides loading, empty, success, error, permission, privacy, stale-evidence, and recovery states. Every recommendation displays evidence, reasoning, confidence, confirmation, and feedback. No screen mutates canonical truth without Kernel-admitted capability and human confirmation.

| Screen | Purpose | Primary action | Required data | Permission |
|---|---|---|---|---|
| Scholar Home | Orient the scholar around identity, mission, goals, progress, actions, opportunities, network, and achievements | Choose a next step | Scholar Record, Journey, opportunities, support consent | `VIEW_SCHOLAR_HOME` |
| Journey | Connect current reality to desired future and progress | Confirm or revise a goal | Goals, milestones, actions, outcome evidence | `MANAGE_OWN_GOALS` |
| Academic Path | Understand courses, credits, requirements, readiness, and applications | Review academic next action | Verified academic evidence | `VIEW_ACADEMIC_PATH` |
| Athletic Path | Understand development, achievement, recruiting readiness, and pathways | Confirm athletic milestone | Scholar-confirmed and verified athletic evidence | `VIEW_ATHLETIC_PATH` |
| Opportunities | Evaluate scholarships, internships, programs, mentorships, competitions, and careers | Save or pursue opportunity | Source, provenance, eligibility, expiry | `VIEW_OPPORTUNITIES` |
| Human Network | Understand and control support relationships | Invite, scope, or revoke support | Consent, role, visibility, expiry | `MANAGE_SUPPORT_NETWORK` |
| Growth | Review outcomes across paths | Reflect and confirm outcome | Milestone and outcome evidence | `VIEW_GROWTH` |

## Scholar Home Hierarchy

1. Identity and mission.
2. Current focus and next confirmed goal.
3. Progress and milestones.
4. Recommended actions with explanations.
5. Time-sensitive opportunities.
6. Support network and consent status.
7. Achievements and recent evidence.

## State Behavior

- **Loading:** preserve layout, label loading regions, and avoid invented placeholder values.
- **Empty:** distinguish no evidence from zero progress and provide a governed creation path.
- **Error:** identify unavailable source, preserve last trusted state when allowed, and offer retry.
- **Permission:** explain required authority without exposing protected data.
- **Privacy:** show current visibility, consent owner, expiry, and revocation action.
- **Stale evidence:** display observation time and block consequential recommendation.
- **Success:** confirm the human action and resulting evidence reference.

## Analytics And Audit

Analytics records screen and interaction taxonomy without sensitive content. Audit events record consent, recommendation disposition, evidence submission, goal confirmation, opportunity engagement, and permission changes with actor, time, and lineage.
