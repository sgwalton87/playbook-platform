import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { Artifacts, Runtime, artifactDigest } from "../../kernel";
import type { ApprovalRecord } from "../../authority";
import type { TrustedBuildContext } from "../../context/activation";
import type { CodexExecutionPackage } from "../../orchestration";
import type { ExecutionAuthorization, ExecutionAuthorityRecord } from "../authority";
import type { ExecutionTask } from "../tasks";
import type { TaskAssignment } from "../tasks";
import type { ExecutionTelemetry } from "../providers";
import { buildExecutionEvidence } from "./builder";
import { revalidateExecutionEvidence } from "./recovery";
import { evaluateExecutionValidations } from "./validation";

function fixture() {
  const rootDir = mkdtempSync(path.join(tmpdir(), "pbos-validation-"));
  mkdirSync(path.join(rootDir, "pbos/manifests"), { recursive: true });
  mkdirSync(path.join(rootDir, "docs"), { recursive: true });
  writeFileSync(path.join(rootDir, "docs/output.md"), "validated output");
  const domains = [
    "applications", "engines", "features", "infrastructure", "integrations",
    "launch", "operating-systems", "platform", "security",
  ];
  const base = {
    description: "Test.", domain: "features", priority: 100,
    blocking_dependencies: [], required_capabilities: ["test"],
    risk_level: "YELLOW", approval_level: "HUMAN",
    completion_definition: ["Complete."], evidence_requirements: ["Evidence."],
    owner: "PBOS", version: "1.0.0", outputs: ["docs/output.md"],
  };
  const manifest = {
    manifest_id: "PLAYBOOK-MASTER-MANIFEST",
    version: "1.0.0",
    authority: "PBOS-KERNEL",
    program: "Playbook Platform",
    domains,
    milestones: [
      {
        ...base, id: "DEPENDENCY-001", name: "Dependency", type: "ENGINE",
        status: "COMPLETE", dependencies: [], required_artifacts: ["docs/output.md"],
        validation_requirements: ["test"],
      },
      {
        ...base, id: "MILESTONE-001", name: "Milestone", type: "MILESTONE",
        status: "READY", dependencies: ["DEPENDENCY-001"],
        required_artifacts: ["docs/output.md"],
        validation_requirements: [
          "dependency-validation", "package-identity", "permission-boundary",
        ],
      },
    ],
  };
  writeFileSync(
    path.join(rootDir, "pbos/manifests/playbook-master-manifest.yaml"),
    JSON.stringify(manifest)
  );
  const packageBody = {
    package_id: "PACKAGE-001", milestone_id: "MILESTONE-001", mission: "Test.",
    context: ["context"], current_state: ["ready"], dependencies: ["DEPENDENCY-001"],
    required_changes: ["docs/output.md"], implementation_requirements: ["Implement."],
    security_requirements: ["Preserve governance."],
    validation_requirements: ["dependency-validation", "package-identity", "permission-boundary"],
    documentation_requirements: ["docs/output.md"], completion_criteria: ["Complete."],
    human_approval_required: true as const, recommendation_digest: "a".repeat(64),
    timestamp: "2026-07-31T00:00:00.000Z",
  };
  const executionPackage: CodexExecutionPackage = {
    ...packageBody, digest: artifactDigest(packageBody),
  };
  const taskBody = {
    task_id: "TASK-001", package_id: executionPackage.package_id,
    milestone_id: executionPackage.milestone_id, context_identity: "c".repeat(64),
    authorization_reference: "APPROVAL-001", execution_authorization_id: "AUTH-001",
    provider_id: "PROVIDER-001", provider_contract_id: "CONTRACT-001",
    assigned_agent: "AGENT-001", allowed_scope: ["docs/output.md"],
    prohibited_scope: ["pbos/runtime"], required_capabilities: ["CODE_GENERATION"],
    validation_requirements: [...executionPackage.validation_requirements],
    evidence_requirements: ["COMMAND_INVENTORY"],
  };
  const task: ExecutionTask = { ...taskBody, digest: artifactDigest(taskBody) };
  const authorityBody = {
    execution_authority_id: "AUTHORITY-001", package_id: executionPackage.package_id,
    package_digest: executionPackage.digest, package_certification_digest: "b".repeat(64),
    context_id: "CONTEXT-001", context_digest: "c".repeat(64),
    approval_id: "APPROVAL-001", approval_digest: "d".repeat(64), agent_id: "AGENT-001",
    agent_digest: "e".repeat(64), scope: ["docs/output.md"],
    blocked_operations: ["pbos/runtime"], required_capabilities: ["CODE_GENERATION"],
    evidence_requirements: ["COMMAND_INVENTORY"], risk_level: "YELLOW" as const,
    authorization_time: "2026-07-31T00:00:00.000Z",
    expiration_time: "2026-08-01T00:00:00.000Z", authority_status: "AUTHORIZED" as const,
  };
  const authority: ExecutionAuthorityRecord = {
    ...authorityBody, digest: artifactDigest(authorityBody),
  };
  const authorizationBody = {
    authorization_id: "AUTH-001", package_id: executionPackage.package_id,
    package_digest: executionPackage.digest, repository_identity: "repo",
    branch_identity: "main", commit_identity: "f".repeat(40),
    context_digest: "c".repeat(64), provider_id: "PROVIDER-001",
    provider_contract_id: "CONTRACT-001", agent_id: "AGENT-001",
    provider_contract_digest: "1".repeat(64), allowed_actions: ["docs/output.md"],
    prohibited_actions: ["pbos/runtime"], expiration: "2026-08-01T00:00:00.000Z",
    evidence_requirements: ["COMMAND_INVENTORY"], trusted_context_identity: "CONTEXT-001",
    created_by: "requester", approved_by: "reviewer", status: "AUTHORIZED" as const,
    issued_at: "2026-07-31T00:00:00.000Z",
  };
  const authorization: ExecutionAuthorization = {
    ...authorizationBody, digest: artifactDigest(authorizationBody),
  };
  const context: TrustedBuildContext = {
    context_id: "CONTEXT-001", repository_identity: "repo",
    commit_identity: "f".repeat(40), branch_identity: "main",
    manifest_digest: "1".repeat(64), artifact_digest: "2".repeat(64),
    architecture_digest: "3".repeat(64), governance_digest: "4".repeat(64),
    change_boundary_identity: "5".repeat(64), launch_approval_identity: "6".repeat(64),
    activation_decision_id: "ACTIVATION-001", created_timestamp: "2026-07-31T00:00:00.000Z",
    expiration_timestamp: "2026-08-01T00:00:00.000Z", created_by: "reviewer",
    digest: "c".repeat(64),
  };
  const approval: ApprovalRecord = {
    approval_id: "APPROVAL-001", request_id: "REQUEST-001",
    package_id: executionPackage.package_id, package_digest: executionPackage.digest,
    context_digest: context.digest, requested_by: "requester", approved_by: "reviewer",
    authority_type: "HUMAN", risk_level: "YELLOW", scope: ["docs/output.md"],
    decision: "APPROVED", timestamp: "2026-07-31T00:00:00.000Z",
    expiration: "2026-08-01T00:00:00.000Z", digest: "7".repeat(64),
  };
  const assignmentBody = {
    task, assigned: true, authority: "PBOS-TASK-ASSIGNMENT" as const, findings: [],
  };
  const assignment: TaskAssignment = {
    ...assignmentBody, digest: artifactDigest(assignmentBody),
  };
  return {
    rootDir, task, package: executionPackage, authority, authorization,
    context, approval, assignment,
    artifacts: [{
      path: "docs/output.md",
      digest: artifactDigest(Buffer.from("validated output")),
    }],
  };
}

