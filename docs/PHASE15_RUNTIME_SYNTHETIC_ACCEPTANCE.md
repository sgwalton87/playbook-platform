# Phase 15 Runtime Synthetic Acceptance

Trusted Scholar and Scholar-Athlete browser acceptance now creates one-time synthetic identities at runtime instead of requiring pre-provisioned acceptance-account secrets.

## Security boundary

The public Playbook Supabase URL and publishable key are canonical, non-secret configuration. The only privileged credential required by the trusted role runner is `SUPABASE_SERVICE_ROLE_KEY`, which remains a GitHub repository secret and is available only on trusted `main` execution.

Synthetic role credentials are generated with cryptographic randomness inside the runner and are removed with the corresponding synthetic auth user during test cleanup.

## Release intent

This removes configuration-only blockers while preserving privileged durable-data verification, anonymous-denial checks, role routing, RLS evidence, and PBOS provenance assertions.
