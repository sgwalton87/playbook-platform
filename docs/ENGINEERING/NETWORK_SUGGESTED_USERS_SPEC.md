# Network Suggested Users — Implementation Specification

Status: Implementation-scoped
Owner: Playbook Platform / Network shared service
Phase: 5 — Network

## Purpose

Define the deterministic, privacy-preserving contract for Suggested Users before implementation.

## Canonical inputs

Suggested Users may consume only:

- The authenticated actor identity.
- The governed public Network discovery projection.
- Canonical `user_connections` relationship edges through governed Network authority.
- The governed mutual-connection count projection.

No private profile data, inferred sensitive attributes, engagement surveillance, or opaque AI ranking may be used.

## Eligibility

A member is eligible to be suggested only when all of the following are true:

1. The member is discoverable under the canonical public-profile publication boundary: `profile_visibility = public` plus active `public-profile-v1` consent.
2. The member is not the authenticated actor.
3. The member is not already connected to the actor.
4. The member has no pending incoming or outgoing connection request with the actor.
5. The member has at least one mutual connection with the actor.

## Ranking

Eligible members are ranked deterministically by:

1. Mutual connection count descending.
2. Display name ascending as a stable human-readable tie-break.
3. Member identifier ascending as a final deterministic tie-break.

The implementation must not fabricate a score or present the ordering as AI intelligence.

## Explainability

Every suggestion must expose the reason for the suggestion in plain language:

- `1 mutual connection`
- `<N> mutual connections`

No suggestion may be shown without an observable reason derived from canonical data.

## Privacy and security

- Suggested Users must never reveal the identities of third-party mutual connections.
- Suggested Users must never make a private/unpublished profile discoverable.
- Suggested Users must inherit the existing bounded Network projection and least-privilege RPC boundaries.
- Client code must not read another member's connection graph directly.

## Empty state

If no eligible suggestions exist, the UI must say so honestly and continue to expose ordinary Discover search. It must not substitute random members and call them suggestions.

## Definition of Done

Suggested Users is complete only when:

- Eligibility is enforced by governed server/database authority rather than client-only filtering of a capped snapshot.
- Ranking is deterministic and explainable.
- Public-profile publication consent is enforced.
- Pending and existing relationships are excluded.
- Only counts, not third-party identities, are exposed.
- Unit/database regression coverage passes.
- Production build and deployment are green.
