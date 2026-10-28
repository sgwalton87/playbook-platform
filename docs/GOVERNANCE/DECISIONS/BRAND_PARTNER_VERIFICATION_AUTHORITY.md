# Brand Partner Verification Authority

## Status
Implementation decision for the independent Brand Partner pathway.

## Role invariant
Brand Partner remains a first-class `/brand-partner-os` experience. The existing Brand Partner workspace is preserved, but it is inaccessible until authority is proven.

## Authority model
Workspace activation requires all three:
1. approved organization identity;
2. approved campaign scope; and
3. approved compliance scope.

Organization verification alone does not permit campaign creation. Campaign scope alone does not permit NIL/athlete activity without compliance approval.

## Evidence and scope
Onboarding evidence includes organization, title/category, partnership goals, target audience, budget context, NIL/compliance acknowledgement, campaign types, and approval contact. These are requested scopes, not permissions.

## Verifier authority
Organization identity review is governed by the stored Founder/Admin role and the canonical `/api/admin/verification` reviewer functions. Self-approval is denied. Campaign and compliance scopes remain separate approvals; organization identity review does not grant either scope.

## Protected capabilities
Until all three gates are satisfied, the preserved Brand Partner workspace does not render. Campaign creation, opportunity publication, Scholar interaction, athlete-facing NIL activity, application review, and partner messaging remain unavailable from Brand Partner OS.

## Definition of done for this package
- Brand evidence persists in an owner-scoped request.
- Campaign and compliance approvals are stored separately from identity status.
- Only the authenticated Brand Partner can submit/read/update pending evidence and cannot set approval fields.
- Existing Brand Partner UI is preserved behind the specialized gate.
- All three authority gates are required before workspace rendering.

## Admin document review wiring — October 28, 2026

Owner: Playbook OS Engineering. Purpose: connect private business evidence to the governed reviewer workflow.

Stored `profiles.role` values `founder` and `admin` establish platform reviewer authority. `profile_mode` does not grant reviewer access. Platform operators have a Verification Review link in primary desktop/mobile navigation, available while viewing Profile or any dashboard, and in Founder Tools. Their Pending review tile links to `/admin` and counts the canonical `get_verification_review_queue` results, including pending and under-review role requests.

From Founder Dashboard → Open Verification Review, or Verification Review in navigation, select **Open submitted evidence** on a Brand Partner request. The API uses the guarded admin document library and lists retained private files in `brand-verification-evidence`. File links use a stable authenticated dashboard endpoint with private/no-store responses. Every open checks the current admin role; documents and links have no review-time expiration. Public organization profiles do not expose these documents.

Approval requires a document review acknowledgement and decision reason in the dashboard. The API and database independently require stored evidence before identity approval; identity approval does not approve campaign or compliance scopes. Queue and decision authorization, self-review denial, and decision audit history remain governed by the existing reviewer functions.

Hosted inspection on October 28 found one private document associated with a pending Brand Partner request and no accounts whose stored role was `admin` or `founder`. A specifically designated reviewer account must be provisioned before a real signed-in reviewer acceptance run can be completed. No roles are granted by this change. The new retention migration must be released with the matching application APIs.

Validation: behavioral API tests cover authenticated file opens, unauthenticated/non-reviewer denial, invalid document IDs, and storage download failures; dashboard tests cover opening documents, mandatory acknowledgement/reason, and missing evidence; navigation and shell tests cover trusted-role entry and queue counts.

Related: [Reviewer authority](../../../supabase/migrations/202608160031_verification_reviewer_authority.sql), [private evidence migration](../../../supabase/migrations/20261028010000_brand_verification_private_evidence.sql).


## Retention, review target, and inbox ownership — October 28, 2026

The review target is 72 elapsed hours from the current submission, including an explicit resubmission. It is a reviewer target, not an access deadline, automatic approval, deletion rule, or timer that hides evidence. Closed reviews keep their files in the admin document folder. The designated review inbox is `onboarding@playbookseriesinc.org`; `brandpartners@playbookseriesinc.org` handles relationship and campaign correspondence. Files stay in private storage, not email attachments.

Archive requires a reason and records the admin actor and timestamp. Archived documents remain readable to admins and cannot be used for a new approval. Uploaders receive only their own receipt metadata and can append evidence; they cannot open, replace, or delete retained files. The Founder/Admin role is checked for every list, open, and archive operation. A mailbox address or profile mode is never interpreted as an application admin role.

The ten-address purpose directory is visible in the Founder Command Center. Named correspondence, recommendation, family, onboarding, support, partnership, transactional, and notification mailboxes have separate documented uses. Provider mailbox provisioning and real admin-account acceptance remain release prerequisites rather than implied side effects of this directory.
