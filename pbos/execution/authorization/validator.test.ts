import { describe, expect, it } from "vitest";
import {
  buildExecutionAuthorization,
  validateExecutionAuthorization as validateAuthorization,
} from "../authorization";
import type { ExecutionAuthorizationRecord } from "../authorization";
import type { ExecutionContract } from "../contracts";
import type { CodexWorkPackage } from "../work-package";

const contract: ExecutionContract = {
  id: "execution-PBOS-ENGINE-005",
  version: "1.0.0",
  gateId: "PBOS-ENGINE-005",
  authorization: "PENDING",
  objective: "Test governed execution",
  allowedFiles: ["pbos/execution/**"],
  blockedFiles: ["app/**"],
  allowedOperations: ["UPDATE_FILE"],
  requiredValidation: ["pbos:test"],
  rollbackReference: null,
  evidenceRequirements: ["validation-results"],
  createdAt: "2026-07-27T00:00:00.000Z",
  completedAt: null,
};

const workPackage: CodexWorkPackage = {
  id: "work-package-PBOS-ENGINE-005",
  version: "1.0.0",
  gateId: "PBOS-ENGINE-005",
  objective: contract.objective,
  authorizationRequired: true,
  allowedFiles: contract.allowedFiles,
  blockedFiles: contract.blockedFiles,
  allowedOperations: contract.allowedOperations,
  tasks: ["Review execution contract."],
  requiredValidation: contract.requiredValidation,
  evidenceRequirements: contract.evidenceRequirements,
  createdAt: "2026-07-27T00:00:01.000Z",
};

const validAuthorization = (
  overrides?: Partial<ExecutionAuthorizationRecord>
): ExecutionAuthorizationRecord => ({
  ...buildExecutionAuthorization(contract, workPackage),
  status: "AUTHORIZED",
  approvedBy: "test-approver",
  approvalReason: "Test approval",
  evidenceReviewed: [
    "execution-contract.json",
    "work-package.json",
  ],
  createdAt: "2026-07-27T00:00:00.000Z",
  authorizedAt: "2026-07-27T00:00:01.000Z",
  ...overrides,
});

const validateExecutionAuthorization = (
  authorization: ExecutionAuthorizationRecord | undefined
) => validateAuthorization(authorization, contract, workPackage);

describe("PBOS Layer 6: Execution Authorization Validation", () => {
  it("AUTHORIZED status passes validation", () => {
    const result = validateExecutionAuthorization(
      validAuthorization()
    );

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("PENDING status fails validation", () => {
    const result = validateExecutionAuthorization(
      validAuthorization({ status: "PENDING" })
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Execution blocked: authorization status is "PENDING", not AUTHORIZED.'
    );
  });

  it("DENIED status fails validation", () => {
    const result = validateExecutionAuthorization(
      validAuthorization({ status: "DENIED" })
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Execution blocked: authorization status is "DENIED", not AUTHORIZED.'
    );
  });

  it("missing authorization fails validation", () => {
    const result = validateExecutionAuthorization(
      undefined
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Execution blocked: authorization record is missing."
    );
  });

  it("missing contractId fails validation", () => {
    const result = validateExecutionAuthorization(
      validAuthorization({ contractId: "" })
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Execution blocked: authorization contractId is missing or empty."
    );
  });

  it("missing workPackageId fails validation", () => {
    const result = validateExecutionAuthorization(
      validAuthorization({ workPackageId: "" })
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Execution blocked: authorization workPackageId is missing or empty."
    );
  });

  it("missing gateId fails validation", () => {
    const result = validateExecutionAuthorization(
      validAuthorization({ gateId: "" })
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Execution blocked: authorization gateId is missing or empty."
    );
  });

  it("empty evidenceReviewed fails validation", () => {
    const result = validateExecutionAuthorization(
      validAuthorization({ evidenceReviewed: [] })
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Execution blocked: authorization evidenceReviewed is missing or empty."
    );
  });

  it("AUTHORIZED without authorizedAt timestamp fails validation", () => {
    const result = validateExecutionAuthorization(
      validAuthorization({
        status: "AUTHORIZED",
        authorizedAt: null,
      })
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Execution blocked: authorization is AUTHORIZED but authorizedAt timestamp is missing."
    );
  });

  it("missing id fails validation", () => {
    const result = validateExecutionAuthorization(
      validAuthorization({ id: "" })
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Execution blocked: authorization id is missing or empty."
    );
  });

  it("missing version fails validation", () => {
    const result = validateExecutionAuthorization(
      validAuthorization({ version: "" })
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Execution blocked: authorization version is missing or empty."
    );
  });

  it("contract digest mismatch fails validation", () => {
    const authorization = validAuthorization();
    authorization.contract.digest = "tampered";

    const result = validateExecutionAuthorization(authorization);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Execution blocked: authorization does not match the immutable execution contract."
    );
  });

  it("work package identity mismatch fails validation", () => {
    const authorization = validAuthorization({
      workPackageId: "work-package-other",
    });

    const result = validateExecutionAuthorization(authorization);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Execution blocked: authorization work package identity is invalid."
    );
  });
});
