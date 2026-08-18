# Messaging Read Receipts Certification Note

Read Receipts is certified as a derived shared Messaging capability.

- Canonical state: `pbos_conversation_participants.last_read_at`.
- No duplicate receipt table.
- Aggregate receipt projection only; reader identities remain private.
- Mark-read is an explicit authenticated user action.
- Current support, Network, and group authority is re-evaluated before receipt state is accepted or counted.
- The dedicated behavioral preflight is invoked by the existing full Messaging revocation/attachment certification step so inherited authority remains part of the same release gate.
