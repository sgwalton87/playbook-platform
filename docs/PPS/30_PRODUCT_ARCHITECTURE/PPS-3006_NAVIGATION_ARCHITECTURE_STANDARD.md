---
id: PPS-3006
title: Navigation Architecture
version: 0.1.0
status: Draft
classification: Constitutional
parent: Volume 30
---

# Executive Summary

Defines the canonical navigation architecture for every Playbook experience.

## Purpose

Navigation SHALL provide a deterministic path between Operating Systems, Experiences, Workflows, Pages, and Features.

# Navigation Hierarchy

Platform
- Operating System
- Dashboard
- Experience
- Workflow
- Page
- Feature

# Standards

- One canonical route per page.
- Navigation SHALL be role-aware.
- Navigation SHALL respect permissions.
- Duplicate navigation paths are prohibited.
- Breadcrumbs SHALL reflect hierarchy.

# Navigation Schema

- Navigation ID
- Parent
- Children
- Route
- Roles
- Visibility
- Permissions
- Analytics Event
- Dependencies

# Codex Implementation Contract

Codex SHALL generate navigation only from canonical registries and SHALL reject orphan routes.
