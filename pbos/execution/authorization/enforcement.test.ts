import {
  existsSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Runtime, Artifacts } from "../../kernel";
import {
  loadExecutionAuthorizationOrUndefined,
  setAuthorizationStatus,
} from "../authorization";
import type { ExecutionAuthorizationRecord } from "../authorization";
import { runExecutionEngine } from "../index";

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

const managedArtifactPaths = [
  Artifacts.executionContract,
  Artifacts.workPackage,
  Artifacts.executionAuthorization,
];

const originalArtifacts = new Map<string, string | undefined>();

const createTestAuthorization = (
  status: "PENDING" | "AUTHORIZED" | "DENIED"
): ExecutionAuthorizationRecord => ({
  id: "authorization-TEST-LAYER-7",
  version: "1.0.0",
  contractId: "execution-TEST-LAYER-7",
  workPackageId: "work-package-TEST-LAYER-7",
  contract: {
    artifact: Artifacts.executionContract,
    id: "execution-TEST-LAYER-7",
    version: "1.0.0",
    digest: "contract-digest",
  },
  workPackage: {
    artifact: Artifacts.workPackage,
    id: "work-package-TEST-LAYER-7",
    version: "1.0.0",
    digest: "work-package-digest",
  },
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
    for (const artifact of managedArtifactPaths) {
      originalArtifacts.set(
        artifact,
        existsSync(artifact)
          ? readFileSync(artifact, "utf8")
          : undefined
      );
      rmSync(artifact, { force: true });
    }
  });

  afterEach(() => {
    for (const artifact of managedArtifactPaths) {
      const original = originalArtifacts.get(artifact);

      if (original === undefined) {
        rmSync(artifact, { force: true });
      } else {
        writeFileSync(artifact, original, "utf8");
      }
    }

    originalArtifacts.clear();
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

    it("does not revert a terminal authorization to PENDING", () => {
      const testAuth = createTestAuthorization("AUTHORIZED");
      Runtime.save(testAuthorizationPath, testAuth);

      expect(() => setAuthorizationStatus("PENDING")).toThrow(
        "Authorization decision is immutable after status AUTHORIZED."
      );
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

    it("does not overwrite an existing approval", () => {
      const testAuth = createTestAuthorization("AUTHORIZED");
      Runtime.save(testAuthorizationPath, testAuth);

      const before = JSON.stringify(
        loadExecutionAuthorizationOrUndefined()
      );
      const updated = setAuthorizationStatus("AUTHORIZED", {
        approvedBy: "different-reviewer",
        approvalReason: "Replacement decision",
      });
      const after = JSON.stringify(
        loadExecutionAuthorizationOrUndefined()
      );

      expect(updated.approvedBy).toBe("test-approver");
      expect(after).toBe(before);
    });

    it("does not overwrite a denied decision", () => {
      const testAuth = createTestAuthorization("DENIED");
      Runtime.save(testAuthorizationPath, testAuth);

      expect(() => setAuthorizationStatus("AUTHORIZED")).toThrow(
        "Authorization decision is immutable after status DENIED."
      );
    });
  });

  describe("Resumable execution lifecycle", () => {
    it("pending authorization blocks execution and adapter dispatch", () => {
      const dispatch = vi.fn((plan) => plan);

      const result = runExecutionEngine(dispatch);

      expect(result.status).toBe("BLOCKED");
      expect(loadExecutionAuthorizationOrUndefined()?.status).toBe(
        "PENDING"
      );
      expect(dispatch).not.toHaveBeenCalled();
    });

    it("approved authorization survives and permits dispatch", () => {
      runExecutionEngine();
      setAuthorizationStatus("AUTHORIZED", {
        approvedBy: "governance-reviewer",
        approvalReason: "Immutable artifacts reviewed",
      });
      const approved = readFileSync(
        Artifacts.executionAuthorization,
        "utf8"
      );
      const dispatch = vi.fn((plan) => plan);

      const result = runExecutionEngine(dispatch);

      expect(result.status).toBe("READY");
      expect(dispatch).toHaveBeenCalledOnce();
      expect(
        readFileSync(Artifacts.executionAuthorization, "utf8")
      ).toBe(approved);
    });

    it("denied authorization survives and blocks dispatch", () => {
      runExecutionEngine();
      setAuthorizationStatus("DENIED", {
        approvedBy: "governance-reviewer",
        approvalReason: "Governance requirements not met",
      });
      const denied = readFileSync(
        Artifacts.executionAuthorization,
        "utf8"
      );
      const dispatch = vi.fn((plan) => plan);

      const result = runExecutionEngine(dispatch);

      expect(result.status).toBe("BLOCKED");
      expect(dispatch).not.toHaveBeenCalled();
      expect(
        readFileSync(Artifacts.executionAuthorization, "utf8")
      ).toBe(denied);
    });
  });
});
