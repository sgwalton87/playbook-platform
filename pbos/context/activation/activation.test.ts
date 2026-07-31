import { describe, expect, it } from "vitest";
import { artifactDigest } from "../../kernel/identity";
import { activateBuildContext } from "./authority";
import {
  resolveAuthorityLinkedActivation,
} from "./service";
import { createLaunchApproval } from "../../authority/launch";
import type { ChangeBoundaryDeclaration } from "../change-boundary";
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

function boundary(): ChangeBoundaryDeclaration {
  const body = {
    boundary_id: "BASELINE-001",
    boundary_type: "BASELINE_ACTIVATION" as const,
    repository_identity: "REPOSITORY-001",
    commit_identity: "a".repeat(40),
    branch_identity: "main",
    requester_identity: "human-operator",
    inventory_digest: "2".repeat(64),
    inventory_identity: "3".repeat(64),
    approved_files: [],
    included_files: [],
    excluded_files: [],
    scope_digest: artifactDigest({ included: [], excluded: [] }),
    context_digest: "4".repeat(64),
    manifest_digest: "b".repeat(64),
    architecture_digest: "d".repeat(64),
    artifact_digest: "c".repeat(64),
    governance_digest: "e".repeat(64),
    purpose: "Activate baseline.",
    business_purpose: "Enable governed planning.",
    technical_purpose: "Bind the trusted repository state.",
    owner_identity: "human-operator",
    risk_acknowledgment: "Baseline risk reviewed.",
    creation_timestamp: "2026-07-30T00:00:00.000Z",
    created_at: "2026-07-30T00:00:00.000Z",
    expiration_timestamp: expiresAt,
    expiration: expiresAt,
  };
  return { ...body, digest: artifactDigest(body) };
}

function linkedEvidence(
  approvalDecision: "APPROVED" | "REJECTED" = "APPROVED"
) {
  const scope = boundary();
  const approval = createLaunchApproval({
    boundary: scope,
    requesterIdentity: scope.requester_identity,
    reviewerIdentity: "human-reviewer",
    decision: approvalDecision,
    reason: "Reviewed repository comparison and accepted the stated risk.",
    riskAcknowledgment: "Baseline risk reviewed.",
    timestamp: "2026-07-30T00:00:00.000Z",
    expiration: expiresAt,
  });
  const baseSnapshot = snapshot();
  const snapshotBody = {
    ...baseSnapshot,
    change_boundary_identity: scope.digest,
    launch_approval_identity: approval.digest,
    launch_approval_valid: approvalDecision === "APPROVED",
    digest: undefined,
  };
  const activationSnapshot = {
    ...snapshotBody,
    digest: artifactDigest(snapshotBody),
  };
  return {
    scope,
    approval,
    discovery: {
      assessment: { digest: "assessment" },
      reconciliation: { digest: "reconciliation" },
      activation_snapshot: activationSnapshot,
    },
  };
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

  it("activates from a valid boundary and matching approval artifact", () => {
    const value = linkedEvidence();
    const result = resolveAuthorityLinkedActivation({
      discovery: value.discovery,
      boundary: value.scope,
      approval: value.approval,
      timestamp: activatedAt,
    });
    expect(result.valid).toBe(true);
    expect(result.evidence?.trusted_context?.created_by).toBe("human-reviewer");
    expect(result.evidence?.decision.evidence_references).toContain(
      value.approval.digest
    );
  });

  it("activates from a matching applied context refresh approval", () => {
    const base = snapshot();
    const refreshBody = {
      approval_id: "REFRESH-APPROVAL-001",
      requester_identity: "human-operator",
      reviewer_identity: "human-reviewer",
      decision: "APPROVED" as const,
      decision_reason: "Approved the exact committed context transition.",
      risk_acknowledgment: "Refresh risk reviewed.",
      repository_identity: base.repository_identity,
      branch_identity: base.branch_identity,
      commit_identity: base.commit_identity,
      reconciliation_digest: "reconciliation",
      previous_context_identity: "old-context",
      proposed_context_identity: "new-context",
      state: "APPLIED" as const,
      timestamp: "2026-07-30T00:00:00.000Z",
      expiration: expiresAt,
      applied_at: activatedAt,
      resulting_context_identity: "new-context",
    };
    const refreshApproval = {
      ...refreshBody,
      digest: artifactDigest(refreshBody),
    };
    const snapshotBody = {
      ...base,
      change_boundary_valid: false,
      launch_approval_valid: false,
      activation_authority_type: "CONTEXT_REFRESH_APPROVAL" as const,
      activation_authority_identity: refreshApproval.digest,
      activation_authority_reviewer_identity:
        refreshApproval.reviewer_identity,
      activation_authority_valid: true,
      digest: undefined,
    };
    const activationSnapshot = {
      ...snapshotBody,
      digest: artifactDigest(snapshotBody),
    };
    const result = resolveAuthorityLinkedActivation({
      discovery: {
        assessment: { digest: "assessment" },
        reconciliation: { digest: "reconciliation" },
        activation_snapshot: activationSnapshot,
      },
      boundary: null,
      approval: null,
      refreshApproval,
      timestamp: activatedAt,
    });
    expect(result.valid).toBe(true);
    expect(result.evidence?.decision.evidence_references).toContain(
      refreshApproval.digest
    );
    expect(result.evidence?.trusted_context?.activation_authority_type).toBe(
      "CONTEXT_REFRESH_APPROVAL"
    );
    const expired = resolveAuthorityLinkedActivation({
      discovery: {
        assessment: { digest: "assessment" },
        reconciliation: { digest: "reconciliation" },
        activation_snapshot: activationSnapshot,
      },
      boundary: null,
      approval: null,
      refreshApproval,
      timestamp: "2026-08-01T00:00:00.000Z",
    });
    expect(expired.valid).toBe(false);
    expect(expired.findings).toContain(
      "Context expiration must follow activation."
    );
  });

  it("blocks missing and digest-mismatched approval artifacts", () => {
    const value = linkedEvidence();
    expect(resolveAuthorityLinkedActivation({
      discovery: value.discovery,
      boundary: value.scope,
      approval: null,
      timestamp: activatedAt,
    }).findings).toContain("Human launch approval is missing.");
    expect(resolveAuthorityLinkedActivation({
      discovery: value.discovery,
      boundary: value.scope,
      approval: { ...value.approval, boundary_digest: "mismatch" },
      timestamp: activatedAt,
    }).valid).toBe(false);
  });

  it("blocks expired and rejected approval artifacts", () => {
    const approved = linkedEvidence();
    expect(resolveAuthorityLinkedActivation({
      discovery: approved.discovery,
      boundary: approved.scope,
      approval: approved.approval,
      timestamp: "2026-08-01T00:00:00.000Z",
    }).findings).toContain("Launch approval is expired.");
    const rejected = linkedEvidence("REJECTED");
    expect(resolveAuthorityLinkedActivation({
      discovery: rejected.discovery,
      boundary: rejected.scope,
      approval: rejected.approval,
      timestamp: activatedAt,
    }).findings).toContain("Launch approval decision is not APPROVED.");
  });
});
