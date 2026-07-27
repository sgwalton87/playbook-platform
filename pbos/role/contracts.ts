import type { AcademicReport } from "../academic";
import type { AthleticReport } from "../athletics";
import type { CompassReport } from "../compass";
import type { PBOSRuntimeContext } from "../context";
import type { EcosystemReport } from "../ecosystem";
import type { IdentityReport } from "../identity";
import type { OpportunityReport } from "../opportunity";
import type { PortfolioReport } from "../portfolio";

export type RoleType = "SCHOLAR" | "SCHOLAR_ATHLETE" | "PARENT_GUARDIAN" | "MENTOR" | "COACH" | "TEACHER" | "COUNSELOR" | "COLLEGE_REPRESENTATIVE" | "EMPLOYER" | "FINANCIAL_PROFESSIONAL" | "COMMUNITY_LEADER" | "FOUNDER" | "ORGANIZATION_PARTNER";
export type RolePermission = "VIEW" | "CONNECT" | "SHARE" | "MENTOR" | "MANAGE" | "ADMINISTER" | "EXPORT" | "REVOKE";
export type RoleVerificationStatus = "VERIFIED" | "PENDING" | "FAILED" | "EXPIRED";
export type RoleState = "REQUESTED" | "VERIFYING" | "APPROVED" | "ACTIVE" | "SUSPENDED" | "REVOKED" | "ARCHIVED";

export interface RoleProvenance {
  runtimeContextDigest: string;
  identityReportId: string;
  ecosystemReportIds: string[];
  authorizationEvidence: string[];
  consentId: string;
  approvalId: string;
  createdAt: string;
  authorizedActor: string;
}

export interface RoleAssignmentDraft {
  personIdentity: string;
  roleType: RoleType;
  organizationIdentity: string | null;
  relationshipId: string | null;
  requestedPermissions: RolePermission[];
  purpose: string;
  verificationStatus: RoleVerificationStatus;
  consentRequired: boolean;
  consentId: string;
  authorizationEvidence: string[];
  requestedAt: string;
}

export interface RoleApproval {
  approvalId: string;
  personIdentity: string;
  roleType: RoleType;
  organizationIdentity: string | null;
  approvedPermissions: RolePermission[];
  approvalScope: "ROLE_VERIFICATION" | "ORGANIZATION_ACCESS" | "ELEVATED_PERMISSION" | "ADMINISTRATIVE_PRIVILEGE";
  approverIdentity: string;
  approvedAt: string;
  evidenceReferences: string[];
  status: "APPROVED" | "PENDING" | "REJECTED";
}

export interface RoleRecord extends RoleAssignmentDraft {
  roleId: string;
  permissions: RolePermission[];
  state: "ACTIVE";
  identityBound: true;
  createsAuthority: false;
  permanentIdentityLabel: false;
  provenance: RoleProvenance;
}

export interface RoleRestriction {
  code: string;
  description: string;
}

export interface RoleExperienceDefinition {
  roleType: RoleType;
  dashboardComponents: string[];
  availableEngines: string[];
  workflows: string[];
  allowedPermissions: RolePermission[];
  restrictions: RoleRestriction[];
}

export interface RoleDashboard {
  dashboardId: string;
  roleId: string;
  roleType: RoleType;
  enabledEngines: string[];
  widgets: string[];
  workflows: string[];
  actions: string[];
  notifications: string[];
  resources: string[];
  permissions: RolePermission[];
  derivedFromRoleAuthority: true;
  crossRolePermissionMerge: false;
}

export interface MultiRoleProfile {
  profileId: string;
  personIdentity: string;
  roleIds: string[];
  dashboards: RoleDashboard[];
  permissionsByRole: Record<string, RolePermission[]>;
  rolesKeptSeparate: true;
}

export interface RoleInput {
  runtimeContext: PBOSRuntimeContext | null;
  identityReports: IdentityReport[];
  ecosystemReports: EcosystemReport[];
  compassReports: CompassReport[];
  academicReports: AcademicReport[];
  athleticReports: AthleticReport[];
  portfolioReports: PortfolioReport[];
  opportunityReports: OpportunityReport[];
  roleAssignments: RoleAssignmentDraft[];
  approvals: RoleApproval[];
  generatedAt: string;
  authorizedPersonIdentities: string[];
  inferredRoleRequested: boolean;
  permissionBypassRequested: boolean;
  authorityCreationRequested: boolean;
  privacyBypassRequested: boolean;
  institutionalDecisionRequested: boolean;
}

export interface RoleReport {
  reportId: string;
  generatedAt: string;
  runtimeContextDigest: string;
  roleRecords: RoleRecord[];
  experienceConfigurations: RoleExperienceDefinition[];
  dashboards: RoleDashboard[];
  multiRoleProfiles: MultiRoleProfile[];
  governanceRoutes: string[];
  evidenceBundle: string[];
  limitations: string[];
}

export interface RoleLifecycleState {
  currentState: RoleState;
  transitions: Array<{ from: RoleState; to: RoleState; transitionedAt: string; authorityIdentity: string; evidenceReferences: string[] }>;
}

export type RoleFailureCode = "INVALID_CONTEXT" | "UNAUTHORIZED_ACCESS" | "INFERRED_ROLE" | "PERMISSION_BYPASS" | "AUTHORITY_CREATION" | "PRIVACY_VIOLATION" | "MISSING_CONSENT" | "MISSING_EVIDENCE" | "INVALID_ROLE" | "INVALID_PERMISSION" | "GOVERNANCE_BYPASS" | "INSTITUTIONAL_DECISION_PROHIBITED" | "INVALID_TRANSITION";
export interface RoleFailure { code: RoleFailureCode; message: string; }
