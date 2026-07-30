import { describe, expect, it } from "vitest";
import { artifactDigest } from "../../kernel/identity";
import { createChangeBoundary, validateChangeBoundary } from "./authority";
import type { ChangeInventory } from "./types";

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

describe("change boundary authority", () => {
  it("requires every changed file to be explicitly approved or excluded", () => {
    const value = inventory();
    expect(() =>
      createChangeBoundary({
        inventory: value,
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
});
