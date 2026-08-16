# Support Relationship RLS Hardening

## Purpose

Remove the legacy `support_relationships` authorization path that allowed a Scholar owner to insert arbitrary relationship rows based only on `scholar_id` ownership.

## Root cause

The original support-relationship migration created an INSERT policy named `Scholars can create support relationships` with only one authorization condition: `auth.uid() = scholar_id`.

That policy predates the later consent and verification architecture. Once Family, Mentor, Coach, Educator, Counselor, District, Recruiting, Admissions, Community Partner, and Employer activation became invitation/verification-bound, the broad Scholar policy became an authorization bypass.

A direct authenticated Data API request could otherwise create relationship rows without satisfying the newer invitation and verification policies.

## Canonical rule

A support relationship is created only through a governed activation contract.

Valid activation policies are:

- invited Parent/Guardian;
- validated Mentor;
- verified Coach;
- verified exact-role zero-data supporter.

No generic Scholar-owner INSERT policy is permitted.

## Read-policy convergence

The separate Scholar and supporter SELECT policies are replaced by one participant policy:

- Scholar owner may read;
- connected supporter may read.

The policy uses `(select auth.uid())` to avoid per-row re-evaluation and removes the multiple-permissive-policy overlap reported by the Supabase advisor.

## Data API boundary

`authenticated` retains table-level `SELECT` and `INSERT` grants. RLS determines which rows are legal.

Removing the broad policy therefore does not disable legitimate invitation claim flows; it removes only the ungoverned direct-insert path.

## Verification evidence

Repository search found no application path directly inserting `support_relationships` as a Scholar owner. Legitimate relationship creation occurs through the governed claim/finalization flows.

## Certification

The relationship authority preflight fails if:

- the legacy Scholar INSERT policy exists;
- the consolidated participant SELECT policy is missing; or
- any of the four specialized activation policies is missing.

## Constitutional alignment

This decision enforces least privilege, explicit authorization, privacy by design, single-source-of-truth relationship state, and security by default.
