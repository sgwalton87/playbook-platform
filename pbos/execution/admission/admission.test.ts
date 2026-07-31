import { describe, expect, it } from "vitest";
import { createDefaultAgentRegistry } from "../../agents/registry";
import { artifactDigest } from "../../kernel/identity";
import { evaluateAgentExecutionAdmission } from "./gate";
import type { ExecutionAdmissionRequest } from "./types";
import { createExecutionAuthority } from "../authority";
import {
  createCodexProviderContract,
  resolveExecutionIdentity,
} from "../providers";

function request(): ExecutionAdmissionRequest {
  const agent = createDefaultAgentRegistry("2026-07-30T00:00:00.000Z").get("PBOS-CODEX-CODE-001");
  if (!agent) throw new Error("Test agent missing.");
  const contextBody = {
    context_id: "CONTEXT-001",
    repository_identity: "REPOSITORY-001",
    commit_identity: "a".repeat(40),
    branch_identity: "main",
    manifest_digest: "b".repeat(64),
    artifact_digest: "c".repeat(64),
    architecture_digest: "d".repeat(64),
    governance_digest: "e".repeat(64),
    change_boundary_identity: "f".repeat(64),
    launch_approval_identity: "1".repeat(64),
    activation_decision_id: "CONTEXT-APPROVAL-001",
    created_timestamp: "2026-07-30T00:00:00.000Z",
    expiration_timestamp: "2026-07-31T00:00:00.000Z",
    created_by: "human-reviewer",
  };
  const context = { ...contextBody, digest: artifactDigest(contextBody) };
  const packageBody = {
    package_id: "PACKAGE-001",
    milestone_id: "MILESTONE-001",
    mission: "Execute governed test work.",
    context: ["context"],
    current_state: ["ready"],
    dependencies: [],
    required_changes: ["docs/output.md"],
    implementation_requirements: ["Implement output."],
    security_requirements: ["Preserve governance."],
    validation_requirements: ["npm test"],
    documentation_requirements: ["docs/output.md"],
    completion_criteria: ["Validation passes."],
    human_approval_required: true as const,
    recommendation_digest: "d".repeat(64),
    timestamp: "2026-07-30T00:00:00.000Z",
  };
  const executionPackage = { ...packageBody, digest: artifactDigest(packageBody) };
  const approvalBody = {
    approval_id: "APPROVAL-001",
    request_id: "REQUEST-001",
    package_id: executionPackage.package_id,
    package_digest: executionPackage.digest,
    context_digest: context.digest,
    requested_by: "requester",
    approved_by: "approver",
    authority_type: "HUMAN",
    risk_level: "YELLOW" as const,
    scope: ["docs"],
    decision: "APPROVED" as const,
    timestamp: "2026-07-30T00:00:00.000Z",
    expiration: "2026-07-30T01:00:00.000Z",
  };
  const approval = { ...approvalBody, digest: artifactDigest(approvalBody) };
  const task = {
    task_id: "TASK-001",
    package_id: executionPackage.package_id,
    milestone_id: executionPackage.milestone_id,
    context_identity: context.digest,
    authorization_reference: approval.approval_id,
    execution_authorization_id: "EXECUTION-AUTHORIZATION-001",
    provider_id: agent.agent_id,
    provider_contract_id: `PROVIDER-CONTRACT-${agent.agent_id}-${agent.version}`,
    assigned_agent: agent.agent_id,
    allowed_scope: ["docs"],
    prohibited_scope: ["app"],
    required_capabilities: ["CODE_GENERATION"],
    validation_requirements: ["npm test"],
    evidence_requirements: ["EVIDENCE-001"],
    digest: "e".repeat(64),
  };
  const assignmentBody = {
    task,
    assigned: true,
    authority: "PBOS-TASK-ASSIGNMENT" as const,
    findings: [],
  };
  const assignment = { ...assignmentBody, digest: artifactDigest(assignmentBody) };
  const executionAuthority = createExecutionAuthority({
    context,
    package: executionPackage,
    packageCertificationDigest: "f".repeat(64),
    approval,
    agent,
    scope: ["docs"],
    blockedOperations: ["app"],
    requiredCapabilities: ["CODE_GENERATION"],
    evidenceRequirements: ["EVIDENCE-001"],
    authorizationTime: "2026-07-30T00:00:00.000Z",
    expirationTime: "2026-07-30T01:00:00.000Z",
  });
  const providerBody = createCodexProviderContract({
    provider_id: agent.agent_id,
    version: agent.version,
  });
  const provider = { ...providerBody, digest: artifactDigest(providerBody) };
  const identityResolution = resolveExecutionIdentity({
    provider,
    agents: createDefaultAgentRegistry("2026-07-30T00:00:00.000Z"),
    created_at: "2026-07-30T00:00:00.000Z",
  });
  const body = {
    request_id: "ADMISSION-001",
    context,
    package: executionPackage,
    package_certification_digest: "f".repeat(64),
    execution_authority: executionAuthority,
    approval,
    agent,
    identity_resolution: identityResolution,
    assignment,
    requested_at: "2026-07-30T00:30:00.000Z",
  };
  return { ...body, digest: artifactDigest(body) };
}

describe("agent execution admission", () => {
  it("admits only a fully correlated request", () => {
    expect(
      evaluateAgentExecutionAdmission(request(), "2026-07-30T00:30:00.000Z")
        .decision.admitted
    ).toBe(true);
  });

  it("rejects missing context and expired approval", () => {
    const value = request();
    const result = evaluateAgentExecutionAdmission(
      {
        ...value,
        context: null,
        approval: value.approval
          ? { ...value.approval, expiration: "2026-07-29T00:00:00.000Z" }
          : null,
      },
      "2026-07-30T00:30:00.000Z"
    );
    expect(result.decision.admitted).toBe(false);
    expect(result.decision.findings).toContain("Trusted build context is required.");
    expect(result.decision.findings).toContain("Approval is expired.");
  });
});
