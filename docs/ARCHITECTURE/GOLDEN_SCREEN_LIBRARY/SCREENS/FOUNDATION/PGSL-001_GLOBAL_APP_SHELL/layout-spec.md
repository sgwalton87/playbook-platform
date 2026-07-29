---
id: PGSL-001-LAYOUT
parent: PGSL-001
title: Global App Shell Layout Specification
version: 1.0.0
status: Draft
classification: Master Blueprint
last_updated: 2026-07-28
---

# Global App Shell Layout Specification

## Purpose

The Layout Specification defines the permanent structural architecture of every authenticated Playbook experience.

It establishes immutable layout regions, spatial hierarchy, responsive behavior, and content boundaries that every role-specific operating system inherits.

The purpose of the layout is not simply visual organization, but to reduce cognitive load by ensuring users always know:

- where they are
- where they can go
- what requires attention
- what actions are available
- what content belongs to the current context

---

# Architectural Philosophy

Layout is communication.

Every region must have a clearly defined purpose.

No permanent region may exist without constitutional justification.

Whitespace is intentional.

Hierarchy is intentional.

Movement is intentional.

Consistency is mandatory.

---

# Canonical Layout Regions

Every authenticated experience consists of the following architectural regions.

## Region A — Global Header

Purpose:

Provides persistent platform identity and universal actions.

Contains:

- Playbook logo
- Current workspace
- Global search
- Notifications
- User profile
- Quick actions

Always visible.

---

## Region B — Primary Navigation

Purpose:

Provides persistent movement throughout the operating system.

Characteristics:

- collapsible
- keyboard accessible
- responsive
- role-aware

Never changes location.

---

## Region C — Context Navigation

Purpose:

Displays navigation specific to the current module or workspace.

Examples:

Scholar Dashboard

Courses

Transcript

Mentorship

Settings

May collapse on mobile.

---

## Region D — Primary Content Area

Purpose:

Displays the current experience.

Characteristics:

largest visual priority

supports multiple layouts

cards

tables

forms

dashboards

analytics

Never contains permanent navigation.

---

## Region E — Utility Panel

Purpose:

Displays contextual tools.

Examples:

Recent activity

Tasks

Assistant

Context help

Recommendations

Optional on smaller devices.

---

## Region F — Notification Layer

Purpose:

Display temporary system feedback.

Examples:

Success

Errors

Warnings

Progress

Never permanently occupies screen space.

---

## Region G — Modal Layer

Purpose:

Temporary interruption requiring user attention.

Supports:

Dialogs

Confirmation

Quick forms

Search

Preview

Must trap keyboard focus.

---

# Visual Hierarchy

Priority Order

1. Active Content

2. User Actions

3. Context

4. Navigation

5. Platform Identity

Visual emphasis shall follow this order.

---

# Spatial Principles

Every layout shall maximize:

clarity

focus

predictability

consistency

Whitespace is a design element.

No region shall compete with another for attention.

---

# Responsive Layout

Desktop

Full navigation

Utility panel visible

Multi-column layouts

Tablet

Collapsible navigation

Reduced utility panel

Adaptive grids

Mobile

Drawer navigation

Single-column content

Bottom sheets when appropriate

Touch-first interactions

---

# Content Width

Readable content shall remain within optimal reading widths.

Dashboards may expand wider where visual analytics benefit.

Forms should avoid unnecessarily wide fields.

---

# Scroll Behavior

Only the content region shall scroll whenever possible.

Navigation and global header remain persistent.

Nested scrolling should be avoided.

---

# Layout Inheritance

Every authenticated screen inherits this layout specification.

Role-specific operating systems may extend but shall not redefine permanent architectural regions.

---

# PBOS Validation

The PBOS Engine shall validate:

- region existence
- navigation placement
- responsive behavior
- layout inheritance
- accessibility requirements
- content boundaries

---

# Success Criteria

A user should be able to move between any Playbook operating system without relearning the interface.

The layout shall create familiarity through consistency while allowing flexibility within the primary content region.

