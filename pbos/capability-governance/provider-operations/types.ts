export interface ProviderStatusView {
  readonly identity: string;
  readonly provider_identity: string;
  readonly status: string;
  readonly authority: string;
  readonly timestamp: string;
  readonly digest: string;
}

export interface EvidenceStatusView {
  readonly identity: string;
  readonly provider_identity: string;
  readonly evidence_reference: string;
  readonly status: string;
  readonly authority: string;
  readonly expiration: string;
  readonly timestamp: string;
  readonly digest: string;
}

export interface CertificationQueueView {
  readonly identity: string;
  readonly provider_identity: string;
  readonly certification_reference: string;
  readonly status: string;
  readonly authority: string;
  readonly timestamp: string;
  readonly digest: string;
}

export interface RiskFindingView {
  readonly identity: string;
  readonly provider_identity: string;
  readonly severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  readonly status: string;
  readonly authority: string;
  readonly timestamp: string;
  readonly digest: string;
}

export interface ReviewerAssignmentView {
  readonly identity: string;
  readonly provider_identity: string;
  readonly reviewer_identity: string;
  readonly status: string;
  readonly authority: string;
  readonly timestamp: string;
  readonly digest: string;
}

export interface ProviderOperationsSnapshot {
  readonly snapshot_id: string;
  readonly generated_by: string;
  readonly providers: readonly ProviderStatusView[];
  readonly evidence: readonly EvidenceStatusView[];
  readonly certification_queue: readonly CertificationQueueView[];
  readonly risks: readonly RiskFindingView[];
  readonly reviewer_assignments: readonly ReviewerAssignmentView[];
  readonly audit_history: readonly string[];
  readonly timestamp: string;
  readonly digest: string;
}