describe("post-execution constitutional validation", () => {
  it("validates dependencies, package identity, and permission boundaries", () => {
    const results = evaluateExecutionValidations({
      ...fixture(), provider_validation_results: [],
    });
    expect(results.map(({ status }) => status)).toEqual(["PASS", "PASS", "PASS"]);
  });

  it("fails permission validation when authorization identity differs", () => {
    const value = fixture();
    const results = evaluateExecutionValidations({
      ...value,
      authorization: { ...value.authorization, authorization_id: "OTHER" },
      provider_validation_results: [],
    });
    expect(results.find(({ validation_id }) => validation_id === "permission-boundary"))
      .toEqual(expect.objectContaining({ status: "FAIL" }));
  });

  it("fails package validation when artifact content no longer matches", () => {
    const value = fixture();
    writeFileSync(path.join(value.rootDir, "docs/output.md"), "modified");
    const results = evaluateExecutionValidations({
      ...value, provider_validation_results: [],
    });
    expect(results.find(({ validation_id }) => validation_id === "package-identity"))
      .toEqual(expect.objectContaining({ status: "FAIL" }));
  });

  it("safely revalidates a previously successful execution without redispatch", () => {
    const value = fixture();
    const telemetryBody = {
      version: "1.0.0" as const, owner: "execution-provider-telemetry" as const,
      execution_id: "EXEC-001", provider: value.authorization.provider_id,
      task: value.task.task_id, milestone: value.task.milestone_id,
      phase: "PROVIDER_EXECUTION" as const, status: "COMPLETED" as const,
      started_at: "2026-07-31T00:00:00.000Z", updated_at: "2026-07-31T00:01:00.000Z",
      completed_at: "2026-07-31T00:01:00.000Z",
      last_provider_event: "PROVIDER_COMPLETED" as const,
      events: [{ sequence: 1, type: "PROVIDER_COMPLETED" as const,
        timestamp: "2026-07-31T00:01:00.000Z", elapsed_ms: 60_000, detail: "Completed." }],
      completion_state: "SUCCEEDED" as const,
    };
    const telemetry: ExecutionTelemetry = {
      ...telemetryBody, digest: artifactDigest(telemetryBody),
    };
    Runtime.save(
      path.join(value.rootDir, Artifacts.executionTelemetry),
      telemetry,
      "execution-provider-telemetry"
    );
    const failedValidationBody = {
      validation_id: "package-identity", status: "FAIL" as const,
      validator: "legacy", findings: ["Not evaluated."], evidence_digest: "8".repeat(64),
    };
    const prior = buildExecutionEvidence({
      result: {
        execution_id: "EXEC-001", task_id: value.task.task_id,
        agent_id: value.task.assigned_agent, status: "SUCCEEDED",
        artifacts: value.artifacts, validation_results: [],
        evidence_references: ["COMMAND_INVENTORY"], provider_telemetry: telemetry,
        provider_exit_status: 0, started_at: telemetry.started_at,
        completed_at: telemetry.completed_at ?? telemetry.updated_at, digest: "9".repeat(64),
      },
      package_id: value.package.package_id, milestone_id: value.package.milestone_id,
      package_digest: value.package.digest, context_digest: value.context.digest,
      approval_id: value.approval.approval_id,
      authorization_id: value.authorization.authorization_id,
      authority_digest: value.authority.digest, provider_id: value.authorization.provider_id,
      provider_contract_id: value.authorization.provider_contract_id,
      assigned_agent_id: value.task.assigned_agent,
      required_validations: value.task.validation_requirements,
      required_evidence: value.task.evidence_requirements,
      validation_evidence: [{
        ...failedValidationBody, digest: artifactDigest(failedValidationBody),
      }],
    });
    expect(prior.completion.evidence_status).toBe("INVALID");
    const recovered = revalidateExecutionEvidence({
      ...value,
      evidence: prior,
    });
    expect(recovered.completion.evidence_status).toBe("VALIDATED");
    expect(recovered.completion.advancement_eligible).toBe(true);
  });
});
