import type { DetectedPattern, ImprovementProposal, InstitutionalMemory } from "../adaptation";
import type { PBOSRuntimeContext } from "../context";
import type { DiscoveryReport } from "../discovery";
import type { SystemIntelligenceReport } from "../meta";

export type StrategyConfidence = "HIGH" | "MEDIUM" | "LOW";

export interface MissionContext {
  identifier: string;
  missionStatements: string[];
  strategicObjectives: string[];
  approvedPriorities: string[];
  values: string[];
  constraints: string[];
  owner: string;
  sourceReference: string;
  version: string;
  validationStatus: "verified" | "pending" | "rejected";
  evidenceReferences: string[];
}

export interface StrategyOptionCandidate {
  strategicObjective: string;
  missionObjectiveReferences: string[];
  constitutionalPrincipleReferences: string[];
  supportingEvidence: string[];
  requiredResources: string[];
  expectedOutcomes: string[];
  risks: string[];
  dependencies: string[];
  benefits: string[];
  opportunityCosts: string[];
  affectedStakeholders: string[];
  urgency: "LOW" | "MEDIUM" | "HIGH";
  resourceFeasibility: "LOW" | "MEDIUM" | "HIGH";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  requiredAuthority: StrategyAuthorityType[];
}

export type StrategyAuthorityType = "strategic-priority" | "resource-commitment" | "organizational-direction" | "constitutional-interpretation" | "major-investment" | "external-commitment";

export interface StrategyInput {
  runtimeContext: PBOSRuntimeContext | null;
  missionContext: MissionContext | null;
  discoveryReports: DiscoveryReport[];
  metaReports: SystemIntelligenceReport[];
  adaptationProposals: ImprovementProposal[];
  historicalPatterns: DetectedPattern[];
  institutionalMemory: InstitutionalMemory[];
  optionCandidates: StrategyOptionCandidate[];
  analysisTimestamp: string;
  unauthorizedDecisionRequested: boolean;
  guaranteedOutcomeClaimed: boolean;
}

export interface StrategyProvenance {
  missionIdentifier: string;
  missionSourceReference: string;
  missionVersion: string;
  runtimeContextDigest: string;
  discoveryReportIds: string[];
  metaReportIds: string[];
  evidenceReferences: string[];
}

export interface MissionAlignment {
  referencedMissionObjectives: string[];
  referencedConstitutionalPrinciples: string[];
  classification: "ALIGNMENT";
  statement: string;
  provenance: StrategyProvenance;
  leadershipDecisionRequired: true;
}

export interface TradeoffAnalysis {
  benefits: string[];
  risks: string[];
  resourceRequirements: string[];
  opportunityCosts: string[];
  dependencies: string[];
  affectedStakeholders: string[];
  uncertaintyStatement: string;
}

export interface PriorityAssessment {
  score: number;
  scoringMethod: string;
  factors: Record<"missionAlignment" | "urgency" | "evidenceStrength" | "resourceFeasibility" | "risk", number>;
  evidenceReferences: string[];
  limitations: string[];
  confidence: StrategyConfidence;
  advisoryOnly: true;
}

export interface StrategicOption {
  optionId: string;
  strategicObjective: string;
  supportingEvidence: string[];
  alignment: MissionAlignment;
  requiredResources: string[];
  expectedOutcomes: string[];
  risks: string[];
  dependencies: string[];
  tradeoffs: TradeoffAnalysis;
  affectedStakeholders: string[];
  requiredApprovals: string[];
  priorityAssessment: PriorityAssessment;
  provenance: StrategyProvenance;
  advisoryOnly: true;
}

export interface StrategyScenario {
  scenarioId: string;
  name: string;
  knownFacts: string[];
  possibleOutcomes: string[];
  assumptions: string[];
  unknownFactors: string[];
  risks: string[];
  classificationBoundary: string;
  evidenceReferences: string[];
}

export interface StrategyReport {
  reportId: string;
  analysisTimestamp: string;
  runtimeContextDigest: string;
  missionReferences: string[];
  discoveryInputIds: string[];
  metaInputIds: string[];
  strategicOptions: StrategicOption[];
  tradeoffs: { optionId: string; analysis: TradeoffAnalysis }[];
  scenarios: StrategyScenario[];
  risks: string[];
  recommendations: { optionId: string; recommendation: string; advisoryOnly: true; requiredApprovals: string[] }[];
  evidenceBundle: string[];
  confidenceClassification: StrategyConfidence;
}

export type StrategyState = "OBSERVING" | "ANALYZING" | "ALIGNING" | "MODELING_OPTIONS" | "EVALUATING_TRADEOFFS" | "REPORTING" | "RECOMMENDING" | "GOVERNANCE_REVIEW" | "ARCHIVED";
export interface StrategyApproval { status: "approved" | "pending" | "rejected"; approvalIdentifier: string | null; evidenceReferences: string[] }
export interface StrategyMachineState { currentState: StrategyState; transitions: { from: StrategyState; to: StrategyState; transitionedAt: string; approvalIdentifier: string | null; evidenceReferences: string[] }[] }
export type StrategyFailureCode = "MISSING_CONTEXT" | "MISSING_MISSION_AUTHORITY" | "INVALID_EVIDENCE" | "UNAUTHORIZED_DECISION" | "UNSUPPORTED_CERTAINTY" | "INVALID_TRANSITION" | "GOVERNANCE_BYPASS";
export interface StrategyFailure { code: StrategyFailureCode; message: string }
