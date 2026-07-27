# PBOS-ENGINE-005: Architecture Lifecycle Diagram

## Complete Pipeline Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                      PBOS-ENGINE-005 EXECUTION PIPELINE                │
│                    "Governed Codex Execution Pipeline"                 │
└────────────────────────────────────────────────────────────────────────┘

STAGE 1: GATE DEFINITION
═══════════════════════════════════════════════════════════════════════════
  
  ┌─────────────────────────────────────────┐
  │   PBOS-ENGINE-005.json (Gate Definition)│
  │  ┌──────────────────────────────────┐   │
  │  │ id: "PBOS-ENGINE-005"            │   │
  │  │ title: "Create Governed Codex... │   │
  │  │ status: "in_progress"            │   │
  │  │ priority: 95                     │   │
  │  │ dependencies: [PBOS-AUDIT-001]   │   │
  │  │ validation: [docs, pbos:test]    │   │
  │  └──────────────────────────────────┘   │
  └─────────────────────────────────────────┘
           ↓
  INPUT: Gate configuration from planning engine


STAGE 2: EXECUTION CONTRACT GENERATION (Layer 3)
═══════════════════════════════════════════════════════════════════════════

  ┌──────────────────────────────────────────────┐
  │  generateExecutionContract(gateDefinition)   │
  │  • Extract contract terms from gate          │
  │  • Assign version number (versioning)        │
  │  • Include validation requirements           │
  │  • Create ExecutionContract object           │
  └──────────────────────────────────────────────┘
           ↓
  OUTPUT: ExecutionContract
  ┌──────────────────────────────────────────────┐
  │ {                                            │
  │   id: "contract-xxx",                        │
  │   version: 1,                                │
  │   gateId: "PBOS-ENGINE-005",                 │
  │   objective: "Enable Codex execution",       │
  │   requiredValidation: ["evidence", ...],     │
  │   allowedOperations: [...]                   │
  │ }                                            │
  └──────────────────────────────────────────────┘
           ↓
  NEXT: Validate contract before work package generation


STAGE 3: CONTRACT VALIDATION (Layer 5 — Pre-Generation)
═══════════════════════════════════════════════════════════════════════════

  ┌──────────────────────────────────────────────┐
  │  validateExecutionContract(contract)          │
  │  Fail-Closed Validation (9 rules)             │
  │  ├─ Rule 1: id must exist                    │
  │  ├─ Rule 2: version must be valid            │
  │  ├─ Rule 3: gateId must exist                │
  │  ├─ Rule 4: objective must exist             │
  │  ├─ Rule 5: version must increment correctly │
  │  ├─ Rule 6: requiredValidation must exist    │
  │  ├─ Rule 7: evidenceRequirements must exist  │
  │  ├─ Rule 8: allowedFiles must be valid       │
  │  └─ Rule 9: blockedFiles exclusions valid    │
  └──────────────────────────────────────────────┘
           ↓ (both pass and fail)
           │
      ┌────┴─────────────────────┐
      │                          │
   ✅ VALID                   ❌ INVALID
      │                          │
      ↓                          ↓
  Continue to                 BLOCKED
  Work Package                 ↓
                            Return BLOCKED
                            from execution
                            engine


STAGE 4: WORK PACKAGE GENERATION (Layer 5)
═══════════════════════════════════════════════════════════════════════════

  [Only executed if contract validation ✅ PASSES]

  ┌──────────────────────────────────────────────┐
  │  generateCodexWorkPackage(contract)           │
  │  • Create work package from contract         │
  │  • Set execution boundaries                  │
  │  • Include allowed/blocked operations        │
  │  • Create CodexWorkPackage object            │
  └──────────────────────────────────────────────┘
           ↓
  OUTPUT: CodexWorkPackage
  ┌──────────────────────────────────────────────┐
  │ {                                            │
  │   contractId: "contract-xxx",                │
  │   workspaceId: "workspace-yyy",              │
  │   scope: { operations: [...] },              │
  │   boundaries: { allowed: [...] },            │
  │   timelineConstraints: {...}                 │
  │ }                                            │
  └──────────────────────────────────────────────┘
           ↓
  NEXT: Create authorization record


STAGE 5: AUTHORIZATION RECORD GENERATION (Layer 6)
═══════════════════════════════════════════════════════════════════════════

  ┌──────────────────────────────────────────────┐
  │  generateExecutionAuthorization(              │
  │    contract,                                 │
  │    workPackage     ← NEW: work package ref  │
  │  )                                           │
  │  • Create authorization record              │
  │  • Set INITIAL STATUS: PENDING              │
  │  • Link to work package (workPackageId)     │
  │  • Include audit trail fields               │
  │  • Write to runtime artifact                │
  └──────────────────────────────────────────────┘
           ↓
  OUTPUT: ExecutionAuthorizationRecord (written to runtime)
  ┌──────────────────────────────────────────────┐
  │ pbos/runtime/execution-authorization.json    │
  │ {                                            │
  │   id: "auth-xxx",                            │
  │   version: 1,                                │
  │   contractId: "contract-xxx",                │
  │   workPackageId: "workpkg-xxx", ← AUDIT   │
  │   gateId: "PBOS-ENGINE-005",                 │
  │   status: "PENDING",           ← INITIAL   │
  │   evidenceReviewed: [],                      │
  │   createdAt: <timestamp>                     │
  │ }                                            │
  └──────────────────────────────────────────────┘
           ↓
  EXTERNAL SYSTEM BOUNDARY
  ↓↓↓ External approval systems may update status ↓↓↓
           ↓


