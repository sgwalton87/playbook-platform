import { describe, expect, it } from "vitest";
import { artifactDigest } from "../../kernel/identity";
import type { ChangeBoundaryDeclaration } from "../../context/change-boundary";
import { createLaunchApproval, validateLaunchApproval } from "./authority";

const timestamp = "2026-07-30T00:00:00.000Z";

function boundary(): ChangeBoundaryDeclaration {
  const body = {
    boundary_id: "BOUNDARY-001",
    boundary_type: "CHANGE" as const,
    repository_identity: "playbook-platform",
    commit_identity: "c".repeat(40),
    branch_identity: "main",
    requester_identity: "requester",
    inventory_digest: "a".repeat(64),
    inventory_identity: "b".repeat(64),
    approved_files: ["docs/a.md"],
    included_files: ["docs/a.md"],
    excluded_files: ["pbos/a.ts"],
    scope_digest: artifactDigest({
      included: ["docs/a.md"],
      excluded: ["pbos/a.ts"],
    }),
    context_digest: "",
    manifest_digest: "",
    architecture_digest: "",
    artifact_digest: "",
    governance_digest: "",
    purpose: "Approve a bounded release.",
    business_purpose: "Release governed work.",
    technical_purpose: "Commit an exact scope.",
    owner_identity: "requester",
    risk_acknowledgment: "YELLOW and RED changes reviewed.",
    creation_timestamp: timestamp,
    created_at: timestamp,
    expiration_timestamp: "2026-07-31T00:00:00.000Z",
    expiration: "2026-07-31T00:00:00.000Z",
  };
  return { ...body, digest: artifactDigest(body) };
}

describe("human launch authority", () => {
  it("records an identity-bound authority-ledger decision", () => {
    const scope = boundary();
    const approval = createLaunchApproval({
      boundary: scope,
      requesterIdentity: "requester",
      reviewerIdentity: "reviewer",
      decision: "APPROVED",
      reason: "Scope and risk reviewed.",
      riskAcknowledgment: "Accepted for the declared scope.",
      timestamp,
      expiration: "2026-07-31T00:00:00.000Z",
    });
    expect(approval.scope_identity).toBe(scope.digest);
    expect(approval.ledger_decision.actor_id).toBe("reviewer");
  });

  it("rejects self approval and scope mismatch", () => {
    const scope = boundary();
    expect(() =>
      createLaunchApproval({
        boundary: scope,
        requesterIdentity: "requester",
        reviewerIdentity: "requester",
        decision: "APPROVED",
        reason: "Self approval.",
        riskAcknowledgment: "Accepted.",
        timestamp,
        expiration: "2026-07-31T00:00:00.000Z",
      })
    ).toThrow("separation of duties");

    const approval = createLaunchApproval({
      boundary: scope,
      requesterIdentity: "requester",
      reviewerIdentity: "reviewer",
      decision: "APPROVED",
      reason: "Reviewed.",
      riskAcknowledgment: "Accepted.",
      timestamp,
      expiration: "2026-07-31T00:00:00.000Z",
    });
    expect(
      validateLaunchApproval(
        { approval, boundary: { ...scope, digest: "changed" }, timestamp }
      ).findings
    ).toContain("Approval scope identity does not match change boundary.");
  });
});
