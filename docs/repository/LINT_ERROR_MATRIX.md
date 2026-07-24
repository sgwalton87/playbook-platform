# Lint Error Matrix

## Purpose
Categorize lint and TypeScript issues discovered during PBOS-STABILIZATION-001.

## Ownership
Playbook OS Engineering

## Last Updated
July 24, 2026

## Related Links
- [Repository Baseline Status](./BASELINE_STATUS.md)
- [Stabilization Backlog](./STABILIZATION_BACKLOG.md)
- [Merge Plan](./MERGE_PLAN.md)

## Source commands
- `npx tsc --noEmit`
- `npm run lint`

## Matrix
| Category | Count | Files | Severity | Estimated effort | Evidence |
|---|---:|---|---|---|---|
| TypeScript build blockers | 0 | None in current workspace | P0 if present | N/A | `npx tsc --noEmit` exited `0`. |
| ESLint errors | 0 | None in current workspace | P0/P3 if present | N/A | `npm run lint` exited `0`. |
| ESLint warnings | 0 | None in current workspace | P3 if present | N/A | `npm run lint` emitted no warnings in current output. |
| Hook ordering/dependencies | 0 | None reported | P1/P3 if present | N/A | No React hook lint findings emitted. |
| `any`/unsafe boundary findings | 0 reported by lint/tsc | None reported | P2 if present | N/A | Existing global `LegacyValue` usage is not currently reported by the configured checks. |
| `next/image` findings | 0 | None reported | P3 if present | N/A | No `next/image` lint findings emitted. |
| Deprecated API findings | 0 | None reported | P3 if present | N/A | No deprecated API findings emitted. |

## Note on previous audit numbers
The prompt references approximately 287 lint/type errors and 79 warnings. Those counts were not reproduced in this workspace during PBOS-STABILIZATION-001. Treat the old count as historical/unverified until reproduced on the target integration branch with the same toolchain and environment.
