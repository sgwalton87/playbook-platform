export type CampaignStatus = "PROPOSED" | "ACTIVE" | "COMPLETE" | "PAUSED" | "EXPIRED" | "REVOKED";
export type CampaignPackageStatus = "PENDING" | "AUTHORIZED" | "COMPLETE" | "FAILED";

export interface CampaignPackage {
  readonly position: number;
  readonly milestone_id: string;
  readonly package_digest: string;
  readonly risk_level: "GREEN" | "YELLOW";
  readonly dependencies: readonly string[];
  readonly allowed_paths: readonly string[];
  readonly required_validations: readonly string[];
}

export interface ExecutionCampaign {
  readonly campaign_id: string;
  readonly repository_identity: string;
  readonly branch_identity: string;
  readonly provider_id: "PBOS-CODEX-CODE-001";
  readonly maximum_packages: number;
  readonly aggregate_risk: number;
  readonly packages: readonly CampaignPackage[];
  readonly prohibited_actions: readonly string[];
  readonly stop_conditions: readonly string[];
  readonly created_at: string;
  readonly status: CampaignStatus;
  readonly digest: string;
}

export interface CampaignApproval {
  readonly approval_id: string;
  readonly campaign_id: string;
  readonly campaign_digest: string;
  readonly requester_identity: string;
  readonly reviewer_identity: string;
  readonly decision: "APPROVED" | "REJECTED";
  readonly reason: string;
  readonly risk_acknowledgment: string;
  readonly timestamp: string;
  readonly expiration: string;
  readonly digest: string;
}

export interface CampaignProgressEntry {
  readonly milestone_id: string;
  readonly package_digest: string;
  readonly status: CampaignPackageStatus;
  readonly execution_authorization_id: string | null;
  readonly updated_at: string;
}

export interface CampaignProgress {
  readonly campaign_id: string;
  readonly campaign_digest: string;
  readonly entries: readonly CampaignProgressEntry[];
  readonly digest: string;
}

export interface CampaignAuthorizationAssessment {
  readonly valid: boolean;
  readonly campaign: ExecutionCampaign | null;
  readonly approval: CampaignApproval | null;
  readonly package: CampaignPackage | null;
  readonly findings: readonly string[];
}
