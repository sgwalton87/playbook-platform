# Trusted local Scholar QA

Playbook Platform Engineering maintains this exact-commit acceptance check. Updated November 20, 2026.

Dispatch **Platform QA** on the candidate branch and explicitly enable **Approve synthetic Scholar writes to the disposable localhost stack**. Public QA is independent. The trusted job requires a GitHub-hosted runner. It checks out the dispatch SHA, builds against a disposable Supabase database, checks the SHA reported by the running app, and runs the Scholar browser journey against loopback. It stages migrations in a new directory and stops the stack without a backup even after a failed browser assertion.

Supabase sends confirmation messages to the local Mailpit inbox. The job blocks external SMTP and uses only credentials returned by the local stack. The browser allows Playbook, Supabase, and the public CAPTCHA test widget. The job uploads a step ledger and, if the Scholar screen renders, a synthetic dashboard screenshot. Raw browser traces, mail contents, process logs, and credentials are excluded. The ledger links the relevant entries in the 107-capability inventory from the same workflow run.

The local profile can complete onboarding without PBOS connector authority. The ledger reports activation separately and keeps the role uncertified. A complete journey with activation requires a distinct approved isolated PBOS runtime.

Related references are [Platform QA](../../.github/workflows/platform-qa.yml), the [Scholar acceptance spec](../../tests/acceptance/trusted-local-scholar.spec.ts), and the [inventory exporter](../pbos/export-capability-certification.ts).
