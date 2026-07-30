export type AuthorizationRisk = "GREEN" | "YELLOW" | "RED";
export type HumanAuthorizationDecision = "PENDING" | "APPROVED" | "DENIED";

export interface AuthorizationRequest {
  readonly request_id: string;
  readonly requester: string;
  readonly action: string;
  readonly package_id: string;
  readonly package_digest: string;
  readonly risk_level: AuthorizationRisk;
  readonly impact: string;
  readonly evidence: readonly string[];
  readonly timestamp: string;
  readonly digest: string;
}

export interface AuthorizationDecision {
  readonly request_id: string;
  readonly decision: HumanAuthorizationDecision;
  readonly approver: string | null;
  readonly reason: string | null;
  readonly timestamp: string;
  readonly expires_at: string | null;
  readonly request_digest: string;
  readonly digest: string;
}

export interface AuthorizationEvidence {
  readonly request: AuthorizationRequest;
  readonly decision: AuthorizationDecision;
  readonly valid: boolean;
  readonly findings: readonly string[];
  readonly digest: string;
}
