---
id: PGSL-001-NAV
parent: PGSL-001
title: Global App Shell Navigation Map
version: 1.0.0
status: Draft
classification: Master Blueprint
last_updated: 2026-07-28
---

# Global App Shell Navigation Map

## Purpose

The Navigation Map defines the canonical navigation architecture for every authenticated Playbook experience.

Navigation exists to help users answer three questions at all times:

1. Where am I?
2. Where can I go?
3. What should I do next?

Every role-specific operating system inherits this navigation model.

---

# Navigation Philosophy

Navigation should never require explanation.

Users should build muscle memory over time.

Navigation prioritizes clarity over density.

Navigation prioritizes outcomes over features.

Navigation shall remain consistent regardless of user role.

---

# Navigation Hierarchy

Playbook navigation is divided into four architectural levels.

## Level 1 — Global Navigation

Always visible.

Provides movement between major operating environments.

Examples:

- Dashboard
- Profile
- Opportunities
- Learning
- Community
- Messages
- Calendar
- Notifications

---

## Level 2 — Workspace Navigation

Appears inside the active module.

Examples:

Dashboard

- Overview
- Progress
- Goals
- Analytics

Learning

- Courses
- Assignments
- Certificates

Profile

- Personal
- Academic
- Athletics
- Documents

---

## Level 3 — Context Navigation

Appears only when required.

Examples:

Tabs

Filters

Secondary menus

Wizard steps

---

## Level 4 — Action Navigation

User-specific actions.

Examples:

Create

Save

Submit

Share

Export

Apply

Schedule

Invite

---

# Persistent Navigation Elements

Every authenticated experience includes:

- Playbook Logo
- Current Workspace
- Primary Navigation
- Global Search
- Notifications
- User Menu

These elements remain consistent across all roles.

---

# Role Inheritance

Role-specific operating systems extend navigation but do not replace it.

Scholar

Adds:

- Transcript
- Scholarships
- Resume
- Mentorship

Scholar Athlete

Adds:

- Recruiting
- Athletics
- Highlights

Mentor

Adds:

- Scholars
- Meetings
- Notes

Coach

Adds:

- Team
- Recruiting
- Performance

Administrator

Adds:

- Platform
- Users
- Governance
- Reports

Organizations

Adds:

- Opportunities
- Applicants
- Programs

---

# Navigation States

Every navigation element supports:

- Default
- Hover
- Focus
- Active
- Disabled
- Loading

---

# Search Integration

Global Search shall remain accessible from every authenticated screen.

Search may surface:

- People
- Opportunities
- Courses
- Documents
- Organizations
- Events
- Messages

---

# Notification Integration

Notifications remain globally accessible.

Notifications shall not interrupt workflow.

Critical notifications may require acknowledgement.

---

# Responsive Navigation

## Desktop

Persistent sidebar.

Expanded labels.

Multi-level navigation.

---

## Tablet

Collapsible sidebar.

Adaptive navigation groups.

---

## Mobile

Drawer navigation.

Touch-first interactions.

Bottom sheets where appropriate.

No hover interactions.

---

# Accessibility

Navigation shall support:

- Keyboard navigation
- Screen readers
- Focus indicators
- ARIA labels
- Skip-to-content links
- Reduced motion preferences

---

# PBOS Validation

The PBOS Engine validates:

- Navigation hierarchy
- Required destinations
- Role inheritance
- Accessibility compliance
- Responsive behavior
- Active route consistency

---

# Success Criteria

A user should be able to move between any operating system without relearning navigation.

The navigation model shall provide a consistent mental framework that scales across every Playbook role while allowing role-specific extensions through inheritance.

