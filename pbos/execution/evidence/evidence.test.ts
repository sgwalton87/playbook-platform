import { describe, expect, it } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { artifactDigest } from "../../kernel/identity";
import type { CodexExecutionPackage } from "../../orchestration";
import type { AgentExecutionResult } from "../adapters";
import type { ExecutionTelemetry } from "../providers";
import { assessMilestoneAdvancement } from "./advancement";
import { buildExecutionEvidence } from "./builder";
import { persistMilestoneAdvancement } from "./lifecycle";
import { persistExecutionEvidence } from "./store";
import type { ExecutionValidationEvidence } from "./validation";

function executionPackage(): CodexExecutionPackage {
  const body = {
    package_id: "PACKAGE-001",
    milestone_id: "MILESTONE-001",
    mission: "Implement.",
    context: ["context"],
    current_state: ["ready"],
    dependencies: [],
    required_changes: ["docs/output.md"],
    implementation_requirements: ["Implement."],
    security_requirements: ["Preserve governance."],
    validation_requirements: ["package-identity"],
    documentation_requirements: ["docs/output.md"],
    completion_criteria: ["Tests pass."],
    human_approval_required: true as const,
    recommendation_digest: "d".repeat(64),
    timestamp: "2026-07-31T00:00:00.000Z",
  };
  return { ...body, digest: artifactDigest(body) };
}

function telemetry(overrides: Partial<ExecutionTelemetry> = {}): ExecutionTelemetry {
  const event = {
    sequence: 1,
    type: "PROVIDER_COMPLETED" as const,
    timestamp: "2026-07-31T00:01:00.000Z",
    elapsed_ms: 60_000,
    detail: "Completed.",
  };
  const body = {
    version: "1.0.0" as const,
    owner: "execution-provider-telemetry" as const,
    execution_id: "EXEC-001",
    provider: "PROVIDER-001",
    task: "TASK-001",
    milestone: "MILESTONE-001",
    phase: "PROVIDER_EXECUTION" as const,
    status: "COMPLETED" as const,
    started_at: "2026-07-31T00:00:00.000Z",
    updated_at: "2026-07-31T00:01:00.000Z",
    completed_at: "2026-07-31T00:01:00.000Z",
    last_provider_event: "PROVIDER_COMPLETED" as const,
    events: [event],
    completion_state: "SUCCEEDED" as const,
    ...overrides,
  };
  return { ...body, digest: artifactDigest(body) };
}

function validation(status: "PASS" | "FAIL" = "PASS"): ExecutionValidationEvidence {
  const body = {
    validation_id: "package-identity",
    status,
    validator: "pbos.execution.package-identity.v1",
    findings: status === "PASS" ? [] : ["Failed."],
    evidence_digest: "e".repeat(64),
  };
  return { ...body, digest: artifactDigest(body) };
}

function providerResult(overrides: Partial<AgentExecutionResult> = {}): AgentExecutionResult {
  const body = {
    execution_id: "EXEC-001",
    task_id: "TASK-001",
    agent_id: "AGENT-001",
    status: "SUCCEEDED" as const,
    artifacts: [{ path: "docs/output.md", digest: "a".repeat(64) }],
    validation_results: [],
    evidence_references: ["COMMAND_INVENTORY", "FILE_CHANGE_INVENTORY"],
    provider_telemetry: telemetry(),
    provider_exit_status: 0,
    started_at: "2026-07-31T00:00:00.000Z",
    completed_at: "2026-07-31T00:01:00.000Z",
    ...overrides,
  };
  return { ...body, digest: artifactDigest(body) };
}

function evidence(input: {
  result?: AgentExecutionResult;
  validations?: readonly ExecutionValidationEvidence[];
  requiredEvidence?: readonly string[];
  authorizationId?: string;
}) {
  const pkg = executionPackage();
  return buildExecutionEvidence({
    result: input.result ?? providerResult(),
    package_id: pkg.package_id,
    milestone_id: pkg.milestone_id,
    package_digest: pkg.digest,
    context_digest: "c".repeat(64),
    approval_id: "APPROVAL-001",
    authorization_id: input.authorizationId ?? "AUTHORIZATION-001",
    authority_digest: "f".repeat(64),
    provider_id: "PROVIDER-001",
    provider_contract_id: "PROVIDER-CONTRACT-001",
    assigned_agent_id: "AGENT-001",
    required_validations: ["package-identity"],
    required_evidence: input.requiredEvidence ?? ["COMMAND_INVENTORY", "FILE_CHANGE_INVENTORY"],
    validation_evidence: input.validations ?? [validation()],
  });
}

describe("execution evidence", () => {
  it("permits advancement for a successful provider with complete validated evidence", () => {
    const value = evidence({});
    expect(value.completion.evidence_status).toBe("VALIDATED");
    expect(value.completion.advancement_eligible).toBe(true);
    expect(assessMilestoneAdvancement({ package: executionPackage(), evidence: value }).eligible).toBe(true);
  });

  it("fails closed when command inventory is missing", () => {
    const result = providerResult({ evidence_references: ["FILE_CHANGE_INVENTORY"] });
    expect(evidence({ result }).completion.findings).toContain("Evidence reference missing: COMMAND_INVENTORY.");
  });

  it("fails closed when file change inventory is missing", () => {
    const result = providerResult({ evidence_references: ["COMMAND_INVENTORY"] });
    expect(evidence({ result }).completion.findings).toContain("Evidence reference missing: FILE_CHANGE_INVENTORY.");
  });

  it("fails closed when provider completion telemetry is absent", () => {
    expect(evidence({ result: providerResult({ provider_telemetry: null }) }).completion.evidence_status).toBe("INVALID");
  });

  it("fails closed when constitutional validation evidence fails", () => {
    expect(evidence({ validations: [validation("FAIL")] }).completion.findings).toContain("Validation result missing: package-identity.");
  });

  it("fails closed for duplicate provider completion events", () => {
    const value = telemetry();
    const duplicate = telemetry({ events: [...value.events, ...value.events] });
    expect(evidence({ result: providerResult({ provider_telemetry: duplicate }) }).completion.evidence_status).toBe("INVALID");
  });

  it("fails closed when authorization evidence is absent", () => {
    expect(evidence({ authorizationId: "" }).completion.findings).toContain(
      "Execution authority identity chain is incomplete."
    );
  });

  it("rejects an evidence digest mismatch", () => {
    const value = evidence({});
    expect(() => persistExecutionEvidence(
      mkdtempSync(path.join(tmpdir(), "pbos-evidence-")),
      { ...value, digest: "0".repeat(64) }
    )).toThrow("persistence rejected");
  });

  it("does not create duplicate advancement for the same completion evidence", () => {
    const rootDir = mkdtempSync(path.join(tmpdir(), "pbos-advancement-"));
    const value = evidence({});
    const pkg = executionPackage();
    const assessment = assessMilestoneAdvancement({ package: pkg, evidence: value });
    const first = persistMilestoneAdvancement({
      rootDir, package: pkg, assessment, authorized_by: "reviewer",
      timestamp: "2026-07-31T00:01:00.000Z",
    });
    const second = persistMilestoneAdvancement({
      rootDir, package: pkg, assessment, authorized_by: "reviewer",
      timestamp: "2026-07-31T00:02:00.000Z",
    });
    expect(second.latest.digest).toBe(first.latest.digest);
    expect(second.history).toHaveLength(0);
  });
});
