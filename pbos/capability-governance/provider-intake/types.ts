import type {
  ProductionProviderType,
  ProviderEvidenceCategory,
} from "../provider-onboarding";

export type ProviderIntakeStatus =
  | "CANDIDATE"
  | "REGISTERED"
  | "EVIDENCE_REQUESTED"
  | "EVIDENCE_SUBMITTED"
  | "EVIDENCE_VALIDATED"
  | "CERTIFICATION_REVIEW_READY";

export interface ProductionProviderIntakeRecord {
  readonly intake_id: string;
  readonly provider_id: string;
  readonly provider_name: string;
  readonly provider_type: ProductionProviderType;
  readonly organization_identity: string;
  readonly ownership_identity: string;
  readonly service_scope: readonly string[];
  readonly requested_capabilities: readonly string[];
  readonly technical_owner: string;
  readonly security_owner: string;
  readonly operational_owner: string;
  readonly authorized_submitters: readonly string[];
  readonly status: ProviderIntakeStatus;
  readonly created_at: string;
  readonly digest: string;
}

export interface ProviderEvidenceRequirementPackage {
  readonly package_id: string;
  readonly provider_id: string;
  readonly categories: readonly ProviderEvidenceCategory[];
  readonly verification_paths: Readonly<
    Partial<Record<ProviderEvidenceCategory, string>>
  >;
  readonly requested_by: string;
  readonly requested_at: string;
  readonly expires_at: string;
  readonly digest: string;
}

export interface ProviderEvidenceSubmission {
  readonly submission_id: string;
  readonly provider_id: string;
  readonly requirement_package_id: string;
  readonly category: ProviderEvidenceCategory;
  readonly source_reference: string;
  readonly content_digest: string;
  readonly submitted_by: string;
  readonly submitted_at: string;
  readonly expiration: string;
  readonly verification_state:
    | "SUBMITTED"
    | "VALIDATED"
    | "REJECTED"
    | "EXPIRED";
  readonly digest: string;
}
