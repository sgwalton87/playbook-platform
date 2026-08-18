# Messaging Report User Specification

## Purpose

Define the governed Playbook workflow for reporting another user from the shared Messaging experience without creating a Messaging-specific moderation store or exposing conversation history beyond authorized Trust & Safety review.

## Ownership

Playbook Platform Trust & Safety and Messaging.

## Last Updated

August 18, 2026.

## Related Documents

- `AGENTS.md`
- `CODEX.md`
- `docs/ENGINEERING/MESSAGING_BLOCK_USER_SPEC.md`
- `docs/ENGINEERING/FEED_MODERATION_SPEC.md`
- `PPS-002` Platform Principles
- `PPS-003` Experience Principles
- `PPS-011` Data Governance
- `PPS-012` Security and Permissions
- `PPS-014` Analytics and Observability

## Current Truth

Playbook already owns community reports in `moderation_reports` and moderator decisions in `moderation_actions`. Messaging already owns conversations and message evidence in `pbos_conversations` and `pbos_messages`.

The existing per-message `Report message` action marks a message as reported but does not provide the Phase 7 `Report User` case workflow. A user-report implementation must therefore extend the shared Trust & Safety service rather than introduce a second report table or duplicate message content.

## Canonical Ownership

- `profiles` remains canonical user identity.
- `pbos_conversations` remains canonical conversation identity and context.
- `pbos_messages` remains canonical message content and evidence.
- `moderation_reports` remains the canonical report case.
- `moderation_actions` remains the canonical human-review audit trail.
- No message body is copied into a report record.

## Functional Scope

### One-to-One Conversations

A currently authorized support or Network participant may report only the other canonical participant in that conversation.

The report may optionally reference a message sent by the reported user. The referenced message must belong to the same conversation.

A user block must not prevent a participant from submitting a safety report while the conversation history remains authorized.

### Group Conversations

A group conversation does not have one canonical peer. Reporting a group member therefore requires a source message in the current group conversation, and the reported user must be that message's sender.

A user may not report their own message or their own profile.

### Report Reasons

The shared workflow supports these controlled reasons:

- Harassment or bullying
- Spam or scam
- Impersonation
- Threats or unsafe behavior
- Other

Optional detail is limited to 2,000 characters.

## Data Lineage

`moderation_reports` gains nullable `source_conversation_id` and `source_message_id` references. These fields preserve evidence lineage without duplicating message text.

Profile reports created through Messaging must be inserted only through the governed report authority. Direct authenticated profile-report insertion is denied so callers cannot forge conversation lineage or report unrelated user IDs.

Existing non-profile report creation remains available under its existing owner policy.

## Authorization

The database shall independently enforce:

- authenticated reporter identity;
- current access to the source conversation;
- different reporter and target identities;
- target profile existence;
- direct-peer identity for support and Network reports;
- source-message sender identity when a message is supplied;
- mandatory source-message identity for group reports;
- maximum reason and detail lengths;
- moderator-only access to private report evidence context.

Anonymous access is denied. Normal authenticated users may not delete moderation cases or update system review state.

## Shared API

`POST /api/trust/report` remains the shared report entrypoint.

For `targetType: "profile"`, the request must include:

- `targetId`
- `conversationId`
- `reason`
- optional `detail`
- optional `sourceMessageId`

The route delegates profile reports to the governed database RPC. Other existing report types retain their current shared flow.

## Messaging Experience

The shared inbox shall:

- expose `Report user` for the canonical peer in support and Network conversations;
- expose `Report user` on another member's message in group conversations;
- keep `Report message` distinct from `Report user`;
- use an inline, accessible report form rather than browser prompts;
- explain that reporting is reviewed by Playbook Trust & Safety;
- provide loading, success, cancellation, and error feedback;
- never expose a report control for the current user's own message.

Reporting and blocking remain separate actions. Submitting a report does not automatically block a user or make a moderation decision.

## Human Review

Founder/Admin moderators may inspect a privacy-bounded profile report projection containing:

- reported profile identity;
- conversation kind;
- source message identity, body, sender, and timestamp when provided.

The projection is moderator-only and does not widen normal conversation or participant visibility. Existing Review, Resolve, and Dismiss actions remain human decisions.

## Observability

The durable report case and moderation action history are the release evidence for this capability. No message content shall be copied into analytics, notification payloads, or duplicate report stores.

## Non-Goals

This capability does not:

- automatically suspend or restrict a reported user;
- infer guilt from report volume;
- expose reporter identity to the reported user;
- replace the existing per-message report state;
- add user blocking automatically;
- create a new Trust & Safety service.

## Definition of Done

Report User is complete when:

- support, Network, and group report authority is behaviorally certified;
- arbitrary, unrelated, self, and forged-context reports fail closed;
- evidence lineage is preserved without content duplication;
- moderator context is available only through the governed moderator projection;
- shared inbox and moderation queue present clear, accessible states;
- CI, full Database Certification, and exact-head Vercel pass;
- the migration is applied and verified in production without changing existing report, conversation, or message rows.
