import { describe, expect, it } from "vitest";
import { createDefaultAgentRegistry } from "../../agents/registry";
import { artifactDigest } from "../../kernel/identity";
import { createExecutionAuthority } from "./builder";
import { validateExecutionAuthority } from "./validator";

const timestamp = "2026-07-30T00:00:00.000Z";

function evidence() {
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
    activation_decision_id: "DECISION-001",
    created_timestamp: timestamp,
    expiration_timestamp: "2026-07-31T00:00:00.000Z",
    created_by: "reviewer",
  };
  const context = { ...contextBody, digest: artifactDigest(contextBody) };
  const packageBody = {
    package_id: "PACKAGE-001",
    milestone_id: "MILESTONE-001",
    mission: "Execute governed work.",
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
    recommendation_digest: "f".repeat(64),
    timestamp,
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
    approved_by: "approver",
    authority_type: "HUMAN",
    risk_level: "GREEN" as const,
    scope: ["docs"],
    decision: "APPROVED" as const,
    timestamp,
    expiration: "2026-07-30T01:00:00.000Z",
  };
  const approval = { ...approvalBody, digest: artifactDigest(approvalBody) };
  const agent = createDefaultAgentRegistry(timestamp).get("PBOS-CODEX-CODE-001");
  if (!agent) throw new Error("Test agent is missing.");
  return { context, executionPackage, approval, agent };
}

describe("execution authority", () => {
  it("binds context, certified package, approval, agent, scope, and evidence", () => {
    const value = evidence();
    const record = createExecutionAuthority({
      context: value.context,
      package: value.executionPackage,
      packageCertificationDigest: "1".repeat(64),
      approval: value.approval,
      agent: value.agent,
      scope: ["docs"],
      blockedOperations: ["app", "supabase"],
      requiredCapabilities: ["CODE_GENERATION"],
      evidenceRequirements: ["EXECUTION", "VALIDATION"],
      authorizationTime: timestamp,
      expirationTime: "2026-07-30T01:00:00.000Z",
    });
    expect(record.authority_status).toBe("AUTHORIZED");
    expect(record.agent_id).toBe(value.agent.agent_id);
  });

  it("rejects modified packages and expired authority", () => {
    const value = evidence();
    const record = createExecutionAuthority({
      context: value.context,
      package: value.executionPackage,
      packageCertificationDigest: "1".repeat(64),
      approval: value.approval,
      agent: value.agent,
      scope: ["docs"],
      blockedOperations: ["app"],
      requiredCapabilities: ["CODE_GENERATION"],
      evidenceRequirements: ["VALIDATION"],
      authorizationTime: timestamp,
      expirationTime: "2026-07-30T01:00:00.000Z",
    });
    const modifiedPackage = { ...value.executionPackage, mission: "Modified." };
    const validation = validateExecutionAuthority({
      record,
      context: value.context,
      package: modifiedPackage,
      approval: value.approval,
      agent: value.agent,
      timestamp: "2026-07-30T02:00:00.000Z",
    });
    expect(validation.valid).toBe(false);
    expect(validation.findings).toContain("Execution package validation failed.");
    expect(validation.findings).toContain("Execution authority is expired.");
  });
});
