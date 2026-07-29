import type { GateTransition } from "../contracts";
import type { ValidationEvidence } from "../../release";

export interface LifecycleEvidenceReference {
  path: string;
  digest: string;
  capturedAt: string;
}

export interface CompletionClaim {
  requirement: string;
  evidence: string[];
}

export interface GateCompletionEvidenceManifest {
  schemaVersion: 1;
  gateId: string;
  gateDigest: string;
  capturedAt: string;
  validator: {
    id: string;
    version: string;
  };
  evidence: LifecycleEvidenceReference[];
  claims: CompletionClaim[];
}

export interface CompletionEvidenceEvaluation {
  passed: boolean;
  gateId: string;
  gateDigest: string;
  manifestPath: string;
  evidence: LifecycleEvidenceReference[];
  blockers: string[];
}

export interface LifecycleGovernanceRun {
  runId: string;
  gateId: string;
  previousStatus: string;
  newStatus: string;
  evaluatedAt: string;
  authority: "lifecycle-governance";
  gateContentIdentity: string;
  evidenceEvaluation: CompletionEvidenceEvaluation;
  validationEvidence: ValidationEvidence[];
  promotionEligible: boolean;
  promoted: boolean;
  completed: boolean;
  transition: GateTransition | null;
  recovery: {
    artifactsReconciled: boolean;
    contextRefreshed: boolean;
    planningRefreshed: boolean;
  };
  blockers: string[];
}

export interface LifecycleGovernanceArtifact
  extends LifecycleGovernanceRun {
  schemaVersion: 1;
  history: LifecycleGovernanceRun[];
}
