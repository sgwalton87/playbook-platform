import { describe, expect, it } from "vitest";
import { artifactDigest } from "../kernel/identity";
import {
  HumanAuthorizationGateway,
  type AuthorizationRequest,
} from "../orchestration/authorization";
import type { CodexExecutionPackage } from "../orchestration/execution-packages";
import { DurableDecisionHistory } from "../orchestration/history";
import { observeExecution } from "../orchestration/observability";
import { IsolatedImplementationRunner } from "../orchestration/runner";
import { buildTruthLineage, createEvidenceRecord, EvidenceHistory } from ".";

const now = "2026-07-30T12:00:00.000Z";
const temporal = {
  effective_at: now,
  observed_at: now,
  recorded_at: now,
  superseded_at: null,
};

function executionPackage(): CodexExecutionPackage {
  const body: CodexExecutionPackage = {
    package_id: "PACKAGE-001",
    milestone_id: "MILESTONE-001",
    mission: "Perform approved work.",
    context: ["Trusted context"],
    current_state: ["Approved"],
    dependencies: [],
    required_changes: ["pbos/example.ts"],
    implementation_requirements: ["Preserve governance"],
    security_requirements: ["Fail closed"],
    validation_requirements: ["npm test"],
    documentation_requirements: [],
    completion_criteria: ["Tests pass"],
    human_approval_required: true,
    recommendation_digest: "a".repeat(64),
    timestamp: now,
    digest: "",
  };
  return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
}

describe("PBOS evolution trust and action planes", () => {
  it("rejects evidence without provenance and prevents historical rewriting", () => {
    const input = {
      identity: {
        id: "EVIDENCE-001",
        kind: "EVIDENCE" as const,
        authority: "PBOS-CONSTITUTION",
        organization_scope: "PLAYBOOK",
        version: "1",
      },
      created_by: "ACTOR-001",
      approved_by: null,
      source: {
        id: "SOURCE-001",
        uri: "docs/source.md",
        owner: "OWNER-001",
        authority: "PBOS-CONSTITUTION",
        source_digest: "b".repeat(64),
      },
      temporal,
      content_digest: "c".repeat(64),
      validation: {
        status: "PASS" as const,
        validator: "VALIDATOR-001",
        findings: [],
        validated_at: now,
      },
      lineage: [],
    };
    const record = createEvidenceRecord(input);
    const history = new EvidenceHistory().append(record);
    expect(history.records()).toHaveLength(1);
    expect(() => history.append(record)).toThrow("rewriting");
    expect(() =>
      createEvidenceRecord({
        ...input,
        source: { ...input.source, authority: "" },
      })
    ).toThrow("rejected");
  });

  it("validates complete claim-to-outcome lineage", () => {
    const lineage = buildTruthLineage({
      claim: {
        id: "CLAIM-001",
        statement: "Change is required.",
        authority: "MISSION-AUTHORITY",
        evidence_ids: ["EVIDENCE-001"],
        temporal,
      },
      decision: {
        id: "DECISION-001",
        intent: "Approve change.",
        actor_id: "ACTOR-001",
        authority: "HUMAN-AUTHORITY",
        evidence_ids: ["CLAIM-001"],
        approved_by: "APPROVER-001",
        temporal,
      },
      action: {
        id: "ACTION-001",
        decision_id: "DECISION-001",
        authorization_id: "AUTH-001",
        execution_id: "EXEC-001",
        evidence_ids: ["EXECUTION-EVIDENCE"],
        temporal,
      },
      outcome: {
        id: "OUTCOME-001",
        action_id: "ACTION-001",
        status: "SUCCEEDED",
        evidence_ids: ["OUTCOME-EVIDENCE"],
        temporal,
      },
    });
    expect(lineage.digest).toHaveLength(64);
  });

  it("runs only approved packages inside the declared boundary", async () => {
    const value = executionPackage();
    const requestBody: AuthorizationRequest = {
      request_id: "AUTH-001",
      requester: "REQUESTER-001",
      action: "Execute package.",
      package_id: value.package_id,
      package_digest: value.digest,
      risk_level: "YELLOW",
      impact: "Repository change.",
      evidence: [value.digest],
      timestamp: now,
      digest: "",
    };
    const request = {
      ...requestBody,
      digest: artifactDigest({ ...requestBody, digest: undefined }),
    };
    const authorization = new HumanAuthorizationGateway().decide(
      request,
      "APPROVED",
      "APPROVER-001",
      "Reviewed.",
      now,
      "2099-01-01T00:00:00.000Z"
    );
    const environment = {
      id: "ENV-001",
      isolated: true as const,
      network_access: "NONE" as const,
      writable_roots: ["pbos"],
      prohibited_paths: ["app", "supabase"],
      timeout_ms: 1000,
    };
    const result = await new IsolatedImplementationRunner().run(
      {
        id: "RUN-001",
        package: value,
        authorization,
        kernel_admission_digest: "d".repeat(64),
        requested_by: "ACTOR-001",
        requested_at: now,
      },
      environment,
      {
        async run(executionRequest, executionEnvironment) {
          return {
            execution_id: "EXEC-001",
            request_id: executionRequest.id,
            environment_id: executionEnvironment.id,
            status: "SUCCEEDED",
            artifacts: [
              {
                id: "ARTIFACT-001",
                path: "pbos/example.ts",
                before_digest: null,
                after_digest: "e".repeat(64),
              },
            ],
            validations: ["PASS"],
            failures: [],
            rollback: ["Remove artifact"],
            started_at: now,
            completed_at: now,
          };
        },
      }
    );
    expect(observeExecution(result).health.status).toBe("HEALTHY");
  });

  it("preserves durable decision history without duplicate mutation", () => {
    const input = {
      intent_id: "INTENT-001",
      decision_id: "DECISION-001",
      authorization_id: "AUTH-001",
      execution_id: null,
      outcome_id: null,
      evidence_ids: ["EVIDENCE-001"],
    };
    const history = new DurableDecisionHistory().appendLineage(input);
    expect(() => history.appendLineage(input)).toThrow("rewriting");
  });
});
