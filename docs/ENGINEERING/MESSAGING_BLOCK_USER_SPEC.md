# Messaging Block User Authority

## Status

Implementation specification for the Phase 7 backward functionality audit.

## Purpose

Close the Messaging **Block User** capability by converging the existing Messaging control on Playbook's canonical `user_blocks` Trust & Safety record.

## Canonical ownership

- `user_blocks` is the single canonical user-to-user block record.
- `pbos_conversation_participants.blocked_at` is not a user-block authority.
- `pbos_conversations` and `pbos_messages` remain canonical Messaging records.
- No Messaging-specific block table may be introduced.

## Scope

A user block is directional as a record but bilateral as a Messaging barrier: when either person has blocked the other, neither person may send a new direct/support message to the other.

Block User applies to person-to-person support and Network conversations. Group conversations remain multi-party and use Mute rather than a misleading whole-group Block User control.

## Required authority

- Authenticated users may block or unblock only as themselves.
- Self-blocking is denied.
- The target must be a current Playbook profile.
- Anonymous users have no `user_blocks` table or RPC authority.
- Authenticated clients have read-only visibility to their own canonical block records.
- Block/unblock mutation occurs only through a narrow shared Trust RPC.
- Whether another person blocked the caller is exposed only as a boolean conversation state, never as another user's block row.

## Messaging enforcement

The database shall deny new direct/support messages and staged attachments when either direction of a block exists.

The same check shall apply when:

- opening a new Network conversation;
- inserting a message;
- binding or staging attachments;
- finalizing delivery after PBOS publication;
- using legacy `can_message` compatibility authority.

Existing conversation and message history remains visible to currently authorized participants. Blocking prevents future communication; it does not erase canonical history.

## Experience

- Direct/support conversations expose **Block user** or **Unblock user** through the shared Trust service.
- The composer and attachment control are disabled when either person has blocked the other.
- The interface distinguishes `You blocked this user` from `Messaging is unavailable` without identifying private block-row metadata.
- Group conversations expose Mute but not Block User.
- Every block/unblock action provides loading, success, and error feedback.

## Backward compatibility

Existing route-specific `BLOCK` and `UNBLOCK` actions may delegate to the shared Trust RPC during rollout, but may not write `pbos_conversation_participants.blocked_at`.

Any historical direct/support `blocked_at` state shall be converged into `user_blocks` before that legacy field stops governing send authority. Group-local legacy state is not converted into a user block.

## Privacy and security

- Block records are private to the blocker.
- A blocked person receives only the minimum boolean needed to understand that Messaging is unavailable.
- Blocking does not disclose profile data, block reasons, or the time another person blocked the caller.
- Least-privilege grants and RLS are required in addition to route checks.

## Observability

Block/unblock persistence is auditable through canonical row timestamps and migration/DB certification evidence. No message body or private block metadata is copied into analytics.

## Definition of done

Block User is complete only when:

1. canonical ownership and least-privilege grants are enforced;
2. person-to-person Messaging is bilaterally blocked at the database boundary;
3. history remains available to authorized participants;
4. group Messaging does not present a false user-block control;
5. UI/API behavior uses the shared Trust service;
6. full CI, Database Certification, Vercel preview, production migration, and production verification are green.