STAGE 6: AUTHORIZATION LOADING (Layer 7 — Load)
═══════════════════════════════════════════════════════════════════════════

  ┌──────────────────────────────────────────────┐
  │  loadExecutionAuthorizationOrUndefined()      │
  │  • Read from runtime artifact                │
  │  • May have been updated by external system  │
  │  • Return current status (PENDING|AUTH|DENY)│
  └──────────────────────────────────────────────┘
           ↓
  LOAD RESULT: ExecutionAuthorizationRecord | undefined
  ┌──────────────────────────────────────────────┐
  │ Possible states after loading:               │
  │ {                                            │
  │   status: "PENDING"       ← Still awaiting  │
  │   status: "AUTHORIZED"    ← Approved!       │
  │   status: "DENIED"        ← Rejected        │
  │   undefined               ← Not found       │
  │ }                                            │
  └──────────────────────────────────────────────┘
           ↓
  NEXT: Validate authorization status


STAGE 7: AUTHORIZATION ENFORCEMENT VALIDATION (Layer 7 — Validate)
═══════════════════════════════════════════════════════════════════════════

  ┌──────────────────────────────────────────────┐
  │  validateExecutionAuthorization(              │
  │    authorization      ← May be undefined    │
  │  )                                           │
  │  Fail-Closed Validation (10 rules)           │
  │  ├─ Must exist (not undefined)              │
  │  ├─ Must have required id                   │
  │  ├─ Must have required version              │
  │  ├─ Must have required contractId           │
  │  ├─ Must have required workPackageId        │
  │  ├─ Must have required gateId               │
  │  ├─ Must have required status               │
  │  ├─ Status must be valid enum value         │
  │  ├─ Status MUST be "AUTHORIZED"  ← KEY    │
  │  └─ Any missing field = FAIL               │
  └──────────────────────────────────────────────┘
           ↓ (pass/fail)
           │
      ┌────┴──────────────────────────────────┐
      │                                       │
   ✅ AUTHORIZED                      ❌ NOT AUTHORIZED
      │                                       │
      │ - status: "AUTHORIZED"                ├─ status: "PENDING"
      │ - All 10 rules pass                   ├─ status: "DENIED"
      ├─ authorization exists               ├─ authorization: undefined
      │                                       ├─ Missing fields
      ↓                                       ├─ Invalid status value
   READY                                     ↓
   (execution eligible)                   BLOCKED
                                    (execution prevented)


STAGE 8: EXECUTION ELIGIBILITY DECISION
═══════════════════════════════════════════════════════════════════════════

  ┌──────────────────────────────────────────────┐
  │  runExecutionEngine() — Final Decision       │
  └──────────────────────────────────────────────┘
           ↓
           │
      ┌────┴────────────────────────┐
      │                             │
   ✅ READY                    ❌ BLOCKED
      │                             │
      ├─ All contracts valid       ├─ Contract invalid
      ├─ Work package generated    ├─ Work package not generated
      ├─ Authorization generated  ├─ Authorization not generated
      ├─ Status = AUTHORIZED      ├─ Status ≠ AUTHORIZED
      │                             ├─ Authorization missing
      ↓                             ├─ External approval pending
   Execution                   No execution
   proceeds                    (fail-closed)
      ↓                             ↓
   Execute Codex              Return:
   requested changes        { status: "BLOCKED",
                            gate: "...",
                            tasks: [] }


ENFORCEMENT MATRIX: ALL SCENARIOS BLOCKED/READY
═══════════════════════════════════════════════════════════════════════════

Contract Status   Work Package   Authorization   Status Value    Result
────────────────────────────────────────────────────────────────────────
Invalid           ❌ Not Gen     ❌ Not Gen      N/A            BLOCKED
Valid             ✅ Generated   ✅ Generated    "PENDING"      BLOCKED ✓
Valid             ✅ Generated   ✅ Generated    "DENIED"       BLOCKED ✓
Valid             ✅ Generated   ✅ Generated    "AUTHORIZED"   READY ✓
Valid             ✅ Generated   ❌ Missing      N/A            BLOCKED ✓
Valid             ✅ Generated   ✅ Generated    Invalid Enum   BLOCKED ✓
Valid             ✅ Generated   ✅ Missing id   N/A            BLOCKED ✓
Valid             ✅ Generated   ✅ Generated    "AUTHORIZED"   READY ✓


