# PBOS-RLS-001 Migration Recovery Plan

Date:
2026-07-27

Status:
Discovery Complete

## Finding

The remote Supabase database contains the canonical public schema.

The repository migration history does not fully represent the schema lineage required to recreate the current database state.

## Confirmed

- public.profiles exists remotely
- public.profiles is referenced by Playbook Graph
- RLS policies exist remotely
- Profile authentication relationship exists
- Existing application code depends on profiles

## Root Cause

Local migration history drift.

The repository contains downstream migrations that reference public.profiles, but the migration responsible for creating profiles is not present in the tracked migration directory.

## Recovery Principle

The remote database is treated as the source of truth.

No destructive migration changes will occur until schema provenance is documented.

## Next Actions

1. Capture remote schema dump.
2. Compare remote schema against tracked migrations.
3. Identify missing baseline migrations.
4. Create canonical migration recovery path.
5. Validate fresh local Supabase startup.
6. Validate application build.
7. Commit recovery milestone.

