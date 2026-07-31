import type { ApprovalRecord } from "../../authority";
import type { TrustedBuildContext } from "../../context/activation";
import type { CodexExecutionPackage } from "../../orchestration";
import type { ExecutionAuthorization, ExecutionAuthorityRecord } from "../authority";
import { loadExecutionTelemetry } from "../providers";
import type { TaskAssignment } from "../tasks";
import { buildExecutionEvidence } from "./builder";
import type { ExecutionEvidenceBundle } from "./types";
import { evaluateExecutionValidations } from "./validation";

export function revalidateExecutionEvidence(input: {
  readonly rootDir: string;
  readonly evidence: ExecutionEvidenceBundle;
  readonly context: TrustedBuildContext;
  readonly package: CodexExecutionPackage;
  readonly approval: ApprovalRecord;
  readonly authority: ExecutionAuthorityRecord;
  readonly authorization: ExecutionAuthorization;
  readonly assignment: TaskAssignment;
}): ExecutionEvidenceBundle {
  const telemetry = loadExecutionTelemetry(input.rootDir);
  const record = input.evidence.record;
  const identityFindings = [
    ...(record.task_id !== input.assignment.task.task_id
      ? ["Recovered evidence task identity does not match."]
      : []),
    ...(record.package_digest !== input.package.digest
      ? ["Recovered evidence package identity does not match."]
      : []),
    ...(record.context_digest !== input.context.digest
      ? ["Recovered evidence context identity does not match."]
      : []),
    ...(record.approval_id !== input.approval.approval_id ||
    record.authorization_id !== input.authorization.authorization_id
      ? ["Recovered evidence authorization chain does not match."]
      : []),
    ...(record.provider_id !== input.authorization.provider_id ||
    record.provider_contract_id !== input.authorization.provider_contract_id ||
    record.agent_id !== input.authorization.agent_id
      ? ["Recovered evidence provider chain does not match."]
      : []),
    ...(!telemetry || telemetry.execution_id !== record.execution_id
      ? ["Recovered provider telemetry identity does not match."]
      : []),
  ];
  if (identityFindings.length > 0 || !telemetry) {
    throw new Error(`Execution evidence recovery rejected: ${identityFindings.join(" ")}`);
  }
  const providerResult = {
    execution_id: record.execution_id,
    task_id: record.task_id,
    agent_id: record.agent_id,
    status: record.status,
    artifacts: record.artifacts,
    validation_results: record.validation_results,
    evidence_references: record.evidence_references,
    provider_telemetry: telemetry,
    provider_exit_status: telemetry.completion_state === "SUCCEEDED" ? 0 : null,
    started_at: telemetry.started_at,
    completed_at: record.completed_at,
    digest: record.digest,
  };
  const validationEvidence = evaluateExecutionValidations({
    rootDir: input.rootDir,
    task: input.assignment.task,
    package: input.package,
    authority: input.authority,
    authorization: input.authorization,
    artifacts: record.artifacts,
    provider_validation_results: record.validation_results,
  });
  return buildExecutionEvidence({
    result: providerResult,
    package_id: input.package.package_id,
    milestone_id: input.package.milestone_id,
    package_digest: input.package.digest,
    context_digest: input.context.digest,
    approval_id: input.approval.approval_id,
    authorization_id: input.authorization.authorization_id,
    authority_digest: input.authority.digest,
    provider_id: input.authorization.provider_id,
    provider_contract_id: input.authorization.provider_contract_id,
    assigned_agent_id: input.assignment.task.assigned_agent,
    required_validations: input.assignment.task.validation_requirements,
    required_evidence: input.assignment.task.evidence_requirements,
    validation_evidence: validationEvidence,
  });
}
