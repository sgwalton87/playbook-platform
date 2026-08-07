# Governed Opportunity Journey

The CIP-048 opportunity journey replaces demo courses and browser-only state with authenticated Scholar evidence, explainable deterministic matches, owner-scoped Supabase persistence, and signed PBOS lifecycle events.

The browser never submits an owner ID. The route derives ownership from the authenticated Supabase session. Discovery stores only matches with concrete reasons. Save and dismiss use a staged durable decision; the final state becomes delivered only after PBOS accepts the signed event. PBOS rejection leaves a visible pending record for governed recovery instead of claiming success.

Required server-only configuration: `PBOS_API_URL`, `PBOS_ORGANIZATION_ID`, `PBOS_CONNECTOR_ID`, `PBOS_CONNECTOR_KEY_ID`, `PBOS_CONNECTOR_SECRET_BASE64`, and `PBOS_OPPORTUNITY_JOURNEY_APPROVAL_ID`.

Completion requires independent typecheck, tests, lint, production build, owner-isolation tests, keyboard and screen-reader review, responsive viewports, and human certification of the exact pull-request revision.
