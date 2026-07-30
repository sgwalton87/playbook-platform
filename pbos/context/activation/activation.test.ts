import { describe, expect, it } from "vitest";
import { artifactDigest } from "../../kernel/identity";
import { activateBuildContext } from "./authority";
import type {
  ContextActivationDecision,
  ContextActivationRequest,
  ContextActivationSnapshot,
} from "./types";

const activatedAt = "2026-07-30T00:00:01.000Z";
const expiresAt = "2026-07-31T00:00:01.000Z";

function snapshot(clean = true): ContextActivationSnapshot {
  const body = {
    context_id: "CONTEXT-001",
    repository_identity: "REPOSITORY-001",
    commit_identity: "a".repeat(40),
    branch_identity: "main",
    reconciliation_state: "VERIFIED" as const,
    working_tree_clean: clean,
    artifact_inventory_valid: true,
    architecture_inventory_valid: true,
    manifest_digest: "b".repeat(64),
    artifact_digest: "c".repeat(64),
    architecture_digest: "d".repeat(64),
    governance_digest: "e".repeat(64),
    change_boundary_identity: "f".repeat(64),
    change_boundary_valid: true,
    launch_approval_identity: "1".repeat(64),
    launch_approval_reviewer_identity: "human-reviewer",
    launch_approval_valid: true,
    governance_state_valid: true,
  };
  return { ...body, digest: artifactDigest(body) };
}

function request(value: ContextActivationSnapshot): ContextActivationRequest {
  const body = {
    request_id: "ACTIVATE-001",
    requested_by: "human-operator",
    snapshot_digest: value.digest,
    reconciliation_digest: "f".repeat(64),
    risk_acknowledgement: "RISK-ACK-001",
    timestamp: activatedAt,
  };
  return { ...body, digest: artifactDigest(body) };
}

function decision(
  value: ContextActivationSnapshot,
  outcome: "APPROVED" | "REJECTED" = "APPROVED"
): ContextActivationDecision {
  const body = {
    decision_id: "DECISION-001",
    context_id: value.context_id,
    reviewer_identity: "human-reviewer",
    decision: outcome,
    reason: "Reviewed repository comparison and accepted the stated risk.",
    evidence_references: ["evidence-001"],
    risk_acknowledgement: "RISK-ACK-001",
    timestamp: activatedAt,
  };
  return { ...body, digest: artifactDigest(body) };
}

describe("context activation", () => {
  it("creates a temporally bounded trusted context from matching human evidence", () => {
    const value = snapshot();
    const result = activateBuildContext(
      value,
      request(value),
      decision(value),
      activatedAt,
      expiresAt
    );
    expect(result.outcome.decision).toBe("TRUSTED");
    expect(result.trusted_context?.manifest_digest).toBe(value.manifest_digest);
    expect(result.trusted_context?.created_by).toBe("human-reviewer");
  });

  it("fails closed for a dirty repository despite human approval", () => {
    const value = snapshot(false);
    const result = activateBuildContext(
      value,
      request(value),
      decision(value),
      activatedAt,
      expiresAt
    );
    expect(result.outcome.decision).toBe("BLOCKED");
    expect(result.trusted_context).toBeNull();
  });

  it("fails closed without an affirmative human decision", () => {
    const value = snapshot();
    const result = activateBuildContext(
      value,
      request(value),
      decision(value, "REJECTED"),
      activatedAt,
      expiresAt
    );
    expect(result.outcome.findings).toContain("Human context approval is absent.");
    expect(result.trusted_context).toBeNull();
  });
});
