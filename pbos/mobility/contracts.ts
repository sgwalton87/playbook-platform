import type { AcademicReport } from "../academic";
import type { AthleticReport } from "../athletics";
import type { CommunicationReport } from "../communication";
import type { PBOSRuntimeContext } from "../context";
import type { EcosystemReport } from "../ecosystem";
import type { IdentityReport } from "../identity";
import type { OpportunityReport } from "../opportunity";
import type { PortfolioReport } from "../portfolio";

export type MobilityCategory = "ACADEMIC_TRANSITION" | "ATHLETIC_TRANSITION" | "CAREER_TRANSITION" | "INTERNATIONAL_TRANSITION" | "ENTREPRENEURSHIP_TRANSITION" | "COMMUNITY_TRANSITION";
export type TransitionClassification = "FACT" | "REQUIREMENT" | "INFORMATION_GAP" | "POSSIBLE_NEXT_STEP" | "RECOMMENDATION";
export type MobilityReadinessStatus = "PREPARING" | "IN_PROGRESS" | "INFORMATION_NEEDED" | "READY_FOR_REVIEW";
export type MobilityState = "CREATED" | "EXPLORING" | "PLANNING" | "PREPARING" | "CONNECTING" | "TRANSITIONING" | "REFLECTING" | "ARCHIVED";

export interface MobilityLocation { country: string; region: string; locality: string; organizationIdentity: string | null; verified: boolean; sourceAuthority: string; evidenceReferences: string[]; }
export interface MobilityRequirement { requirementId: string; category: "ACADEMIC" | "ATHLETIC" | "CAREER" | "DOCUMENTATION" | "CULTURAL"; description: string; sourceAuthority: string; verificationStatus: "VERIFIED" | "PENDING" | "UNKNOWN"; evidenceReferences: string[]; limitations: string[]; legalDetermination: false; }
export interface TransitionItem { classification: TransitionClassification; statement: string; evidenceReferences: string[]; limitations: string[]; }
export interface TransitionDraft { currentState: string; desiredState: string; preparationActivities: TransitionItem[]; requirementIds: string[]; milestones: TransitionItem[]; resourceReferences: string[]; possibleBarriers: TransitionItem[]; supportOptions: string[]; }
export interface MobilitySupport { supporterIdentity: string; relationshipId: string; communicationMessageId: string; role: "MENTOR" | "COACH" | "COUNSELOR" | "ORGANIZATION" | "ADVISOR"; consentId: string; permissions: Array<"VIEW" | "CONNECT">; evidenceReferences: string[]; }
export interface MobilityDocument { documentId: string; category: string; sourceAuthority: string; status: "AVAILABLE" | "NEEDED" | "PENDING_VERIFICATION"; evidenceReferences: string[]; legalAdvice: false; }
export interface MobilityJourneyDraft { personIdentity: string; category: MobilityCategory; origin: MobilityLocation; destination: MobilityLocation; goal: string; timeline: { startsAt: string; targetAt: string }; evidenceReferences: string[]; requirementIds: string[]; supportRelationshipIds: string[]; limitations: string[]; transition: TransitionDraft; opportunityIds: string[]; documentIds: string[]; }
export interface MobilityReadiness { readinessId: string; transitionGoal: string; status: MobilityReadinessStatus; knownRequirementIds: string[]; completedPreparation: string[]; missingInformation: string[]; evidenceReferences: string[]; limitations: string[]; informationalOnly: true; guaranteesSuccess: false; }
export interface MobilityJourney extends MobilityJourneyDraft { journeyId: string; ownerIdentity: string; ownershipStatus: "PERSON_OWNED_PBOS_STEWARD"; readiness: MobilityReadiness; athleticDecisionMade: false; admissionDecisionMade: false; employmentDecisionMade: false; placementGuaranteed: false; provenance: { runtimeContextDigest: string; sourceReportIds: string[]; evidenceReferences: string[]; generatedAt: string; authorizedActor: string }; }

export interface MobilityInput { runtimeContext: PBOSRuntimeContext | null; identityReports: IdentityReport[]; academicReports: AcademicReport[]; athleticReports: AthleticReport[]; portfolioReports: PortfolioReport[]; opportunityReports: OpportunityReport[]; ecosystemReports: EcosystemReport[]; communicationReports: CommunicationReport[]; journeyDrafts: MobilityJourneyDraft[]; requirements: MobilityRequirement[]; supports: MobilitySupport[]; documents: MobilityDocument[]; authorizedPersonIdentities: string[]; generatedAt: string; guaranteedOutcomeRequested: boolean; fabricatedPathwayRequested: boolean; recruitingDecisionRequested: boolean; admissionsDecisionRequested: boolean; employmentDecisionRequested: boolean; legalDeterminationRequested: boolean; rankingRequested: boolean; privacyBypassRequested: boolean; }
export interface MobilityReport { reportId: string; generatedAt: string; runtimeContextDigest: string; personIdentities: string[]; journeys: MobilityJourney[]; origins: MobilityLocation[]; destinations: MobilityLocation[]; requirements: MobilityRequirement[]; readiness: MobilityReadiness[]; opportunityIds: string[]; supportResources: MobilitySupport[]; documents: MobilityDocument[]; evidenceBundle: string[]; limitations: string[]; }
export interface MobilityLifecycle { currentState: MobilityState; transitions: Array<{ from: MobilityState; to: MobilityState; transitionedAt: string; actorIdentity: string; evidenceReferences: string[] }>; }
export type MobilityFailureCode = "INVALID_CONTEXT" | "UNSUPPORTED_TRANSITION" | "FABRICATED_DESTINATION" | "MISSING_EVIDENCE" | "UNAUTHORIZED_ACCESS" | "GUARANTEED_OUTCOME" | "RECRUITING_DECISION_PROHIBITED" | "ADMISSIONS_DECISION_PROHIBITED" | "EMPLOYMENT_DECISION_PROHIBITED" | "LEGAL_DETERMINATION_PROHIBITED" | "RANKING_PROHIBITED" | "PRIVACY_VIOLATION" | "INVALID_SUPPORT" | "INVALID_TRANSITION" | "GOVERNANCE_BYPASS";
export interface MobilityFailure { code: MobilityFailureCode; message: string; }
