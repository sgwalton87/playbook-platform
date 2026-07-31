# Product Factory Build Package Validation 001

## Purpose

Record bounded validation evidence for task `TASK-f704c37bad1e0a97` and
milestone `PBOS-PRODUCT-FACTORY-BUILD-PACKAGE-VALIDATION-001` without changing
PBOS authority, runtime truth, approvals, or lifecycle state.

## Owner

Playbook OS Engineering.

## Last Updated

July 31, 2026.

## Related Documents

- [Engineering constitution](../../CODEX.md)
- [Product Factory compiler](../../pbos/product-factory/screen-compiler/compiler.ts)
- [Scholar Home specification](../EXPERIENCE/SCHOLAR_OS_SCREEN_COMPILER/SCHOLAR_HOME.md)
- [Master manifest](../../pbos/manifests/playbook-master-manifest.yaml)

## Assignment Boundary

- Task: `TASK-f704c37bad1e0a97`
- Milestone: `PBOS-PRODUCT-FACTORY-BUILD-PACKAGE-VALIDATION-001`
- Allowed change: this evidence file only
- Prohibited changes: `.env`, `.git`, `pbos/runtime`, and every path outside the
  allowed change
- Authority effect: none
- Approval effect: none
- Lifecycle effect: none

Unrelated pre-existing worktree changes were observed in
`docs/release-evidence/pbos-context-refresh.md` and three files under
`pbos/runtime/`. They were not modified, reverted, staged, or used as authority
by this assignment.

## Build Package Identity

The canonical `SCHOLAR-HOME` Markdown specification was transcribed in memory
into the public `ScreenSpecificationContract` shape. The transcription preserves
the declared purpose, roles, goals, hierarchy, components, data, actions,
permissions, navigation, governed read-model boundary, six required states,
responsive behavior, accessibility requirements, and brand references. No
generated package was persisted outside this evidence record.

| Field | Value |
| --- | --- |
| Screen | `SCHOLAR-HOME` |
| Source file SHA-256 | `8aceb91bce4ddb5b807aa49b2d6e2136191e642e15b77783d746b3d5abf45c97` |
| Compiler file SHA-256 | `b22285922da18bf6e7e8509bbed79332b5b5ea5467501ca31df47eab939f4d7f` |
| Contract digest | `78974bf1dc95f0eebc4a72a3dc91f0f5f50531e1164cf579ac85dc9a5b21af4f` |
| Package ID | `PRODUCT-BUILD-78974bf1dc95f0ee` |
| Package digest | `430b3637154ba61d67f08549973f04ead0018ef198fbc469eafd6e65a0bf0424` |
| Route | `/scholar` |
| Permissions | `SCOPED_SUPPORT_WITH_CONSENT`, `VIEW_SCHOLAR_HOME` |
| Implementation authority | `PBOS-PRODUCT-FACTORY` |
| Human authorization required | `true` |

The package digest is the SHA-256 digest of the compiler-defined canonical JSON
package body. A repeated in-memory derivation returned the same package ID,
source digest, ordered contents, and package digest.

## COMMAND_INVENTORY

| ID | Command | Purpose | Exit |
| --- | --- | --- | --- |
| C01 | `pwd`; Git repository identity, remote, branch, status, and latest-commit inspection | Confirm repository identity and preserve unrelated changes | `0` |
| C02 | Read `CODEX.md`, scoped instructions if present, the manifest milestone, compiler, compiler test, types, canonical screen specification, and related evidence | Establish governing and implementation context | `0` |
| C03 | `npx vitest run pbos/product-factory/screen-compiler/compiler.test.ts --pool=threads` | Exercise deterministic generation, authorization binding, and fail-closed digest/permission validation | `0` |
| C04 | Read-only Node manifest validation | Confirm milestone dependency status, required artifacts, and declared validation requirements | `0` |
| C05 | `npx tsx -e <in-memory package validation>` followed by source hashing | Attempt public-API package derivation and hash required artifacts | `1` for `tsx`; hashes completed |
| C06 | Read-only Node canonical package derivation | Independently reproduce compiler identity rules for the canonical screen transcription and verify repeatability and permission fields | `0` |
| C07 | `git diff --check` for the authorized file, related-link existence checks, `git status --short`, and authorized-file inspection | Verify document integrity, boundary, and final worktree truth | `0` |

Command C05 failed because the sandbox denied the `tsx -e` IPC pipe with
`listen EPERM`. It made no repository change. The compiler public API remained
covered by C03; C06 then reproduced the reviewed compiler transformation and
canonical hashing algorithm in a plain Node process.

## EXECUTION_TIMESTAMPS

All timestamps are UTC.

| Command | Started | Completed | Result |
| --- | --- | --- | --- |
| C03 | `2026-07-31T17:03:07Z` | `2026-07-31T17:03:16Z` | Passed: 1 file, 2 tests |
| C04 | `2026-07-31T17:03:25Z` | `2026-07-31T17:03:25Z` | Passed |
| C05 | `2026-07-31T17:03:43Z` | `2026-07-31T17:03:45Z` | Package invocation blocked by sandbox; artifact hashes completed |
| C06 | `2026-07-31T17:04:20Z` | `2026-07-31T17:04:21Z` | Passed |
| C07 | `2026-07-31T17:05:07Z` | `2026-07-31T17:05:07Z` | Passed; only the authorized file was newly added by this assignment |

## FILE_CHANGE_INVENTORY

| Path | Assignment change | Classification |
| --- | --- | --- |
| `docs/release-evidence/product-factory-build-package-validation-001.md` | Added bounded validation evidence | Authorized |

No other file is part of this assignment's change inventory. No application,
manifest, approval, authority, runtime, or lifecycle artifact was changed.

## VALIDATION_RESULTS

| Required validation | Result | Evidence |
| --- | --- | --- |
| `dependency-validation` | PASS | Manifest milestone is `READY`; dependency `PBOS-PRODUCT-FACTORY-FOUNDATION-001` is `COMPLETE`; both required artifacts exist; all three assigned validations are declared. |
| `package-identity` | PASS | Compiler tests passed; the canonical transcription produced package `PRODUCT-BUILD-78974bf1dc95f0ee` with digest `430b3637154ba61d67f08549973f04ead0018ef198fbc469eafd6e65a0bf0424`; repeated derivation was byte-equivalent. |
| `permission-boundary` | PASS | Package permissions exactly preserve sorted `VIEW_SCHOLAR_HOME` and consent-scoped support access; `human_authorization_required` is `true`; modified or permission-empty contracts fail compiler validation. |

## Authorization Decision

No human authorization decision was supplied or created by this assignment.
Implementation remains blocked pending a separately issued, package-bound human
authorization. This evidence does not promote, complete, approve, activate, or
otherwise mutate the milestone.

## Bounded Conclusion

The single-screen package is deterministically identifiable and passes the
three assigned validation checks. The result is an authorization-ready
engineering handoff, not implementation authority and not milestone lifecycle
completion.
