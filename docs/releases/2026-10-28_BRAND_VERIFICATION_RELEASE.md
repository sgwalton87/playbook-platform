# Brand Partner Verification and Communication Release

Purpose: retain private evidence, support clear human review, communicate decisions and enable verified role access.
Owner: Playbook OS Engineering / Founder. Last updated: October 28, 2026.
Related: [PR 292](https://github.com/sgwalton87/playbook-platform/pull/292), [Database handbook](../DATABASE.md), [Release process](../RELEASE_PROCESS.md).

## Resulting workflow

Applicants submit their organization identity, establishment jurisdiction/structure, contact, evidence, safeguarding declarations and scope acknowledgement. Relevant convictions, pending charges and restrictions are asked separately, with “Discuss privately” and legally protected-record exclusions. A charge is not a conviction. No criminal-history inference is made by AI and no declaration alone automatically declines an applicant.

Admins open retained documents, compare official registration or alternative establishment evidence, resolve safeguarding privately, and explicitly approve document/campaign/compliance scope. Approval activates the existing Brand Partner authority flags; it never changes the person's role to admin or bypasses Scholar ownership, relationship, publication or consent rules.

Reviewers select one of ten additional-information reasons, or a decline reason, preview the applicant message, add a specific explanation and separate private notes, then save and send. The outcome and durable communication row are committed together. The return button requires normal sign-in. The 72-hour target never expires stored evidence or automatically approves access.

A sender lease prevents concurrent duplicate sends; repeated action IDs replay the same committed communication. SMTP acceptance is logged separately from verified inbox delivery. Known failures can be retried by admins; uncertain acceptance is not blindly retried. Notes and communication history remain available after review closes. No existing constituent is approved and no live email is sent as a deployment test.

## Community introduction and consent

Four progressive modules explain vetting, future Scholar/Scholar-Athlete/family/institution connections, review steps and the ongoing community standard. Before document upload the applicant explicitly acknowledges `playbook-safety-v2-20261028`; the server records an append-only timestamp and the upload policy and approval trigger enforce it. The shared all-role onboarding agreement and terms also explain suspension, removal and tool-access revocation for harmful conduct. Existing approved partners are not silently re-decided. This notice reserves enforcement rights; it does not introduce a new universal account-ban service.

Reviewer determinations bind to the exact registration timestamp reviewed; applicant edits serialize with approval and invalidate earlier eligibility. The isolated Brand Partner journey completes all modules, declarations and acknowledgement before submission.

## Official registry and AI assistance

California's documented CALICO public search API uses `CA_SOS_API_KEY` and fixed official endpoints. The state directory derives from NASS corporate-registration links. Optional Vercel AI Gateway research uses official-domain search, a bounded two-step call and public business name/jurisdiction/entity number only. The UI presents official links, candidate facts, a timestamp and human-review requirement. No usable source, missing credentials, provider errors, no search match or an inaccessible registry never becomes an adverse finding.

Official API onboarding/key: https://calicodev.sos.ca.gov/content/California%20SOS%20BE%20Public%20Search%20API%20Guide%20v1.0.4.pdf
Registry scope and alternative California records: https://www.sos.ca.gov/business-programs/business-entities/information-requests
State directory: https://www.nass.org/business-services/corporate-registration
Provider search integration: https://vercel.com/blog/use-perplexity-web-search-with-vercel-ai-gateway

Sole proprietors and DBAs may have city/county records rather than a Secretary of State entity record. A legal name match alone does not verify representative authority, safeguarding or permitted scope. Consumer/background-report procurement, adverse-action procedures and regulated screening integrations require a separately defined lawful workflow; this release does not purchase or run criminal background reports.

## Coordinated release sequence

1. Verify the exact branch revision: CI, full migration replay, role recovery, marketplace certification, build, lint, security audit and targeted workflow/RLS tests.
2. Merge the verified revision to main. Preserve the current production deployment as rollback baseline.
3. Apply the expand/retain migration `20261028184949_brand_verification_admin_archive` and communication migration `20261028191001_brand_review_communications`. These preserve legacy owner upload-list access during the app build. Existing approval history and stored files remain unchanged.
4. Deploy the exact main commit to production. Verify READY, actual commit and aliases, and unauthenticated API denial.
5. Apply `20261028192445_brand_document_admin_read_cutover` to remove owner content SELECT and enforce admin-only file reads after the matching receipt API is live. Verify policies, private bucket, functions, archival triggers and zero unexpected communications/role grants.
6. Update PBOS-RCC-001 in place with commit, migration versions, tests, deployment, limitations and remaining live reviewer acceptance.

The current hosted project has no registered Founder/Admin reviewer account, and onboarding@ is not registered as a platform user. Mailbox designation never grants application privileges. Production SMTP variable names are configured; actual sending/receipt and signed-in reviewer acceptance are distinct from local mocked transport tests. AI Gateway runtime/credit availability and the CA API subscription must be verified before claiming live automated registry acceptance.

Rollback: use a forward fix or a compatible retained-document application build after cutover. Reverting to the old owner-storage-list client requires a deliberate policy rollback; do not drop retained objects, notes, outbox rows or audit events. The latest deployment alone is not whole-platform launch certification.
