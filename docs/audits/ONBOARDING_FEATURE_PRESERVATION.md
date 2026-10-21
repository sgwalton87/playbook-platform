# Onboarding Feature Preservation

## 2026-10-21 availability boundary

Scholar, Scholar-Athlete, and Transition Youth onboarding now treats the
self-owned profile and PBOS activation as separate states. When the protected
PBOS runtime or role approval configuration is absent, the authenticated
governed completion RPC records onboarding completion, marks verification
pending, returns HTTP 202 with `pending-pbos-activation`, and routes the user to
their role dashboard. This path does not create a PBOS identity, publish an
event, project an exchange, or grant relationship or role authority.

The full PBOS activation path remains unchanged when all role-specific
configuration exists. Production PBOS activation is still uncertified until a
production runtime and approvals are provisioned and the authenticated journey
is exercised end to end.

## Purpose
Recover established profile-building behavior inside the canonical onboarding flow and prevent consolidation from silently removing it.

## Ownership
Playbook OS Engineering. Product requirements remain owner-supplied constitutional specifications and established product behavior.

## Last Updated
October 20, 2026 (America/Los_Angeles).

## Related evidence
- [Sport-specific onboarding introduction](https://github.com/sgwalton87/playbook-platform/commit/f79cb8f20f4c0a9d3f6d816126098a451f6100a6)
- [July 24 consolidation](https://github.com/sgwalton87/playbook-platform/commit/e4e703b6e199d14df8db1ab0cd3bffd92b7bcefa)
- [Original consolidation audit](../ONBOARDING_CANONICAL_AUDIT_2026-07-24.md)
- [Current engineering board](../MASTER_CHECKLIST.md)
- [Architecture](../ARCHITECTURE.md)

## Confirmed regression
The June 23 onboarding page contained SPORT_CONFIG with 17 sports and dedicated position/event/specialty/distance/weight-class/format/style menus. July 24 consolidation deleted app/onboarding/page.tsx and redirected the route to /start. The replacement ATHLETE_PROFILE configuration retained a generic position text field and only 14 sports. The old menus were not ported. Git history preserves the implementation; this is an identifiable feature-parity regression rather than evidence that the source disappeared.

The owner's screenshot also shows missing PBOS_API_URL during final activation and unreadable progress-pill text. This is separate from the lost menus. Current drafts save through the existing owner-scoped profile path; final role activation requires the governed server adapter. An activation failure must not relabel a confirmed saved draft as unsaved.

## Preservation inventory

| Capability | Historical evidence | Current repair / remaining gate |
|---|---|---|
| 17 sports | SPORT_CONFIG before July 24 | Original catalog recovered into lib/onboarding/sports.ts; canonical primary/secondary menus share it. |
| Sport-specific menus | Position, Event, Specialty, Distance, Weight class, Format, Style | Shared SportPositionField used by /start and profile editor. Dropdown tests cover seven distinct sport/label combinations; all known sports retain nonempty menus. |
| Custom positions / Other | Historical free-entry fallback | Existing custom values remain editable; UI sentinel is never saved as the position. |
| Switching sports | Historical explicit position reset | Explicit primary-sport changes clear incompatible position; loading saved answers does not clear them. Actual StartPage component test covers the change. |
| Existing saved athlete values | Legacy profiles.sport and profiles.position | Used as initial defaults; saved onboarding_data remains higher priority. Payload mapping retains exact strings. |
| Draft save / reload | Existing governed draft persistence | Mocked client flow proves sport + position reach profile draft and athlete prerequisites and reload correctly after failed activation. Hosted authenticated acceptance remains blocked. |
| Progress readability | Screenshot shows light text on light pills | Explicit dark pill text and readable native option colors. Production visual check remains a separate gate. |
| Height / weight, jersey, team, club and coach details | Prior athlete step | Profile editor retains these controls; canonical onboarding still combines or omits several. Full field-by-field recovery and cross-surface persistence parity remain open. |
| Username availability | Historical raw cross-user profile lookup | Not restored through a broad profile read. A bounded availability check and uniqueness/recovery acceptance remain open. |
| Profile activation | Current governed role endpoint | Missing production PBOS configuration still blocks activation. No completion flag, role authority or success screen is granted on failure. |

## Regression gate
Before changing onboarding routes or consolidating configuration, compare this inventory with the historical baseline. Require rendered dependent-menu behavior, exact save payload, reload, sport-switch and failed-activation tests. Route existence, a production build or public-page checks do not establish feature parity. Broader profile controls and authenticated production acceptance must not be marked complete based on this targeted recovery.
