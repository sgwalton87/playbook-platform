# Binary Blocker Report

## Purpose
Inventory generated artifacts and binary candidates for PBOS-RESCUE-001, identify likely Codex PR blockers, and define safe actions without discarding source work.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 24, 2026

## Related Links
- [AGENTS.md](./AGENTS.md)
- [PBOS Rescue Audit](./PBOS_RESCUE_AUDIT.md)

## Summary
- The repository contains many tracked image assets used by the application and demo archive. They are binary files, but they are existing tracked repository assets and are not safe to delete as generated artifacts during rescue.
- The only tracked generated or temporary artifact found in the requested search set was `package.json.tmp`, an empty temporary file. It is safe to remove and ignore.
- No `.next/`, `dist/`, `build/`, `coverage/`, `.turbo/`, untracked `node_modules/`, `*.tsbuildinfo`, PDF, ZIP, WOFF, or TTF blockers were present outside tracked application assets at audit time.
- `canonical-athletics.patch` is a text patch backup artifact, not a binary blocker.

## Blocker Table

| Filename | Reason | Required action | Safe to remove? |
| --- | --- | --- | --- |
| `package.json.tmp` | Empty tracked temporary file; generated artifact candidate and unnecessary for build/runtime. | Remove from Git and add ignore coverage for `*.tmp` and `package.json.tmp`. | yes |
| `app/favicon.ico` | Binary icon asset tracked as application source asset. | Keep. Existing source asset, not generated rescue residue. | no |
| `public/assets/*.png` | Binary brand/deck/home assets tracked as application source assets. | Keep. Existing source assets, not generated rescue residue. | no |
| `public/brand/playbook-logo.png` | Binary brand asset tracked as application source asset. | Keep. Existing source asset, not generated rescue residue. | no |
| `public/demo/founder-archive/**/*.{jpg,jpeg,png}` | Binary demo/founder archive assets tracked as product/demo source assets. | Keep. Existing source/demo assets, not generated rescue residue. | no |
| `canonical-athletics.patch` | Text backup patch generated to preserve recovered athletics engineering context. | Keep as required backup artifact. | no |

## Files Preventing Codex PR Creation
Repository validation identified `package.json.tmp` as the only removable generated artifact in the requested scan set. If Codex still reports `Binary files are not supported` after this cleanup, the remaining binary files are repository assets rather than generated artifacts; that failure should be treated as a Codex platform limitation unless GitHub or repository validation reports a concrete repository-side blocker.
