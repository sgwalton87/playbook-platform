import type { PBOSRuntimeContext } from "../context";
import type { CredentialReport } from "../credential";
import type { IdentityReport } from "../identity";
import type { LearningReport } from "../learning";
import type { MasteryReport } from "../mastery";
import type { OpportunityReport } from "../opportunity";

export type PortfolioVisibility = "PRIVATE" | "SHARED" | "PUBLIC";
export type PortfolioPermission = "VIEW" | "SHARE" | "EDIT" | "EXPORT" | "CURATE" | "PRESENT" | "ARCHIVE";
export type ArtifactType = "PROJECT" | "ACHIEVEMENT" | "REFLECTION" | "PRESENTATION" | "RESEARCH" | "SERVICE" | "ATHLETIC_DEVELOPMENT" | "CREATIVE_WORK" | "ENTREPRENEURSHIP" | "LEADERSHIP";
export type EvidenceClassification = "VERIFIED" | "USER_PROVIDED" | "PENDING" | "UNVERIFIED";
export type ConnectionConfidence = "HIGH" | "MEDIUM" | "LOW";

export interface PortfolioProvenance {
  runtimeContextDigest: string;
  ownerIdentity: string;
  sourceReportIds: string[];
  sourceReferences: string[];
  evidenceReferences: string[];
  createdAt: string;
  authorizedActor: string;
}

export interface EvidenceDraft {
  sourceReference: string;
  classification: EvidenceClassification;
  verificationAuthority: string | null;
  observedAt: string;
  supportingRecordIds: string[];
  limitations: string[];
}
export interface PortfolioEvidence extends EvidenceDraft {
  evidenceId: string;
  isClaim: false;
  provenance: PortfolioProvenance;
}

export interface ArtifactDraft {
  ownerIdentity: string;
  artifactType: ArtifactType;
  title: string;
  description: string;
  createdAt: string;
  evidenceSourceReferences: string[];
  relatedCompetencies: string[];
  relatedCredentialIds: string[];
  permissions: PortfolioPermission[];
  sourceReference: string;
}
export interface PortfolioArtifact extends Omit<ArtifactDraft, "evidenceSourceReferences"> {
  artifactId: string;
  evidenceIds: string[];
  provenance: PortfolioProvenance;
}

export interface CompetencyConnection {
  connectionId: string;
  artifactId: string;
  competency: string;
  evidenceIds: string[];
  explanation: string;
  confidence: ConnectionConfidence;
  limitations: string[];
  guaranteedOutcome: false;
}

export interface ReflectionDraft {
  authorIdentity: string;
  experienceReference: string;
  reflectionText: string;
  lessonsLearned: string[];
  growthAreas: string[];
  futureGoals: string[];
  reflectedAt: string;
}
export interface PortfolioReflection extends ReflectionDraft {
  reflectionId: string;
  ownerIdentity: string;
  authoredByPerson: true;
}

export interface NarrativeDraft {
  authorIdentity: string;
  storySections: string[];
  experienceReferences: string[];
  achievementArtifactTitles: string[];
  goals: string[];
  values: string[];
  evidenceSourceReferences: string[];
  personalVoiceConfirmed: boolean;
}
export interface PortfolioNarrative extends Omit<NarrativeDraft, "evidenceSourceReferences" | "personalVoiceConfirmed"> {
  narrativeId: string;
  evidenceIds: string[];
  voiceStandard: "AUTHENTIC_PERSONAL_VOICE";
  personAuthored: true;
  fabricatedContent: false;
}

export interface ShowcaseDraft {
  ownerIdentity: string;
  selectedArtifactTitles: string[];
  audience: string;
  permissions: PortfolioPermission[];
  purpose: string;
  sharingStatus: "PRIVATE" | "AUTHORIZED" | "EXPIRED" | "REVOKED";
}
export interface PortfolioShowcase extends Omit<ShowcaseDraft, "selectedArtifactTitles"> {
  showcaseId: string;
  selectedArtifactIds: string[];
  defaultVisibility: "PRIVATE";
}

