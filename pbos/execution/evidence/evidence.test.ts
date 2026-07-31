import { describe, expect, it } from "vitest";
import { buildExecutionEvidence } from "./builder";
import { assessMilestoneAdvancement } from "./advancement";
import { artifactDigest } from "../../kernel/identity";

describe("execution evidence", () => {
  it("does not permit advancement with incomplete evidence", () => {
    const result = buildExecutionEvidence({
      result: {
        execution_id: "EXEC-001",
        task_id: "TASK-001",
        agent_id: "AGENT-001",
        status: "SUCCEEDED",
        artifacts: [],
        validation_results: [],
        evidence_references: [],
        started_at: "2026-07-30T00:00:00.000Z",
        completed_at: "2026-07-30T00:00:01.000Z",
        digest: "a".repeat(64),
      },
      package_digest: "b".repeat(64),
      context_digest: "c".repeat(64),
      approval_id: "APPROVAL-001",
      authorization_id: "AUTHORIZATION-001",
      provider_id: "PROVIDER-001",
      provider_contract_id: "PROVIDER-CONTRACT-001",
      required_validations: ["npm test"],
      required_evidence: ["EVIDENCE-001"],
    });
    expect(result.completion.advancement_eligible).toBe(false);
  });

  it("permits advancement only for matching complete package evidence", () => {
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
      recommendation_digest: "d".repeat(64),
      timestamp: "2026-07-31T00:00:00.000Z",
    };
    const executionPackage = {
      ...packageBody,
      digest: artifactDigest(packageBody),
    };
    const evidence = buildExecutionEvidence({
      result: {
        execution_id: "EXEC-001",
        task_id: "TASK-001",
        agent_id: "AGENT-001",
        status: "SUCCEEDED",
        artifacts: [{ path: "docs/output.md", digest: "a".repeat(64) }],
        validation_results: ["npm test"],
        evidence_references: ["VALIDATION_RESULTS"],
        started_at: "2026-07-31T00:00:00.000Z",
        completed_at: "2026-07-31T00:01:00.000Z",
        digest: "b".repeat(64),
      },
      package_digest: executionPackage.digest,
      context_digest: "c".repeat(64),
      approval_id: "APPROVAL-001",
      authorization_id: "AUTHORIZATION-001",
      provider_id: "PROVIDER-001",
      provider_contract_id: "PROVIDER-CONTRACT-001",
      required_validations: ["npm test"],
      required_evidence: ["VALIDATION_RESULTS"],
    });
    expect(
      assessMilestoneAdvancement({ package: executionPackage, evidence })
        .eligible
    ).toBe(true);
    expect(
      assessMilestoneAdvancement({
        package: { ...executionPackage, digest: "f".repeat(64) },
        evidence,
      }).eligible
    ).toBe(false);
  });
});
