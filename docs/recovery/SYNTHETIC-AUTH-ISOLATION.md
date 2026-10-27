# Synthetic authentication isolation

Purpose: enforce the recovery mission's prohibition on synthetic production accounts.
Owner: Playbook OS Engineering. Last updated: 2026-10-26.
Related: [PBOS-RCC-001](https://docs.google.com/spreadsheets/d/12ALDMBbQOPIT9lGSzT-RfqY5S_TMdtPO4Wwi00Xo0kI/edit), [PR #288](https://github.com/sgwalton87/playbook-platform/pull/288), [release process](../RELEASE_PROCESS.md).

The older main-only trusted Scholar/Athlete/Family workflow declares production targets while its tests create synthetic users. It has been skipped on this PR and was not executed during recovery. Production synthetic-account creation is prohibited even if fixtures would later be deleted.

Every acceptance administrative client now requires `PBOS_ALLOW_SYNTHETIC_AUTH_WRITE=YES` and both application/database URLs to use HTTP(S) localhost or 127.0.0.1 without embedded credentials. The guard runs before client construction; errors never include environment values. The main-only workflow independently checks the same boundary during configuration, before checkout, secret use or any account creation. Its existing production target consequently fails closed; it is not silently redirected to a different environment or counted as successful acceptance.

The isolated runner already supplies approved loopback targets and the explicit flag. Production configuration, database/RLS, OAuth and redirect URIs are unchanged. A hosted isolated target needs an independently reviewed isolation mechanism before these guards may be extended. Never relax them merely to make a main-branch job green.

Behavioral tests reject production/other remote databases, production app URLs, hostname lookalikes, missing approval/configuration, non-HTTP schemes and embedded credentials. A repository inventory checks guard placement before every acceptance administrative client. Existing role journey assertions remain in place.
