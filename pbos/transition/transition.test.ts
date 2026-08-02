import { describe, expect, it } from "vitest";
import { artifactDigest } from "../kernel";
import type { ChangeInventory } from "../context/change-boundary";
import {
  advanceTransition,
  createTransitionProposal,
  transitionAuthorizationStatus,
  validateTransitionScope,
} from ".";

function inventory(commitIdentity = "a".repeat(40)): ChangeInventory {
  const body = {
    inventory_id: "CHANGE-INVENTORY-CLEAN",
    repository_identity: "playbook-platform",
    commit_identity: commitIdentity,
    branch_identity: "pbos/post-pps300-convergence",
    content_identity: artifactDigest({ commitIdentity, changes: [] }),
    changes: [],
    timestamp: "2026-08-02T12:00:00.000Z",
  };
  return { ...body, digest: artifactDigest(body) };
}

describe("PBOS transition lifecycle", () => {
  it("advances deterministically through two approvals and automatic completion", () => {
    const current = inventory();
    let proposal = createTransitionProposal({
      inventory: current,
      riskLevel: "LOW",
      purpose: "Activate the canonical baseline.",
      timestamp: "2026-08-02T12:00:00.000Z",
    });
    expect(proposal.state_history.map(({ state }) => state)).toEqual([
      "DRAFT", "PROPOSED",
    ]);
    proposal = advanceTransition(proposal, "REQUESTER_APPROVED",
      "2026-08-02T12:01:00.000Z", "BOUNDARY-001", {
        requester_identity: "REQUESTER-001",
        requester_decision: "APPROVED",
        requester_reason: "Approved canonical activation.",
        requester_risk_acknowledgment: "YES",
        expiration: "2026-08-03T12:00:00.000Z",
        boundary_identity: "BOUNDARY-001",
      });
    expect(transitionAuthorizationStatus(proposal.state)).toBe(
      "AWAITING_REVIEWER_APPROVAL"
    );
    proposal = advanceTransition(proposal, "REVIEWER_APPROVED",
      "2026-08-02T12:02:00.000Z", "APPROVAL-001", {
        reviewer_identity: "REVIEWER-002",
        reviewer_decision: "APPROVED",
        reviewer_reason: "Independently reviewed.",
        launch_approval_identity: "APPROVAL-001",
      });
    proposal = advanceTransition(proposal, "CONTEXT_REFRESH_PENDING",
      "2026-08-02T12:03:00.000Z", "APPROVAL-001", {
        context_refresh: "PENDING",
      });
    proposal = advanceTransition(proposal, "CONTEXT_REFRESHED",
      "2026-08-02T12:04:00.000Z", "CONTEXT-001", {
        context_refresh: "APPLIED",
      });
    proposal = advanceTransition(proposal, "TRUSTED_CONTEXT_ACTIVE",
      "2026-08-02T12:05:00.000Z", "TRUST-001", {
        trusted_context_identity: "TRUST-001",
      });
    proposal = advanceTransition(proposal, "VALIDATED",
      "2026-08-02T12:06:00.000Z", "VALIDATION-001", {
        validation: "PASS",
      });
    proposal = advanceTransition(proposal, "COMPLETE",
      "2026-08-02T12:07:00.000Z", "VALIDATION-001");

    expect(proposal.state).toBe("COMPLETE");
    expect(proposal.context_refresh).toBe("APPLIED");
    expect(proposal.validation).toBe("PASS");
    expect(proposal.requester_identity).toBe("REQUESTER-001");
    expect(proposal.reviewer_identity).toBe("REVIEWER-002");
  });

  it("blocks completion when reviewer approval is missing", () => {
    const proposal = advanceTransition(createTransitionProposal({
      inventory: inventory(),
      riskLevel: "LOW",
      purpose: "Activate the canonical baseline.",
      timestamp: "2026-08-02T12:00:00.000Z",
    }), "REQUESTER_APPROVED", "2026-08-02T12:01:00.000Z", "BOUNDARY-001");

    expect(() => advanceTransition(
      proposal, "CONTEXT_REFRESH_PENDING", "2026-08-02T12:02:00.000Z", ""
    )).toThrow("REQUESTER_APPROVED -> CONTEXT_REFRESH_PENDING");
  });

  it("invalidates expired authorization and changed scope", () => {
    const original = inventory();
    let proposal = createTransitionProposal({
      inventory: original,
      riskLevel: "LOW",
      purpose: "Activate the canonical baseline.",
      timestamp: "2026-08-02T12:00:00.000Z",
    });
    proposal = advanceTransition(proposal, "REQUESTER_APPROVED",
      "2026-08-02T12:01:00.000Z", "BOUNDARY-001", {
        expiration: "2026-08-02T13:00:00.000Z",
      });

    expect(validateTransitionScope(
      proposal, inventory("b".repeat(40)), "2026-08-02T14:00:00.000Z"
    )).toEqual(expect.arrayContaining([
      "Repository scope changed after transition proposal creation.",
      "Transition authorization is expired.",
    ]));
  });

  it("prohibits skipped lifecycle states", () => {
    const proposal = createTransitionProposal({
      inventory: inventory(),
      riskLevel: "LOW",
      purpose: "Activate the canonical baseline.",
      timestamp: "2026-08-02T12:00:00.000Z",
    });
    expect(() => advanceTransition(
      proposal, "COMPLETE", "2026-08-02T12:01:00.000Z", "INVALID"
    )).toThrow("PROPOSED -> COMPLETE");
  });
});
