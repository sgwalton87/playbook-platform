import { describe, expect, it } from "vitest";
import { buildExecutionEvidence } from "./builder";

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
      required_validations: ["npm test"],
      required_evidence: ["EVIDENCE-001"],
    });
    expect(result.completion.advancement_eligible).toBe(false);
  });
});
