# Application-to-Support Journey

A signed-in Scholar chooses a durable application workspace and an active support relationship that grants `support_tasks`. The server derives record ownership from the authenticated Supabase session, verifies the workspace and relationship under RLS, durably records the request, and publishes an approved server-signed PBOS lifecycle event. The UI exposes loading, empty, failure, retry, submitting, and delivered states without demo fallbacks.

The browser cannot select a Scholar identity, invent a relationship, or access connector credentials. The application owns the workspace, relationship, request, and UI. PBOS v1 owns connector identity, approval and lifecycle provenance. Configure `PBOS_SUPPORT_REQUEST_APPROVAL_ID` only in the protected deployment environment.

Completion requires independent typecheck, tests, accessibility and security evidence, production build, and human certification of the exact pull-request commit. A generated file or green PBOS ledger entry alone is not completion.
