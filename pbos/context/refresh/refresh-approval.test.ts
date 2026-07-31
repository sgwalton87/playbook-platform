import { describe, expect, it } from "vitest";
import { artifactDigest } from "../../kernel/identity";
import type { RepositoryContextSnapshot } from "../schema";
import type { ContextReconciliationReport } from "../reconciliation";
import { ContextRefreshAuthority } from "./authority";
import {
  applyContextRefreshApproval,
  createContextRefreshApproval,
  validateContextRefreshApproval,
} from "./approval";

const now = "2026-07-30T12:00:00.000Z";
const expiration = "2026-07-30T13:00:00.000Z";

function snapshot(): RepositoryContextSnapshot {
  return {
    repositoryRoot: "/repo",
    remoteName: "origin",
    remoteUrl: "git@example.com:playbook/platform.git",
    repositoryIdentity: "repository-identity",
    git: {
      branch: "pbos/test",
      commitSha: "a".repeat(40),
      upstream: "origin/pbos/test",
      ahead: 0,
      behind: 0,
      workingTreeClean: true,
      workingTreeDigest: "b".repeat(64),
      workingTreeContentDigest: "c".repeat(64),
    },
    runtime: {
      engineVersion: "1.0.0",
      currentGate: null,
      completedGates: [],
      activeSprint: null,
      executionMode: "GOVERNED",
    },
    artifacts: [],
  };
}

function reconciliation(): ContextReconciliationReport {
  const current = snapshot();
  const body: Omit<ContextReconciliationReport, "digest"> = {
    reconciliation_id: "RECONCILIATION-001",
    state: "REVIEW_REQUIRED",
    previous_identity: "previous-context",
    current_identity: "proposed-context",
    previous_snapshot: null,
    current_snapshot: current,
    differences: [],
    resolution_actions: ["Human review is required."],
    confidence: 1,
    risk_level: "MEDIUM",
    recommendation: "HUMAN_REVIEW_REQUIRED",
    timestamp: now,
  };
  return { ...body, digest: artifactDigest(body) };
}

function approval(
  overrides: Partial<Parameters<typeof createContextRefreshApproval>[0]> = {}
) {
  return createContextRefreshApproval({
    reconciliation: reconciliation(),
    requesterIdentity: "REQUESTER-001",
    reviewerIdentity: "REVIEWER-001",
    decision: "APPROVED",
    decisionReason: "Repository changes were independently reviewed.",
    riskAcknowledgment: "Refresh risk is accepted.",
    timestamp: now,
    expiration,
    ...overrides,
  });
}

describe("context refresh approval authority", () => {
  it("blocks refresh when approval is missing", () => {
    expect(() =>
      new ContextRefreshAuthority().refreshApproved("/repo", {
        reconciliation: reconciliation(),
        approval: undefined as never,
        timestamp: now,
      })
    ).toThrow();
  });

  it("accepts a valid reconciliation-bound approval", () => {
    expect(
      validateContextRefreshApproval({
        approval: approval(),
        reconciliation: reconciliation(),
        timestamp: now,
      })
    ).toEqual({ valid: true, findings: [] });
  });

  it("blocks a reconciliation digest mismatch", () => {
    const value = approval();
    const modified = { ...value, reconciliation_digest: "x".repeat(64) };
    expect(
      validateContextRefreshApproval({
        approval: modified,
        reconciliation: reconciliation(),
        timestamp: now,
      }).valid
    ).toBe(false);
  });

  it("blocks an expired approval", () => {
    expect(
      validateContextRefreshApproval({
        approval: approval(),
        reconciliation: reconciliation(),
        timestamp: "2026-07-30T14:00:00.000Z",
      }).findings
    ).toContain("Refresh approval is expired or has invalid expiration.");
  });

  it("blocks a rejected approval", () => {
    const rejected = approval({ decision: "REJECTED" });
    expect(
      validateContextRefreshApproval({
        approval: rejected,
        reconciliation: reconciliation(),
        timestamp: now,
      }).findings
    ).toContain("Refresh approval decision is not APPROVED.");
  });

  it("performs and records the approved refresh transition", () => {
    const value = approval();
    const refresh = new ContextRefreshAuthority(() => ({
      context: {
        version: "1.1.0",
        capturedAt: now,
        snapshot: snapshot(),
        identity: value.proposed_context_identity,
      },
      refresh: {
        version: "1.0.0",
        owner: "repository-context",
        latest: {
          id: "REFRESH-001",
          previousContextIdentity: value.previous_context_identity,
          newContextIdentity: value.proposed_context_identity,
          reason: value.decision_reason,
          triggeringConditions: [],
          timestamp: now,
          validator: { id: "PBOS-CONTEXT-VALIDATOR", version: "1.1.0" },
          generationResult: "PASS",
        },
        history: [],
      },
    }));
    const result = refresh.refreshApproved("/repo", {
      reconciliation: reconciliation(),
      approval: value,
      timestamp: now,
    });
    const applied = applyContextRefreshApproval(
      value,
      result.context.identity,
      now
    );
    expect(applied.state).toBe("APPLIED");
    expect(applied.resulting_context_identity).toBe(
      value.proposed_context_identity
    );
  });
});
