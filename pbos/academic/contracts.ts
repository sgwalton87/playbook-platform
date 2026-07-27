import type { AthleticReport } from "../athletics";
import type { PBOSRuntimeContext } from "../context";
import type { CredentialReport } from "../credential";
import type { IdentityReport } from "../identity";
import type { LearningReport } from "../learning";
import type { MasteryReport } from "../mastery";
import type { OpportunityReport } from "../opportunity";

export type EducationLevel = "MIDDLE_SCHOOL" | "HIGH_SCHOOL" | "COLLEGE" | "TRANSFER" | "GRADUATE" | "ADULT_LEARNER" | "INTERNATIONAL_LEARNER";
export type AcademicPermission = "VIEW" | "SHARE" | "EDIT_PLAN" | "CONNECT_ADVISOR" | "EXPORT" | "REMIND";
export type CourseworkStatus = "COMPLETED" | "IN_PROGRESS" | "PLANNED" | "RECOMMENDED" | "UNVERIFIED";
export type AcademicRecordClass = "VERIFIED_INSTITUTIONAL_RECORD" | "STUDENT_REPORTED_INFORMATION";
export type RequirementType = "GRADUATION" | "COLLEGE_ADMISSION" | "PROGRAM" | "CERTIFICATION" | "ATHLETIC_ELIGIBILITY";
export type RequirementProgress = "APPEARS_COMPLETE" | "IN_PROGRESS" | "MISSING" | "NOT_ASSESSED";
export type AGSubject = "A_HISTORY" | "B_ENGLISH" | "C_MATHEMATICS" | "D_LABORATORY_SCIENCE" | "E_LANGUAGE_OTHER_THAN_ENGLISH" | "F_VISUAL_PERFORMING_ARTS" | "G_COLLEGE_PREPARATORY_ELECTIVE";
export type ReadinessStatus = "READY" | "DEVELOPING" | "NEEDS_EVIDENCE" | "NOT_ASSESSED";

export interface AcademicProvenance { runtimeContextDigest: string; studentOwnerIdentity: string; sourceReportIds: string[]; sourceReferences: string[]; evidenceReferences: string[]; generatedAt: string; authorizedActor: string; }
export interface AcademicIdentityDraft { studentIdentity: string; educationLevel: EducationLevel; institutionHistory: string[]; academicGoals: string[]; interests: string[]; intendedPathways: string[]; permissions: AcademicPermission[]; sourceReference: string; evidenceReferences: string[]; }
export interface AcademicIdentity extends AcademicIdentityDraft { academicIdentityId: string; ownershipStatus: "STUDENT_OWNED_PBOS_STEWARD"; provenance: AcademicProvenance; }

export interface InstitutionDraft { institutionIdentity: string; name: string; institutionType: "MIDDLE_SCHOOL" | "HIGH_SCHOOL" | "COLLEGE" | "UNIVERSITY" | "PROGRAM" | "INTERNATIONAL_INSTITUTION"; country: string; verificationStatus: "VERIFIED" | "PENDING" | "REJECTED"; authorityScope: string[]; sourceReference: string; evidenceReferences: string[]; }
export interface AcademicInstitution extends InstitutionDraft { institutionId: string; provenance: AcademicProvenance; }

export interface CourseworkDraft { courseName: string; subjectArea: string; institutionIdentity: string; grade: string | null; credits: number; term: string; status: CourseworkStatus; recordClass: AcademicRecordClass; evidenceReferences: string[]; sourceAuthority: string | null; }
export interface CourseworkRecord extends CourseworkDraft { courseworkId: string; studentIdentity: string; provenance: AcademicProvenance; }

export interface RequirementDraft { requirementId: string; requirementType: RequirementType; authoritySource: string; institutionOrProgram: string; category: string; requiredEvidence: string[]; completionCriteria: string[]; limitations: string[]; applicableCourseNames: string[]; }
export interface AcademicRequirement extends RequirementDraft { progress: RequirementProgress; supportingCourseworkIds: string[]; decisionMade: false; }

export interface AcademicPathway { pathwayId: string; pathwayType: "HIGH_SCHOOL_GRADUATION" | "A_G" | "COLLEGE_ADMISSION" | "TRANSFER" | "CAREER" | "INTERNATIONAL_EDUCATION"; goal: string; requirementIds: string[]; progress: RequirementProgress[]; missingRequirementIds: string[]; evidenceReferences: string[]; limitations: string[]; admissionGuaranteed: false; graduationGuaranteed: false; institutionalDecisionMade: false; }
export interface AGRequirementDraft { subjectCategory: AGSubject; requiredCourseNames: string[]; sourceAuthority: string; evidenceReferences: string[]; }
export interface AGTrackingRecord extends AGRequirementDraft { agRecordId: string; completedCourseNames: string[]; missingCourseNames: string[]; expandableStandard: true; }

