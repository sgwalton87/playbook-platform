import type { PBOSRuntimeContext } from "../context";
import type { KnowledgeReport } from "../knowledge";
import type { SimulationReport } from "../simulation";
import type { StrategyReport } from "../strategy";

export type SkillStage = "EXPOSURE" | "PRACTICE" | "DEMONSTRATION" | "MASTERY_EVIDENCE";
export type MasteryClassification = "INTRODUCED" | "DEVELOPING" | "PRACTICED" | "DEMONSTRATED" | "ADVANCED";
export type LearningConfidence = "HIGH" | "MEDIUM" | "LOW";

export interface LearnerEvidence {
  evidenceId: string;
  learnerId: string;
  evidenceType: "ACTIVITY" | "PROJECT" | "ASSESSMENT" | "REFLECTION" | "ACHIEVEMENT" | "FEEDBACK";
  description: string;
  occurredAt: string;
  sourceReference: string;
  owner: string;
  verificationStatus: "VERIFIED" | "PENDING" | "REJECTED";
  authorizedUses: Array<"LEARNING_RECORD" | "PATHWAY" | "MASTERY" | "RECOMMENDATION" | "REPORT">;
}

export interface LearnerDevelopment {
  learnerId: string;
  learningGoals: string[];
  interests: string[];
  currentCompetencyIds: string[];
  growthAreas: string[];
  evidenceHistory: string[];
  mentorRelationships: string[];
  learningPreferences: string[];
  agencyStatement: "The learner and authorized humans retain learning decision authority.";
  potentialAssessment: null;
}

export interface CompetencyDraft {
  name: string;
  description: string;
  evidenceRequirements: string[];
  relatedSkillNames: string[];
  masteryIndicators: string[];
  limitations: string[];
  sourceEvidenceIds: string[];
}

export interface Competency extends CompetencyDraft {
  competencyId: string;
  provenance: LearningProvenance;
  developmental: true;
}

export interface SkillDraft {
  name: string;
  category: string;
  evidenceIds: string[];
  practiceOpportunities: string[];
  progressionIndicators: string[];
  stage: SkillStage;
  confidence: LearningConfidence;
  limitations: string[];
}

export interface Skill extends SkillDraft {
  skillId: string;
  provenance: LearningProvenance;
}

export interface MilestoneDraft {
  objective: string;
  evidenceRequired: string[];
  supportingEvidenceIds: string[];
  requestedStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  feedback: string[];
  reflectionPrompts: string[];
  supportingRecords: string[];
}

export interface LearningMilestone extends Omit<MilestoneDraft, "requestedStatus"> {
  milestoneId: string;
  completionStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  completionEvidenceVerified: boolean;
}

export interface ReflectionDraft {
  experience: string;
  learnerReflection: string;
  lessonsLearned: string[];
  growthObservations: string[];
  supportingEvidenceIds: string[];
}

export interface LearningReflection extends ReflectionDraft {
  reflectionId: string;
  learnerId: string;
  ownership: "LEARNER";
  manufacturedMeaning: false;
}

export interface PathwayDraft {
  goal: string;
  competencyNames: string[];
  recommendedActivities: string[];
  milestoneObjectives: string[];
  resources: string[];
  mentorSupportRoles: string[];
  evidenceExpectations: string[];
}

export interface LearningPathway extends PathwayDraft {
  pathwayId: string;
  competencyIds: string[];
  milestoneIds: string[];
  advisoryOnly: true;
  learnerChoiceRequired: true;
}

export interface MasteryIndicator {
  masteryId: string;
  competencyId: string;
  classification: MasteryClassification;
  evidenceIds: string[];
  rationale: string;
  limitations: string[];
  completionIsNotMastery: true;
}

export interface RecommendationDraft {
  learnerContext: string;
  evidenceIds: string[];
  suggestedNextStep: string;
  relatedCompetencyName: string;
  resources: string[];
  mentorSupportSuggestions: string[];
  limitations: string[];
}

export interface LearningRecommendation extends RecommendationDraft {
  recommendationId: string;
  learnerId: string;
  relatedCompetencyId: string;
  advisoryOnly: true;
  highImpactDecision: false;
}

export interface LearningProvenance {
  learnerId: string;
  evidenceIds: string[];
  sourceReferences: string[];
  owners: string[];
  runtimeContextDigest: string;
}

export interface LearningInput {
  runtimeContext: PBOSRuntimeContext | null;
  learner: Omit<LearnerDevelopment, "evidenceHistory" | "agencyStatement" | "potentialAssessment">;
  learnerEvidence: LearnerEvidence[];
  knowledgeReports: KnowledgeReport[];
  strategyReports: StrategyReport[];
  simulationReports: SimulationReport[];
  competencyDrafts: CompetencyDraft[];
  skillDrafts: SkillDraft[];
  milestoneDrafts: MilestoneDraft[];
  reflectionDrafts: ReflectionDraft[];
  pathwayDrafts: PathwayDraft[];
  recommendationDrafts: RecommendationDraft[];
  generatedAt: string;
  authorizedLearnerIds: string[];
  unauthorizedConclusionRequested: boolean;
  rankingRequested: boolean;
  highImpactDecisionRequested: boolean;
}

export interface LearningReport {
  reportId: string;
  generatedAt: string;
  runtimeContextDigest: string;
  learner: LearnerDevelopment;
  learnerEvidence: LearnerEvidence[];
  competencies: Competency[];
  skills: Skill[];
  milestones: LearningMilestone[];
  reflections: LearningReflection[];
  masteryIndicators: MasteryIndicator[];
  pathways: LearningPathway[];
  recommendations: LearningRecommendation[];
  evidenceBundle: string[];
  limitations: string[];
}

export type LearningGovernanceAction = "educational-decision" | "evaluation" | "certification" | "disciplinary-decision" | "access-opportunity";
export type LearningState = "OBSERVING" | "ASSESSING_CONTEXT" | "IDENTIFYING_GOALS" | "MAPPING_COMPETENCIES" | "BUILDING_PATHWAY" | "TRACKING_PROGRESS" | "REFLECTING" | "RECOMMENDING_NEXT_STEPS" | "MENTOR_REVIEW" | "ARCHIVED";
export interface LearningApproval { status: "approved" | "pending" | "rejected"; approvalIdentifier: string | null; evidenceReferences: string[] }
export interface LearningMachineState { currentState: LearningState; transitions: Array<{ from: LearningState; to: LearningState; transitionedAt: string; approvalIdentifier: string | null; evidenceReferences: string[] }> }
export type LearningFailureCode = "INVALID_CONTEXT" | "MISSING_EVIDENCE" | "UNSUPPORTED_MASTERY" | "UNAUTHORIZED_CONCLUSION" | "PRIVACY_VIOLATION" | "RANKING_PROHIBITED" | "HIGH_IMPACT_DECISION" | "INVALID_TRANSITION" | "GOVERNANCE_BYPASS";
export interface LearningFailure { code: LearningFailureCode; message: string }
