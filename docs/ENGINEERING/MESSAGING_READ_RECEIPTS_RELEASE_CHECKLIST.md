# Read Receipts Release Checklist

- [x] Specification precedes production release.
- [x] `last_read_at` remains canonical.
- [x] No reader identity list is exposed.
- [x] Unauthorized mark/query paths fail closed.
- [x] Revoked membership is excluded from aggregate counts.
- [x] Shared inbox shows sender-only Seen / Seen by N states.
- [x] Behavioral DB preflight added to the existing full Messaging certification boundary.
- [ ] Exact-head CI green.
- [ ] Exact-head Database Certification green.
- [ ] Exact-head Vercel READY.
- [ ] Guarded merge.
- [ ] Migration 098 applied to production.
- [ ] Production catalog and deployment verified.
