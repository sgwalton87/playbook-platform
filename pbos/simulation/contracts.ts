import type { PBOSRuntimeContext } from "../context";
import type { DiscoveryReport } from "../discovery";
import type { GovernedKnowledgeGraph, KnowledgeReport } from "../knowledge";
import type { SystemIntelligenceReport } from "../meta";
import type { StrategyReport } from "../strategy";

export type SimulationConfidence = "HIGH" | "MEDIUM" | "LOW";
export type AssumptionStatus = "VERIFIED" | "SUPPORTED" | "UNCERTAIN" | "UNKNOWN";
export type OutcomeClassification = "POSSIBLE" | "UNCERTAIN" | "NOT_ESTABLISHED";

export interface AssumptionDraft { statement: string; sourceEvidence: string[]; confidence: SimulationConfidence; validationStatus: AssumptionStatus; limitations: string[] }
export interface SimulationAssumption extends AssumptionDraft { assumptionId: string; artifactType: "ASSUMPTION_NOT_FACT" }
export interface PathwayDraft { name: string; startingConditions: string[]; actionsConsidered: string[]; dependencies: string[]; requiredResources: string[]; possibleOutcomes: string[]; risks: string[]; unknownFactors: string[]; supportingEvidence: string[] }
export interface SimulationPathway extends PathwayDraft { pathwayId: string; advisoryOnly: true }
export interface OutcomeDraft { pathwayName: string; evidenceBasis: string[]; possibleResult: string; assumptionStatements: string[]; classification: OutcomeClassification; limitations: string[] }
export interface SimulationOutcome extends OutcomeDraft { outcomeId: string; scenarioReference: string; assumptionIds: string[]; uncertaintyStatement: string }
export interface ScenarioDraft { description: string; assumptions: AssumptionDraft[]; constraints: string[]; variables: string[]; pathways: PathwayDraft[]; outcomes: OutcomeDraft[]; risks: string[]; limitations: string[]; supportingEvidence: string[] }

export interface SimulationProvenance { runtimeContextDigest: string; knowledgeReportIds: string[]; strategyReportIds: string[]; discoveryReportIds: string[]; metaReportIds: string[]; evidenceReferences: string[] }
export interface SimulationScenario { scenarioId: string; scenarioDescription: string; originatingQuestion: string; supportingEvidence: string[]; assumptions: SimulationAssumption[]; constraints: string[]; variables: string[]; possibleOutcomes: SimulationOutcome[]; pathways: SimulationPathway[]; risks: string[]; limitations: string[]; confidenceClassification: SimulationConfidence; disclaimer: "This scenario represents a possible future state and is not a prediction."; provenance: SimulationProvenance }
export interface PathwayComparison { comparisonId: string; pathwayIds: string[]; comparisonMethod: string; dimensions: { pathwayId: string; tradeoffs: string[]; risks: string[]; resourceCount: number; assumptionCount: number; constraintCount: number }[]; evidenceUsed: string[]; limitations: string[]; confidence: SimulationConfidence; advisoryOnly: true; selectedPathway: null }

export interface SimulationInput { runtimeContext: PBOSRuntimeContext | null; simulationQuestion: string; knowledgeReports: KnowledgeReport[]; knowledgeGraphs: GovernedKnowledgeGraph[]; strategyReports: StrategyReport[]; discoveryReports: DiscoveryReport[]; metaReports: SystemIntelligenceReport[]; scenarioDrafts: ScenarioDraft[]; generatedAt: string; unsupportedSimulationRequested: boolean; guaranteedOutcomeRequested: boolean; unauthorizedDecisionRequested: boolean }
export interface SimulationReport { reportId: string; runtimeContextDigest: string; generatedAt: string; simulationQuestion: string; scenariosAnalyzed: SimulationScenario[]; assumptions: SimulationAssumption[]; pathways: SimulationPathway[]; outcomes: SimulationOutcome[]; comparisons: PathwayComparison[]; risks: string[]; evidenceBundle: string[]; uncertaintyStatements: string[]; confidenceClassification: SimulationConfidence; provenance: SimulationProvenance }

export type SimulationAuthorityChange = "strategic-commitment" | "resource-commitment" | "external-decision" | "policy-change" | "constitutional-implication";
export type SimulationState = "OBSERVING" | "DEFINING_QUESTION" | "GATHERING_EVIDENCE" | "MODELING_ASSUMPTIONS" | "GENERATING_SCENARIOS" | "COMPARING_PATHWAYS" | "REPORTING" | "GOVERNANCE_REVIEW" | "ARCHIVED";
export interface SimulationApproval { status: "approved" | "pending" | "rejected"; approvalIdentifier: string | null; evidenceReferences: string[] }
export interface SimulationMachineState { currentState: SimulationState; transitions: { from: SimulationState; to: SimulationState; transitionedAt: string; approvalIdentifier: string | null; evidenceReferences: string[] }[] }
export type SimulationFailureCode = "MISSING_CONTEXT" | "UNSUPPORTED_SIMULATION" | "MISSING_EVIDENCE" | "INVALID_ASSUMPTION" | "GUARANTEED_OUTCOME" | "UNAUTHORIZED_DECISION" | "INVALID_TRANSITION" | "GOVERNANCE_BYPASS";
export interface SimulationFailure { code: SimulationFailureCode; message: string }
