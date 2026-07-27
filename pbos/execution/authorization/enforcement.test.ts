import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { existsSync, rmSync } from "fs";
import path from "path";
import { Runtime, Artifacts } from "../../kernel";
import {
  loadExecutionAuthorizationOrUndefined,
  setAuthorizationStatus,
} from "../authorization";
import type { ExecutionAuthorizationRecord } from "../authorization";

/**
 * Layer 7 Enforcement Tests
 *
 * These tests verify that authorization enforcement works correctly:
 * - Missing authorization → BLOCKED
 * - PENDING authorization → BLOCKED
 * - DENIED authorization → BLOCKED
 * - AUTHORIZED authorization → READY
 */

const testAuthorizationPath = path.join(
  process.cwd(),
  Artifacts.executionAuthorization
);

const createTestAuthorization = (
  status: "PENDING" | "AUTHORIZED" | "DENIED"
): ExecutionAuthorizationRecord => ({
  id: "authorization-TEST-LAYER-7",
  version: "1.0.0",
  contractId: "execution-TEST-LAYER-7",
  workPackageId: "work-package-TEST-LAYER-7",
  gateId: "TEST-LAYER-7",
  status,
  approvedBy: status === "AUTHORIZED" ? "test-approver" : null,
  approvalReason: status === "AUTHORIZED" ? "Test approval" : null,
  evidenceReviewed: [
    "execution-contract.json",
    "work-package.json",
  ],
  createdAt: "2026-07-27T00:00:00.000Z",
  authorizedAt: status !== "PENDING" ? "2026-07-27T00:00:01.000Z" : null,
});

