import type {
  ProductionProviderType,
  ProviderEvidenceCategory,
} from "../provider-onboarding";

export const PROVIDER_EVALUATION_DOMAINS = [
  "IDENTITY_TRUST",
  "SECURITY_MATURITY",
  "DATA_PROTECTION",
  "RELIABILITY",
  "RECOVERY_CAPABILITY",
  "OBSERVABILITY",
  "SCALABILITY",
  "OPERATIONAL_OWNERSHIP",
  "EVIDENCE_QUALITY",
  "GOVERNANCE_ALIGNMENT",
] as const;

export type ProviderEvaluationDomain =
  (typeof PROVIDER_EVALUATION_DOMAINS)[number];

export interface ProviderDomainScore {
  readonly domain: ProviderEvaluationDomain;
  readonly score: number;
  readonly evidence: readonly string[];
  readonly findings: readonly string[];
}

export interface ProductionProviderEvaluation {
  readonly evaluation_id: string;
  readonly provider_id: string;
  readonly provider_type: ProductionProviderType;
  readonly business_identity: string;
  readonly ownership: string;
  readonly service_description: string;
  readonly supported_capabilities: readonly string[];
  readonly security_profile: string;
  readonly availability_profile: string;
  readonly compliance_profile: string;
  readonly operational_profile: string;
  readonly risk_assessment: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  readonly domain_scores: readonly ProviderDomainScore[];
  readonly evaluation_score: number;
  readonly evaluation_status: "BLOCKED" | "CONDITIONAL" | "READY_FOR_INTAKE";
  readonly evaluated_at: string;
  readonly digest: string;
}

export interface ProviderEvidenceRequirement {
  readonly provider_type: ProductionProviderType;
  readonly required_evidence: ProviderEvidenceCategory;
  readonly validation_method: string;
  readonly expiration_days: number;
  readonly reviewer_authority: string;
  readonly certification_impact: "BLOCKING" | "CONDITIONAL";
}

export interface ProviderEvidenceRequirementMatrix {
  readonly matrix_id: string;
  readonly version: string;
  readonly requirements: readonly ProviderEvidenceRequirement[];
  readonly digest: string;
}
