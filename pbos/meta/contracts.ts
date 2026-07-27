import type { DetectedPattern, ImprovementProposal, InstitutionalMemory } from "../adaptation";
import type { PBOSRuntimeContext } from "../context";
import type { LifecycleStage } from "../orchestrator";

export interface EngineHistoryRecord {
  identifier: string;
  engine: string;
  outcome: "SUCCESS" | "FAILURE" | "BLOCKED";
  durationMs: number;
  evidenceComplete: boolean;
  evidenceReferences: string[];
}

export interface MetaLifecycleRecord {
  identifier: string;
  stage: LifecycleStage;
  outcome: "COMPLETED" | "BLOCKED" | "REJECTED";
  startedAt: string;
  finishedAt: string;
  evidenceComplete: boolean;
  evidenceReferences: string[];
}

export interface GovernanceHistoryRecord {
  identifier: string;
  status: "APPROVED" | "PENDING" | "REJECTED" | "EXCEPTION";
  requestedAt: string;
  resolvedAt?: string;
  blockers: string[];
  evidenceReferences: string[];
}

export interface MetaInput {
  runtimeContext: PBOSRuntimeContext | null;
  expectedEngines: string[];
  engineHistory: EngineHistoryRecord[];
  lifecycleHistory: MetaLifecycleRecord[];
  governanceHistory: GovernanceHistoryRecord[];
  institutionalMemory: InstitutionalMemory[];
  patterns: DetectedPattern[];
  proposals: ImprovementProposal[];
  analysisTimestamp: string;
  directModificationRequested: boolean;
  causalClaimRequested: boolean;
}

export type IntelligenceClassification = "FACT" | "PATTERN" | "INFERENCE" | "RECOMMENDATION";
export type MetricConfidence = "HIGH" | "MEDIUM" | "LOW";

export interface ExplainableMetric {
  metric: string;
  value: number;
  unit: "count" | "percent" | "milliseconds";
  sourceEvidence: string[];
  calculationMethod: string;
  limitations: string[];
  confidence: MetricConfidence;
  classification: IntelligenceClassification;
}

export interface EngineHealthSummary {
  status: "HEALTHY" | "DEGRADED" | "BLOCKED";
  metrics: ExplainableMetric[];
  unavailableEngines: string[];
}

export interface LifecycleAnalysis {
  metrics: ExplainableMetric[];
  bottlenecks: string[];
  improvementOpportunities: string[];
}

export interface GovernanceAnalysis {
  metrics: ExplainableMetric[];
  observations: string[];
  evidenceReferences: string[];
  advisoryRecommendations: string[];
}

export interface MetaRecommendation {
  recommendation: string;
  evidenceReferences: string[];
  advisoryOnly: true;
  classification: "RECOMMENDATION";
}

export interface SystemIntelligenceReport {
  reportId: string;
  analysisTimestamp: string;
  inputContextDigest: string;
  inputEvidenceReferences: string[];
  systemHealthSummary: EngineHealthSummary;
  lifecycleAnalysis: LifecycleAnalysis;
  governanceAnalysis: GovernanceAnalysis;
  recurringPatterns: DetectedPattern[];
  risks: string[];
  recommendations: MetaRecommendation[];
  confidenceClassification: MetricConfidence;
}

export type MetaState = "OBSERVING" | "ANALYZING" | "REPORTING" | "RECOMMENDING" | "GOVERNANCE_REVIEW" | "ARCHIVED";

export interface MetaApproval {
  status: "approved" | "pending" | "rejected" | "revoked";
  approvalIdentifier: string | null;
  evidenceReferences: string[];
}

export interface MetaTransition {
  from: MetaState;
  to: MetaState;
  transitionedAt: string;
  approvalIdentifier: string | null;
  evidenceReferences: string[];
}

export interface MetaMachineState {
  currentState: MetaState;
  transitions: MetaTransition[];
}

export type MetaFailureCode =
  | "MISSING_CONTEXT"
  | "INVALID_EVIDENCE"
  | "UNAUTHORIZED_MODIFICATION"
  | "MISSING_PROVENANCE"
  | "UNSUPPORTED_CAUSAL_CLAIM"
  | "INVALID_TRANSITION"
  | "GOVERNANCE_BYPASS";

export interface MetaFailure {
  code: MetaFailureCode;
  message: string;
}
