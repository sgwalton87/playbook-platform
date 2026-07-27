import type { PBOSRuntimeContext } from "../context";
import type { KnowledgeReport } from "../knowledge";
import type { LearningReport } from "../learning";

export type MasteryProgression = "INTRODUCED" | "DEVELOPING" | "PRACTICED" | "DEMONSTRATED" | "ADVANCED" | "RECOGNIZED_MASTERY";
export type MasteryConfidence = "HIGH" | "MEDIUM" | "LOW";
export type EvidencePermission = "PORTFOLIO" | "DEMONSTRATION" | "ACHIEVEMENT" | "CREDENTIAL" | "MASTERY_REPORT";

export interface MasteryEvidence {
  evidenceId: string;
  learnerId: string;
  evidenceType: "PROJECT" | "WORK_SAMPLE" | "ACHIEVEMENT" | "CERTIFICATION" | "PERFORMANCE" | "LEADERSHIP";
  description: string;
  sourceReference: string;
  owner: string;
  occurredAt: string;
  verificationStatus: "VERIFIED" | "PENDING" | "REJECTED";
  permissions: EvidencePermission[];
}

export interface HumanValidation {
  validationId: string;
  evidenceIds: string[];
  reviewerId: string;
  reviewerRole: "MENTOR" | "EDUCATOR" | "COACH" | "SUPERVISOR" | "APPROVED_REVIEWER";
  validationDate: string;
  validationPurpose: string;
  status: "VALIDATED" | "PENDING" | "REJECTED";
  limitations: string[];
}

export interface DemonstrationDraft {
  competencyName: string;
  activity: string;
  category: "ACADEMIC" | "ATHLETIC" | "LEADERSHIP" | "ENTREPRENEURSHIP" | "COMMUNITY" | "PROFESSIONAL";
  evidenceIds: string[];
  validationIds: string[];
  feedback: string[];
  context: string;
}

export interface Demonstration extends DemonstrationDraft {
  demonstrationId: string;
  learnerId: string;
  reviewers: string[];
  validationStatus: "VALIDATED" | "PENDING";
  provenance: MasteryProvenance;
}

export interface AchievementDraft {
  description: string;
  category: "ACADEMIC" | "ATHLETIC" | "LEADERSHIP" | "CREATIVE" | "PROFESSIONAL" | "SERVICE" | "ENTREPRENEURIAL";
  date: string;
  evidenceIds: string[];
  associatedCompetencyNames: string[];
}

export interface Achievement extends AchievementDraft {
  achievementId: string;
  verificationStatus: "VERIFIED";
  provenance: MasteryProvenance;
}

export interface CredentialDraft {
  issuingOrganization: string;
  requirements: string[];
  evidenceIds: string[];
  completionStatus: "INCOMPLETE" | "COMPLETED";
  verificationStatus: "UNVERIFIED" | "VERIFIED";
  associatedCompetencyNames: string[];
}

export interface Credential extends CredentialDraft {
  credentialId: string;
  demonstrated: false;
  mastered: false;
  completionIsNotMastery: true;
}

export interface PortfolioDraft {
  artifactEvidenceIds: string[];
  competencyNames: string[];
  achievementDescriptions: string[];
  reflectionEvidenceIds: string[];
  validationIds: string[];
}

export interface GovernedPortfolio extends PortfolioDraft {
  portfolioId: string;
  owner: string;
  learnerId: string;
  createdAt: string;
  permissions: EvidencePermission[];
  provenance: MasteryProvenance;
  manufacturedAchievements: false;
}

export interface MasteryRecord {
  masteryId: string;
  learnerId: string;
  competencyId: string;
  competencyName: string;
  evidenceReferences: string[];
  demonstrationHistory: string[];
  validationStatus: "HUMAN_VALIDATED" | "EVIDENCE_INCOMPLETE";
  progression: MasteryProgression;
  limitations: string[];
  confidence: MasteryConfidence;
  statement: "Demonstrated capability based on available evidence; not a measure of human worth or total potential.";
}

export interface MasteryProvenance {
  learnerId: string;
  evidenceIds: string[];
  sourceReferences: string[];
  owners: string[];
  validationIds: string[];
  runtimeContextDigest: string;
}

export interface MasteryInput {
  runtimeContext: PBOSRuntimeContext | null;
  learnerId: string;
  learningReports: LearningReport[];
  knowledgeReports: KnowledgeReport[];
  evidence: MasteryEvidence[];
  validations: HumanValidation[];
  approvedReviewerIds: string[];
  demonstrationDrafts: DemonstrationDraft[];
  portfolioDraft: PortfolioDraft;
  achievementDrafts: AchievementDraft[];
  credentialDrafts: CredentialDraft[];
  progressionRequests: Array<{ competencyName: string; requestedProgression: MasteryProgression; evidenceIds: string[]; validationIds: string[] }>;
  generatedAt: string;
  authorizedLearnerIds: string[];
  rankingRequested: boolean;
  potentialInferenceRequested: boolean;
  highImpactDecisionRequested: boolean;
}

export interface MasteryReport {
  reportId: string;
  generatedAt: string;
  runtimeContextDigest: string;
  learnerId: string;
  competencies: Array<{ competencyId: string; competencyName: string }>;
  demonstrations: Demonstration[];
  achievements: Achievement[];
  portfolio: GovernedPortfolio;
  credentials: Credential[];
  masteryProgression: MasteryRecord[];
  limitations: string[];
  confidence: MasteryConfidence;
  evidenceBundle: string[];
}

export type MasteryGovernanceAction = "credential-approval" | "certification-decision" | "admissions-decision" | "employment-decision" | "opportunity-access";
export type MasteryState = "OBSERVING" | "COLLECTING_EVIDENCE" | "VALIDATING_EVIDENCE" | "MAPPING_COMPETENCIES" | "ASSESSING_DEMONSTRATION" | "UPDATING_MASTERY" | "REPORTING" | "HUMAN_REVIEW" | "ARCHIVED";
export interface MasteryApproval { status: "approved" | "pending" | "rejected"; approvalIdentifier: string | null; evidenceReferences: string[] }
export interface MasteryMachineState { currentState: MasteryState; transitions: Array<{ from: MasteryState; to: MasteryState; transitionedAt: string; approvalIdentifier: string | null; evidenceReferences: string[] }> }
export type MasteryFailureCode = "INVALID_CONTEXT" | "MISSING_EVIDENCE" | "UNSUPPORTED_MASTERY" | "UNAUTHORIZED_VALIDATION" | "IDENTITY_MISMATCH" | "PRIVACY_VIOLATION" | "RANKING_PROHIBITED" | "POTENTIAL_INFERENCE" | "HIGH_IMPACT_DECISION" | "INVALID_TRANSITION" | "GOVERNANCE_BYPASS";
export interface MasteryFailure { code: MasteryFailureCode; message: string }
