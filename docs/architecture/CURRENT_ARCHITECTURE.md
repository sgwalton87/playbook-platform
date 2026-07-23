# Current Architecture

Generated originally by Playbook Cartographer; reconciled manually against the review branch on 2026-07-22.

## Generated At

2026-07-22T20:25:00.000Z

## System

Playbook Intelligence OS

## Current Milestone

Alpha 1.0

## Counts

- Total files: 1100
- Engines: 36
- Repositories: 5
- Events: 14
- SDK modules: 11
- Components: 109
- Pages: 92
- Migrations: 18
- Tests: 95
- Docs: 170

## Core Flow

Playbook Record  
↓  
Playbook Graph  
↓  
Event Bus  
↓  
Engines  
↓  
Repositories  
↓  
Experience Layer  
↓  
Compass Guidance

## Current Role and Relationship Architecture

- One canonical registry defines all 14 public roles, aliases, onboarding availability, labels, and OS destinations.
- Four learner-owned operating systems inherit the Scholar capability baseline and add role-specific modules.
- Ten support, institutional, college, and opportunity-partner roles inherit a shared live platform baseline and add distinct role modules.
- `/start` is the canonical onboarding shell; every role completes a tutorial before OS entry.
- Starting Five stores a precise invited role, excludes the learner’s own role, and orders likely support roles with Parent/Guardian first and Other last.
- Invitation acceptance remains pending until matching role onboarding completes; only then are the relationship, welcome message, event, and inviter notification created.
- Product Inbox, Support Network, Scholar Network, and invitation management use authenticated persisted data. Demo identities remain confined to explicit demo/studio tooling.

## Open Production Boundary

The current branch has local implementation and contract/build evidence. Production truth still depends on OR-008: review-database migrations, RLS allow/deny verification, 14-role browser E2E, desktop/mobile validation, real email delivery, agreement audit records, accessibility, observability, and recovery testing.

## Major Layers

### Core Platform

- Playbook Record
- Scholar Record
- Trust Layer
- Playbook Graph
- Event Bus
- Engine Layer
- Repository Layer
- Playbook SDK

### Intelligence Layer

- Academic Intelligence
- Transcript Knowledge Graph
- Academic DNA
- Opportunity Graph
- Opportunity Marketplace
- Compass Core

### Experience Layer

- Dashboard Guidance
- Scholar Record Recommendations
- Opportunity Marketplace
- Compass UI
- Design System
