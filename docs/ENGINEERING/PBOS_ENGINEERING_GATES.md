# PBOS Engineering Gates

No gate below was executed as a repair during PBOS-GATE-001.

| Order | Gate/work package | Dependency | Deterministic exit criteria |
|---:|---|---|---|
| 1 | PBOS-GOV-001 | Human repository owner decision | Canonical remote, host/default branch, governance policy, protections, approval authority, and visibility are recorded from authoritative evidence. |
| 2 | PBOS-DEPENDENCY-001 | PBOS-GOV-001 | Clean install reproduces lockfile; `npm ls --all` has no non-optional missing/extraneous packages. |
| 3 | PBOS-ENVIRONMENT-001 | PBOS-GOV-001 | Non-secret environment schema and deployment/environment strategy are approved and validation is executable. |
| 4 | PBOS-TS-001 / PBOS-TS-002 | Dependency gate | `npx tsc --noEmit` exits 0. |
| 5 | PBOS-BUILD-001 | TypeScript gate | `npm run build` exits 0 and produces the configured production artifact. |
| 6 | PBOS-TEST-001 | Dependency gate | `npm test` exits 0 with unit/integration scope deterministic and E2E separated. |
| 7 | PBOS-LINT-001 / 002 / 003 | Passing type/test baseline | `npm run lint` exits 0 under the approved source scope. |
| 8 | PBOS-E2E-001 | Build + environment gates | Desktop/mobile Playwright and accessibility checks exit 0 in a documented environment. |
| 9 | PBOS-DOCUMENTATION-001 | Governance policy | Canonical paths are reconciled; contradictions resolved; non-mutating validation exits 0. |
| 10 | PBOS-ARCHITECTURE-001 | Documentation authority | Four canonical architecture records are approved and topology validation passes. |
| 11 | PBOS-DATABASE-001 | Environment strategy | Local migration reset/lint and authorized target drift/RLS checks pass. |
| 12 | PBOS-SECURITY-001 | Dependency + network access | Approved dependency audit, SAST, and secret scanning complete with dispositioned findings. |
| 13 | PBOS-CODE-QUALITY-001 / PBOS-DUPLICATE-001 | Stable build/test architecture | Approved dead-code, cycle, import, unused dependency/export, and duplicate checks run with reviewed findings. |

Gate ordering is dependency-driven. Severity alone does not permit skipping prerequisites.
