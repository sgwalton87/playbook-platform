# Messaging Meeting Links — MVP Specification

## Purpose

Close Phase 7 Messaging capability 9/9 by allowing an authorized Playbook user to share an external HTTPS meeting URL inside an existing governed conversation.

## Canonical ownership

- `pbos_messages` remains the canonical persisted Messaging record.
- Existing support, Network, and group conversation authorities remain unchanged.
- Community Events remains the owner of scheduled-event metadata, including `virtual_url`.
- Meeting Links does not create a parallel calendar, meeting, event, conferencing, or scheduling datastore.

## Functional behavior

An authenticated user may:

1. Open `/messages/meeting-links` from the canonical Messages experience.
2. Select one currently authorized support, Network, or group conversation.
3. Enter a human-readable link label.
4. Enter an HTTPS meeting URL.
5. Share the meeting URL through the existing canonical Messaging send endpoint for that conversation type.
6. Return to `/messages` and see the link as normal governed message content.

## Security and permissions

- Only conversations returned through existing governed Messaging APIs may be selected.
- The Meeting Links workflow does not bypass support relationship, Network connection, group membership, block, or Messaging RLS/authority rules.
- Only HTTPS URLs are accepted by the Meeting Links UI.
- Credentials embedded in URLs are rejected.
- No service-role credential is exposed to the browser.
- Existing PBOS provenance, notification, read-receipt, and moderation behavior applies because delivery uses the existing Messaging endpoints.

## Shared Services First

This capability intentionally composes existing services:

- Messaging owns conversation delivery.
- Events owns scheduled-event metadata.
- External conferencing providers own the meeting room itself.

No provider-specific Zoom, Google Meet, or Microsoft Teams database is introduced for the MVP.

## Accessibility and feedback

The workflow provides:

- Semantic labels for conversation, link label, and URL fields.
- Loading state.
- Success state.
- Error state using `role="alert"`.
- Disabled state while sharing.
- Keyboard-operable native controls.

## Definition of Done

- Meeting Links is discoverable from `/messages`.
- Authorized support, Network, and group conversations are selectable.
- HTTPS meeting links send through the existing Messaging APIs.
- Invalid/non-HTTPS URLs fail before send.
- No new duplicate meeting/calendar datastore exists.
- TypeScript, unit tests, production build, and deployment checks pass.
