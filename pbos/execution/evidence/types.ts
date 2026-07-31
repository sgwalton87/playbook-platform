import type { AgentExecutionArtifact, AgentExecutionResult } from "../adapters";
import type { ProviderExecutionEvent } from "../providers";
import type { ExecutionValidationEvidence } from "./validation";

export interface ExecutionRecord {
  readonly execution_id: string;
  readonly task_id: string;
  readonly package_id: string;
  readonly milestone_id: string;
  readonly package_digest: string;
  readonly context_digest: string;
  readonly approval_id: string;
  readonly authorization_id: string;
  readonly authority_digest: string;
  readonly provider_id: string;
  readonly provider_contract_id: string;
  readonly agent_id: string;
  readonly assigned_agent_id: string;
  readonly status: AgentExecutionResult["status"];
  readonly artifacts: readonly AgentExecutionArtifact[];
  readonly validation_results: readonly string[];
  readonly validation_evidence: readonly ExecutionValidationEvidence[];
  readonly evidence_references: readonly string[];
  readonly started_at: string;
  readonly completed_at: string;
  readonly duration_ms: number;
  readonly provider_exit_status: number | null;
  readonly provider_telemetry_digest: string | null;
  readonly provider_lifecycle_events: readonly ProviderExecutionEvent[];
  readonly artifact_inventory_digest: string;
  readonly digest: string;
}

export interface CompletionAssessment {
  readonly execution_id: string;
  readonly complete: boolean;
  readonly advancement_eligible: boolean;
  readonly evidence_status: "VALIDATED" | "INVALID";
  readonly findings: readonly string[];
  readonly digest: string;
}

export interface ExecutionEvidenceBundle {
  readonly record: ExecutionRecord;
  readonly completion: CompletionAssessment;
  readonly digest: string;
}
