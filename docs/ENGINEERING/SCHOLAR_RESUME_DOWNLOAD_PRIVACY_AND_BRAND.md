# SJ-02 Scholar Resume Download & Brand Policy
Status: proposed implementation in PR #286, NOT production certification. October 23, 2026.
Authority: PPS-012 Security and Permissions, PPS-013 Design Language, PPS-011 Data Governance, Scholar Record and governed sharing.

## Local download/print boundary
1. Only a signed-in, role-authorized Scholar may load their own Scholar Record through owner-filtered RLS queries. A client-side owner comparison is defense in depth, not a substitute for server RLS.
2. The résumé starts with no achievements selected. No automatically public entries, hidden personal data, address, date of birth, guardian contacts, transcript, medical/disciplinary/financial records, unselected evidence, or private uploads.
3. The Scholar explicitly selects entries to include. Clearly label *self-reported / not verified*; never infer that an uploaded certificate is verified.
4. Preview and print contain the same selected fields. The browser Print/Save as PDF is a user-controlled local export; the platform does not retain or send the file during this action. Be transparent that after local export the platform cannot revoke, update, track, or delete outside copies. Shared/public computers pose extra risk.
5. Do not persist PDF or selection on shared devices or in browser localStorage. No automatic downloads, background email, or third-party analytics of résumé content.
6. Export requires explicit user action; on-screen checklist reminds scholars to review recipients, selected entries, and sensitive details. On-device browser/system download history is outside Playbook control.
7. No external link sharing from this workspace. Employer/institution sharing requires a separate SJ-03 authorization flow with packet allowlist, purpose, expiry, revocation, audit, rate limits, guardian/age policies and dedicated RLS certification.
8. Minors may export their own private résumé only after approved age/guardian rules and applicable account authority are verified. Until server-backed age/guardian enforcement is certified, this workspace must remain pre-release.
9. Branding: visible text lockup **PLAYBOOK SERIES** / **SCHOLAR RECORD™** in header with restrained gold divider and black text, accessible contrast, print-safe monochrome fallback. This is a textual lockup, not a claim of official logo asset approval. Never include platform marks that imply verification/endorsement of unverified entries.
10. Accessible print: semantic headings, meaningful text, no decorative-only essential info, default printable page size, readable spacing, no UI controls, no private debug data. QA must compare print to selected preview and test mobile Safari.
11. Before launch: actual browser QA on new/returning and minor accounts; print-to-PDF on mobile/desktop; screen-reader and high contrast; malicious cross-user request; logged-out/role mismatch; RLS and no data leak; confirm privacy copy with founder.

## Modular walkthrough
Step 1 Review record / fill omissions → Step 2 Select accomplishments → Step 3 Review verification and privacy → Step 4 Print or save PDF → Step 5 (future) Governed share. Learner can replay walkthrough any time; no course prerequisite or blocking pop-up.
