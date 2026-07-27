import type { AutonomyObservation, AutonomyRecommendation } from "../autonomy";
import type { PBOSRuntimeContext } from "../context";

export type AdaptationSignalType =
  | "VALIDATION_FAILURE"
  | "BLOCKED_TRANSITION"
  | "MISSING_EVIDENCE"
  | "GOVERNANCE_DELAY"
  | "REMEDIATION_PATH"
  | "TECHNICAL_DEBT";

export interface HistoricalEvidenceRecord {
  identifier: string;
  signalType: AdaptationSignalType;
  signal: string;
  affectedSystem: string;
  observedAt: string;
  evidenceReferences: string[];
  remediationReference?: string;
}

export interface LifecycleHistoryRecord {
  identifier: string;
  gateIdentifier: string;
  outcome: "completed" | "failed" | "blocked";
  evidenceReferences: string[];
}

export interface AdaptationInput {
  runtimeContext: PBOSRuntimeContext | null;
  historicalEvidence: HistoricalEvidenceRecord[];
  autonomyObservations: AutonomyObservation[];
  autonomyRecommendations: AutonomyRecommendation[];
  lifecycleHistory: LifecycleHistoryRecord[];
}

export interface DetectedPattern {
  patternId: string;
  signalType: AdaptationSignalType;
  signal: string;
  occurrenceCount: number;
  affectedSystems: string[];
  sourceRecordIdentifiers: string[];
  supportingEvidence: string[];
  cause: "UNDETERMINED";
}

export type GovernedChangeType =
  | "constitutional"
  | "architecture"
  | "schema"
  | "lifecycle"
  | "security"
  | "policy"
  | "authority"
  | "operational";

export interface ImprovementProposalDraft {
  improvementDescription: string;
  expectedImpact: string;
  risks: string[];
  constitutionalConsiderations: string[];
  changeType: GovernedChangeType;
  directModificationRequested: boolean;
}

export interface InstitutionalMemory {
  sourceObservationIds: string[];
  sourceRecordIdentifiers: string[];
  evidenceReferences: string[];
  historicalContext: string[];
  decisionOutcomes: string[];
  approvalRecords: string[];
  lifecycleResults: string[];
}

export interface ImprovementProposal {
  proposalId: string;
  detectedPattern: DetectedPattern;
  supportingEvidence: string[];
  affectedSystems: string[];
  improvementDescription: string;
  expectedImpact: string;
  risks: string[];
  requiredApprovals: string[];
  constitutionalConsiderations: string[];
  confidenceClassification: "HIGH" | "MEDIUM" | "LOW";
  governanceStatus: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "BLOCKED";
  advisoryOnly: true;
  institutionalMemory: InstitutionalMemory;
}

export type AdaptationState =
  | "OBSERVING"
  | "ANALYZING"
  | "PATTERN_IDENTIFIED"
  | "PROPOSAL_CREATED"
  | "GOVERNANCE_REVIEW"
  | "APPROVED_CHANGE"
  | "LIFECYCLE_EXECUTION"
  | "VALIDATION"
  | "CERTIFICATION"
  | "RELEASE"
  | "REJECTED"
  | "BLOCKED";

export interface AdaptationApproval {
  status: "approved" | "pending" | "rejected" | "revoked";
  approvalIdentifier: string | null;
  evidenceReferences: string[];
}

export interface AdaptationTransition {
  from: AdaptationState;
  to: AdaptationState;
  transitionedAt: string;
  approvalIdentifier: string | null;
  evidenceReferences: string[];
}

export interface AdaptationMachineState {
  currentState: AdaptationState;
  transitions: AdaptationTransition[];
}

export type AdaptationFailureCode =
  | "INVALID_CONTEXT"
  | "MISSING_EVIDENCE"
  | "MISSING_PROVENANCE"
  | "UNAUTHORIZED_CHANGE"
  | "GOVERNANCE_BYPASS"
  | "SELF_MODIFICATION"
  | "INVALID_TRANSITION";

export interface AdaptationFailure {
  code: AdaptationFailureCode;
  message: string;
}
