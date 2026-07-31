import { describe, expect, it } from "vitest";
import { AgentExecutor } from "./executor";
import type { TaskAssignment } from "../tasks";

const assignment: TaskAssignment = {
  task: {
    task_id: "TASK-001",
    package_id: "PACKAGE-001",
    milestone_id: "MILESTONE-001",
    context_identity: "CONTEXT-001",
    authorization_reference: "AUTH-001",
    execution_authorization_id: "EXECUTION-AUTH-001",
    provider_id: "PBOS-CODEX-CODE-001",
    provider_contract_id: "PROVIDER-CONTRACT-PBOS-CODEX-CODE-001-1.0.0",
    assigned_agent: "PBOS-CODEX-CODE-001",
    allowed_scope: ["docs"],
    prohibited_scope: ["app"],
    required_capabilities: ["CODE_GENERATION"],
    validation_requirements: ["npm test"],
    evidence_requirements: ["artifact inventory"],
    digest: "a".repeat(64),
  },
  assigned: true,
  authority: "PBOS-TASK-ASSIGNMENT",
  findings: [],
  digest: "b".repeat(64),
};

describe("agent executor", () => {
  it("rejects artifacts outside approved scope", async () => {
    await expect(
      new AgentExecutor().execute(assignment, {
        execute: async () => ({
          execution_id: "EXEC-001",
          task_id: "TASK-001",
          agent_id: "PBOS-CODEX-CODE-001",
          status: "SUCCEEDED",
          artifacts: [{ path: "app/page.tsx", digest: "c".repeat(64) }],
          validation_results: ["PASS"],
          evidence_references: ["EVIDENCE-001"],
          started_at: "2026-07-30T00:00:00.000Z",
          completed_at: "2026-07-30T00:00:01.000Z",
        }),
      })
    ).rejects.toThrow("violated assignment governance");
  });
});
