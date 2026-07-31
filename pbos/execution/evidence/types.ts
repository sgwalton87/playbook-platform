import type { AgentExecutionArtifact, AgentExecutionResult } from "../adapters";

export interface ExecutionRecord {
  readonly execution_id: string;
  readonly task_id: string;
  readonly package_digest: string;
  readonly context_digest: string;
  readonly approval_id: string;
  readonly authorization_id: string;
  readonly provider_id: string;
  readonly provider_contract_id: string;
  readonly agent_id: string;
  readonly status: AgentExecutionResult["status"];
  readonly artifacts: readonly AgentExecutionArtifact[];
  readonly validation_results: readonly string[];
  readonly evidence_references: readonly string[];
  readonly completed_at: string;
  readonly digest: string;
}

export interface CompletionAssessment {
  readonly execution_id: string;
  readonly complete: boolean;
  readonly advancement_eligible: boolean;
  readonly findings: readonly string[];
  readonly digest: string;
}

export interface ExecutionEvidenceBundle {
  readonly record: ExecutionRecord;
  readonly completion: CompletionAssessment;
  readonly digest: string;
}