COMPLETE ARCHITECTURAL FLOW
═══════════════════════════════════════════════════════════════════════════

  Gate Definition
        │
        ├─── Layer 3 ──→ ExecutionContract (versioned)
        │                      │
        │                      ├─► validateExecutionContract()
        │                      │        │
        │                      │   (FAIL ──► BLOCKED)
        │                      │        │
        │                      └─► (PASS)
        │
        └─ Layer 5 ──→ CodexWorkPackage (bounded scope)
                            │
                            ├─► Only after contract validation ✓
                            │
                            └─ Layer 6 ──→ ExecutionAuthorizationRecord (PENDING)
                                          │
                                          ├─► Write to runtime artifact
                                          │
                                          ├─► External system may update status
                                          │
                                          └─ Layer 7 ──→ LOAD from runtime
                                                          │
                                                          ├─► Status may be:
                                                          │   - PENDING (updated externally)
                                                          │   - AUTHORIZED (approved)
                                                          │   - DENIED (rejected)
                                                          │   - undefined (missing)
                                                          │
                                                          └─► VALIDATE status
                                                              │
                                                              ├─► ONLY "AUTHORIZED" = READY
                                                              │
                                                              └─► All others = BLOCKED


EXECUTION DECISION OUTPUT
═══════════════════════════════════════════════════════════════════════════

interface ExecutionPlan {
  status: "READY" | "BLOCKED";  ← Determined by authorization enforcement
  gate: string;                  ← Gate being executed
  tasks: Array<...>;             ← Execution tasks (empty if BLOCKED)
}

Result: "READY"
  → Authorization is AUTHORIZED
  → All validations passed
  → Execution proceeds

Result: "BLOCKED"
  → Any validation failed
  → Contract invalid OR
  → Work package not generated OR
  → Authorization missing OR
  → Authorization not AUTHORIZED
  → Execution prevented (fail-closed)


ARTIFACT LIFECYCLE
═══════════════════════════════════════════════════════════════════════════

Written by Layer 6:
  pbos/runtime/execution-authorization.json
    {
      id: "...",
      status: "PENDING",        ← Initial
      contractId: "...",
      workPackageId: "...",     ← Audit trail
      ...
    }

Optionally Updated by External System:
  pbos/runtime/execution-authorization.json
    {
      id: "...",
      status: "AUTHORIZED",     ← Changed by external system
      contractId: "...",
      workPackageId: "...",
      approvedBy: "system-id",
      approvalReason: "...",
      authorizedAt: <timestamp>
    }

Read by Layer 7:
  loadExecutionAuthorizationOrUndefined()
    → Returns authorization with current status
    → validateExecutionAuthorization() checks status
    → Only AUTHORIZED permits execution


KEY FAIL-CLOSED ENFORCEMENT POINTS
═══════════════════════════════════════════════════════════════════════════

1. Contract Validation (Layer 5)
   └─ Invalid contract → No work package generated → BLOCKED

2. Work Package Generation (Layer 5)
   └─ Only generated after contract validation → No bypass

3. Authorization Generation (Layer 6)
   └─ Starts with PENDING status (not auto-AUTHORIZED)

4. Authorization Status Check (Layer 7)
   └─ Only AUTHORIZED status permits execution
   └─ PENDING/DENIED/missing all → BLOCKED

5. Multi-Layer Protection
   └─ Contract + Work Package + Authorization all required
   └─ Cannot bypass any layer
   └─ Each layer independently enforces fail-closed

Result: No execution without passing all layers
```

---

## Decision Tree: Will Execution Proceed?

```
START: Should execution proceed?
   │
   ├─ Is contract valid?
   │  │
   │  ├─ NO ──────────────────────→ BLOCKED ❌
   │  │
   │  └─ YES
   │     │
   │     ├─ Is work package generated?
   │     │  │
   │     │  ├─ NO ─────────────────→ BLOCKED ❌
   │     │  │
   │     │  └─ YES
   │     │     │
   │     │     ├─ Is authorization created?
   │     │     │  │
   │     │     │  ├─ NO ───────────→ BLOCKED ❌
   │     │     │  │
   │     │     │  └─ YES
   │     │     │     │
   │     │     │     ├─ Is status AUTHORIZED?
   │     │     │     │  │
   │     │     │     │  ├─ NO (PENDING, DENIED, or invalid) → BLOCKED ❌
   │     │     │     │  │
   │     │     │     │  └─ YES
   │     │     │     │     │
   │     │     │     │     └─→ READY ✅ (execute)
```

---

## Integration with External Systems

```
External Authorization System
        ↑
        │
        └──→ Reads: ExecutionAuthorizationRecord
             Updates: status field
             Writes: Updated record back to runtime artifact
                        │
                        ↓
        Layer 7: Load updated authorization
             ↓
        Layer 7: Validate status
             ↓
        Engine: Decision (READY or BLOCKED)
```

---

**Prepared by**: GitHub Copilot  
**Date**: July 27, 2026
