# ADR-0002 — Playbook Event Bus™

## Status

Accepted

## Decision

Playbook will use an event-driven architecture.

## Why

One achievement should update multiple engines without tightly coupling them.

## Alternatives Considered

- Direct function calls between engines
- UI-driven database writes only

## Consequences

Events become the nervous system of Playbook OS™.
