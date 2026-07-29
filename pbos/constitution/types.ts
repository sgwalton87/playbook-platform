export const constitutionalVolumeLifecycles = [
  "draft",
  "architecture_complete",
  "implementation_ready",
  "certified",
  "canonical",
  "blocked",
] as const;

export type ConstitutionalVolumeLifecycle =
  (typeof constitutionalVolumeLifecycles)[number];

export const certificationRuleIds = [
  "INT-001",
  "INT-002",
  "INT-003",
  "INT-004",
  "INT-005",
  "INT-006",
  "INT-007",
  "INT-008",
  "INT-009",
  "INT-010",
] as const;

export type CertificationRuleId =
  (typeof certificationRuleIds)[number];

export interface ConstitutionalDocumentMetadata {
  id: string | null;
  title: string | null;
  status: string | null;
  parent: string[];
  dependsOn: string[];
  related: string[];
}

export interface ConstitutionalDocument {
  path: string;
  content: string;
  digest: string;
  metadata: ConstitutionalDocumentMetadata;
}

export interface ConstitutionalVolume {
  number: number;
  id: string;
  directory: string;
  lifecycle: ConstitutionalVolumeLifecycle;
  lifecycleSource: string | null;
  authorityId: string;
  authority: ConstitutionalDocument | null;
  readme: ConstitutionalDocument | null;
  documents: ConstitutionalDocument[];
  contentDigest: string;
  discoveryErrors: string[];
}

export interface CertificationRuleResult {
  id: CertificationRuleId;
  name: string;
  passed: boolean;
  evidence: string[];
  blockingConditions: string[];
}

export type PromotionRecommendation =
  | {
      eligible: false;
      action: "BLOCKED" | "NO_ACTION";
      targetLifecycle: null;
      reason: string;
    }
  | {
      eligible: true;
      action: "REVIEW_TRANSITION";
      targetLifecycle: ConstitutionalVolumeLifecycle;
      reason: string;
    };

export interface VolumeCertificationRun {
  runId: string;
  volume: number;
  volumeId: string;
  volumePath: string;
  authorityId: string;
  lifecycle: ConstitutionalVolumeLifecycle;
  lifecycleSource: string | null;
  contentDigest: string;
  evaluatedAt: string;
  status: "PASS" | "FAIL";
  certificationScore: number;
  rules: CertificationRuleResult[];
  passedRules: CertificationRuleId[];
  failedRules: CertificationRuleId[];
  blockingConditions: string[];
  promotionRecommendation: PromotionRecommendation;
}

export interface VolumeCertificationArtifact {
  schemaVersion: 1;
  owner: "volume-certification";
  latest: VolumeCertificationRun;
  history: VolumeCertificationRun[];
}
