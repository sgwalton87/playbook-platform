import type { CommunicationReport } from "../communication";
import type { PBOSRuntimeContext } from "../context";
import type { EcosystemReport } from "../ecosystem";
import type { IdentityReport } from "../identity";
import type { InstitutionReport } from "../institution";
import type { MobilityReport } from "../mobility";
import type { RoleReport } from "../role";
export type AccessRole = "SCHOLAR" | "SCHOLAR_ATHLETE" | "PARENT_GUARDIAN" | "MENTOR" | "COACH" | "TEACHER" | "COUNSELOR" | "COLLEGE_REPRESENTATIVE" | "EMPLOYER" | "COMMUNITY_LEADER" | "FINANCIAL_PROFESSIONAL" | "FOUNDER" | "ORGANIZATION_PARTNER" | "BRAND_STRATEGIC_PARTNER";
export type AgeCategory = "CHILD" | "YOUTH" | "YOUNG_ADULT" | "ADULT";
export type AccessPermission = "VIEW" | "CONNECT" | "MESSAGE" | "SHARE" | "EDIT" | "MANAGE" | "ADMINISTER" | "EXPORT" | "REVOKE";
export type ConsentStatus = "GRANTED" | "PENDING" | "EXPIRED" | "REVOKED" | "DENIED";
export type TrainingCategory = "ATHLETE_COMPLIANCE" | "COACH_COMPLIANCE" | "RECRUITING_COMMUNICATION" | "ELIGIBILITY_PROTECTION" | "NIL_AWARENESS" | "PLATFORM_RULES" | "MENTOR_TRAINING";
export type AccessDecisionKind = "ALLOW" | "DENY" | "REQUIRE_APPROVAL" | "REQUIRE_TRAINING" | "REQUIRE_CONSENT" | "REQUIRE_VERIFICATION";
export type RecruitingFirewallDecision = "AUTHORIZED" | "PENDING_REVIEW" | "REQUIRE_TRAINING" | "REQUIRE_APPROVAL" | "BLOCKED";
export type AccessState = "CREATED" | "VERIFYING" | "VERIFIED" | "ACTIVE" | "RESTRICTED" | "SUSPENDED" | "REVOKED" | "ARCHIVED";
export interface AgeGovernance { category: AgeCategory; minimumAge: number; maximumAge: number | null; restrictions: string[]; requiredSafeguards: string[]; ageOnlyDeterminesAccess: false; }
export interface AccessConsent { consentId: string; personIdentity: string; recipientIdentity: string; purpose: string; dataCategories: string[]; status: ConsentStatus; grantedAt: string | null; expiresAt: string | null; evidenceReferences: string[]; }
export interface TrainingRecord { trainingId: string; userIdentity: string; role: AccessRole; category: TrainingCategory; courseReference: string; status: "COMPLETED" | "IN_PROGRESS" | "EXPIRED" | "NOT_STARTED"; completedAt: string | null; acknowledged: boolean; evidenceReferences: string[]; expiresAt: string | null; }
export interface OnboardingPolicy { role: AccessRole; minimumAge: number; identityRequired: true; roleVerificationRequired: true; institutionVerificationRequired: boolean; guardianConsentRequiredUnder18: boolean; requiredTraining: TrainingCategory[]; allowedOS: string[]; restrictions: string[]; }
export interface AccessRequest { requestId: string; userIdentity: string; role: AccessRole; age: number; ageVerified: boolean; jurisdiction: string; requestedExperience: string; requestedAction: string; requestedPermissions: AccessPermission[]; relationshipId: string | null; consentId: string | null; institutionIdentity: string | null; evidenceReferences: string[]; risk: "LOW" | "MODERATE" | "HIGH" | "CRITICAL"; externalAdultInteraction: boolean; recruitingInteraction: boolean; guardianIdentity: string | null; supervised: boolean; }
export interface AccessApproval { approvalId: string; requestId: string; scope: "ROLE_ACCESS" | "GUARDIAN_ACCESS" | "RECRUITING_CONTACT" | "ADMINISTRATION"; approvedBy: string; status: "APPROVED" | "PENDING" | "DENIED"; evidenceReferences: string[]; }
export interface AccessDecision { decisionId: string; requestId: string; decision: AccessDecisionKind; firewallDecision: RecruitingFirewallDecision | null; reason: string[]; permissions: AccessPermission[]; evidenceReferences: string[]; policyReferences: string[]; decidedAt: string; authorizedActor: string; }
export interface AccessAuditRecord { auditId: string; userIdentity: string; role: AccessRole; requestedAction: string; decision: AccessDecisionKind; permissions: AccessPermission[]; consentId: string | null; complianceStatus: string; evidenceReferences: string[]; timestamp: string; immutable: true; }
export interface AccessInput { runtimeContext: PBOSRuntimeContext | null; identityReports: IdentityReport[]; roleReports: RoleReport[]; institutionReports: InstitutionReport[]; ecosystemReports: EcosystemReport[]; communicationReports: CommunicationReport[]; mobilityReports: MobilityReport[]; requests: AccessRequest[]; consents: AccessConsent[]; trainingRecords: TrainingRecord[]; approvals: AccessApproval[]; generatedAt: string; fakeIdentityRequested: boolean; fakeCoachRequested: boolean; privacyBypassRequested: boolean; permissionBypassRequested: boolean; institutionalDecisionRequested: boolean; eligibilityDeterminationRequested: boolean; legalDeterminationRequested: boolean; guaranteedOutcomeRequested: boolean; }
export interface AccessReport { reportId: string; generatedAt: string; runtimeContextDigest: string; agePolicies: AgeGovernance[]; onboardingPolicies: OnboardingPolicy[]; decisions: AccessDecision[]; auditTrail: AccessAuditRecord[]; evidenceBundle: string[]; limitations: string[]; }
export interface AccessLifecycle { currentState: AccessState; transitions: Array<{ from: AccessState; to: AccessState; transitionedAt: string; actorIdentity: string; evidenceReferences: string[] }>; }
export type AccessFailureCode = "INVALID_CONTEXT" | "UNDERAGE_UNAUTHORIZED" | "FAKE_IDENTITY" | "FAKE_COACH" | "UNAUTHORIZED_RECRUITING" | "MISSING_CONSENT" | "MISSING_TRAINING" | "PRIVACY_VIOLATION" | "PERMISSION_BYPASS" | "INVALID_RELATIONSHIP" | "INVALID_TRANSITION" | "PROHIBITED_DECISION" | "MISSING_EVIDENCE";
export interface AccessFailure { code: AccessFailureCode; message: string; }
