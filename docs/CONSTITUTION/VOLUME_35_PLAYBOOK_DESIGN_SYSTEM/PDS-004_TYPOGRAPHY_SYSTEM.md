---
id: PDS-004
title: Typography System
version: 1.0.0
status: Canonical
classification: Constitutional
owners:
  - Playbook
layer: Design System
parent: Volume 35
depends_on:
  - PDS-000
  - PDS-001
  - PDS-002
  - PDS-003
related:
  - PDS-005
  - PDS-006
  - PDS-009
last_updated: 2026-07-28
---

# Purpose

The Typography System establishes the constitutional standards governing written communication throughout the Playbook ecosystem.

Typography communicates hierarchy, meaning, trust, accessibility, and emotion.

It is one of the primary ways users understand the platform.

Typography shall prioritize comprehension before aesthetics.

---

# Constitutional Authority

This document derives authority from:

- PDS-000 — Playbook Design Philosophy
- PDS-001 — Visual Language Standards
- PDS-002 — Design Tokens
- PDS-003 — Layout and Grid System

No implementation may conflict with these governing standards.

---

# Guiding Principles

Typography shall be:

- Readable
- Accessible
- Consistent
- Inclusive
- Predictable
- Scalable
- Internationally adaptable
- Purpose-driven

---

# Typography Philosophy

Typography exists to reduce cognitive effort.

Users should immediately understand:

- what is most important
- what requires action
- what provides context
- what may be safely ignored

Typography creates information hierarchy before color or decoration.

---

# Semantic Typography

Playbook uses semantic text roles rather than visual names.

Examples include:

- Display
- Heading
- Title
- Subtitle
- Body
- Caption
- Label
- Overline
- Code
- Quote

Engineering implementations shall reference semantic roles rather than font sizes.

---

# Display Text

Display text is reserved for:

- Landing pages
- Major milestones
- Hero sections
- Marketing experiences
- High-impact achievements

Display text shall be used sparingly.

---

# Headings

Headings establish document hierarchy.

Every page shall contain one primary heading.

Additional headings shall follow a logical hierarchy.

Heading levels shall never be skipped solely for visual appearance.

---

# Titles

Titles identify sections, cards, dialogs, and workspaces.

Titles should remain concise and descriptive.

---

# Body Text

Body text communicates primary information.

Body text shall prioritize readability over density.

Long-form content should support comfortable reading across all devices.

---

# Labels

Labels identify interactive elements.

Labels shall be:

- concise
- unambiguous
- accessible

Every interactive control shall have a label.

---

# Captions

Captions provide supporting information.

Captions shall never communicate critical instructions without additional reinforcement.

---

# Overlines

Overlines introduce categories or context.

They should remain visually subordinate to headings.

---

# Numeric Typography

Numbers shall display consistently.

Examples include:

- GPA
- Test scores
- Scholarship amounts
- Financial balances
- Dates
- Percentages
- Rankings

Formatting shall remain predictable throughout the platform.

---

# Date & Time Formatting

Dates and times shall follow platform localization standards.

Implementations shall support international formatting.

---

# Content Hierarchy

Information should generally follow this order:

Heading

↓

Supporting description

↓

Primary action

↓

Secondary information

↓

Metadata

Users should understand page structure within seconds.

---

# Reading Width

Long-form text should avoid excessive line length.

Reading layouts shall prioritize comprehension over density.

---

# Responsive Typography

Typography shall scale gracefully across:

- Mobile
- Tablet
- Laptop
- Desktop
- Large Displays

Scaling shall preserve hierarchy.

---

# Accessibility

Typography shall support:

- screen readers
- browser zoom
- high contrast
- scalable text
- dyslexia-friendly spacing where applicable
- reduced cognitive load

Typography shall never become unreadable because of implementation choices.

---

# Internationalization

Typography shall support:

- multilingual interfaces
- right-to-left languages
- variable character widths
- future localization

No typography standard shall assume English-only experiences.

---

# AI Experiences

AI-generated content shall remain visually distinguishable from system-generated content when appropriate.

AI explanations should emphasize clarity over verbosity.

---

# Writing Style

Playbook copy shall be:

- encouraging
- direct
- respectful
- transparent
- human

Avoid unnecessary jargon.

Avoid blame-oriented language.

Avoid fear-based messaging.

---

# Error Messaging

Error messages shall:

- explain the problem
- explain why it occurred when known
- recommend corrective action

Users should understand how to recover.

---

# Success Messaging

Success messages should:

- acknowledge progress
- reinforce accomplishment
- recommend meaningful next actions when appropriate

Celebration should never interrupt productivity.

---

# Component Integration

Every reusable component shall define:

- heading usage
- label usage
- body text usage
- caption usage
- accessibility behavior

Typography shall remain consistent regardless of component.

---

# Design Tokens

Typography implementations shall derive from constitutional Design Tokens.

Raw font sizes, weights, and spacing shall not be hard-coded where semantic tokens exist.

---

# PBOS Responsibilities

PBOS shall validate:

- semantic typography usage
- heading hierarchy
- accessibility compliance
- responsive scaling
- component consistency
- approved typography tokens

Implementations violating constitutional typography standards shall fail certification.

---

# Engineering Responsibilities

Engineering shall implement semantic typography roles using approved Design Tokens.

Implementation details may evolve without changing constitutional meaning.

---

# Governance

Changes to the Typography System require constitutional review.

Typography changes affecting hierarchy, accessibility, or semantic meaning shall be considered breaking changes.

---

# Success Criteria

Every Playbook interface communicates clearly through consistent, accessible, and semantically meaningful typography.

Users should understand information hierarchy immediately, regardless of device, operating system, language, or implementation technology.

The Typography System serves as the constitutional language framework for every written experience within the Playbook ecosystem.