export interface FinancialMilestoneDraft { milestoneType: "FAFSA" | "SCHOLARSHIP_READINESS" | "FINANCIAL_EDUCATION" | "APPLICATION_DEADLINE"; title: string; dueAt: string; sourceReference: string; evidenceReferences: string[]; reminderAuthorized: boolean; }
export interface FinancialReadinessMilestone extends FinancialMilestoneDraft { milestoneId: string; informationalOnly: true; aidOutcomeGuaranteed: false; financialAdviceProvided: false; }

export interface AcademicMilestone { milestoneId: string; title: string; requirementIds: string[]; targetAt: string; evidenceReferences: string[]; status: "PLANNED" | "IN_PROGRESS" | "EVIDENCE_COMPLETE"; institutionalCompletionDecision: false; }
export interface AdvisorDraft { advisorIdentity: string; advisorType: "COUNSELOR" | "TEACHER" | "MENTOR" | "COACH" | "GUARDIAN"; identityVerificationStatus: "VERIFIED" | "PENDING" | "FAILED"; permissions: AcademicPermission[]; consentId: string; relationshipEvidenceReferences: string[]; }
export interface AcademicAdvisor extends AdvisorDraft { advisorRecordId: string; studentIdentity: string; accessAuthorized: true; decisionAuthority: false; }

export interface AcademicReadiness { readinessId: string; studentIdentity: string; courseworkCompletion: ReadinessStatus; requirementProgress: ReadinessStatus; portfolioReadiness: ReadinessStatus; credentialReadiness: ReadinessStatus; applicationPreparation: ReadinessStatus; supportNeeds: string[]; evidenceReferences: string[]; limitations: string[]; informationalOnly: true; predictive: false; ranking: false; }
export interface ScholarAthleteAcademicSupport { supportId: string; studentIdentity: string; eligibilityRequirementIds: string[]; academicMilestoneIds: string[]; balanceConsiderations: string[]; supportAdvisorIds: string[]; athleticEvidenceReferences: string[]; eligibilityDecisionMade: false; }

export interface AcademicInput { runtimeContext: PBOSRuntimeContext | null; identityReports: IdentityReport[]; learningReports: LearningReport[]; masteryReports: MasteryReport[]; credentialReports: CredentialReport[]; opportunityReports: OpportunityReport[]; athleticReports: AthleticReport[]; academicIdentityDraft: AcademicIdentityDraft; institutionDrafts: InstitutionDraft[]; courseworkDrafts: CourseworkDraft[]; requirementDrafts: RequirementDraft[]; agRequirementDrafts: AGRequirementDraft[]; financialMilestoneDrafts: FinancialMilestoneDraft[]; milestones: AcademicMilestone[]; advisorDrafts: AdvisorDraft[]; generatedAt: string; authorizedStudentIdentities: string[]; fabricatedCourseworkRequested: boolean; alteredGradeRequested: boolean; unsupportedRequirementRequested: boolean; guaranteedOutcomeRequested: boolean; rankingRequested: boolean; intelligenceInferenceRequested: boolean; privacyBypassRequested: boolean; institutionalDecisionRequested: boolean; }
export interface AcademicReport { reportId: string; generatedAt: string; runtimeContextDigest: string; academicProfile: AcademicIdentity; institutions: AcademicInstitution[]; coursework: CourseworkRecord[]; requirements: AcademicRequirement[]; pathways: AcademicPathway[]; agTracking: AGTrackingRecord[]; financialReadiness: FinancialReadinessMilestone[]; milestones: AcademicMilestone[]; advisors: AcademicAdvisor[]; readinessIndicators: AcademicReadiness; scholarAthleteSupport: ScholarAthleteAcademicSupport | null; evidence: string[]; limitations: string[]; provenance: AcademicProvenance; }

export type AcademicGovernanceAction = "grade" | "transcript" | "institutional-record" | "admissions-decision" | "eligibility-decision" | "graduation-decision";
export type AcademicState = "CREATED" | "EXPLORING" | "PLANNING" | "TRACKING" | "REVIEWING" | "PATHWAY_READY" | "TRANSITIONING" | "COMPLETED" | "LIFELONG_LEARNING" | "ARCHIVED";
export interface AcademicLifecycleState { currentState: AcademicState; transitions: Array<{ from: AcademicState; to: AcademicState; transitionedAt: string; authorityIdentity: string; evidenceReferences: string[] }> }
export type AcademicFailureCode = "INVALID_CONTEXT" | "FABRICATED_COURSEWORK" | "ALTERED_RECORD" | "UNAUTHORIZED_ACCESS" | "UNSUPPORTED_REQUIREMENT" | "GUARANTEED_OUTCOME" | "OWNERSHIP_VIOLATION" | "PRIVACY_VIOLATION" | "MISSING_EVIDENCE" | "UNAUTHORIZED_ADVISOR" | "FALSE_COMPLETION" | "RANKING_PROHIBITED" | "INFERENCE_PROHIBITED" | "INSTITUTIONAL_DECISION_PROHIBITED" | "INVALID_TRANSITION" | "GOVERNANCE_BYPASS";
export interface AcademicFailure { code: AcademicFailureCode; message: string; }
