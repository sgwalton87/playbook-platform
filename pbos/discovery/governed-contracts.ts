import type { ImprovementProposal, DetectedPattern } from "../adaptation";
import type { PBOSRuntimeContext } from "../context";
import type { SystemIntelligenceReport } from "../meta";

export type DiscoveryConfidence = "HIGH" | "MEDIUM" | "LOW";
export type DiscoveryChangeType = "investigation" | "strategic" | "constitutional" | "policy" | "resource" | "architecture" | "external";

export interface ApprovedDiscoverySource {
  identifier: string;
  owner: string;
  sourceType: "internal" | "institutional-memory" | "lifecycle-history" | "external" | "dataset";
  provenance: string;
  retrievedAt: string;
  validationStatus: "verified" | "pending" | "rejected";
  approvedDomains: string[];
  evidenceReferences: string[];
}

export interface SourceObservation {
  sourceIdentifier: string;
  observation: string;
  observedAt: string;
  affectedDomain: string;
  signalType: "opportunity" | "risk" | "requirement-change" | "environmental-change" | "resource-availability" | "performance-change" | "ecosystem-development";
  evidenceReferences: string[];
  occurrenceCount: number;
}

export interface InformationGap {
  domain: string;
  description: string;
  evidenceReferences: string[];
  status: "UNRESOLVED";
}

export interface DiscoveryInput {
  runtimeContext: PBOSRuntimeContext | null;
  sources: ApprovedDiscoverySource[];
  observations: SourceObservation[];
  metaReports: SystemIntelligenceReport[];
  adaptationPatterns: DetectedPattern[];
  adaptationProposals: ImprovementProposal[];
  informationGaps: InformationGap[];
  observationTimestamp: string;
  unsupportedConclusionRequested: boolean;
  unauthorizedDecisionRequested: boolean;
}

export interface DiscoveredSignal {
  signalId: string;
  signalType: SourceObservation["signalType"];
  sourceReference: string;
  sourceIdentity: string;
  sourceOwnership: string;
  sourceProvenance: string;
  retrievalTimestamp: string;
  sourceValidationStatus: "verified";
  observation: string;
  timestamp: string;
  affectedDomain: string;
  evidenceReferences: string[];
  confidenceClassification: DiscoveryConfidence;
  classification: "FACT" | "PATTERN";
}

export interface DiscoveryProvenance {
  sourceIdentity: string;
  sourceOwnership: string;
  sourceProvenance: string;
  retrievalTimestamp: string;
  validationStatus: "verified";
  evidenceReferences: string[];
}

export interface OpportunityInput {
  affectedSystemsOrCommunities: string[];
  potentialImpact: string;
  requiredExpertise: string[];
  risks: string[];
  recommendedNextSteps: string[];
  changeType: DiscoveryChangeType;
}

export interface DiscoveryOpportunity extends OpportunityInput {
  opportunityId: string;
  discoveredSignal: string;
  supportingEvidence: string[];
  provenance: DiscoveryProvenance;
  requiredApprovals: string[];
  advisoryOnly: true;
}

export interface RiskInput {
  affectedSystems: string[];
  severityClassification: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  possibleImpact: string;
  mitigationRecommendations: string[];
}

export interface DiscoveryRisk extends RiskInput {
  riskId: string;
  discoveredSignal: string;
  evidenceReferences: string[];
  provenance: DiscoveryProvenance;
  confidenceLevel: DiscoveryConfidence;
  uncertaintyStatement: string;
  classification: "RISK";
  advisoryOnly: true;
}

export interface DiscoveryReport {
  reportId: string;
  observationTimestamp: string;
  runtimeContextDigest: string;
  sourceInventory: ApprovedDiscoverySource[];
  discoveredSignals: DiscoveredSignal[];
  opportunities: DiscoveryOpportunity[];
  risks: DiscoveryRisk[];
  informationGaps: InformationGap[];
  recommendations: { recommendation: string; evidenceReferences: string[]; advisoryOnly: true }[];
  confidenceClassifications: DiscoveryConfidence[];
  evidenceBundle: string[];
}

export type DiscoveryState = "OBSERVING" | "COLLECTING" | "VALIDATING" | "CLASSIFYING" | "REPORTING" | "RECOMMENDING" | "GOVERNANCE_REVIEW" | "ARCHIVED";
export interface DiscoveryApproval { status: "approved" | "pending" | "rejected"; approvalIdentifier: string | null; evidenceReferences: string[] }
export interface DiscoveryTransition { from: DiscoveryState; to: DiscoveryState; transitionedAt: string; approvalIdentifier: string | null; evidenceReferences: string[] }
export interface DiscoveryMachineState { currentState: DiscoveryState; transitions: DiscoveryTransition[] }
export type DiscoveryFailureCode = "MISSING_CONTEXT" | "INVALID_SOURCE" | "MISSING_PROVENANCE" | "UNSUPPORTED_CONCLUSION" | "UNAUTHORIZED_DECISION" | "INVALID_EVIDENCE" | "INVALID_TRANSITION" | "GOVERNANCE_BYPASS";
export interface DiscoveryFailure { code: DiscoveryFailureCode; message: string }
