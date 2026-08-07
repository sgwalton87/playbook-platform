# Opportunity-to-Application Journey

This journey replaces the demonstration-only application workspace with an authenticated Scholar workflow. A Scholar starts from an opportunity, receives a durable task checklist, tracks a deadline and readiness, uploads private application documents, changes task state, and records submission status. Every record is owner-scoped by Supabase RLS and survives process restart.

PBOS v1 receives server-signed creation and progress lifecycle events. The application cannot self-authorize: the server requires the protected PBOS application-journey approval and connector credentials. Browser input never selects the record owner. Private documents are constrained by type and size and stored in an owner-prefixed private bucket.

Completion requires independent validation of typecheck, tests, production build, owner-isolation security, keyboard and screen-reader behavior, error/retry states, the exact pull-request revision, and human certification. Creating source files or opening a pull request is implementation evidence—not completion.
