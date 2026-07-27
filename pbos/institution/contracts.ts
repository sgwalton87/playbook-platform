import type { AcademicReport } from "../academic";
import type { AthleticReport } from "../athletics";
import type { CommunicationReport } from "../communication";
import type { PBOSRuntimeContext } from "../context";
import type { EcosystemReport } from "../ecosystem";
import type { IdentityReport } from "../identity";
import type { MobilityReport } from "../mobility";
import type { OpportunityReport } from "../opportunity";
import type { RoleReport } from "../role";
export type InstitutionType = "SCHOOL" | "DISTRICT" | "COLLEGE" | "UNIVERSITY" | "ATHLETIC_ORGANIZATION" | "NONPROFIT" | "EMPLOYER" | "COMMUNITY_ORGANIZATION" | "PARTNER";
export type InstitutionVerificationStatus = "PENDING" | "VERIFIED" | "SUSPENDED" | "REVOKED" | "ARCHIVED";
export type InstitutionPermission = "VIEW" | "CONNECT" | "OPERATE_PROGRAM" | "COMMUNICATE" | "SHARE" | "ADMINISTER";
export type ParticipantRelationshipType = "STUDENT" | "ATHLETE" | "MENTEE" | "PARTICIPANT" | "APPLICANT" | "EMPLOYEE" | "PARTNER";
export type ImpactClassification = "FACT" | "OBSERVED_RESULT" | "PATTERN" | "RECOMMENDATION";
export type InstitutionState = "CREATED" | "VERIFYING" | "VERIFIED" | "ACTIVE" | "PROGRAM_OPERATING" | "REVIEWING" | "SUSPENDED" | "ARCHIVED";
export interface InstitutionDraft { institutionIdentity: string; institutionType: InstitutionType; name: string; mission: string; location: string; verificationStatus: InstitutionVerificationStatus; representativeRoleIds: string[]; ownershipReference: string; permissions: InstitutionPermission[]; evidenceReferences: string[]; approvalId: string; }
export interface InstitutionRecord extends InstitutionDraft { institutionId: string; participantDataOwner: false; provenance: { runtimeContextDigest: string; ecosystemReportIds: string[]; evidenceReferences: string[]; verifiedBy: string; generatedAt: string }; }
export interface InstitutionApproval { approvalId: string; institutionIdentity: string; scope: "INSTITUTION_VERIFICATION" | "REPRESENTATIVE_ACCESS" | "PARTICIPANT_PROGRAM" | "EXTERNAL_SHARING" | "ADMINISTRATIVE_PERMISSION"; approvedBy: string; status: "APPROVED" | "PENDING" | "REJECTED"; evidenceReferences: string[]; }
export interface ProgramDraft { programId: string; institutionIdentity: string; purpose: string; description: string; eligibilityInformation: string[]; participantRelationshipIds: string[]; requirements: string[]; resources: string[]; startsAt: string; endsAt: string; evidenceReferences: string[]; }
export interface ProgramRecord extends ProgramDraft { provenance: string[]; decisionsMade: false; }
export interface ParticipantRelationshipDraft { relationshipId: string; institutionIdentity: string; personIdentity: string; relationshipType: ParticipantRelationshipType; purpose: string; permissions: InstitutionPermission[]; consentId: string; evidenceReferences: string[]; }
export interface ParticipantRelationship extends ParticipantRelationshipDraft { verifiedInstitution: true; verifiedPerson: true; consentVerified: true; personRetainsOwnership: true; }
export interface CohortDraft { cohortId: string; programId: string; memberRelationshipIds: string[]; startsAt: string; endsAt: string; milestones: string[]; communicationMessageIds: string[]; supportResources: string[]; }
export interface CohortRecord extends CohortDraft { individualOwnershipPreserved: true; }
export interface ImpactDraft { impactId: string; programId: string; participantRelationshipIds: string[]; activities: string[]; statements: Array<{ classification: ImpactClassification; statement: string; evidenceReferences: string[] }>; limitations: string[]; }
export interface ImpactRecord extends ImpactDraft { causalClaimMade: false; }
export interface InstitutionDashboard { dashboardId: string; institutionId: string; institutionType: InstitutionType; representativeRoleIds: string[]; widgets: string[]; permissions: InstitutionPermission[]; roleBased: true; }
export interface InstitutionInput { runtimeContext: PBOSRuntimeContext | null; identityReports: IdentityReport[]; ecosystemReports: EcosystemReport[]; roleReports: RoleReport[]; opportunityReports: OpportunityReport[]; academicReports: AcademicReport[]; athleticReports: AthleticReport[]; communicationReports: CommunicationReport[]; mobilityReports: MobilityReport[]; institutionDrafts: InstitutionDraft[]; approvals: InstitutionApproval[]; programDrafts: ProgramDraft[]; relationshipDrafts: ParticipantRelationshipDraft[]; cohortDrafts: CohortDraft[]; impactDrafts: ImpactDraft[]; generatedAt: string; fakeInstitutionRequested: boolean; unauthorizedRepresentativeRequested: boolean; privacyBypassRequested: boolean; unsupportedOutcomeRequested: boolean; consentBypassRequested: boolean; participantRankingRequested: boolean; institutionalDecisionRequested: boolean; dataSaleRequested: boolean; }
export interface InstitutionReport { reportId: string; generatedAt: string; runtimeContextDigest: string; institutions: InstitutionRecord[]; programs: ProgramRecord[]; participantRelationships: ParticipantRelationship[]; cohorts: CohortRecord[]; dashboards: InstitutionDashboard[]; impactRecords: ImpactRecord[]; evidenceBundle: string[]; limitations: string[]; }
export interface InstitutionLifecycle { currentState: InstitutionState; transitions: Array<{ from: InstitutionState; to: InstitutionState; transitionedAt: string; actorIdentity: string; evidenceReferences: string[] }>; }
export type InstitutionFailureCode = "INVALID_CONTEXT" | "FAKE_INSTITUTION" | "UNAUTHORIZED_REPRESENTATIVE" | "PRIVACY_VIOLATION" | "UNSUPPORTED_OUTCOME" | "CONSENT_BYPASS" | "MISSING_EVIDENCE" | "INVALID_PROGRAM" | "INVALID_RELATIONSHIP" | "RANKING_PROHIBITED" | "INSTITUTIONAL_DECISION_PROHIBITED" | "DATA_SALE_PROHIBITED" | "GOVERNANCE_BYPASS" | "INVALID_TRANSITION";
export interface InstitutionFailure { code: InstitutionFailureCode; message: string; }
