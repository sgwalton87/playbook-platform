import { describe, expect, it } from "vitest";
import { validateExecutionAuthorization } from "../authorization/validator";
import type { ExecutionAuthorizationRecord } from "../authorization";

const validAuthorization = (
  overrides?: Partial<ExecutionAuthorizationRecord>
): ExecutionAuthorizationRecord => ({
  id: "authorization-PBOS-ENGINE-005",
  version: "1.0.0",
  contractId: "execution-PBOS-ENGINE-005",
  workPackageId: "work-package-PBOS-ENGINE-005",
  gateId: "PBOS-ENGINE-005",
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
});
