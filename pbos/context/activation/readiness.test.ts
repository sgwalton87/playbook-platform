import { describe, expect, it } from "vitest";
import { assessAutonomousReadiness } from "./readiness";

const repository = {
  assessment_id: "ASSESSMENT-1",
  repository_identity: "repo",
  current_commit: "commit",
  current_branch: "main",
  working_tree_state: "CLEAN" as const,
  artifact_state: "VALID" as const,
  manifest_state: "VALID" as const,
  governance_state: "VALID" as const,
  architecture_digest: "architecture",
  artifact_digest: "artifacts",
  manifest_digest: "manifest",
  risk_level: "LOW" as const,
  recommendation: "ACTIVATION_ELIGIBLE" as const,
  findings: [],
  timestamp: "2026-07-30T00:00:00.000Z",
  digest: "assessment-digest",
};

describe("autonomous readiness", () => {
  it("requires a current, unexpired trusted context", () => {
    const result = assessAutonomousReadiness({
      repository,
      context: null,
      timestamp: "2026-07-30T00:00:00.000Z",
    });
    expect(result.current_capability_level).toBe("BLOCKED");
    expect(result.next_eligible_milestone).toBeNull();
  });

  it("permits governed planning while retaining execution restrictions", () => {
    const result = assessAutonomousReadiness({
      repository,
      context: {
        context_id: "context",
        repository_identity: "repo",
        commit_identity: "commit",
        branch_identity: "main",
        manifest_digest: "manifest",
        artifact_digest: "artifacts",
        architecture_digest: "architecture",
        governance_digest: "governance",
        change_boundary_identity: "boundary",
        launch_approval_identity: "launch-approval",
        activation_decision_id: "decision",
        created_timestamp: "2026-07-30T00:00:00.000Z",
        expiration_timestamp: "2026-07-31T00:00:00.000Z",
        created_by: "reviewer",
        digest: "context-digest",
      },
      timestamp: "2026-07-30T12:00:00.000Z",
      nextEligibleMilestone: "MILESTONE-001",
    });
    expect(result.current_capability_level).toBe("GOVERNED_PLANNING");
    expect(result.remaining_restrictions).toContain("Human authorization remains mandatory.");
  });
});
