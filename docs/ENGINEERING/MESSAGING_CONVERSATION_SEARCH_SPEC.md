# Messaging Conversation Search Specification

## Purpose

Provide a single search experience across the authenticated user's currently authorized Playbook Messaging conversations without creating a second message store, search index, or broader visibility surface.

## Canonical ownership

- `pbos_conversations` remains the canonical conversation record.
- `pbos_messages` remains the canonical message record.
- Support relationship, Network connection, and group membership remain the authorities that determine whether a conversation is readable.
- Search is a derived experience over already-authorized records and never becomes a canonical data source.

## Requirements

1. Search shall operate only on conversations currently readable by the authenticated user.
2. Search shall include support, Network, and group conversation labels plus message body text already loaded through governed APIs.
3. Search shall not query or expose profiles, groups, relationships, or messages outside the user's current Messaging authority.
4. Existing Network conversations shall be listable without requiring a `?peer=` deep link so search covers the complete authorized inbox.
5. Search shall be case-insensitive and trim surrounding whitespace.
6. Empty search shall show the full authorized conversation list.
7. Search results shall preserve the existing conversation object; search creates no duplicate records.
8. Revoked Network connections, support relationships, or group memberships shall disappear because the underlying APIs/RLS fail closed.
9. The UI shall provide an accessible labeled search field and an explicit no-results state.

## Security

- No anonymous Messaging search.
- No SECURITY DEFINER search surface is required.
- Network listing continues through the existing authenticated API and RLS-backed `loadConversation` path.
- Message content remains visible only through existing Messaging RLS.

## Observability

Search errors reuse the inbox's governed error/status channel. No message body text is emitted to analytics or logs by this feature.

## Definition of Done

- All currently authorized support, Network, and group conversations participate in search.
- Label and message-body matching works case-insensitively.
- Revoked contexts remain unavailable.
- Empty and no-result states are explicit.
- CI, database certification, production build, and exact-head Vercel preview pass before merge.