import { describe, expect, it } from "vitest";
import { artifactDigest } from "../../kernel/identity";
import { createChangeBoundary, validateChangeBoundary } from "./authority";
import type { BaselineActivationIdentity, ChangeInventory } from "./types";

const timestamp = "2026-07-30T00:00:00.000Z";

function inventory(): ChangeInventory {
  const changes = [
    {
      file_path: "docs/a.md",
      change_type: "MODIFIED" as const,
      owner: "Playbook OS Engineering",
      domain: "documentation",
      risk_level: "GREEN" as const,
      dependency: "repository-context",
      approval_status: "APPROVED_CANDIDATE" as const,
      content_digest: "a".repeat(64),
    },
    {
      file_path: "pbos/a.ts",
      change_type: "ADDED" as const,
      owner: "PBOS Engineering",
      domain: "control-plane",
      risk_level: "YELLOW" as const,
      dependency: "repository-context",
      approval_status: "REVIEW_REQUIRED" as const,
      content_digest: "b".repeat(64),
    },
  ];
  const base = {
    inventory_id: "INVENTORY-1",
    repository_identity: "playbook-platform",
    commit_identity: "c".repeat(40),
    branch_identity: "main",
    content_identity: artifactDigest(changes),
    changes,
    timestamp,
  };
  return { ...base, digest: artifactDigest(base) };
}

const baselineIdentity: BaselineActivationIdentity = {
  context_digest: "1".repeat(64),
  manifest_digest: "2".repeat(64),
  architecture_digest: "3".repeat(64),
  artifact_digest: "4".repeat(64),
  governance_digest: "5".repeat(64),
};

function cleanInventory(): ChangeInventory {
  const body = {
    inventory_id: "INVENTORY-CLEAN",
    repository_identity: "playbook-platform",
    commit_identity: "c".repeat(40),
    branch_identity: "main",
    content_identity: artifactDigest({
      repositoryIdentity: "playbook-platform",
      commitIdentity: "c".repeat(40),
      branchIdentity: "main",
      changes: [],
    }),
    changes: [],
    timestamp,
  };
  return { ...body, digest: artifactDigest(body) };
}

describe("change boundary authority", () => {
  it("requires every changed file to be explicitly approved or excluded", () => {
    const value = inventory();
    expect(() =>
      createChangeBoundary({
        inventory: value,
        boundaryType: "CHANGE",
        requesterIdentity: "human-owner",
        approvedFiles: ["docs/a.md"],
        excludedFiles: [],
        purpose: "Approve documentation only.",
        businessPurpose: "Release governed documentation.",
        technicalPurpose: "Commit the approved documentation scope.",
        riskAcknowledgment: "YELLOW risk reviewed.",
        creationTimestamp: timestamp,
        expirationTimestamp: "2026-07-31T00:00:00.000Z",
      })
    ).toThrow("Every changed file must be classified exactly once.");
  });

  it("detects scope drift after declaration", () => {
    const value = inventory();
    const declaration = createChangeBoundary({
      inventory: value,
      boundaryType: "CHANGE",
      requesterIdentity: "human-owner",
      approvedFiles: ["docs/a.md"],
      excludedFiles: ["pbos/a.ts"],
      purpose: "Approve documentation only.",
      businessPurpose: "Release governed documentation.",
      technicalPurpose: "Commit the approved documentation scope.",
      riskAcknowledgment: "YELLOW risk reviewed.",
      creationTimestamp: timestamp,
      expirationTimestamp: "2026-07-31T00:00:00.000Z",
    });
    const drifted = {
      ...value,
      content_identity: "drifted",
    };
    expect(
      validateChangeBoundary(declaration, drifted, timestamp).findings
    ).toContain("Change inventory identity does not match.");
  });

  it("accepts a clean repository baseline with complete identity evidence", () => {
    const value = cleanInventory();
    const declaration = createChangeBoundary({
      inventory: value,
      boundaryType: "BASELINE_ACTIVATION",
      baselineIdentity,
      requesterIdentity: "human-owner",
      approvedFiles: [],
      excludedFiles: [],
      purpose: "Activate the current trusted baseline.",
      businessPurpose: "Begin governed planning.",
      technicalPurpose: "Bind PBOS to the clean repository snapshot.",
      riskAcknowledgment: "Baseline activation risk reviewed.",
      creationTimestamp: timestamp,
      expirationTimestamp: "2026-07-31T00:00:00.000Z",
    });
    expect(declaration.boundary_type).toBe("BASELINE_ACTIVATION");
    expect(validateChangeBoundary(
      declaration, value, timestamp, baselineIdentity
    )).toEqual({ valid: true, findings: [] });
  });

  it("rejects baseline activation for a changed repository", () => {
    expect(() => createChangeBoundary({
      inventory: inventory(),
      boundaryType: "BASELINE_ACTIVATION",
      baselineIdentity,
      requesterIdentity: "human-owner",
      approvedFiles: [],
      excludedFiles: [],
      purpose: "Invalid baseline.",
      businessPurpose: "Invalid baseline.",
      technicalPurpose: "Invalid baseline.",
      riskAcknowledgment: "Risk reviewed.",
      creationTimestamp: timestamp,
      expirationTimestamp: "2026-07-31T00:00:00.000Z",
    })).toThrow("Baseline activation requires a clean repository.");
  });

  it("rejects missing identity, expiration, and baseline digest drift", () => {
    const value = cleanInventory();
    const declaration = createChangeBoundary({
      inventory: value,
      boundaryType: "BASELINE_ACTIVATION",
      baselineIdentity,
      requesterIdentity: "human-owner",
      approvedFiles: [],
      excludedFiles: [],
      purpose: "Activate baseline.",
      businessPurpose: "Begin governed planning.",
      technicalPurpose: "Bind the clean repository.",
      riskAcknowledgment: "Risk reviewed.",
      creationTimestamp: timestamp,
      expirationTimestamp: "2026-07-31T00:00:00.000Z",
    });
    const withoutRepository = {
      ...declaration,
      repository_identity: "",
    };
    const missingIdentity = {
      ...withoutRepository,
      digest: artifactDigest({ ...withoutRepository, digest: undefined }),
    };
    expect(validateChangeBoundary(
      missingIdentity, value, timestamp, baselineIdentity
    ).findings).toContain("Repository identity does not match change boundary.");
    expect(validateChangeBoundary(
      declaration, value, "2026-08-01T00:00:00.000Z", baselineIdentity
    ).findings).toContain("Change boundary is expired.");
    expect(validateChangeBoundary(declaration, value, timestamp, {
      ...baselineIdentity,
      governance_digest: "changed",
    }).findings).toContain(
      "Baseline activation digest does not match current context."
    );
  });
});
