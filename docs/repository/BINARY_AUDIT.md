# Binary Audit

## Purpose
Determine why repository tooling reports `Binary files are not supported` and classify tracked binary assets for recovery.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 24, 2026

## Related Links
- [Repository Recovery Audit](./REPOSITORY_RECOVERY_AUDIT.md)
- [Repository Canon](../REPOSITORY_CANON.md)
- [Engineering Dashboard](../../ENGINEERING_DASHBOARD.md)

## Finding
The binary warning is caused by tracked image/icon/media assets that cannot be rendered by text-only review tooling. No tracked build artifact directory was found.

## Tracked Build Artifact Scan
| Pattern | Result | Classification |
| --- | --- | --- |
| `.next/` | Not tracked | IGNORE |
| `build/` | Not tracked | IGNORE |
| `dist/` | Not tracked | IGNORE |
| `coverage/` | Not tracked | IGNORE |
| `.turbo/` | Not tracked | IGNORE |
| `.cache/` | Not tracked | IGNORE |
| `out/` | Not tracked | IGNORE |
| `node_modules/` | Not tracked | IGNORE |

## Binary Asset Classification
| Path family | Examples | Decision | Rationale |
| --- | --- | --- | --- |
| `app/favicon.ico` | App icon | KEEP | Legitimate browser asset. |
| `public/assets/*.png` | Deck, logo, brand, home images | KEEP / HUMAN REVIEW REQUIRED for size optimization | Legitimate application assets, but several are multi-megabyte files and should be reviewed for compression or CDN migration. |
| `public/brand/*.png` | Brand logo | KEEP | Legitimate brand asset. |
| `public/demo/founder-archive/*.jpg`, `*.jpeg`, `*.png` | Founder archive images and contact sheets | HUMAN REVIEW REQUIRED | Legitimate demo/archive media, but numerous generated variants may belong in external storage or an archive package. |
| `*.zip` | None currently tracked by scan | REMOVE FROM VERSION CONTROL if introduced | Archives should not be committed unless explicitly approved. |
| `public/assets/playbook-promo.mp4` | Ignored media path | IGNORE | Large video assets should remain ignored or move to external hosting. |

## Largest Tracked Binary Objects Observed
- `public/assets/pb-logo-framed.png` (~3.0 MB)
- `public/assets/playbook-lockup.png` (~2.5 MB)
- `public/brand/playbook-logo.png` (~2.5 MB)
- `public/assets/playbook-logo-new.png` (~2.5 MB)
- `public/assets/deck-04.png` (~2.3 MB)

## Action Taken
- No legitimate application assets were removed.
- `.gitignore` was corrected so `*.zip` and `public/assets/playbook-promo.mp4` are separate ignore rules.

## Recovery Policy
- KEEP source-controlled brand/application images that are required at runtime.
- REMOVE FROM VERSION CONTROL generated build outputs, caches, archives, and local exports.
- REGENERATE screenshots and generated reports only when source scripts exist.
- IGNORE local build artifacts and large video exports.
- HUMAN REVIEW REQUIRED for founder archive variants and multi-megabyte images before any deletion or migration.
