import type { InstitutionalMemory } from "../adaptation";
import type { PBOSRuntimeContext } from "../context";
import type { DiscoveryReport } from "../discovery";
import type { StrategyReport } from "../strategy";

export type KnowledgeConfidence = "HIGH" | "MEDIUM" | "LOW";
export type KnowledgeClassification = "DECISION" | "PROJECT" | "ROLE" | "SYSTEM" | "DOCUMENT" | "STRATEGY" | "OUTCOME" | "LESSON" | "PATTERN" | "EVENT";

export interface HistoricalRecord {
  recordId: string;
  recordType: "planning" | "execution" | "validation" | "certification" | "release" | "lifecycle" | "decision" | "outcome";
  occurredAt: string;
  owner: string;
  summary: string;
  evidenceReferences: string[];
  status: string;
}

export interface KnowledgeEntityInput {
  sourceRecordId: string;
  name: string;
  classification: KnowledgeClassification;
  owner: string;
  timestamp: string;
  sourceEvidence: string[];
  historicalState: string;
}

export interface KnowledgeProvenance {
  sourceRecordIds: string[];
  evidenceReferences: string[];
  owners: string[];
  sourceContextDigest: string;
}

export interface GovernedKnowledgeEntity {
  entityId: string;
  name: string;
  classification: KnowledgeClassification;
  owner: string;
  timestamp: string;
  historicalState: string;
  sourceEvidence: string[];
  provenance: KnowledgeProvenance;
}

export type KnowledgeRelationshipType = "PRODUCED" | "INFLUENCED" | "OBSERVED_IN" | "DEFINES" | "DERIVED_FROM" | "CONTRADICTS";
export interface RelationshipInput { fromEntityId: string; toEntityId: string; relationshipType: KnowledgeRelationshipType; evidenceReferences: string[]; confidence: KnowledgeConfidence; limitations: string[] }
export interface GovernedKnowledgeRelationship extends RelationshipInput { relationshipId: string; provenance: KnowledgeProvenance }
export interface GovernedKnowledgeGraph { graphId: string; contextDigest: string; generatedAt: string; nodes: GovernedKnowledgeEntity[]; relationships: GovernedKnowledgeRelationship[]; evidenceReferences: string[]; historicalStates: string[] }

export interface PrecedentInput { historicalSituation: string; evidenceReferences: string[]; decisionMade: string; outcome: string; lessonsLearned: string[]; limitations: string[]; applicabilityConditions: string[]; sourceRecordIds: string[] }
export interface KnowledgePrecedent extends PrecedentInput { precedentId: string; distinction: "HISTORICAL_NOT_PRESCRIPTIVE"; provenance: KnowledgeProvenance }
export interface LessonInput { originatingEvidence: string[]; historicalContext: string; observedOutcome: string; lessonSummary: string; confidence: KnowledgeConfidence; limitations: string[]; governanceStatus: "DRAFT" | "REVIEWED" | "APPROVED"; sourceRecordIds: string[] }
export interface InstitutionalLesson extends LessonInput { lessonId: string; artifactType: "KNOWLEDGE_NOT_COMMAND"; provenance: KnowledgeProvenance }

export interface KnowledgeInput {
  runtimeContext: PBOSRuntimeContext | null;
  historicalRecords: HistoricalRecord[];
  institutionalMemory: InstitutionalMemory[];
  strategyReports: StrategyReport[];
  discoveryReports: DiscoveryReport[];
  entityInputs: KnowledgeEntityInput[];
  relationshipInputs: RelationshipInput[];
  precedentInputs: PrecedentInput[];
  lessonInputs: LessonInput[];
  generatedAt: string;
  fabricatedKnowledgeRequested: boolean;
  historyModificationRequested: boolean;
}

export interface KnowledgeRetrievalQuery { classifications?: KnowledgeClassification[]; text?: string; includeContradictoryEvidence: true }
export interface KnowledgeRetrievalItem { entity: GovernedKnowledgeEntity; relationships: GovernedKnowledgeRelationship[]; supportingEvidence: string[]; historicalContext: string; confidence: KnowledgeConfidence; limitations: string[]; provenance: KnowledgeProvenance }
export interface KnowledgeRetrievalResult { queryDigest: string; items: KnowledgeRetrievalItem[]; contradictoryEvidencePreserved: true; fabricatedContent: false }

export interface KnowledgeReport { reportId: string; runtimeContextDigest: string; generatedAt: string; knowledgeSources: string[]; entities: GovernedKnowledgeEntity[]; relationships: GovernedKnowledgeRelationship[]; precedents: KnowledgePrecedent[]; lessons: InstitutionalLesson[]; evidenceBundle: string[]; confidenceClassification: KnowledgeConfidence }

export type KnowledgeAuthorityChange = "classification" | "historical-interpretation" | "ownership" | "deletion-archival" | "authoritative-lesson";
export type KnowledgeState = "OBSERVING" | "INGESTING" | "VALIDATING" | "CONNECTING" | "INDEXING" | "RETRIEVING" | "REPORTING" | "GOVERNANCE_REVIEW" | "ARCHIVED";
export interface KnowledgeApproval { status: "approved" | "pending" | "rejected"; approvalIdentifier: string | null; evidenceReferences: string[] }
export interface KnowledgeMachineState { currentState: KnowledgeState; transitions: { from: KnowledgeState; to: KnowledgeState; transitionedAt: string; approvalIdentifier: string | null; evidenceReferences: string[] }[] }
export type KnowledgeFailureCode = "INVALID_CONTEXT" | "MISSING_PROVENANCE" | "UNSUPPORTED_RELATIONSHIP" | "FABRICATED_KNOWLEDGE" | "HISTORY_MODIFICATION" | "INVALID_EVIDENCE" | "INVALID_TRANSITION" | "GOVERNANCE_BYPASS";
export interface KnowledgeFailure { code: KnowledgeFailureCode; message: string }
