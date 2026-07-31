import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { artifactDigest } from "../../kernel/identity";
import {
  createExecutionApproval,
  loadExecutionApproval,
  persistExecutionApproval,
} from "./index";

const roots: string[] = [];

function root(): string {
  const value = mkdtempSync(path.join(os.tmpdir(), "pbos-execution-approval-"));
  roots.push(value);
  return value;
}

function input() {
  const contextBody = {
    context_id: "CONTEXT-001",
    repository_identity: "playbook-platform",
    commit_identity: "a".repeat(40),
    branch_identity: "main",
    manifest_digest: "b".repeat(64),
    artifact_digest: "c".repeat(64),
    architecture_digest: "d".repeat(64),
    governance_digest: "e".repeat(64),
    change_boundary_identity: "f".repeat(64),
    launch_approval_identity: "1".repeat(64),
    activation_decision_id: "DECISION-001",
    created_timestamp: "2026-07-31T00:00:00.000Z",
    expiration_timestamp: "2026-08-01T00:00:00.000Z",
    created_by: "reviewer",
  };
  const context = { ...contextBody, digest: artifactDigest(contextBody) };
  const packageBody = {
    package_id: "PACKAGE-001",
    milestone_id: "MILESTONE-001",
    mission: "Implement.",
    context: ["context"],
    current_state: ["ready"],
    dependencies: [],
    required_changes: ["docs/output.md"],
    implementation_requirements: ["Implement."],
    security_requirements: ["Preserve governance."],
    validation_requirements: ["npm test"],
    documentation_requirements: ["docs/output.md"],
    completion_criteria: ["Tests pass."],
    human_approval_required: true as const,
    recommendation_digest: "2".repeat(64),
    timestamp: "2026-07-31T00:00:00.000Z",
  };
  return {
    package: { ...packageBody, digest: artifactDigest(packageBody) },
    context,
    requested_by: "requester",
    approved_by: "reviewer",
    decision: "APPROVED" as const,
    reason: "Approved bounded implementation.",
    risk_acknowledgment: "Risk accepted.",
    risk_level: "YELLOW" as const,
    scope: ["docs/output.md"],
    timestamp: "2026-07-31T00:00:00.000Z",
    expiration: "2026-08-01T00:00:00.000Z",
  };
}

afterEach(() => {
  for (const value of roots.splice(0)) rmSync(value, { recursive: true, force: true });
});

describe("execution approval activation", () => {
  it("persists package-bound approval and preserves history", () => {
    const rootDir = root();
    const first = createExecutionApproval(input());
    persistExecutionApproval(rootDir, first);
    const second = createExecutionApproval({
      ...input(),
      reason: "Reapproved after review.",
      timestamp: "2026-07-31T01:00:00.000Z",
    });
    persistExecutionApproval(rootDir, second);
    expect(loadExecutionApproval(rootDir)?.latest.digest).toBe(second.digest);
    expect(loadExecutionApproval(rootDir)?.history).toContainEqual(first);
  });

  it("rejects self-approval and expired evidence", () => {
    expect(() => createExecutionApproval({
      ...input(),
      approved_by: "requester",
    })).toThrow("incomplete");
    expect(() => createExecutionApproval({
      ...input(),
      expiration: "2026-07-30T00:00:00.000Z",
    })).toThrow("incomplete");
  });
});
