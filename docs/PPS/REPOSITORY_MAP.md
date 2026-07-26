Playbook Platform Repository Map

Status

Draft

Purpose

The Repository Map defines the canonical organization of the Playbook Platform repository.

It serves as the primary navigation document for PBOS, AI agents, contributors, and maintainers.

This document does not replace existing documentation.

Instead, it establishes where authoritative information lives.

Repository Layers

Layer 1

Platform Constitution

Location

docs/PPS

Purpose

- Platform governance
- Specification standards
- Repository rules
- Validation rules
- Canonical references

Authority

Highest

------------------------------------------------------------

Layer 2

Vision

Location

docs/VISION

Purpose

- Mission
- Vision
- Theory of Change
- Success Metrics

Authority

Strategic

------------------------------------------------------------

Layer 3

Architecture

Location

docs/ARCHITECTURE

Purpose

- System architecture
- Engine architecture
- Data model
- Component catalog
- Repository catalog
- System map

Authority

Technical

------------------------------------------------------------

Layer 4

Architecture Decisions

Location

docs/ADR

Purpose

- Permanent architectural decisions

Authority

Permanent

------------------------------------------------------------

Layer 5

Engineering

Location

docs/ENGINEERING

Purpose

- Implementation standards
- Development workflow
- Engineering governance

Authority

Implementation

------------------------------------------------------------

Layer 6

Design

Location

docs/DESIGN

Purpose

- Design system
- User experience
- Accessibility
- Interaction patterns

Authority

Experience

------------------------------------------------------------

Layer 7

Intelligence

Location

docs/INTELLIGENCE

Purpose

- AI engines
- Recommendation systems
- Decision intelligence
- Compass

Authority

Platform Intelligence

------------------------------------------------------------

Layer 8

Product

Location

docs/PRODUCT

Purpose

- Features
- Roadmaps
- Requirements
- Specifications

Authority

Product

------------------------------------------------------------

Layer 9

Database

Location

docs

Purpose

- Database schema
- Tables
- Relationships
- Data governance

Authority

Data

------------------------------------------------------------

Layer 10

Releases

Location

docs/releases

Purpose

- Release history
- Ship logs
- Completion reports

Authority

Historical

Canonical Rules

- Every domain has one canonical owner.
- Documentation should reference rather than duplicate existing information.
- Architecture decisions belong in ADR.
- Platform rules belong in PPS.
- Product behavior belongs in Product documentation.
- Implementation belongs in Engineering.
- Historical information belongs in Releases.

PBOS Responsibilities

- Locate canonical documents.
- Validate repository organization.
- Detect duplicate documentation.
- Maintain traceability.
- Produce dependency graphs.
- Recommend documentation locations.
- Never invent new canonical locations without approval.

Definition of Done

- Repository structure documented.
- Ownership defined.
- Documentation hierarchy established.
- Ready for registry integration.

