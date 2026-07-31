import { describe, expect, it } from "vitest";
import { artifactDigest } from "../../kernel/identity";
import { ExecutionProviderRegistry, registerCodexProvider } from "../providers";
import { ExecutionFabricRunner } from "./runner";
import type { ExecutionFabricRequest } from "./types";
import { issueExecutionAuthorization } from "../authority";

function request(): ExecutionFabricRequest {
  const contextBody = {
    context_id: "CONTEXT-001",
    repository_identity: "playbook-platform",
    commit_identity: "a".repeat(40),
    branch_identity: "main",
    manifest_digest: "b".repeat(64),
    artifact_digest: "c".repeat(64),
    architecture_digest: "d".repeat(64),
    governance_digest: "e".repeat(64),
    change_boundary_identity: "f".repeat(64),
    launch_approval_identity: "1".repeat(64),
    activation_decision_id: "DECISION-001",
    created_timestamp: "2026-07-31T00:00:00.000Z",
    expiration_timestamp: "2026-08-01T00:00:00.000Z",
    created_by: "reviewer",
  };
  const context = { ...contextBody, digest: artifactDigest(contextBody) };
  const packageBody = {
    package_id: "PACKAGE-001",
    milestone_id: "MILESTONE-001",
    mission: "Implement governed work.",
    context: ["repository"],
    current_state: ["ready"],
    dependencies: [],
    required_changes: ["docs/output.md"],
    implementation_requirements: ["Implement output."],
    security_requirements: ["Preserve governance."],
    validation_requirements: ["npm test"],
    documentation_requirements: ["docs/output.md"],
    completion_criteria: ["Tests pass."],
    human_approval_required: true as const,
    recommendation_digest: "2".repeat(64),
    timestamp: "2026-07-31T00:00:00.000Z",
  };
  const executionPackage = {
    ...packageBody,
    digest: artifactDigest(packageBody),
  };
  const approvalBody = {
    approval_id: "APPROVAL-001",
    request_id: "REQUEST-001",
    package_id: executionPackage.package_id,
    package_digest: executionPackage.digest,
    context_digest: context.digest,
    requested_by: "requester",
    approved_by: "reviewer",
    authority_type: "HUMAN",
    risk_level: "YELLOW" as const,
    scope: ["docs"],
    decision: "APPROVED" as const,
    timestamp: "2026-07-31T00:00:00.000Z",
    expiration: "2026-08-01T00:00:00.000Z",
  };
  const approval = { ...approvalBody, digest: artifactDigest(approvalBody) };
  const authorityBody = {
    execution_authority_id: "AUTHORITY-001",
    package_id: executionPackage.package_id,
    package_digest: executionPackage.digest,
    package_certification_digest: "3".repeat(64),
    context_id: context.context_id,
    context_digest: context.digest,
    approval_id: approval.approval_id,
    approval_digest: approval.digest,
    agent_id: "PBOS-CODEX-CODE-001",
    agent_digest: "4".repeat(64),
    scope: ["docs"],
    blocked_operations: ["app", "supabase", "pbos/runtime"],
    required_capabilities: ["CODE_GENERATION"],
    evidence_requirements: ["VALIDATION_RESULTS"],
    risk_level: "YELLOW" as const,
    authorization_time: "2026-07-31T00:00:00.000Z",
    expiration_time: "2026-08-01T00:00:00.000Z",
    authority_status: "AUTHORIZED" as const,
  };
  const authority = { ...authorityBody, digest: artifactDigest(authorityBody) };
  const providers = registerCodexProvider({
    registry: new ExecutionProviderRegistry(),
    provider_id: "PBOS-CODEX-CODE-001",
    version: "1.0.0",
    delegate: async (task) => ({
      execution_id: "EXECUTION-001",
      task_id: task.task_id,
      agent_id: task.assigned_agent,
      status: "SUCCEEDED",
      artifacts: [{ path: "docs/output.md", digest: "6".repeat(64) }],
      validation_results: ["npm test"],
      evidence_references: ["VALIDATION_RESULTS"],
      started_at: "2026-07-31T00:00:00.000Z",
      completed_at: "2026-07-31T00:01:00.000Z",
    }),
  });
  const provider = providers.get("PBOS-CODEX-CODE-001");
  if (!provider) throw new Error("Test provider is missing.");
  const authorization = issueExecutionAuthorization({
    authority,
    context,
    package: executionPackage,
    provider: provider.contract,
    created_by: "requester",
    approved_by: "reviewer",
    issued_at: "2026-07-31T00:00:00.000Z",
  });
  const taskBody = {
    task_id: "TASK-001",
    package_id: executionPackage.package_id,
    milestone_id: executionPackage.milestone_id,
    context_identity: context.digest,
    authorization_reference: approval.approval_id,
    execution_authorization_id: authorization.authorization_id,
    provider_id: provider.contract.provider_id,
    provider_contract_id: provider.contract.provider_contract_id,
    assigned_agent: "PBOS-CODEX-CODE-001",
    allowed_scope: ["docs"],
    prohibited_scope: ["app", "supabase", "pbos/runtime"],
    required_capabilities: ["CODE_GENERATION"],
    validation_requirements: ["npm test"],
    evidence_requirements: ["VALIDATION_RESULTS"],
  };
  const task = { ...taskBody, digest: artifactDigest(taskBody) };
  const assignmentBody = {
    task,
    assigned: true,
    authority: "PBOS-TASK-ASSIGNMENT" as const,
    findings: [],
  };
  const assignment = {
    ...assignmentBody,
    digest: artifactDigest(assignmentBody),
  };
  const admissionDecisionBody = {
    request_id: "ADMISSION-001",
    admitted: true,
    authority: "PBOS-AGENT-EXECUTION-ADMISSION" as const,
    findings: [],
    decided_at: "2026-07-31T00:00:00.000Z",
  };
  const decision = {
    ...admissionDecisionBody,
    digest: artifactDigest(admissionDecisionBody),
  };
  const admissionBody = {
    request_digest: "5".repeat(64),
    context_digest: context.digest,
    package_digest: executionPackage.digest,
    approval_digest: approval.digest,
    agent_digest: authority.agent_digest,
    identity_resolution_digest: "7".repeat(64),
    assignment_digest: assignment.digest,
    certification_digest: authority.package_certification_digest,
    execution_authority_digest: authority.digest,
    decision,
  };
  const admission = {
    ...admissionBody,
    digest: artifactDigest(admissionBody),
  };
  return {
    context,
    package: executionPackage,
    approval,
    authority,
    authorization,
    assignment,
    admission,
    providers,
    requested_at: "2026-07-31T00:00:01.000Z",
  };
}

describe("execution fabric runner", () => {
  it("executes an admitted assignment and emits advancement evidence", async () => {
    const result = await new ExecutionFabricRunner().execute(request());
    expect(result.provider_id).toBe("PBOS-CODEX-CODE-001");
    expect(result.evidence.completion.advancement_eligible).toBe(true);
  });

  it("rejects execution without admission", async () => {
    const value = request();
    await expect(new ExecutionFabricRunner().execute({
      ...value,
      admission: {
        ...value.admission,
        decision: { ...value.admission.decision, admitted: false },
      },
    })).rejects.toThrow("admission rejected");
  });

  it("rejects authorization bound to another agent", async () => {
    const value = request();
    await expect(
      new ExecutionFabricRunner().execute({
        ...value,
        authorization: {
          ...value.authorization,
          agent_id: "PBOS-CODEX-TEST-001",
        },
      })
    ).rejects.toThrow("admission rejected");
  });
});
