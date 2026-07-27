import type { PBOSRuntimeContext } from "../context";
import type { CredentialReport } from "../credential";
import type { EcosystemReport } from "../ecosystem";
import type { IdentityReport } from "../identity";
import type { MasteryReport } from "../mastery";
import type { OpportunityReport } from "../opportunity";
import type { PortfolioReport } from "../portfolio";

export type AthleteDevelopmentStage = "YOUTH" | "SCHOLAR_ATHLETE" | "COLLEGIATE" | "PROFESSIONAL" | "INTERNATIONAL" | "POST_ATHLETIC";
export type AthleticPermission = "VIEW" | "SHARE" | "EDIT" | "EXPORT" | "CONNECT" | "REPRESENT";
export type PerformanceEvidenceClassification = "VERIFIED" | "ATHLETE_PROVIDED" | "PENDING" | "UNVERIFIED";
export type AthleticOrganizationType = "HIGH_SCHOOL" | "COLLEGE" | "CLUB" | "PROFESSIONAL_TEAM" | "INTERNATIONAL_ORGANIZATION";
export type ReadinessLevel = "READY" | "DEVELOPING" | "NEEDS_EVIDENCE" | "NOT_ASSESSED";

export interface AthleticProvenance {
  runtimeContextDigest: string;
  athleteOwnerIdentity: string;
  sourceReportIds: string[];
  sourceReferences: string[];
  evidenceReferences: string[];
  generatedAt: string;
  authorizedActor: string;
}

export interface AthleteIdentityDraft {
  ownerIdentity: string;
  sport: string;
  positions: string[];
  developmentStage: AthleteDevelopmentStage;
  goals: string[];
  locationPreferences: string[];
  opportunityPreferences: string[];
  permissions: AthleticPermission[];
  sourceReference: string;
  evidenceReferences: string[];
}
export interface AthleteIdentity extends AthleteIdentityDraft {
  athleteId: string;
  ownershipStatus: "ATHLETE_OWNED_PBOS_STEWARD";
  provenance: AthleticProvenance;
}

export interface AthleticPortfolioDraft {
  biography: string;
  sportHistory: string[];
  teams: string[];
  seasons: string[];
  statistics: string[];
  awards: string[];
  achievements: string[];
  videoReferences: string[];
  academicInformation: string[];
  leadershipExperiences: string[];
  communityInvolvement: string[];
  careerInterests: string[];
  evidenceReferences: string[];
}
export interface AthleticProfile extends AthleticPortfolioDraft {
  profileId: string;
  athleteId: string;
  provenance: AthleticProvenance;
}

export interface PerformanceEvidenceDraft {
  athleteOwnerIdentity: string;
  sport: string;
  event: string;
  statistic: string;
  sourceReference: string;
  classification: PerformanceEvidenceClassification;
  verificationAuthority: string | null;
  observedAt: string;
  limitations: string[];
}
export interface PerformanceEvidence extends PerformanceEvidenceDraft {
  evidenceId: string;
  athleteId: string;
  isAthleteClaim: false;
  provenance: AthleticProvenance;
}

export interface AthleticOrganizationDraft {
  organizationIdentity: string;
  organizationType: AthleticOrganizationType;
  sport: string;
  league: string;
  country: string;
  verificationStatus: "VERIFIED" | "PENDING" | "REJECTED";
  ownership: string;
  contactPermissions: AthleticPermission[];
  opportunitySourceReferences: string[];
  evidenceReferences: string[];
}
export interface AthleticOrganization extends AthleticOrganizationDraft { organizationId: string; provenance: AthleticProvenance; }

export interface RecruitingOpportunityDraft {
  opportunityId: string;
  organizationIdentity: string;
  league: string;
  location: string;
  rosterNeeds: string[];
  requirements: string[];
  contactInformation: string[];
  sourceReference: string;
  evidenceReferences: string[];
  verificationStatus: "VERIFIED" | "PENDING" | "REJECTED";
}
export interface RecruitingAlignment {
  alignmentId: string;
  athleteId: string;
  opportunityId: string;
  alignedPositions: string[];
  alignedLocations: string[];
  developmentObjectives: string[];
  evidenceReferences: string[];
  limitations: string[];
  advisoryOnly: true;
  recruitingDecisionMade: false;
  guaranteedOutcome: false;
}

export interface MobilityDraft {
  originLocation: string;
  destinationLocation: string;
  sportPathway: string;
  eligibilityConsiderations: string[];
  documentationRequirements: string[];
  preparationNeeds: string[];
  transitionResources: string[];
  evidenceReferences: string[];
}
export interface GlobalAthleteMobility extends MobilityDraft {
  mobilityId: string;
  athleteId: string;
  outcomeGuaranteed: false;
  eligibilityDecisionMade: false;
}

