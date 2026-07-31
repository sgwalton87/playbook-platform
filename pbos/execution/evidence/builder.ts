import { artifactDigest } from "../../kernel/identity";
import type { AgentExecutionResult } from "../adapters";
import type { ExecutionEvidenceBundle } from "./types";

export function buildExecutionEvidence(input: {
  readonly result: AgentExecutionResult;
  readonly package_digest: string;
  readonly context_digest: string;
  readonly approval_id: string;
  readonly authorization_id: string;
  readonly provider_id: string;
  readonly provider_contract_id: string;
  readonly required_validations: readonly string[];
  readonly required_evidence: readonly string[];
}): ExecutionEvidenceBundle {
  const recordBody = {
    execution_id: input.result.execution_id,
    task_id: input.result.task_id,
    package_digest: input.package_digest,
    context_digest: input.context_digest,
    approval_id: input.approval_id,
    authorization_id: input.authorization_id,
    provider_id: input.provider_id,
    provider_contract_id: input.provider_contract_id,
    agent_id: input.result.agent_id,
    status: input.result.status,
    artifacts: input.result.artifacts,
    validation_results: input.result.validation_results,
    evidence_references: input.result.evidence_references,
    completed_at: input.result.completed_at,
  };
  const record = { ...recordBody, digest: artifactDigest(recordBody) };
  const findings = [
    ...(input.result.status !== "SUCCEEDED" ? ["Execution did not succeed."] : []),
    ...input.required_validations
      .filter((validation) => !input.result.validation_results.includes(validation))
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
    findings,
  };
  const completion = {
    ...completionBody,
    digest: artifactDigest(completionBody),
  };
  const body = { record, completion };
  return { ...body, digest: artifactDigest(body) };
}
