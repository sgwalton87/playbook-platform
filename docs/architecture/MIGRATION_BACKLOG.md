# Playbook HDOS Migration Backlog

Generated: $(date)

---

# Priority: HIGH

## Migration 001

### Folder

lib/profile

### Recommended Engine

Participant Record

### Current State

Profile functionality is distributed across multiple libraries and UI components, making ownership unclear and increasing maintenance cost.

### Target State

The Participant Record Engine becomes the canonical owner of:

- Identity Profile
- Academic Profile
- Athlete Profile
- Public Profile
- Privacy Settings
- Profile Completion
- Transcript Summary
- Portfolio Summary
- Badges
- Verification Status

### Scope

Move business logic from:

- lib/profile
- app/profile
- components/profile
- profile-related helpers

into:

lib/participant-record/

### Benefits

- Single source of truth
- Eliminates duplicate profile logic
- Easier testing
- Easier maintenance
- Enables HDOS ownership model

### Dependencies

- Identity Engine
- Scholar Record
- Athletics
- Portfolio
- Badges
- Connections

### Estimated Effort

Medium

### Risk

Low

### Status

Not Started

---

# Future Migrations

| Priority | Folder | Canonical Engine | Status |
|-----------|------------------------|----------------------|-------------|
| HIGH | lib/profile | Participant Record | Pending |
| HIGH | lib/scholar-record | Participant Record | Pending |
| HIGH | lib/scholar-athlete | Participant Record | Pending |
| HIGH | lib/playbook-record | Participant Record | Pending |
| HIGH | lib/portfolio | Participant Record | Pending |
| HIGH | lib/athletics | Athletics Engine | Pending |
| HIGH | lib/opportunity-graph | Opportunity Engine | Pending |
| HIGH | lib/courses | Learning Engine | Pending |
| HIGH | lib/rewards | Economy Engine | Pending |
| HIGH | lib/gamification | Economy Engine | Pending |
| MEDIUM | lib/messages | Communication Engine | Pending |
| MEDIUM | lib/notifications-v2 | Communication Engine | Pending |
| MEDIUM | lib/network | Relationship Engine | Pending |
| MEDIUM | lib/trust | Trust Engine | Pending |
| LOW | lib/demo | Archive | Pending |

---

## HDOS Rule

Every folder must have exactly one canonical owner.

No shared ownership.

No duplicate business logic.

Every migration must reduce architectural complexity.

