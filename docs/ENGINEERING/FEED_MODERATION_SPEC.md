# Feed Moderation Specification

## Purpose

Close Phase 6 Feed Moderation by integrating Feed reporting and publication enforcement with Playbook's existing shared Trust & Safety service.

## Canonical ownership

- `moderation_reports` remains the canonical case record.
- `moderation_actions` remains the append-only moderation decision audit trail.
- `feed_posts` remains the canonical story record and stores only the current enforcement state required for deterministic Feed reads.
- No duplicate moderation table or role-specific moderation service may be introduced.

## User reporting

Authenticated users may report a public Feed story through the existing `/api/trust/report` service using `target_type = 'post'`.

The report service must verify that the target story exists and is currently visible before accepting a report. Reports require a reason and may include optional detail. The reporting workflow must provide loading, success, and error feedback.

## Moderator authority

Only authenticated Platform Founder/Admin moderators may hide or restore Feed stories.

Moderator review shall not widen general Feed RLS. Hidden-target enforcement state is available only through a narrow moderator-authorized projection function. The existing private moderator-authority helper remains non-executable by API roles and is evaluated only inside governed SECURITY DEFINER functions.

Moderator enforcement must be atomic:

1. Validate moderator authority.
2. Validate the target Feed post.
3. Validate an optional report belongs to that same post.
4. Update the Feed post's current moderation state.
5. Append the corresponding `moderation_actions` audit record.
6. If a report is supplied, mark it resolved and bind reviewer/time metadata to the moderator.

Supported Feed publication actions are:

- `hide_content`
- `restore_content`

Dismiss/review case-management actions remain available through the existing moderation queue. Resolved reports for currently hidden Feed posts remain available in the queue so an authorized moderator can restore the story; once restored, that resolved case leaves the active queue.

## Visibility contract

- Public/anonymous Feed reads shall never return a post whose moderation state is `hidden`.
- Authenticated non-owners shall never receive hidden public posts.
- The post owner may continue to see their own hidden post through the existing owner policy for transparency.
- Moderators do not receive blanket Feed RLS access to hidden posts; the moderation queue receives only the target IDs/current enforcement state required for review through the governed projection.
- Hidden stories shall not be available through the public story permalink.
- Restored stories become publicly readable again only if their normal Feed visibility is `public`.

## Security

- Direct authenticated `UPDATE` on Feed moderation fields remains unavailable.
- Enforcement occurs through a narrow SECURITY DEFINER function with a fixed search path and the existing private moderator-authority helper.
- Moderator target-state review occurs through a separate narrow SECURITY DEFINER projection with the same internal authority check.
- The private moderator-authority helper remains non-executable by `anon` and `authenticated`.
- Anonymous callers may not execute Feed moderation functions.
- Existing Create/Edit/Delete, media, comments, likes, shares, identity, and pagination boundaries remain unchanged.

## Experience

- Report actions use clear, neutral language and do not expose reporter identity to story authors.
- The moderation queue distinguishes hide/restore from case-only resolve/dismiss actions.
- Moderation actions provide success/error feedback.
- Authors retain access to their own hidden stories and see a moderation-state label rather than silent disappearance.

## Observability

Each hide/restore decision is represented by an append-only `moderation_actions` record containing moderator identity, target, action type, note, and timestamp. This is the canonical audit evidence for Feed enforcement.

## Definition of Done

Feed Moderation is complete when reporting, moderator hide/restore, public-read enforcement, owner transparency, narrow moderator review projection, audit logging, regression tests, Database Certification, CI, exact-head Vercel, production migration, and live production verification are green.