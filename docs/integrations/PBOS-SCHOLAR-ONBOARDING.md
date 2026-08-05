# Governed Scholar Onboarding Journey

## Purpose

This integration connects The Playbook's authenticated Scholar onboarding flow to PBOS v1 without allowing the application to self-authorize.

## Ownership and boundaries

- The Playbook owns the user interface, Supabase records, and Scholar experience.
- PBOS v1 owns connector identity, lifecycle communication, approved private exchange, and provenance.
- Connector credentials and approval references are server-only configuration.
- Merge, production deployment, secret creation, and certification remain protected human decisions.

## Runtime flow

1. Supabase authenticates the Scholar.
2. The server verifies owner authority and the PBOS identity approval.
3. The application durably records the Scholar profile, first goal, and onboarding milestone.
4. The server signs and publishes the onboarding lifecycle event to PBOS v1.
5. PBOS v1 authorizes the private identity-and-goals dashboard projection.
6. The application persists the projection and marks the dashboard ready.

Every retry uses a stable idempotency key. PBOS denial or unavailable protected configuration fails closed and is surfaced accessibly in the existing onboarding page.

## Required server configuration

Copy `.env.example` to the environment-specific secret configuration and supply every `PBOS_*` value through the deployment platform's protected secret store. Never commit credential values.

## Data and rollback

Migration `supabase/migrations/202608050003_pbos_scholar_dashboard.sql` adds idempotency boundaries and an owner-scoped dashboard projection. Rollback is a separately reviewed destructive migration; do not remove durable journey records automatically.

## Validation gate

Human operators run:

```bash
npm run typecheck
npm test
npm run build
```
