# SJ-07 Open, Confidential and Post-Deadline View-Only Acceptance Contract
Status: RELEASE BLOCKED — the proposed post-deadline unseal feature is NOT implemented or certified.

## Independent tests required
### Open letter
Authenticated invited recommender submits letter with explicit open selection; atomically commit immutable digest and vault metadata; owner can read exactly that letter and attach its request reference to their own application workspace. Another scholar, unverified invited email, and unrelated recipient must receive no content. Duplicate submit must fail.

### Confidential letter
Authenticated invited recommender submits a confidential letter; owner sees only metadata, status, and the branded gold Playbook seal. Owner and every other unauthorized account must be denied any content from the read-open API, generic Vault query, packet exports, public portfolio, and app context. Only the exact authorized recipient transfer may retrieve confidential content after a separately approved recipient delivery flow. Never label a request reference as successfully delivered.

### Post-deadline unsealing — not yet authorized
The deadline must be a server-verified, immutable, opportunity-specific timestamp with timezone, not a mutable browser clock or Scholar-supplied 'deadline passed' flag. The recommender must separately consent to optional post-deadline Scholar viewing; absent that consent, the letter remains sealed indefinitely, including when an institution requires strict confidentiality. No blanket override of admissions confidentiality waivers. Upon eligibility and Scholar affirmative unseal action, serve a short-lived authenticated, owner-bound render-only response through a separate RPC/endpoint; NEVER change the original artifact's confidentiality value or grant Scholar read-open permissions. Render with a prominently repeated 'VIEW ONLY · UNSEALED AFTER DEADLINE · NOT FOR REDISTRIBUTION' watermark plus the viewer identifier and view timestamp. No download, export, print, email, copy, share, cache, or browser prefetch controls. Every view and denied action must have an audit event.

**Security limitation:** Screen captures, photographing a screen, and client-side content copying cannot be absolutely prevented after revealing text in a browser. Watermarks and restricted controls deter leakage but are not a technical guarantee of non-retransmission. Final founder/legal/privacy approval required before this feature can ship.

### Technical certification
Run real isolated database migration + RLS with synthetic users for both paths, including stale/expired links, minor role policy, denied cross-user submissions, request cancellation, unauthorized ref attachment, repeated letter and status forgery. Test authenticated browser UI, Safari mobile, screen readers, print, public URL access, and a real sender-authorized SMTP end-to-end message. Record exact HEAD SHA and CI, DB, isolated QA, Platform QA results in Command Center. Keep production untouched until all green.
