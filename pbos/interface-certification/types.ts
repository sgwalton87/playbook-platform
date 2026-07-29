export const interfaceCertificationDomainIds = [
  "IC-001",
  "IC-002",
  "IC-003",
  "IC-004",
  "IC-005",
  "IC-006",
  "IC-007",
  "IC-008",
] as const;

export type InterfaceCertificationDomainId =
  (typeof interfaceCertificationDomainIds)[number];

export interface InterfaceEvidenceReference {
  path: string;
  digest: string;
  capturedAt: string;
}

export interface InterfaceDomainEvidence {
  controls: Record<string, boolean>;
  evidence: InterfaceEvidenceReference[];
  findings: string[];
}

export interface InterfaceCertificationEvidencePackage {
  schemaVersion: 1;
  volume: string;
  volumeDigest: string;
  implementation: string;
  implementationDigest: string;
  certificationTimestamp: string;
  validator: {
    id: string;
    version: string;
  };
  validationComplete: boolean;
  domains: Partial<
    Record<InterfaceCertificationDomainId, InterfaceDomainEvidence>
  >;
}

export interface InterfaceDomainResult {
  id: InterfaceCertificationDomainId;
  name: string;
  passed: boolean;
  score: number;
  requiredControls: string[];
  evidence: InterfaceEvidenceReference[];
  blockingConditions: string[];
}

export interface InterfaceCertificationRun {
  runId: string;
  volume: string;
  volumeDigest: string;
  implementation: string;
  digest: string;
  validationComplete: boolean;
  domains: Record<
    InterfaceCertificationDomainId,
    InterfaceDomainResult
  >;
  score: number;
  status: "pending" | "failed" | "passed";
  certificationTimestamp: string;
  validator: {
    id: string;
    version: string;
  } | null;
  measurement: {
    runId: string;
    implementationDigest: string;
    measurementComplete: boolean;
    certificationEligible: false;
  } | null;
  blockingConditions: string[];
}

export interface InterfaceCertificationArtifact
  extends InterfaceCertificationRun {
  schemaVersion: 1;
  owner: "interface-certification";
  history: InterfaceCertificationRun[];
}

export interface LoadedInterfaceEvidence {
  path: string;
  evidencePackage: InterfaceCertificationEvidencePackage | null;
  volumeDigest: string;
  implementationDigest: string;
  blockingConditions: string[];
}
