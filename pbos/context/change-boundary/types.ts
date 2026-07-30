export type ChangeType = "ADDED" | "MODIFIED" | "DELETED" | "RENAMED";
export type ChangeRisk = "GREEN" | "YELLOW" | "RED";
export type ChangeApprovalStatus =
  | "APPROVED_CANDIDATE"
  | "REVIEW_REQUIRED"
  | "EXCLUDED";

export interface ChangeInventoryItem {
  readonly file_path: string;
  readonly change_type: ChangeType;
  readonly owner: string;
  readonly domain: string;
  readonly risk_level: ChangeRisk;
  readonly dependency: string;
  readonly approval_status: ChangeApprovalStatus;
  readonly content_digest: string;
}

export interface ChangeInventory {
  readonly inventory_id: string;
  readonly repository_identity: string;
  readonly commit_identity: string;
  readonly branch_identity: string;
  readonly content_identity: string;
  readonly changes: readonly ChangeInventoryItem[];
  readonly timestamp: string;
  readonly digest: string;
}

export interface ChangeBoundaryDeclaration {
  readonly boundary_id: string;
  readonly repository_identity: string;
  readonly commit_identity: string;
  readonly branch_identity: string;
  readonly requester_identity: string;
  readonly inventory_digest: string;
  readonly inventory_identity: string;
  readonly approved_files: readonly string[];
  readonly included_files: readonly string[];
  readonly excluded_files: readonly string[];
  readonly scope_digest: string;
  readonly purpose: string;
  readonly business_purpose: string;
  readonly technical_purpose: string;
  readonly owner_identity: string;
  readonly risk_acknowledgment: string;
  readonly creation_timestamp: string;
  readonly created_at: string;
  readonly expiration_timestamp: string;
  readonly expiration: string;
  readonly digest: string;
}

export interface ChangeBoundaryValidation {
  readonly valid: boolean;
  readonly findings: readonly string[];
}

export interface ChangeBoundaryHistory {
  readonly owner: "change-boundary-authority";
  readonly latest: ChangeBoundaryDeclaration;
  readonly history: readonly ChangeBoundaryDeclaration[];
  readonly digest: string;
}

export interface ChangeBoundaryAssessmentItem {
  readonly file_path: string;
  readonly classification: "INCLUDE" | "EXCLUDE" | "REVIEW_REQUIRED";
  readonly domain: string;
  readonly risk: ChangeRisk;
  readonly recommendation: "INCLUDE" | "EXCLUDE" | "REVIEW_REQUIRED";
  readonly reason: string;
}

export interface ChangeBoundaryAssessment {
  readonly boundary_id: string;
  readonly repository_identity: string;
  readonly commit_identity: string;
  readonly branch_identity: string;
  readonly changed_file_count: number;
  readonly scope_digest: string;
  readonly included_files: readonly string[];
  readonly excluded_files: readonly string[];
  readonly change_summary: readonly ChangeBoundaryAssessmentItem[];
  readonly risk_level: ChangeRisk;
  readonly classification_summary: Readonly<Record<
    "INCLUDE" | "EXCLUDE" | "REVIEW_REQUIRED",
    number
  >>;
  readonly owner_identity: string;
  readonly created_at: string;
  readonly digest: string;
}
