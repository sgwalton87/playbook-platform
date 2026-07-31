import { artifactDigest } from "../../kernel/identity";
import type { AgentExecutionResult } from "../adapters";
import type { ExecutionEvidenceBundle } from "./types";
import type { ExecutionValidationEvidence } from "./validation";

export function buildExecutionEvidence(input: {
  readonly result: AgentExecutionResult;
  readonly package_digest: string;
  readonly package_id: string;
  readonly milestone_id: string;
  readonly context_digest: string;
  readonly approval_id: string;
  readonly authorization_id: string;
  readonly authority_digest: string;
  readonly provider_id: string;
  readonly provider_contract_id: string;
  readonly assigned_agent_id: string;
  readonly required_validations: readonly string[];
  readonly required_evidence: readonly string[];
  readonly validation_evidence: readonly ExecutionValidationEvidence[];
}): ExecutionEvidenceBundle {
  const durationMs = Date.parse(input.result.completed_at) - Date.parse(input.result.started_at);
  const recordBody = {
    execution_id: input.result.execution_id,
    task_id: input.result.task_id,
    package_id: input.package_id,
    milestone_id: input.milestone_id,
    package_digest: input.package_digest,
    context_digest: input.context_digest,
    approval_id: input.approval_id,
    authorization_id: input.authorization_id,
    authority_digest: input.authority_digest,
    provider_id: input.provider_id,
    provider_contract_id: input.provider_contract_id,
    agent_id: input.result.agent_id,
    assigned_agent_id: input.assigned_agent_id,
    status: input.result.status,
    artifacts: input.result.artifacts,
    validation_results: input.validation_evidence
      .filter(({ status }) => status === "PASS")
      .map(({ validation_id }) => validation_id),
    validation_evidence: input.validation_evidence,
    evidence_references: [
      ...input.result.evidence_references,
      `EXECUTION_VALIDATION:${artifactDigest(input.validation_evidence)}`,
    ],
    started_at: input.result.started_at,
    completed_at: input.result.completed_at,
    duration_ms: durationMs,
    provider_exit_status: input.result.provider_exit_status,
    provider_telemetry_digest: input.result.provider_telemetry?.digest ?? null,
    provider_lifecycle_events: input.result.provider_telemetry?.events ?? [],
    artifact_inventory_digest: artifactDigest(input.result.artifacts),
  };
  const record = { ...recordBody, digest: artifactDigest(recordBody) };
  const findings = [
    ...(input.result.status !== "SUCCEEDED" ? ["Execution did not succeed."] : []),
    ...(!input.approval_id || !input.authorization_id || !input.authority_digest
      ? ["Execution authority identity chain is incomplete."]
      : []),
    ...(input.result.task_id === "" || input.result.agent_id !== input.assigned_agent_id
      ? ["Provider execution identity does not match assignment."]
      : []),
    ...(!input.result.provider_telemetry
      ? ["Provider completion telemetry is missing."]
      : []),
    ...(input.result.provider_telemetry &&
    (input.result.provider_telemetry.execution_id !== input.result.execution_id ||
      input.result.provider_telemetry.task !== input.result.task_id ||
      input.result.provider_telemetry.provider !== input.provider_id ||
      input.result.provider_telemetry.milestone !== input.milestone_id)
      ? ["Provider telemetry identity chain does not match."]
      : []),
    ...(input.result.provider_telemetry &&
    (input.result.provider_telemetry.status !== "COMPLETED" ||
      input.result.provider_telemetry.completion_state !== "SUCCEEDED" ||
      input.result.provider_telemetry.events.filter(({ type }) => type === "PROVIDER_COMPLETED").length !== 1 ||
      input.result.provider_telemetry.events.some(({ type }) => type === "PROVIDER_FAILED"))
      ? ["Provider completion lifecycle is invalid."]
      : []),
    ...(input.result.provider_exit_status !== 0
      ? ["Provider exit status is not successful."]
      : []),
    ...(!Number.isFinite(durationMs) || durationMs < 0
      ? ["Execution timeline is invalid."]
      : []),
    ...input.required_validations
      .filter((validation) =>
        !input.validation_evidence.some(
          (item) => item.validation_id === validation && item.status === "PASS"
        )
      )
      .map((validation) => `Validation result missing: ${validation}.`),
    ...input.required_evidence
      .filter((evidence) => !input.result.evidence_references.includes(evidence))
      .map((evidence) => `Evidence reference missing: ${evidence}.`),
    ...(input.result.artifacts.length === 0 ? ["Artifact inventory is empty."] : []),
  ];
  const completionBody = {
    execution_id: input.result.execution_id,
    complete: findings.length === 0,
    advancement_eligible: findings.length === 0,
    evidence_status: findings.length === 0 ? "VALIDATED" as const : "INVALID" as const,
    findings,
  };
  const completion = {
    ...completionBody,
    digest: artifactDigest(completionBody),
  };
  const body = { record, completion };
  return { ...body, digest: artifactDigest(body) };
}
