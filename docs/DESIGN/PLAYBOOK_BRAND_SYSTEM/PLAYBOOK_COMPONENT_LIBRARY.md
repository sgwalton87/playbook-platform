# Playbook Component Library

**Purpose:** Define governed component contracts for consistent Playbook experiences.  
**Owner:** Playbook Design System Governance  
**Last Updated:** July 30, 2026

| ID | Component | Purpose | Required states | Core data |
|---|---|---|---|---|
| PB-NAV-001 | Operating System Navigation | Global, local, role, and mobile navigation | default, active, collapsed, permission | route, role, permissions |
| PB-CARD-001 | Evidence Card | Present a sourced fact or achievement | loading, verified, disputed, stale, error | identity, source, time, trust |
| PB-MODULE-001 | Operating Module | Group one coherent task or status | loading, empty, success, error, restricted | purpose, action, state |
| PB-PROGRESS-001 | Progress Indicator | Explain movement toward a confirmed goal | unknown, started, progressing, achieved, blocked | baseline, target, evidence |
| PB-JOURNEY-001 | Journey Timeline | Connect current reality to future outcomes | empty, planned, active, blocked, complete | goals, milestones, actions |
| PB-BADGE-001 | Achievement Badge | Recognize authentic evidence-backed achievement | locked, earned, verified, revoked | achievement, issuer, evidence |
| PB-OPPORTUNITY-001 | Opportunity Card | Explain fit, eligibility, source, and deadline | loading, eligible, ineligible, expired, saved | source, criteria, expiry |
| PB-PROFILE-001 | Identity Card | Present role-safe human identity | private, partial, public, verified | identity, story, permissions |
| PB-COURSE-001 | Course Module | Support learning progress and certification | not started, active, complete, locked, error | course, progress, evidence |
| PB-MESSAGE-001 | Trusted Message Module | Support governed human communication | unread, read, sending, failed, restricted | participants, consent, message |
| PB-COMPASS-001 | AI Compass Module | Explain options and recommendations | loading, ready, low confidence, blocked, feedback | evidence, reasoning, confidence |

## Governance Contract

Every component defines owner, variants, data schema, loading, empty, error, success, permission, privacy, responsive, keyboard, focus, semantic, contrast, and assistive-technology behavior. Components consume semantic tokens and existing shared primitives. Route-specific forks require architectural justification.
