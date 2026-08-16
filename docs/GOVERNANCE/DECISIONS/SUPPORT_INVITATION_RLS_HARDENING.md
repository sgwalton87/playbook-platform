# Support Invitation RLS Hardening

## Purpose

Close two legacy authorization paths on `support_invitations` that predate the governed role-verification architecture.

## Root causes

### Unconstrained Scholar invitation creation

The earlier Scholar-owner INSERT policy proved only that `scholar_id = auth.uid()` and that the caller had a self-owned Scholar Record role.

It did not constrain:

- relationship identity;
- permission payload;
- OS destination;
- initial status;
- acceptance/decline timestamps.

A direct Data API client could therefore originate an invitation whose authority payload did not match the canonical relationship contract.

### Direct invitee mutation

The original `Invitees can update their invitation status` policy authorized UPDATE whenever the authenticated JWT email matched `invitee_email`.

Because an RLS UPDATE policy cannot by itself restrict the client to one mutable column, the invitee could directly rewrite authority-bearing invitation fields outside the atomic claim workflow.

## Governing rule

A Scholar may originate an invitation, but the invitation must be structurally canonical.

Only the following exact relationships may be created:

- Parent / Guardian
- Mentor
- Coach
- Educator
- High School Counselor
- District Administrator
- College Recruiter
- College Admissions
- Community Partner
- Employer Partner

Parent/Guardian and Mentor carry only their governed least-privilege permission arrays. Every other relationship begins with `permissions=[]`.

The destination must exactly match the relationship's Operating System.

## Mutation boundary

Authenticated Data API clients receive SELECT and governed INSERT access only.

They receive no direct UPDATE or DELETE capability on `support_invitations`.

Acceptance and decline remain atomic through the public `claim_support_invitation` RPC.

## Privileged implementation

The mature claim implementation from the preceding migration is moved into the non-exposed `private` schema and converted to `SECURITY DEFINER`.

The public RPC remains a `SECURITY INVOKER` wrapper. The private implementation retains the explicit checks already built into the governed claim lifecycle:

- authenticated identity;
- exact invitee email;
- pending invitation state;
- supported relationship type;
- role/onboarding verification;
- Coach verification;
- Mentor validation lifecycle;
- zero-data permission requirements for external roles.

The private schema is not exposed through the Data API.

## Read boundary

Scholar-owner and invitee-email SELECT policies are consolidated into one participant policy using cached `(select auth.uid())` / `(select auth.jwt())` evaluation.

## Certification

`supabase/tests/support_invitation_authority_preflight.sql` verifies:

- governed INSERT policy exists;
- legacy broad policies are absent;
- direct authenticated UPDATE/DELETE is unavailable;
- participant SELECT policy exists;
- public claim wrapper remains invoker-mode;
- private claim implementation exists and is definer-mode;
- the preflight persists no data.

## Constitutional alignment

This decision enforces explicit authorization, least privilege, correct OS routing, canonical permission ownership, privacy by design, and auditable atomic relationship activation.
