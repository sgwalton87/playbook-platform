---
id: PPS-3004
title: Workflow Registry Standard
version: 0.1.0
status: Draft
classification: Constitutional
parent: Volume 30
---

# Executive Summary

Defines the canonical architecture for every user workflow.

## Purpose

Workflows—not pages—represent business behavior.

# Canonical WORKFLOW Schema

- Workflow ID
- Name
- Purpose
- Experience
- Entry Trigger
- Exit Trigger
- Actors
- Pages
- Features
- Business Rules
- Validation
- Required Data
- Optional Data
- APIs
- Database Writes
- Events
- Notifications
- Failure States
- Recovery
- Analytics
- Definition of Done

# Standard Lifecycle

- Not Started
- Started
- In Progress
- Waiting
- Review
- Submitted
- Completed
- Archived

# Codex Implementation Contract

Codex SHALL validate workflow dependencies before implementation.
Codex SHALL reject undefined Features, Pages, or APIs.
