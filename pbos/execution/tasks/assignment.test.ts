import { describe, expect, it } from "vitest";
import { createDefaultAgentRegistry } from "../../agents/registry";
import { assignExecutionTask } from "./assignment";

const task = {
  task_id: "TASK-001",
  package_id: "PACKAGE-001",
  milestone_id: "MILESTONE-001",
  context_identity: "CONTEXT-DIGEST",
  authorization_reference: "APPROVAL-001",
  execution_authorization_id: "EXECUTION-AUTHORIZATION-001",
  provider_id: "PBOS-CODEX-CODE-001",
  provider_contract_id: "PROVIDER-CONTRACT-PBOS-CODEX-CODE-001-1.0.0",
  assigned_agent: "PBOS-CODEX-CODE-001",
  allowed_scope: ["docs/release-evidence"],
  prohibited_scope: ["app", "supabase", "pbos/runtime"],
  required_capabilities: ["CODE_GENERATION"],
  validation_requirements: ["npm test"],
  evidence_requirements: ["artifact inventory"],
};

describe("execution task assignment", () => {
  it("rejects missing trust, approval, and package", () => {
    const result = assignExecutionTask({
      task,
      registry: createDefaultAgentRegistry("2026-07-30T00:00:00.000Z"),
      context: null,
      approval: null,
      package: null,
      execution_authorization_id: task.execution_authorization_id,
      provider_id: task.provider_id,
      provider_contract_id: task.provider_contract_id,
      resolved_agent_id: task.assigned_agent,
      required_permissions: ["MODIFY_APPROVED_FILES"],
    });
    expect(result.assigned).toBe(false);
    expect(result.findings).toContain("Trusted context is required.");
  });

  it("rejects scope intersection", () => {
    const result = assignExecutionTask({
      task: { ...task, allowed_scope: ["app"] },
      registry: createDefaultAgentRegistry("2026-07-30T00:00:00.000Z"),
      context: null,
      approval: null,
      package: null,
      execution_authorization_id: task.execution_authorization_id,
      provider_id: task.provider_id,
      provider_contract_id: task.provider_contract_id,
      resolved_agent_id: task.assigned_agent,
      required_permissions: ["MODIFY_APPROVED_FILES"],
    });
    expect(result.findings).toContain("Approved scope intersects prohibited scope: app.");
  });
});
