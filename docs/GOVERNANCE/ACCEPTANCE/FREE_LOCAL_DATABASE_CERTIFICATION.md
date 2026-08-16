# Free Local Database Certification

## Status

Draft release-gating acceptance path.

## Decision

Playbook remains on the Supabase Free plan. Database certification for the current role-verification and support-relationship migration stack is performed in an isolated local Supabase environment rather than a paid hosted development branch.

## Production Boundary

The hosted Playbook OS project (`oexgxnybeixwadgtdtzp`) is not linked to, reset by, pushed to, or addressed by the local certification workflow.

No production credentials are required by the workflow.

## Certification Lifecycle

1. GitHub checks out the candidate branch.
2. The official Supabase CLI GitHub Action is installed.
3. `supabase start` creates an ephemeral local Supabase stack in the GitHub runner.
4. `supabase db reset --local` recreates the database from zero and replays the full repository migration chain in deterministic order.
5. `supabase migration list --local` records the locally applied migration state.
6. `relationship_authority_preflight.sql` validates the relationship, verification, revocation, RLS, and observability contracts.
7. `support_invitation_authority_preflight.sql` validates invitation creation, claim, mutation, and private privileged-function boundaries.
8. `supabase stop --no-backup` destroys the local environment.

## Fail-Closed Rules

Certification fails when:

- any migration cannot replay from zero;
- required relationship or verification objects are missing;
- required RLS is disabled or bypass policies return;
- direct authenticated mutation of protected audit or invitation state is possible;
- privileged security-definer implementations are exposed in `public`;
- relationship or invitation preflight assertions fail.

## Hosted Production Promotion

Passing this local job is necessary but not sufficient for production promotion.

Before applying migrations to the hosted Playbook OS project, PBOS must additionally preserve:

- a reviewed migration diff and deterministic ordering;
- current production schema/migration-history evidence;
- security advisor evidence;
- browser acceptance for the affected role workflows;
- explicit human approval for the production database change.

## Cost Boundary

This certification strategy does not require Supabase Branching or an additional Supabase project. It uses local containers in the GitHub Actions runner and therefore preserves the existing Supabase Free plan.
