# Messaging Block User Release Checklist

## Immutable gate

Block User may merge only after the exact pull-request head passes:

- CI dependency audit, lint, PBOS audit, full tests, and production build.
- Full zero-to-current Database Certification, including `messaging_block_user_preflight.sql`.
- Exact-head Vercel preview.

## Production close

After guarded merge:

1. Apply migration 100 to the canonical Playbook Supabase project.
2. Verify `user_blocks` data preservation and canonical profile foreign keys.
3. Verify anonymous user-block and participant-state grants are absent.
4. Verify authenticated `user_blocks` is SELECT-only outside narrow RPCs.
5. Verify `blocked_at` is not client-writable and historical rows were converged.
6. Verify Block User RPCs, message policy, attachment policies, and finalizer are live.
7. Verify existing conversation/message history counts are preserved.
8. Verify the exact merge deployment is READY in production.

Block User remains incomplete until every production-close check is evidenced.
