import { describe, expect, it } from "vitest";
import { artifactDigest } from "../kernel/identity";
import { ContextRefreshAuthority, type ContextRefreshApproval } from "../context/refresh";
import { HumanAuthorizationGateway, type AuthorizationRequest } from "./authorization";
import { CodexExecutionPackageEngine, type CodexExecutionPackage } from "./execution-packages";
import { GovernedExecutionEngine } from "./execution";
import { ContinuousImprovementEngine } from "./improvement";

const now = "2026-07-30T12:00:00.000Z";

function executionPackage(): CodexExecutionPackage {
  const body: CodexExecutionPackage = {
    package_id: "CODEX-001",
    milestone_id: "MILESTONE-001",
    mission: "Implement the governed milestone.",
    context: ["Repository context."],
    current_state: ["Planning."],
    dependencies: [],
    required_changes: ["pbos/example.ts"],
    implementation_requirements: ["Preserve authority."],
    security_requirements: ["Fail closed."],
    validation_requirements: ["npm test"],
    documentation_requirements: [],
    completion_criteria: ["Tests pass."],
    human_approval_required: true,
    recommendation_digest: "a".repeat(64),
    timestamp: now,
    digest: "",
  };
  return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
}

function request(value: CodexExecutionPackage, risk: "GREEN" | "YELLOW" | "RED"): AuthorizationRequest {
  const body: AuthorizationRequest = {
    request_id: "AUTH-001",
    requester: "REQUESTER-001",
    action: "Implement package.",
    package_id: value.package_id,
    package_digest: value.digest,
    risk_level: risk,
    impact: "Repository changes.",
    evidence: [value.digest],
    timestamp: now,
    digest: "",
  };
  return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
}

describe("governed autonomous development", () => {
  it("requires governed context refresh approval", () => {
    const body: ContextRefreshApproval = {
      request_id: "REFRESH-001",
      state: "REVIEW_REQUIRED",
      reconciliation_digest: "b".repeat(64),
      requested_by: "REQUESTER-001",
      approved_by: null,
      approval_evidence: null,
      reason: "Repository changes were reviewed.",
      timestamp: now,
      digest: "",
    };
    const pending = { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
    expect(() =>
      new ContextRefreshAuthority().transition(
        pending,
        "APPROVED",
        "APPROVER-001",
        null,
        now
      )
    ).toThrow("evidence");
  });

  it("validates deterministic package identity and rejects modification", () => {
    const value = executionPackage();
    const validator = new CodexExecutionPackageEngine();
    expect(validator.validate(value).valid).toBe(true);
    expect(validator.validate({ ...value, mission: "Modified." }).valid).toBe(false);
  });

  it("prevents RED requester self-approval", () => {
    const value = executionPackage();
    expect(() =>
      new HumanAuthorizationGateway().decide(
        request(value, "RED"),
        "APPROVED",
        "REQUESTER-001",
        "Approved.",
        now,
        "2099-01-01T00:00:00.000Z"
      )
    ).toThrow("independent");
  });

  it("executes only a trusted, approved, unchanged package", async () => {
    const value = executionPackage();
    const authorization = new HumanAuthorizationGateway().decide(
      request(value, "YELLOW"),
      "APPROVED",
      "APPROVER-001",
      "Reviewed.",
      now,
      "2099-01-01T00:00:00.000Z"
    );
    const evidence = await new GovernedExecutionEngine().execute(
      {
        trusted_context: true,
        execution_package: value,
        authorization,
        dependencies_satisfied: true,
        validations_passing: true,
      },
      async () => ({
        execution_id: "EXEC-001",
        state: "COMPLETED",
        package_id: value.package_id,
        authorization_id: authorization.decision.digest,
        changes_made: ["Governed change."],
        files_affected: ["pbos/example.ts"],
        validation_results: ["PASS"],
        failures: [],
        rollback_information: ["Not required."],
        completion_evidence: ["TEST-PASS"],
        timestamp: now,
      })
    );
    expect(evidence.state).toBe("COMPLETED");
    await expect(
      new GovernedExecutionEngine().execute(
        {
          trusted_context: false,
          execution_package: value,
          authorization,
          dependencies_satisfied: true,
          validations_passing: true,
        },
        async () => ({ ...evidence, digest: undefined } as never)
      )
    ).rejects.toThrow("rejected");
  });

  it("requires evidence for improvement recommendations", () => {
    const engine = new ContinuousImprovementEngine();
    expect(() =>
      engine.recommend({
        finding: "Validation failed.",
        evidence: [],
        impact: "Work blocked.",
        recommended_action: "Repair validation.",
        confidence: 100,
        timestamp: now,
      })
    ).toThrow("evidence");
  });
});
