# PBOS-RLS-001 Profile Schema Provenance Finding

Date: 2026-07-27

## Status

Discovery complete. Resolution pending.

## Finding

A fresh Supabase initialization fails because the repository references `public.profiles`, but no committed migration creates the canonical profile foundation.

## Validation Evidence

Command:

supabase start

Result:

Migration execution fails during:

20260701_playbook_graph.sql

Error:

relation "public.profiles" does not exist

## Dependency Evidence

The platform depends on public.profiles through:

- authentication callbacks
- onboarding persistence
- dashboard
- public profiles
- role systems
- Scholar Record
- Playbook Graph
- platform services

## Missing Artifact

No migration currently provides:

create table public.profiles

## Required Resolution

Recover the canonical profiles schema and introduce it as the foundational migration before dependent migrations.

## PBOS Principle

Repository truth must be sufficient to recreate a trusted environment.
