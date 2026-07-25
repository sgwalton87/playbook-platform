# Recommended PBOS-GATE-002

## Name

**PBOS-GATE-002 — Governance, Dependency Reproducibility & Build Baseline**

## Entry criteria

1. H-001 through H-004 have authoritative answers.
2. The Git Integration Policy is approved.
3. A canonical remote may be fetched without rewriting history.
4. The approved package registry/install environment is available.

## Ordered scope

1. Configure/verify the canonical remote; fetch all branches/tags and unshallow without merging.
2. Capture host metadata, rulesets, templates, ownership, labels, projects, milestones, releases, and PR topology.
3. Perform a clean, lockfile-enforced dependency install.
4. Re-run dependency, TypeScript, build, Vitest, and Playwright discovery baselines.
5. Repair only PBOS-DEPENDENCY-001, PBOS-TS-001/002, PBOS-TEST-001, and PBOS-BUILD-001 if explicitly authorized by the new gate.
6. Update PBOS YAML atomically with command evidence and retain unresolved unknowns.

## Exit criteria

- Identity/governance fields are verified from host evidence.
- Clean install is reproducible.
- TypeScript, production build, and aggregate unit test commands exit zero.
- E2E is at least runnable/listable in the approved environment.
- No merge, force push, history rewrite, application feature change, or unrelated lint repair occurs.