export interface SharingDraft {
  ownerIdentity: string;
  recipient: string;
  purpose: string;
  dataCategories: string[];
  expiresAt: string;
  consentEvidenceReferences: string[];
  ownerApproved: boolean;
  visibility: PortfolioVisibility;
}
export interface PortfolioSharingGrant extends SharingDraft {
  sharingId: string;
  consentId: string;
  active: true;
}

export interface PortfolioRecord {
  portfolioId: string;
  ownerIdentity: string;
  stewardIdentity: "PBOS";
  purpose: string;
  visibility: PortfolioVisibility;
  artifactIds: string[];
  evidenceIds: string[];
  competencies: string[];
  narrativeIds: string[];
  provenance: PortfolioProvenance;
  permissions: PortfolioPermission[];
  personOwnsPortfolio: true;
}

export interface PortfolioInput {
  runtimeContext: PBOSRuntimeContext | null;
  identityReports: IdentityReport[];
  learningReports: LearningReport[];
  masteryReports: MasteryReport[];
  credentialReports: CredentialReport[];
  opportunityReports: OpportunityReport[];
  ownerIdentity: string;
  purpose: string;
  requestedVisibility: PortfolioVisibility;
  requestedPermissions: PortfolioPermission[];
  evidenceDrafts: EvidenceDraft[];
  artifactDrafts: ArtifactDraft[];
  reflectionDrafts: ReflectionDraft[];
  narrativeDrafts: NarrativeDraft[];
  showcaseDrafts: ShowcaseDraft[];
  sharingDrafts: SharingDraft[];
  generatedAt: string;
  authorizedOwnerIdentities: string[];
  fabricatedArtifactRequested: boolean;
  falseAchievementRequested: boolean;
  alteredEvidenceRequested: boolean;
  ownershipBypassRequested: boolean;
  portfolioRankingRequested: boolean;
  protectedCharacteristicInferenceRequested: boolean;
  guaranteedOutcomeRequested: boolean;
}

export interface PortfolioReport {
  reportId: string;
  generatedAt: string;
  runtimeContextDigest: string;
  portfolioState: PortfolioRecord;
  artifacts: PortfolioArtifact[];
  evidence: PortfolioEvidence[];
  competencyConnections: CompetencyConnection[];
  credentials: string[];
  reflections: PortfolioReflection[];
  narrativeElements: PortfolioNarrative[];
  showcases: PortfolioShowcase[];
  sharingGrants: PortfolioSharingGrant[];
  permissions: PortfolioPermission[];
  limitations: string[];
  provenanceBundle: PortfolioProvenance;
}

export type PortfolioGovernanceAction = "ownership-decision" | "sharing" | "external-presentation" | "correction" | "verification";
export type PortfolioState = "CREATED" | "BUILDING" | "CURATING" | "REVIEWING" | "SHARING_AUTHORIZED" | "PRESENTED" | "ARCHIVED";
export interface PortfolioLifecycleState { currentState: PortfolioState; transitions: Array<{ from: PortfolioState; to: PortfolioState; transitionedAt: string; authorityIdentity: string; evidenceReferences: string[] }> }
export type PortfolioFailureCode = "INVALID_CONTEXT" | "FABRICATED_ARTIFACT" | "MISSING_EVIDENCE" | "UNAUTHORIZED_SHARING" | "OWNERSHIP_VIOLATION" | "FALSE_ACHIEVEMENT" | "ALTERED_EVIDENCE" | "PRIVACY_VIOLATION" | "PERSONAL_VOICE_VIOLATION" | "RANKING_PROHIBITED" | "INFERENCE_PROHIBITED" | "GUARANTEE_PROHIBITED" | "INVALID_TRANSITION" | "GOVERNANCE_BYPASS";
export interface PortfolioFailure { code: PortfolioFailureCode; message: string; }
