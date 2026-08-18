# Group Messages Authority Specification

## Purpose

Add Group Messages to the existing shared Playbook Messaging service without creating a parallel group-message datastore or changing group-management authority.

## Canonical ownership

- `groups` is the canonical group record.
- `group_members` is the canonical group-membership record.
- `pbos_conversations` remains the canonical Messaging conversation record.
- `pbos_conversation_participants` remains participant experience state such as unread, mute, and block.
- `pbos_messages` remains the canonical message record.
- `pbos_message_attachments` remains the attachment lineage record.
- The legacy `messages` table is not a Group Messages authority and shall not receive new writes.

## Dependency boundary

Group Messages consumes existing group membership. It does not create groups, invite group members, or define community membership lifecycle.

A group must already exist and the actor must already be an authorized member before Messaging may open or use its conversation.

## Conversation model

`pbos_conversations.conversation_kind` shall support `group` in addition to existing `support` and `network` contexts.

A group conversation shall:

- reference exactly one `groups.id` through `group_id`;
- have no support relationship, scholar, or Network peer lineage;
- be unique per group;
- preserve one stable conversation identifier for the lifetime of the group;
- be created only through a governed `ensure_group_conversation` authority function.

## Access authority

Current canonical `group_members` membership is required for group conversation access.

`private.pbos_user_has_active_conversation_access` shall recognize group conversations only when:

- conversation status is `ACTIVE`;
- the referenced group exists; and
- `group_members(group_id, profile_id)` contains the requesting user.

Removing group membership shall revoke message, attachment, unread-state, and group-conversation access immediately while preserving historical conversation/message rows.

## Participant state

Opening a group conversation shall ensure participant state for the requesting member only. Participant state does not create or replace canonical group membership.

Other group members become Messaging participants when they open or interact with the group conversation. Authorization always derives from `group_members`, never from stale participant rows.

## Sending

A group member may send a message only when current group membership is valid and the member is not blocked in their Messaging participant state.

Group messages shall use `scholar_id = null` and retain the immutable message-row authority established by Direct Messages:

- authenticated clients insert but do not directly update/delete message rows;
- delivery finalization uses `finalize_governed_message_delivery`;
- reporting uses `report_governed_message`;
- attachments remain private and governed by current conversation access.

## Shared inbox

The `/messages` experience shall display authorized group conversations alongside support and Network conversations.

Group conversations shall show the canonical group name and provide the existing shared capabilities:

- message history;
- send;
- unread state;
- mark read;
- mute/block participant state where semantically applicable;
- report message;
- private attachments;
- loading, success, error, and empty feedback.

Group membership management is not performed from the Messaging inbox in this feature.

## Security

- Group conversation creation is governed and idempotent.
- Anonymous access is prohibited.
- Non-members cannot open, read, send, report, or access attachments for a group conversation.
- Stale `pbos_conversation_participants` rows shall never preserve access after `group_members` removal.
- Direct table creation of group conversations remains prohibited.
- The private group-membership helper remains least privilege and is not exposed to anonymous users.

## Observability

Group sends shall publish PBOS lifecycle provenance using a Group Messaging event type and preserve canonical group/conversation/message identifiers.

## Definition of Done

Group Messages is complete when:

- group context exists in the canonical PBOS conversation model;
- one group maps to one stable conversation;
- current membership grants access and membership removal revokes access;
- shared inbox loads group conversations;
- send/report/read/attachment authority uses the existing Messaging service;
- the legacy `messages` table remains unused;
- CI, full Database Certification, exact-head Vercel, production migration, and live production verification are green.