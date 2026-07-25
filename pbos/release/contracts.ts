export type ContractStatus = "PASS" | "FAIL" | "PENDING";

export interface ValidationEvidence {
  id: string;
  name: string;
  status: ContractStatus;
  executedAt: string;
  durationMs: number;
  summary: string;
  evidence: string[];
}

export interface ValidationAdapter {
  id: string;
  name: string;
  run(): Promise<ValidationEvidence>;
}

export interface ReleaseContract {
  version: string;
  gateId: string | null;
  generatedAt: string;
  overallStatus: ContractStatus;
  promotionReady: boolean;
  evidence: ValidationEvidence[];
  failedEvidenceIds: string[];
  pendingEvidenceIds: string[];
}

export interface ReleaseEvaluation {
  status: ContractStatus;
  promotionReady: boolean;
  failedEvidenceIds: string[];
  pendingEvidenceIds: string[];
}

export interface BuildReleaseContractOptions {
  version?: string;
  gateId?: string | null;
  adapters: ValidationAdapter[];
  persist?: boolean;
  reportsDirectory?: string;
}
