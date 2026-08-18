# Messaging Read Receipts Specification

## Purpose

Provide privacy-preserving read receipts across support, Network, and group Messaging using the existing canonical participant `last_read_at` state rather than introducing a duplicate receipt datastore.

## Canonical ownership

- `pbos_conversation_participants.last_read_at` remains the canonical read-position state for each participant.
- `pbos_messages.created_at` remains the canonical message ordering timestamp.
- Read receipts are a derived projection and do not create a second canonical read-state table.

## Requirements

1. Only a currently authorized conversation participant may mark a conversation read.
2. Marking read shall create the caller's participant state when current Messaging authority exists but no participant row has yet been materialized.
3. The caller may update only their own read position.
4. Receipt projection shall be available only to a caller with current conversation authority.
5. Receipt projection shall return aggregate reader counts per message and shall not expose reader identities.
6. A participant counts as a reader only when their canonical `last_read_at` is at or after the message creation time and they still belong to the current conversation context.
7. Support readers shall be validated against the active support relationship, including email-linked supporters.
8. Network readers shall remain members of the active connected pair.
9. Group readers shall remain current canonical `group_members` members.
10. The inbox shall show receipt state only on messages sent by the current user: `Seen` for one reader and `Seen by N` for multiple readers. Unread sent messages continue to show their delivery state.
11. The existing explicit `Mark read` action remains the user-controlled receipt action; opening a default-selected conversation alone does not silently create a receipt.

## Security and privacy

- Participant-table SELECT remains self-only; no RLS widening is permitted.
- Public receipt functions are authenticated-only SECURITY DEFINER functions with fixed search paths.
- Reader identities are never returned.
- Revoked support relationships, Network connections, or group memberships immediately remove receipt authority and are excluded from aggregate counts.

## Observability

Read actions reuse the existing Messaging status/error feedback. Receipt analytics shall not contain message body content or reader identity lists.

## Definition of Done

- Mark-read works for authorized support, Network, and group conversations even when the caller's participant row is not yet materialized.
- Unauthorized callers cannot mark or query receipts.
- Receipt counts derive from current canonical participant/context state.
- Sender-only Seen/Seen-by-N presentation is wired in the shared inbox.
- Direct Messages, Group Messages, Conversation Search, Attachments, and downstream certification remain green.
- CI, Database Certification, production build, and exact-head Vercel preview pass before merge.