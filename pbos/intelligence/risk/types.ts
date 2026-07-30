import type { GovernedEvidenceReference } from "../../cognitive-control-plane/types";

export type RiskDomain =
  | "SECURITY"
  | "PRIVACY"
  | "COMPLIANCE"
  | "ARCHITECTURE"
  | "OPERATIONS"
  | "FINANCIAL"
  | "HUMAN";

export interface RiskScore {
  readonly likelihood: number;
  readonly impact: number;
  readonly reversibility: number;
  readonly total: number;
}

export interface RiskFinding {
  readonly id: string;
  readonly domain: RiskDomain;
  readonly description: string;
  readonly score: Omit<RiskScore, "total">;
  readonly evidence: readonly GovernedEvidenceReference[];
}

export interface MitigationPlan {
  readonly finding_id: string;
  readonly owner: string;
  readonly actions: readonly string[];
  readonly rollback: readonly string[];
}

export interface RiskAssessment {
  readonly id: string;
  readonly findings: readonly (RiskFinding & { readonly score: RiskScore })[];
  readonly mitigations: readonly MitigationPlan[];
  readonly risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  readonly confidence: number;
  readonly digest: string;
}
