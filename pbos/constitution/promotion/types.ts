import type {
  ConstitutionalVolume,
  ConstitutionalVolumeLifecycle,
  VolumeCertificationArtifact,
  VolumeCertificationRun,
} from "../types";

export interface VolumePromotionRecord {
  promotionId: string;
  volume: number;
  volumeId: string;
  from: ConstitutionalVolumeLifecycle;
  to: ConstitutionalVolumeLifecycle;
  approved: boolean;
  evidence: string[];
  certificationRunId: string | null;
  contentDigestBefore: string;
  contentDigestAfter: string | null;
  timestamp: string;
  blockingConditions: string[];
  reason: string;
}

export interface VolumePromotionArtifact {
  schemaVersion: 1;
  owner: "volume-promotion";
  latest: VolumePromotionRecord;
  history: VolumePromotionRecord[];
}

export interface VolumePromotionValidation {
  approved: boolean;
  evidence: string[];
  blockingConditions: string[];
  certification: VolumeCertificationRun | null;
}

export interface VolumePromotionContext {
  rootDir: string;
  volume: ConstitutionalVolume;
  target: ConstitutionalVolumeLifecycle;
  certificationArtifact: VolumeCertificationArtifact | null;
  promotionArtifact: VolumePromotionArtifact | null;
}
