import type { PBOSRuntimeContext } from "../context";
import type { DiscoveryReport } from "../discovery";
import type { KnowledgeReport } from "../knowledge";
import type { SimulationReport } from "../simulation";
import type { StrategyReport } from "../strategy";

export type ForesightConfidence = "HIGH" | "MEDIUM" | "LOW";
export type HorizonType = "NEAR_TERM" | "MEDIUM_TERM" | "LONG_TERM";
export type FutureConditionClassification = "POSSIBLE" | "SUPPORTED" | "UNCERTAIN" | "NOT_ESTABLISHED";

export interface TrendDraft {
  description: string;
  supportingEvidence: string[];
  originatingSignalIds: string[];
  historicalReferences: string[];
  affectedDomains: string[];
  timeframe: HorizonType;
  limitations: string[];
}

export interface ForesightTrend extends TrendDraft {
  trendId: string;
  confidenceClassification: ForesightConfidence;
  classification: "TREND_NOT_PREDICTION";
}

export interface HorizonAnalysis {
  horizonId: string;
  horizon: HorizonType;
  timeframeDefinition: string;
  evidenceBasis: string[];
  uncertaintyStatement: string;
  limitations: string[];
}

export interface EmergingSignalDraft {
  description: string;
  sourceEvidence: string[];
  firstObservation: string;
  recurrenceCount: number;
  affectedSystems: string[];
  limitations: string[];
}

export interface EmergingSignal extends EmergingSignalDraft {
  signalId: string;
  confidence: ForesightConfidence;
  uncertaintyStatement: string;
}

export interface FutureConditionDraft {
  description: string;
  supportingEvidence: string[];
  contributingSignalIds: string[];
  assumptions: string[];
  possibleImpacts: string[];
  affectedStakeholders: string[];
  classification: FutureConditionClassification;
  limitations: string[];
}

export interface FutureCondition extends FutureConditionDraft {
  conditionId: string;
  uncertaintyStatement: string;
}

export type PreparednessAuthority =
  | "strategic-direction"
  | "investment"
  | "resource-commitment"
  | "organizational-commitment"
  | "policy-change"
  | "constitutional-implication";

export interface PreparednessDraft {
  areaOfPreparation: string;
  supportingEvidence: string[];
  futureConditionDescription: string;
  recommendedQuestions: string[];
  resourcesToEvaluate: string[];
  risks: string[];
  requiredAuthority: PreparednessAuthority[];
}

export interface PreparednessOpportunity extends PreparednessDraft {
  preparednessId: string;
  futureConditionId: string;
  requiredApprovals: string[];
  advisoryOnly: true;
  commitmentCreated: false;
}

export interface ForesightProvenance {
  runtimeContextDigest: string;
  discoveryReportIds: string[];
  knowledgeReportIds: string[];
  simulationReportIds: string[];
  strategyReportIds: string[];
  evidenceReferences: string[];
}

export interface ForesightInput {
  runtimeContext: PBOSRuntimeContext | null;
  discoveryReports: DiscoveryReport[];
  knowledgeReports: KnowledgeReport[];
  simulationReports: SimulationReport[];
  strategyReports: StrategyReport[];
  trendDrafts: TrendDraft[];
  emergingSignalDrafts: EmergingSignalDraft[];
  futureConditionDrafts: FutureConditionDraft[];
  preparednessDrafts: PreparednessDraft[];
  horizonDefinitions: Record<HorizonType, string>;
  generatedAt: string;
  predictionPresentedAsFact: boolean;
  unauthorizedDirectionRequested: boolean;
}

export interface ForesightReport {
  reportId: string;
  generatedAt: string;
  runtimeContextDigest: string;
  trendInventory: ForesightTrend[];
  horizonAnalysis: HorizonAnalysis[];
  emergingSignals: EmergingSignal[];
  possibleFutureConditions: FutureCondition[];
  preparednessOpportunities: PreparednessOpportunity[];
  uncertaintyStatements: string[];
  evidenceBundle: string[];
  confidenceClassification: ForesightConfidence;
  provenance: ForesightProvenance;
}

export type ForesightState =
  | "OBSERVING"
  | "COLLECTING_SIGNALS"
  | "ANALYZING_PATTERNS"
  | "ASSESSING_HORIZONS"
  | "MODELING_FUTURE_CONDITIONS"
  | "IDENTIFYING_PREPARATION_AREAS"
  | "REPORTING"
  | "GOVERNANCE_REVIEW"
  | "ARCHIVED";

export interface ForesightApproval {
  status: "approved" | "pending" | "rejected";
  approvalIdentifier: string | null;
  evidenceReferences: string[];
}

export interface ForesightMachineState {
  currentState: ForesightState;
  transitions: Array<{
    from: ForesightState;
    to: ForesightState;
    transitionedAt: string;
    approvalIdentifier: string | null;
    evidenceReferences: string[];
  }>;
}

export type ForesightFailureCode =
  | "INVALID_CONTEXT"
  | "MISSING_EVIDENCE"
  | "UNSUPPORTED_TREND"
  | "HIDDEN_ASSUMPTION"
  | "PREDICTION_PROHIBITED"
  | "UNAUTHORIZED_DIRECTION"
  | "INVALID_TRANSITION"
  | "GOVERNANCE_BYPASS";

export interface ForesightFailure {
  code: ForesightFailureCode;
  message: string;
}
