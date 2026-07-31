export type ExecutionAuthorityStatus = "AUTHORIZED" | "EXPIRED" | "REVOKED";

export interface ExecutionAuthorityRecord {
  readonly execution_authority_id: string;
  readonly package_id: string;
  readonly package_digest: string;
  readonly package_certification_digest: string;
  readonly context_id: string;
  readonly context_digest: string;
  readonly approval_id: string;
  readonly approval_digest: string;
  readonly agent_id: string;
  readonly agent_digest: string;
  readonly scope: readonly string[];
  readonly blocked_operations: readonly string[];
  readonly required_capabilities: readonly string[];
  readonly evidence_requirements: readonly string[];
  readonly risk_level: "GREEN" | "YELLOW" | "RED";
  readonly authorization_time: string;
  readonly expiration_time: string;
  readonly authority_status: ExecutionAuthorityStatus;
  readonly digest: string;
}

export interface ExecutionAuthorityValidation {
  readonly valid: boolean;
  readonly findings: readonly string[];
}

export interface ExecutionAuthorityHistory {
  readonly owner: "execution-authority";
  readonly latest: ExecutionAuthorityRecord;
  readonly history: readonly ExecutionAuthorityRecord[];
  readonly digest: string;
}

export interface ExecutionAuthorization {
  readonly authorization_id: string;
  readonly package_id: string;
  readonly package_digest: string;
  readonly repository_identity: string;
  readonly branch_identity: string;
  readonly commit_identity: string;
  readonly context_digest: string;
  readonly provider_id: string;
  readonly provider_contract_digest: string;
  readonly allowed_actions: readonly string[];
  readonly prohibited_actions: readonly string[];
  readonly expiration: string;
  readonly evidence_requirements: readonly string[];
  readonly trusted_context_identity: string;
  readonly created_by: string;
  readonly approved_by: string;
  readonly status: "AUTHORIZED";
  readonly issued_at: string;
  readonly digest: string;
}
