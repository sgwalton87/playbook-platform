---
id: PGSL-001-COMPONENTS
parent: PGSL-001
title: Global App Shell Component Map
version: 1.0.0
status: Draft
classification: Master Blueprint
last_updated: 2026-07-28
---

# Global App Shell Component Map

## Purpose

The Component Map defines every reusable interface component that composes the Global App Shell.

Components are the atomic building blocks of the Playbook Platform.

No screen shall introduce a new component without constitutional review and Design System approval.

---

# Component Architecture

The App Shell is composed of five architectural layers:

1. Foundation Components
2. Navigation Components
3. Content Components
4. Feedback Components
5. Utility Components

Every component belongs to exactly one architectural layer.

---

# Foundation Components

## PB-COMP-001 — Application Frame

Purpose:

Provides the structural container for every authenticated experience.

Responsibilities:

- Responsive layout
- Safe area handling
- Global spacing
- Region boundaries

---

## PB-COMP-002 — Content Container

Purpose:

Constrains readable content width while supporting dashboard expansion.

Supports:

- Standard pages
- Dashboards
- Forms
- Reports
- Analytics

---

## PB-COMP-003 — Grid System

Purpose:

Provides responsive column layouts.

Supports:

- 12-column desktop grid
- Adaptive tablet grid
- Single-column mobile layout

---

# Navigation Components

## PB-COMP-100 — Global Header

Contains:

- Logo
- Workspace title
- Global search
- Notifications
- User menu

Persistent across authenticated experiences.

---

## PB-COMP-101 — Primary Sidebar

Provides primary navigation.

Supports:

- Expand / collapse
- Keyboard navigation
- Role-aware items
- Active route highlighting

---

## PB-COMP-102 — Context Navigation

Displays module-specific navigation.

Examples:

- Dashboard tabs
- Course navigation
- Profile sections

---

## PB-COMP-103 — Breadcrumb

Displays hierarchical location within the platform.

---

## PB-COMP-104 — Global Search

Supports searching across:

- Scholars
- Opportunities
- Courses
- Organizations
- Documents
- Events

---

# Content Components

## PB-COMP-200 — Card

Reusable information container.

Variants:

- Summary
- Statistic
- Action
- Opportunity
- Course
- Profile

---

## PB-COMP-201 — Data Table

Supports:

- Sorting
- Filtering
- Pagination
- Bulk actions
- Responsive collapse

---

## PB-COMP-202 — Form

Supports:

- Validation
- Multi-step workflows
- Autosave
- Error recovery

---

## PB-COMP-203 — Section Header

Provides page organization.

Contains:

- Title
- Description
- Optional actions

---

## PB-COMP-204 — Empty State

Displayed when no data exists.

Contains:

- Illustration
- Explanation
- Primary action

---

# Feedback Components

## PB-COMP-300 — Toast Notification

Temporary feedback.

Variants:

- Success
- Warning
- Error
- Information

---

## PB-COMP-301 — Modal

Focus-trapping dialog.

Supports:

- Confirmation
- Forms
- Preview
- Decisions

---

## PB-COMP-302 — Loading Indicator

Displays progress during asynchronous operations.

Variants:

- Skeleton
- Spinner
- Progress Bar

---

## PB-COMP-303 — Error State

Displays recoverable failures.

Must include:

- Explanation
- Recovery action
- Optional support link

---

# Utility Components

## PB-COMP-400 — Avatar Menu

Displays:

- User profile
- Settings
- Sign out

---

## PB-COMP-401 — Notification Center

Displays grouped notifications.

Supports:

- Read status
- Filtering
- Deep linking

---

## PB-COMP-402 — Quick Actions

Provides frequently used actions.

Examples:

- Create
- Apply
- Schedule
- Upload

---

# Component Relationships

Application Frame

├── Global Header

├── Primary Sidebar

├── Context Navigation

└── Content Container

&nbsp;&nbsp;&nbsp;&nbsp;├── Cards

&nbsp;&nbsp;&nbsp;&nbsp;├── Tables

&nbsp;&nbsp;&nbsp;&nbsp;├── Forms

&nbsp;&nbsp;&nbsp;&nbsp;└── Empty States

---

# Design System Integration

Each component defined in this document shall have a corresponding canonical specification within Volume 35.

The Design System is the implementation authority for component behavior and styling.

This document is the architectural authority for component composition.

---

# PBOS Validation

The PBOS Engine validates:

- Component identity
- Approved composition
- Design System references
- Accessibility support
- Responsive compatibility
- Inheritance compliance

---

# Success Criteria

Every authenticated Playbook experience shall be constructed exclusively from approved canonical components.

Screens compose components.

Components compose the platform.

