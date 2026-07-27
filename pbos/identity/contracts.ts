import type { PBOSRuntimeContext } from "../context";
import type { CredentialReport } from "../credential";
import type { EcosystemReport } from "../ecosystem";
import type { LearningReport } from "../learning";
import type { MasteryReport } from "../mastery";

export type IdentityInformationClass = "IDENTITY_FACT" | "USER_PROVIDED_INFORMATION" | "INFERRED_INFORMATION";
export type IdentityPermission = "VIEW" | "SHARE" | "EDIT" | "EXPORT" | "CONNECT" | "REVOKE";
export type PrivacyClassification = "PUBLIC" | "SHARED" | "PRIVATE" | "RESTRICTED" | "SENSITIVE";
export type ConsentStatus = "GRANTED" | "PENDING" | "EXPIRED" | "REVOKED" | "DENIED";
export type IdentityVerificationStatus = "VERIFIED" | "PENDING" | "FAILED" | "EXPIRED" | "UNKNOWN";

export interface IdentityAttributeDraft {
  name: string;
  value: string;
  informationClass: IdentityInformationClass;
  sourceReference: string;
  evidenceReferences: string[];
  verified: boolean;
  privacy: PrivacyClassification;
}

export interface IdentityProvenance {
  sourceReferences: string[];
  createdAt: string;
  modificationHistory: IdentityModification[];
  authorizedActor: string;
  evidenceReferences: string[];
  consentBasisIds: string[];
  runtimeContextDigest: string;
}

export interface IdentityModification {
  modificationId: string;
  category: string;
  changedAt: string;
  authorizedActor: string;
  evidenceReferences: string[];
  permission: "EDIT";
}

export interface PersonIdentity {
  identityId: string;
  personReference: string;
  attributes: IdentityAttributeDraft[];
  preferredInformation: Record<string, string>;
  ownershipStatus: "PERSON_OWNED_PBOS_STEWARD";
  permissions: IdentityPermission[];
  privacySettings: Record<string, PrivacyClassification>;
  provenance: IdentityProvenance;
}

export interface OwnershipRecord {
  ownershipId: string;
  ownerIdentity: string;
  stewardIdentity: "PBOS";
  ownedDataCategories: string[];
  accessRights: IdentityPermission[];
  sharingPermissions: IdentityPermission[];
  transferRules: string[];
  consentHistoryIds: string[];
  personOwnsRecord: true;
}

export interface ConsentDraft {
  personReference: string;
  purpose: string;
  dataCategories: string[];
  authorizedRecipient: string;
  expiresAt: string | null;
  status: ConsentStatus;
  evidenceReferences: string[];
  grantedAt: string | null;
}
export interface ConsentRecord extends ConsentDraft { consentId: string; }

export interface PermissionGrant {
  permissionId: string;
  personReference: string;
  recipient: string;
  permissions: IdentityPermission[];
  dataCategories: string[];
  privacyCeiling: PrivacyClassification;
  consentId: string;
  defaultVisibility: "PRIVATE";
}

export interface VerificationDraft {
  personReference: string;
  verificationMethod: string;
  verificationAuthority: string;
  verifiedAt: string;
  evidenceReferences: string[];
  status: IdentityVerificationStatus;
}
export interface IdentityVerification extends VerificationDraft { verificationId: string; }

export interface PortabilityRequest {
  requestId: string;
  personReference: string;
  requestedCategories: string[];
  receivingSystem: string;
  permissions: IdentityPermission[];
  consentEvidenceReferences: string[];
}
export interface PortableIdentity {
  portabilityId: string;
  personReference: string;
  exportableIdentityData: IdentityAttributeDraft[];
  ownershipProof: OwnershipRecord;
  sharingPermissions: IdentityPermission[];
  provenanceHistory: IdentityModification[];
  receivingSystemInformation: string;
  controlledByPerson: true;
}

export interface UserControlledIdentityData {
  personReference: string;
  preferredInformation: Record<string, string>;
  goals: string[];
  preferences: string[];
  attributes: IdentityAttributeDraft[];
  privacySettings: Record<string, PrivacyClassification>;
  requestedPermissions: IdentityPermission[];
  evidenceReferences: string[];
}

export interface IdentityInput {
  runtimeContext: PBOSRuntimeContext | null;
  ecosystemReports: EcosystemReport[];
  credentialReports: CredentialReport[];
  learningReports: LearningReport[];
  masteryReports: MasteryReport[];
  identityData: UserControlledIdentityData;
  consentDrafts: ConsentDraft[];
  verificationDrafts: VerificationDraft[];
  portabilityRequests: PortabilityRequest[];
  modificationHistory: IdentityModification[];
  authorizedPersonReferences: string[];
  generatedAt: string;
  accessRequester: string;
  accessPurpose: string;
  requestedDataCategories: string[];
  requestedPermissions: IdentityPermission[];
  falseIdentityClaimRequested: boolean;
  ownershipBypassRequested: boolean;
  identityRankingRequested: boolean;
  protectedCharacteristicInferenceRequested: boolean;
  dataSaleRequested: boolean;
}

export interface IdentityAccessDecision {
  authorized: true;
  requester: string;
  purpose: string;
  permissions: IdentityPermission[];
  dataCategories: string[];
  consentId: string;
  limitations: string[];
}

export interface IdentityReport {
  reportId: string;
  generatedAt: string;
  runtimeContextDigest: string;
  identityState: PersonIdentity;
  ownershipInformation: OwnershipRecord;
  permissions: PermissionGrant[];
  consentHistory: ConsentRecord[];
  verificationStatus: IdentityVerification[];
  privacyControls: Record<string, PrivacyClassification>;
  portableIdentities: PortableIdentity[];
  accessDecision: IdentityAccessDecision;
  provenanceEvidence: string[];
  limitations: string[];
}

export type IdentityGovernanceAction = "identity-verification" | "consent-decision" | "data-sharing" | "external-access" | "identity-correction";
export type IdentityState = "CREATED" | "VERIFYING" | "VERIFIED" | "ACTIVE" | "SHARING_AUTHORIZED" | "TRANSFER_REQUESTED" | "ARCHIVED";
export interface IdentityLifecycleState { currentState: IdentityState; transitions: Array<{ from: IdentityState; to: IdentityState; transitionedAt: string; authorityIdentity: string; evidenceReferences: string[] }> }
export type IdentityFailureCode = "INVALID_CONTEXT" | "UNAUTHORIZED_ACCESS" | "MISSING_CONSENT" | "FALSE_IDENTITY" | "PRIVACY_VIOLATION" | "OWNERSHIP_BYPASS" | "MISSING_PROVENANCE" | "INVALID_VERIFICATION" | "INFERENCE_PROHIBITED" | "RANKING_PROHIBITED" | "DATA_SALE_PROHIBITED" | "INVALID_TRANSITION" | "GOVERNANCE_BYPASS";
export interface IdentityFailure { code: IdentityFailureCode; message: string; }