export interface ReadinessAssessment {
  readinessId: string;
  athleteId: string;
  athleticPreparation: ReadinessLevel;
  academicPreparation: ReadinessLevel;
  portfolioCompleteness: ReadinessLevel;
  documentationReadiness: ReadinessLevel;
  communicationReadiness: ReadinessLevel;
  transitionReadiness: ReadinessLevel;
  evidenceReferences: string[];
  limitations: string[];
  informationalOnly: true;
  prediction: false;
}

export interface RepresentationDraft {
  representativeIdentity: string;
  representativeType: "AGENT" | "ADVISOR" | "RECRUITER" | "ATHLETE_ADVOCATE";
  organizationIdentity: string;
  identityVerificationStatus: "VERIFIED" | "PENDING" | "FAILED";
  organizationVerificationStatus: "VERIFIED" | "PENDING" | "FAILED";
  permissions: AthleticPermission[];
  relationshipId: string;
  relationshipEvidenceReferences: string[];
}
export interface AthleteRepresentation extends RepresentationDraft {
  representationId: string;
  athleteId: string;
  athleteConsentVerified: true;
  decisionAuthority: false;
}

export interface AthletesAbroadProgramDraft {
  programName: string;
  partnerOrganizationIdentity: string;
  programType: "ATHLETE_PREPARATION" | "INTERNATIONAL_EDUCATION" | "TRANSITION_RESOURCE" | "VERIFIED_OPPORTUNITY_PATHWAY";
  originCountries: string[];
  destinationCountries: string[];
  consentEvidenceReferences: string[];
  evidenceReferences: string[];
}
export interface AthletesAbroadProgram extends AthletesAbroadProgramDraft {
  programId: string;
  verifiedPartner: true;
  athleteOwnershipPreserved: true;
  connectionCreated: false;
}

export interface AthleticInput {
  runtimeContext: PBOSRuntimeContext | null;
  identityReports: IdentityReport[];
  portfolioReports: PortfolioReport[];
  masteryReports: MasteryReport[];
  credentialReports: CredentialReport[];
  opportunityReports: OpportunityReport[];
  ecosystemReports: EcosystemReport[];
  athleteIdentityDraft: AthleteIdentityDraft;
  athleticPortfolioDraft: AthleticPortfolioDraft;
  performanceEvidenceDrafts: PerformanceEvidenceDraft[];
  organizationDrafts: AthleticOrganizationDraft[];
  recruitingOpportunityDrafts: RecruitingOpportunityDraft[];
  mobilityDrafts: MobilityDraft[];
  representationDrafts: RepresentationDraft[];
  athletesAbroadProgramDrafts: AthletesAbroadProgramDraft[];
  generatedAt: string;
  authorizedAthleteIdentities: string[];
  fabricatedStatisticRequested: boolean;
  falseOpportunityRequested: boolean;
  recruitingDecisionRequested: boolean;
  athleteRankingRequested: boolean;
  protectedCharacteristicInferenceRequested: boolean;
  guaranteedOutcomeRequested: boolean;
  privacyBypassRequested: boolean;
}

export interface AthleticReport {
  reportId: string;
  generatedAt: string;
  runtimeContextDigest: string;
  athleteProfile: AthleticProfile;
  athleteIdentity: AthleteIdentity;
  evidenceInventory: PerformanceEvidence[];
  organizations: AthleticOrganization[];
  opportunities: RecruitingOpportunityDraft[];
  recruitingAlignments: RecruitingAlignment[];
  mobilityPathways: GlobalAthleteMobility[];
  representations: AthleteRepresentation[];
  athletesAbroadPrograms: AthletesAbroadProgram[];
  relationships: string[];
  readinessIndicators: ReadinessAssessment;
  limitations: string[];
  provenanceBundle: AthleticProvenance;
}

export type AthleticGovernanceAction = "recruiting-decision" | "contract" | "representation" | "eligibility-decision" | "team-selection" | "admissions" | "employment-decision";
export type AthleticState = "CREATED" | "DEVELOPING" | "SHOWCASE_READY" | "OPPORTUNITY_SEARCH" | "CONNECTED" | "TRANSITIONING" | "ACTIVE" | "POST_ATHLETIC" | "ARCHIVED";
export interface AthleticLifecycleState { currentState: AthleticState; transitions: Array<{ from: AthleticState; to: AthleticState; transitionedAt: string; authorityIdentity: string; evidenceReferences: string[] }> }
export type AthleticFailureCode = "INVALID_CONTEXT" | "FABRICATED_STATISTIC" | "UNAUTHORIZED_ACCESS" | "FALSE_OPPORTUNITY" | "UNSUPPORTED_RECRUITING_DECISION" | "PRIVACY_VIOLATION" | "OWNERSHIP_VIOLATION" | "MISSING_EVIDENCE" | "UNAUTHORIZED_REPRESENTATION" | "UNKNOWN_REPRESENTATIVE" | "RANKING_PROHIBITED" | "INFERENCE_PROHIBITED" | "GUARANTEE_PROHIBITED" | "INVALID_TRANSITION" | "GOVERNANCE_BYPASS";
export interface AthleticFailure { code: AthleticFailureCode; message: string; }
