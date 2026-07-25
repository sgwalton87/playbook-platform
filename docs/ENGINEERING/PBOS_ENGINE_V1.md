# PBOS Engine v1

PBOS Engine v1 is a deterministic, read-only interpreter for the five canonical YAML documents in `docs/PBOS`. It loads and validates those documents, resolves gate dependencies in declared order, recommends at most one sprint, and emits a standardized JSON report. It never updates canonical state or executes a recommended sprint.

## Canonical inputs

- `repository-state.yaml`
- `repository-health.yaml`
- `repository-topology.yaml`
- `engineering-gates.yaml`
- `validation-baseline.yaml`

Every document must contain the same `repository` identity. Unknown evidence is represented only by the exact `UNKNOWN` sentinel; the engine reports its path and reduces confidence rather than guessing or repairing it. Gate identifiers must be unique, and every `depends_on` value must reference a declared gate.

Each gate supplies its own goal, scope, required files, constraints, acceptance criteria, and required validations. A pending gate is eligible only when every dependency is completed. When multiple gates are eligible, declared YAML order is the deterministic tie-breaker.

## Read-only commands

```bash
npm run pbos -- status
npm run pbos -- next
npm run pbos -- report
```

`status` emits repository and gate status, `next` emits the single recommended sprint (or `null`), and `report` emits the complete execution report. Missing, malformed, or invalid canonical input causes a non-zero exit with file and field evidence.

## Current input availability

At implementation time, the repository does not contain `docs/PBOS` or its five canonical YAML inputs. The engine and fixture-based tests are complete, but repository-level commands intentionally fail closed until governance supplies those authoritative documents. PBOS Engine does not synthesize them because unknown repository facts must not be invented and this sprint must not modify existing governance.
