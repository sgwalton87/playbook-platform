import type { PBOSRuntimeContext } from "../context";
import type { CredentialReport } from "../credential";
import type { KnowledgeReport } from "../knowledge";
import type { OpportunityReport } from "../opportunity";

export type EcosystemEntityType = "PERSON" | "MENTOR" | "COACH" | "EDUCATOR" | "INSTITUTION" | "ORGANIZATION" | "COMMUNITY" | "RESOURCE" | "PROGRAM" | "PARTNER";
export type EcosystemPermission = "PROFILE" | "RELATIONSHIP" | "SUPPORT_NETWORK" | "RESOURCE_MATCH" | "REPORT";

export interface EntityDraft {
  name: string;
  entityType: EcosystemEntityType;
  ownership: string;
  verificationStatus: "VERIFIED" | "PENDING" | "REJECTED";
  sourceReference: string;
  evidenceReferences: string[];
  permissions: EcosystemPermission[];
  limitations: string[];
}

export interface EcosystemProvenance {
  runtimeContextDigest: string;
  sourceReferences: string[];
  evidenceReferences: string[];
  opportunityReportIds: string[];
  knowledgeReportIds: string[];
  credentialReportIds: string[];
}

export interface EcosystemEntity extends EntityDraft {
  entityId: string;
  provenance: EcosystemProvenance;
}

export type RelationshipType = "MENTORS" | "COACHES" | "SUPPORTS" | "PARTNERS_WITH" | "WORKS_WITH" | "LEARNS_FROM" | "PARTICIPATES_IN" | "CONNECTED_TO";
export interface RelationshipDraft {
  sourceEntityName: string;
  targetEntityName: string;
  relationshipType: RelationshipType;
  consentStatus: "CONSENTED" | "PENDING" | "DECLINED" | "REVOKED";
  evidenceReferences: string[];
  startDate: string;
  status: "ACTIVE" | "INACTIVE" | "ENDED";
  permissions: EcosystemPermission[];
  hidden: boolean;
}

export interface EcosystemRelationship extends Omit<RelationshipDraft, "sourceEntityName" | "targetEntityName"> {
  relationshipId: string;
  sourceEntityId: string;
  targetEntityId: string;
  provenance: EcosystemProvenance;
}

export interface MentorshipDraft {
  mentorName: string;
  menteeName: string;
  expertiseAreas: string[];
  goals: string[];
  availability: string;
  consentStatus: "CONSENTED" | "PENDING" | "DECLINED" | "REVOKED";
  relationshipStatus: "ACTIVE" | "POTENTIAL" | "ENDED";
  outcomes: string[];
  evidenceReferences: string[];
}

export interface MentorshipRecord extends MentorshipDraft {
  mentorshipId: string;
  mentorEntityId: string;
  menteeEntityId: string;
  participationRequired: false;
}

export type SupportType = "ACADEMIC" | "CAREER" | "FINANCIAL_EDUCATION" | "ATHLETIC_DEVELOPMENT" | "ENTREPRENEURSHIP" | "COMMUNITY";
export interface SupportNetworkDraft {
  personName: string;
  identifiedNeeds: string[];
  resourceNames: string[];
  supporterNames: string[];
  organizationNames: string[];
  evidenceReferences: string[];
  permissions: EcosystemPermission[];
  supportTypes: SupportType[];
}
export interface SupportNetwork extends Omit<SupportNetworkDraft, "personName" | "resourceNames" | "supporterNames" | "organizationNames"> {
  networkId: string;
  personEntityId: string;
  resourceEntityIds: string[];
  supporterEntityIds: string[];
  organizationEntityIds: string[];
  explanation: string[];
}

export type ResourceType = "SCHOLARSHIP_SUPPORT" | "TUTORING" | "MENTORSHIP" | "CAREER_SERVICES" | "FINANCIAL_EDUCATION" | "WELLNESS" | "ENTREPRENEURSHIP";
export interface ResourceDraft { name: string; resourceType: ResourceType; description: string; providerName: string; eligibility: string[]; accessRequirements: string[]; verificationStatus: "VERIFIED" | "PENDING" | "REJECTED"; sourceReference: string; evidenceReferences: string[] }
export interface EcosystemResource extends ResourceDraft { resourceId: string; providerEntityId: string; provenance: EcosystemProvenance }

export interface OrganizationEcosystemRecord {
  organizationId: string;
  mission: string;
  services: string[];
  programs: string[];
  partnershipRelationshipIds: string[];
  verificationStatus: "VERIFIED";
  contacts: string[];
  evidenceReferences: string[];
}

export interface EcosystemAlignment {
  alignmentId: string;
  personId: string;
  personGoals: string[];
  availableSupportIds: string[];
  relationshipEvidence: string[];
  relevantResourceIds: string[];
  explanation: string[];
  limitations: string[];
  statement: "This represents a potential support connection, not a guaranteed outcome.";
  advisoryOnly: true;
  connectionCreated: false;
}

export interface UserControlledProfile {
  personId: string;
  entityName: string;
  interests: string[];
  goals: string[];
  requestedSupport: SupportType[];
  relationshipNames: string[];
  evidenceReferences: string[];
  permissions: EcosystemPermission[];
}

export interface EcosystemInput {
  runtimeContext: PBOSRuntimeContext | null;
  profile: UserControlledProfile;
  opportunityReports: OpportunityReport[];
  knowledgeReports: KnowledgeReport[];
  credentialReports: CredentialReport[];
  entityDrafts: EntityDraft[];
  relationshipDrafts: RelationshipDraft[];
  mentorshipDrafts: MentorshipDraft[];
  supportNetworkDrafts: SupportNetworkDraft[];
  resourceDrafts: ResourceDraft[];
  generatedAt: string;
  authorizedPersonIds: string[];
  hiddenConnectionRequested: boolean;
  fabricatedRelationshipRequested: boolean;
  rankingRequested: boolean;
  influenceScoreRequested: boolean;
}

export interface EcosystemReport {
  reportId: string;
  generatedAt: string;
  runtimeContextDigest: string;
  ecosystemEntities: EcosystemEntity[];
  relationships: EcosystemRelationship[];
  mentorships: MentorshipRecord[];
  supportNetworks: SupportNetwork[];
  resources: EcosystemResource[];
  organizations: OrganizationEcosystemRecord[];
  alignments: EcosystemAlignment[];
  evidenceBundle: string[];
  permissions: EcosystemPermission[];
  limitations: string[];
  provenance: EcosystemProvenance;
}

export type EcosystemGovernanceAction = "relationship-acceptance" | "mentorship-participation" | "institutional-partnership" | "organizational-representation";
export type EcosystemState = "DISCOVERING" | "VERIFYING" | "MAPPING" | "CONNECTING" | "SUPPORTING" | "REVIEWING" | "ARCHIVED";
export interface EcosystemLifecycleState { currentState: EcosystemState; transitions: Array<{ from: EcosystemState; to: EcosystemState; transitionedAt: string; authorityIdentity: string; evidenceReferences: string[] }> }
export type EcosystemFailureCode = "INVALID_CONTEXT" | "UNKNOWN_ENTITY" | "UNAUTHORIZED_RELATIONSHIP" | "PRIVACY_VIOLATION" | "FABRICATED_ORGANIZATION" | "FABRICATED_RELATIONSHIP" | "HIDDEN_CONNECTION" | "MISSING_EVIDENCE" | "RANKING_PROHIBITED" | "INFLUENCE_SCORE_PROHIBITED" | "INVALID_TRANSITION" | "GOVERNANCE_BYPASS";
export interface EcosystemFailure { code: EcosystemFailureCode; message: string }
