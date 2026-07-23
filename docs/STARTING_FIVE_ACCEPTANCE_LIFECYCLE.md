# Starting Five Invitation Acceptance Lifecycle

Starting Five is the learner-facing name for the canonical Support Network. Accepting an emailed invitation activates one relationship and the shared network experience; it does not create a second network.

## Required acceptance sequence

1. The invitee opens the secure token link and signs in or creates the account that matches the invited email.
2. The server verifies the bearer session, token, pending status, and exact normalized email match before changing the invitation.
3. Acceptance activates a permission-scoped `support_relationships` row tied to the invitation ID.
4. The invitee’s first Support Network inbox message is created for the scholar: “I’m here to support you—thanks for inviting me to your Playbook.”
5. An `invitation.accepted` event is recorded.
6. An unread in-app notification is created for the scholar inviting them to open the Support Network.
7. Only after all four effects persist does the invitation move from `pending` to `accepted`.
8. The supporter enters the OS assigned to the accepted relationship and can access the scholar only within granted permissions.

## Reliability and privacy rules

- Relationship, message, event, and notification use the invitation UUID as an idempotency key so a retry cannot duplicate acceptance effects.
- A unique source-invitation constraint prevents duplicate Support Network relationships.
- The invitation cannot be accepted by a session whose email differs from the invited email.
- Failed side effects leave the invitation pending so the operation can be safely retried.
- The inviter’s Notification Center fetch is authenticated and shows the persisted acceptance notification.
