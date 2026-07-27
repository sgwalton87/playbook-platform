import type { PBOSRuntimeContext } from "../context";
import type { LearningReport } from "../learning";
import type { MasteryReport } from "../mastery";

export type IssuerClassification = "EDUCATIONAL" | "ATHLETIC" | "PROFESSIONAL" | "COMMUNITY" | "EMPLOYER" | "PLATFORM";
export type CredentialType = "BADGE" | "CERTIFICATE" | "CREDENTIAL";
export type CredentialVerificationStatus = "VALID" | "EXPIRED" | "REVOKED" | "PENDING" | "INVALID";

export interface IssuerAuthority {
  issuerId: string;
  organizationIdentity: string;
  classification: IssuerClassification;
  authorityScope: string[];
  verificationStatus: "VERIFIED" | "PENDING" | "REJECTED";
  approvalRecords: string[];
  ownership: string;
  limitations: string[];
}

export interface IssuanceApproval {
  approvalId: string;
  issuerId: string;
  recipientId: string;
  approvedCredentialTypes: CredentialType[];
  approvedCompetencies: string[];
  approverIdentity: string;
  approvedAt: string;
  evidenceReferences: string[];
  status: "APPROVED" | "PENDING" | "REJECTED";
}

export interface CredentialDraft {
  credentialType: CredentialType;
  title: string;
  description: string;
  recipientIdentity: string;
  issuerId: string;
  requirements: string[];
  evidenceReferences: string[];
  competencyMappings: string[];
  issueDate: string;
  expirationDate: string | null;
  approvalId: string;
}

export interface CredentialProvenance {
  runtimeContextDigest: string;
  masteryReportIds: string[];
  learningReportIds: string[];
  evidenceReferences: string[];
  issuerApprovalIds: string[];
}

export interface CredentialRecord extends CredentialDraft {
  credentialId: string;
  issuerIdentity: string;
  issuingAuthority: string[];
  status: "ISSUED" | "PENDING";
  verificationInformation: CredentialVerification;
  provenance: CredentialProvenance;
  statement: "Recognition of verified achievement; not a measure of human worth or future potential.";
}

export interface BadgeDraft {
  title: string;
  criteria: string[];
  evidenceRequirements: string[];
  issuerId: string;
  recipientIdentity: string;
  competenciesRepresented: string[];
  evidenceReferences: string[];
  metadata: Record<string, string>;
  approvalId: string;
}

export interface BadgeRecord extends BadgeDraft {
  badgeId: string;
  verificationStatus: CredentialVerificationStatus;
  masteryImplied: false;
}

export interface CertificateDraft {
  issuingOrganization: string;
  issuerId: string;
  recipientIdentity: string;
  achievementRecognized: string;
  requirementsSatisfied: string[];
  evidenceReferences: string[];
  signatureApprovals: string[];
  issueDate: string;
  approvalId: string;
}

export interface CertificateRecord extends CertificateDraft {
  certificateId: string;
  verificationStatus: CredentialVerificationStatus;
  institutionallyAuthorized: true;
}

export interface CredentialVerification {
  credentialIdentity: string;
  issuerIdentity: string;
  recipientIdentity: string;
  evidenceReferences: string[];
  validationStatus: CredentialVerificationStatus;
  verificationTimestamp: string;
  verificationAuthority: string;
}

export interface PortabilityPermission {
  ownerId: string;
  credentialId: string;
  sharingPermission: "PRIVATE" | "AUTHORIZED_PARTIES" | "PUBLIC";
  authorizedPartyIds: string[];
  verificationMethod: string;
  externalReferenceCompatibility: string[];
}

export interface PortableCredential extends PortabilityPermission {
  portabilityId: string;
  credentialData: CredentialRecord;
  ownershipPreserved: true;
}

export interface CredentialHistoryEvent {
  eventId: string;
  credentialId: string;
  eventType: "ISSUED" | "VERIFIED" | "EXPIRED" | "REVOKED" | "CORRECTED" | "SUPERSEDED" | "SHARED" | "ARCHIVED";
  occurredAt: string;
  authorityIdentity: string;
  reason: string;
  evidenceReferences: string[];
  previousCredentialId: string | null;
  preserved: true;
}

export interface CredentialInput {
  runtimeContext: PBOSRuntimeContext | null;
  recipientIdentity: string;
  masteryReports: MasteryReport[];
  learningReports: LearningReport[];
  issuers: IssuerAuthority[];
  issuanceApprovals: IssuanceApproval[];
  credentialDrafts: CredentialDraft[];
  badgeDrafts: BadgeDraft[];
  certificateDrafts: CertificateDraft[];
  portabilityPermissions: PortabilityPermission[];
  historyEvents: CredentialHistoryEvent[];
  generatedAt: string;
  authorizedRecipientIds: string[];
  fabricatedCredentialRequested: boolean;
  rankingRequested: boolean;
  opportunityGuaranteeRequested: boolean;
}

export interface CredentialReport {
  reportId: string;
  generatedAt: string;
  runtimeContextDigest: string;
  recipientIdentity: string;
  credentialInventory: CredentialRecord[];
  badges: BadgeRecord[];
  certificates: CertificateRecord[];
  issuerInformation: IssuerAuthority[];
  verificationState: CredentialVerification[];
  portableCredentials: PortableCredential[];
  credentialHistory: CredentialHistoryEvent[];
  evidenceBundle: string[];
  competencyMappings: string[];
  limitations: string[];
  provenance: CredentialProvenance;
}

export type CredentialGovernanceAction = "credential-issuance" | "issuer-approval" | "certification-recognition" | "institutional-recognition" | "external-acceptance";
export type CredentialState = "CREATED" | "EVIDENCE_ATTACHED" | "ISSUER_VALIDATION" | "APPROVAL_REVIEW" | "ISSUED" | "VERIFIED" | "SHARED" | "EXPIRED" | "REVOKED" | "ARCHIVED";
export interface CredentialLifecycleState { currentState: CredentialState; transitions: Array<{ from: CredentialState; to: CredentialState; transitionedAt: string; authorityIdentity: string; evidenceReferences: string[] }> }
export type CredentialFailureCode = "INVALID_CONTEXT" | "UNAUTHORIZED_ISSUER" | "MISSING_EVIDENCE" | "IDENTITY_MISMATCH" | "FABRICATED_CREDENTIAL" | "PRIVACY_VIOLATION" | "RANKING_PROHIBITED" | "OPPORTUNITY_GUARANTEE" | "INVALID_TRANSITION" | "GOVERNANCE_BYPASS";
export interface CredentialFailure { code: CredentialFailureCode; message: string }
