# ADR-0003 — Engine and Repository Pattern

## Status

Accepted

## Decision

Business logic belongs in Engines. Persistence belongs in Repositories.

## Why

Handlers and UI components should not directly own business rules.

## Alternatives Considered

- Supabase calls directly inside handlers
- Supabase calls directly inside UI components

## Consequences

The platform becomes easier to test, scale, and eventually support AI agents.
