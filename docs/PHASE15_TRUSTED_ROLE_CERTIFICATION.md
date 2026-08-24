# Phase 15 Trusted Role Certification

## Purpose

This file records the production-backed certification order for the Phase 15 role journeys. A role is not green merely because its pull-request checks pass. The trusted browser journey must execute only after the exact repository revision is deployed and any required hosted Supabase migration is present in production.

## Required order

1. Diagnose from exact trusted-run evidence.
2. Repair the smallest proven defect.
3. Pass exact-head CI, Platform QA, Database Certification when applicable, and Vercel.
4. Merge the certified pull request.
5. Promote and verify any required hosted Supabase migration.
6. Run the trusted production-backed role journey against the converged application/database state.
7. Advance to the next role only after the current role is green.

## August 24, 2026 reconciliation

PR #243 repaired the `public.profiles` autosave conflict-key privilege boundary by granting authenticated users column-level `UPDATE(id)` while preserving owner-only RLS and withholding broad table UPDATE and authority-bearing columns. CI #605, Platform QA #34, Database Certification #298, and Vercel passed on exact head `4490ba8e78ed3bd807d3c5101d07c8728a6bf33a`; PR #243 merged as `8737c05329867f9ac4f8fe32ebaac622d60395f6`.

PR #244 then aligned trusted Scholar and Scholar-Athlete acceptance with the canonical onboarding dispatcher and merged as `0c8a98de3f9a9181c6d1f29c13a4e3b84ed1f707`.

The hosted migration `profile_safe_autosave_conflict_id_grant` was applied after the first merge-triggered run from PR #243 had already begun. That result is not accepted as post-migration certification evidence. Hosted inspection after migration confirms `authenticated` has `UPDATE(id)` but no broad table UPDATE, no role UPDATE, and no onboarding-completion UPDATE, with owner-only profile UPDATE/INSERT policies intact.

The next trusted run is the first eligible run combining the canonical onboarding dispatcher and the already-promoted production privilege repair. Scholar-Athlete and Family remain blocked until Scholar passes.
