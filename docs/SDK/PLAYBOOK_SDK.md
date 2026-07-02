# Playbook SDK

The Playbook SDK is the internal interface for Playbook Intelligence OS.

It centralizes access to the major engines, repositories, records, graphs, and UI primitives.

## Purpose

The SDK prevents future features from importing random internal paths.

Instead of reaching directly into engines, components, or repositories, new work should increasingly import from:

`@/lib/playbook`

## SDK Modules

- Academic
- Opportunities
- Compass
- Trust
- Record
- Timeline
- Events
- Repositories
- Graph
- UI

## Principle

Playbook features should consume the SDK whenever possible.

This keeps the platform consistent as Scholar OS, Educator OS, Family OS, Institution OS, and Community OS grow.