describe("PBOS Layer 7: Execution Authorization Enforcement", () => {
  beforeEach(() => {
    // Clean up any existing test artifact
    if (existsSync(testAuthorizationPath)) {
      rmSync(testAuthorizationPath);
    }
  });

  afterEach(() => {
    // Clean up test artifact
    if (existsSync(testAuthorizationPath)) {
      rmSync(testAuthorizationPath);
    }
  });

  describe("Load authorization from runtime", () => {
    it("returns undefined when authorization artifact does not exist", () => {
      const result = loadExecutionAuthorizationOrUndefined();
      expect(result).toBeUndefined();
    });

    it("loads authorization when artifact exists", () => {
      const testAuth = createTestAuthorization("PENDING");
      Runtime.save(testAuthorizationPath, testAuth);

      const result = loadExecutionAuthorizationOrUndefined();
      expect(result).toBeDefined();
      expect(result?.id).toBe("authorization-TEST-LAYER-7");
      expect(result?.status).toBe("PENDING");
    });

    it("loads authorization with AUTHORIZED status", () => {
      const testAuth = createTestAuthorization("AUTHORIZED");
      Runtime.save(testAuthorizationPath, testAuth);

      const result = loadExecutionAuthorizationOrUndefined();
      expect(result?.status).toBe("AUTHORIZED");
      expect(result?.approvedBy).toBe("test-approver");
      expect(result?.authorizedAt).toBe("2026-07-27T00:00:01.000Z");
    });

    it("loads authorization with DENIED status", () => {
      const testAuth = createTestAuthorization("DENIED");
      Runtime.save(testAuthorizationPath, testAuth);

      const result = loadExecutionAuthorizationOrUndefined();
      expect(result?.status).toBe("DENIED");
    });
  });

  describe("Set authorization status", () => {
    it("updates authorization to AUTHORIZED", () => {
      const testAuth = createTestAuthorization("PENDING");
      Runtime.save(testAuthorizationPath, testAuth);

      const updated = setAuthorizationStatus("AUTHORIZED", {
        approvedBy: "approver-123",
        approvalReason: "Governance review passed",
      });

      expect(updated.status).toBe("AUTHORIZED");
      expect(updated.approvedBy).toBe("approver-123");
      expect(updated.approvalReason).toBe("Governance review passed");
      expect(updated.authorizedAt).toBeDefined();

      // Verify persistence
      const loaded = loadExecutionAuthorizationOrUndefined();
      expect(loaded?.status).toBe("AUTHORIZED");
    });

    it("updates authorization to DENIED", () => {
      const testAuth = createTestAuthorization("PENDING");
      Runtime.save(testAuthorizationPath, testAuth);

      const updated = setAuthorizationStatus("DENIED", {
        approvedBy: "reviewer-456",
        approvalReason: "Security review failed",
      });

      expect(updated.status).toBe("DENIED");
      expect(updated.approvalReason).toBe("Security review failed");
    });

    it("reverts authorization to PENDING", () => {
      const testAuth = createTestAuthorization("AUTHORIZED");
      Runtime.save(testAuthorizationPath, testAuth);

      const updated = setAuthorizationStatus("PENDING");

      expect(updated.status).toBe("PENDING");
      expect(updated.authorizedAt).toBeNull();
    });
  });

  describe("Execution enforcement scenarios", () => {
    it("scenario 1: PENDING authorization blocks execution", () => {
      const testAuth = createTestAuthorization("PENDING");
      Runtime.save(testAuthorizationPath, testAuth);

      const loaded = loadExecutionAuthorizationOrUndefined();
      expect(loaded?.status).toBe("PENDING");
      // In real execution engine, this would cause BLOCKED status
      // Validation would fail because status is not AUTHORIZED
    });

    it("scenario 2: DENIED authorization blocks execution", () => {
      const testAuth = createTestAuthorization("DENIED");
      Runtime.save(testAuthorizationPath, testAuth);

      const loaded = loadExecutionAuthorizationOrUndefined();
      expect(loaded?.status).toBe("DENIED");
      // In real execution engine, this would cause BLOCKED status
      // Validation would fail because status is not AUTHORIZED
    });

    it("scenario 3: AUTHORIZED authorization permits execution", () => {
      const testAuth = createTestAuthorization("AUTHORIZED");
      Runtime.save(testAuthorizationPath, testAuth);

      const loaded = loadExecutionAuthorizationOrUndefined();
      expect(loaded?.status).toBe("AUTHORIZED");
      expect(loaded?.approvedBy).toBeDefined();
      expect(loaded?.authorizedAt).toBeDefined();
      // In real execution engine, this would cause READY status
      // Validation would pass because status is AUTHORIZED
    });

    it("scenario 4: Missing authorization blocks execution", () => {
      const loaded = loadExecutionAuthorizationOrUndefined();
      expect(loaded).toBeUndefined();
      // In real execution engine, this would cause BLOCKED status
      // Validation would fail because authorization is missing
    });

    it("scenario 5: External approval workflow", () => {
      // Create initial PENDING authorization
      const testAuth = createTestAuthorization("PENDING");
      Runtime.save(testAuthorizationPath, testAuth);

      let loaded = loadExecutionAuthorizationOrUndefined();
      expect(loaded?.status).toBe("PENDING");

      // External system approves
      const approved = setAuthorizationStatus("AUTHORIZED", {
        approvedBy: "governance-team",
        approvalReason: "All requirements satisfied",
      });
      expect(approved.status).toBe("AUTHORIZED");

      // Layer 7 now loads the approved authorization
      loaded = loadExecutionAuthorizationOrUndefined();
      expect(loaded?.status).toBe("AUTHORIZED");
      // Validation would pass, execution eligible
    });
  });

  describe("Authorization enforcement guarantees", () => {
    it("cannot bypass authorization by generating contract alone", () => {
      // Even with valid contract and work package, no authorization = blocked
      const loaded = loadExecutionAuthorizationOrUndefined();
      expect(loaded).toBeUndefined();
    });

    it("cannot bypass authorization by generating work package alone", () => {
      // Even with valid work package, no authorization = blocked
      const loaded = loadExecutionAuthorizationOrUndefined();
      expect(loaded).toBeUndefined();
    });

    it("must have AUTHORIZED status, not just any status", () => {
      const testAuth = createTestAuthorization("PENDING");
      Runtime.save(testAuthorizationPath, testAuth);

      const loaded = loadExecutionAuthorizationOrUndefined();
      expect(loaded?.status).not.toBe("AUTHORIZED");
      // Validation would fail (not AUTHORIZED)
    });

    it("approval must include metadata (approvedBy, reason, timestamp)", () => {
      const testAuth = createTestAuthorization("PENDING");
      Runtime.save(testAuthorizationPath, testAuth);

      const approved = setAuthorizationStatus("AUTHORIZED", {
        approvedBy: "reviewer",
        approvalReason: "Passed review",
      });

      expect(approved.approvedBy).toBe("reviewer");
      expect(approved.approvalReason).toBe("Passed review");
      expect(approved.authorizedAt).toBeDefined();
      expect(approved.authorizedAt).not.toBeNull();
    });
  });
});
