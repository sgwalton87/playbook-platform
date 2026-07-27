import type { PBOSRuntimeContext } from "../context";
import type { CredentialReport } from "../credential";
import type { DiscoveryReport } from "../discovery";
import type { LearningReport } from "../learning";
import type { MasteryReport } from "../mastery";

export type OpportunityType = "SCHOLARSHIP" | "INTERNSHIP" | "FELLOWSHIP" | "JOB" | "PROGRAM" | "COMPETITION" | "MENTORSHIP" | "ENTREPRENEURSHIP";
export type EligibilityStatus = "MEETS_REQUIREMENTS" | "MAY_BE_ELIGIBLE" | "UNKNOWN";
export type OpportunityConfidence = "HIGH" | "MEDIUM" | "LOW";

export interface OrganizationDraft {
  name: string;
  organizationType: "EDUCATIONAL" | "NONPROFIT" | "EMPLOYER" | "GOVERNMENT" | "COMMUNITY" | "PROFESSIONAL";
  mission: string;
  authority: string[];
  verificationStatus: "VERIFIED" | "PENDING" | "REJECTED";
  ownership: string;
  contactInformation: string[];
  sourceReference: string;
  evidenceReferences: string[];
}

export interface Organization extends OrganizationDraft {
  organizationId: string;
  provenance: OpportunityProvenance;
}

export type RequirementCategory = "ACADEMIC" | "COMPETENCY" | "CREDENTIAL" | "GEOGRAPHIC" | "TIMELINE" | "APPLICATION";
export interface EligibilityCriterion {
  criterionId: string;
  category: RequirementCategory;
  description: string;
  requiredEvidence: string[];
  sourceReference: string;
  verificationStatus: "VERIFIED" | "PENDING";
}

export interface DeadlineDraft {
  deadlineType: "APPLICATION" | "DOCUMENT" | "INTERVIEW" | "DECISION" | "START";
  date: string;
  sourceReference: string;
  verificationStatus: "VERIFIED" | "PENDING";
  reminderEligible: boolean;
}

export interface OpportunityDraft {
  title: string;
  description: string;
  organizationName: string;
  opportunityType: OpportunityType;
  location: string;
  requirements: string[];
  deadlines: DeadlineDraft[];
  applicationProcess: string[];
  eligibilityCriteria: EligibilityCriterion[];
  evidenceRequirements: string[];
  sourceReference: string;
  sourceEvidence: string[];
  verificationStatus: "VERIFIED" | "PENDING" | "REJECTED";
}

export interface Opportunity extends Omit<OpportunityDraft, "deadlines"> {
  opportunityId: string;
  organizationId: string;
  deadlines: OpportunityDeadline[];
  provenance: OpportunityProvenance;
}

export interface OpportunityDeadline extends DeadlineDraft {
  deadlineId: string;
  opportunityId: string;
}

export interface PersonOpportunityContext {
  personId: string;
  goals: string[];
  interests: string[];
  competencies: string[];
  credentialIds: string[];
  location: string;
  evidenceReferences: string[];
}

export interface EligibilityAssessment {
  eligibilityId: string;
  opportunityId: string;
  status: EligibilityStatus;
  satisfiedCriteriaIds: string[];
  unresolvedCriteriaIds: string[];
  missingCriteriaIds: string[];
  supportingEvidence: string[];
  limitations: string[];
}

export interface OpportunityAlignment {
  alignmentId: string;
  personId: string;
  opportunityId: string;
  supportingEvidence: string[];
  relevantCompetencies: string[];
  relevantCredentials: string[];
  relevantInterests: string[];
  relevantGoals: string[];
  locationFactor: "MATCH" | "DIFFERENT" | "UNKNOWN";
  whyIdentified: string[];
  limitations: string[];
  confidence: OpportunityConfidence;
  statement: "This represents potential relevance, not guaranteed success.";
}

export interface OpportunityRecommendation {
  recommendationId: string;
  opportunityId: string;
  evidenceBasis: string[];
  alignmentFactors: string[];
  preparationSuggestions: string[];
  missingRequirements: string[];
  limitations: string[];
  confidence: OpportunityConfidence;
  advisoryOnly: true;
  applicationSubmitted: false;
  acceptanceGuaranteed: false;
}

export interface ApplicationPathway {
  pathwayId: string;
  opportunityId: string;
  steps: string[];
  deadlines: OpportunityDeadline[];
  requirements: string[];
  documentsNeeded: string[];
  preparationResources: string[];
  supportRoles: string[];
  humanCompletionRequired: true;
}

export interface OpportunityProvenance {
  runtimeContextDigest: string;
  sourceReferences: string[];
  evidenceReferences: string[];
  credentialReportIds: string[];
  masteryReportIds: string[];
  learningReportIds: string[];
  discoveryReportIds: string[];
}

export interface OpportunityInput {
  runtimeContext: PBOSRuntimeContext | null;
  personContext: PersonOpportunityContext;
  credentialReports: CredentialReport[];
  masteryReports: MasteryReport[];
  learningReports: LearningReport[];
  discoveryReports: DiscoveryReport[];
  organizationDrafts: OrganizationDraft[];
  opportunityDrafts: OpportunityDraft[];
  eligibilityAssertions: Array<{ opportunitySourceReference: string; assertedStatus: EligibilityStatus }>;
  generatedAt: string;
  authorizedPersonIds: string[];
  fabricatedOpportunityRequested: boolean;
  guaranteedOutcomeRequested: boolean;
  unauthorizedDecisionRequested: boolean;
  rankingRequested: boolean;
}

export interface OpportunityReport {
  reportId: string;
  generatedAt: string;
  runtimeContextDigest: string;
  opportunityInventory: Opportunity[];
  organizations: Organization[];
  eligibilityAssessments: EligibilityAssessment[];
  alignmentRecords: OpportunityAlignment[];
  recommendations: OpportunityRecommendation[];
  applicationPathways: ApplicationPathway[];
  deadlines: OpportunityDeadline[];
  evidenceBundle: string[];
  limitations: string[];
  provenance: OpportunityProvenance;
}

export type OpportunityGovernanceAction = "admissions" | "hiring" | "scholarship-selection" | "program-acceptance" | "employment-decision";
export type OpportunityState = "DISCOVERING" | "VALIDATING_SOURCE" | "ANALYZING_REQUIREMENTS" | "ASSESSING_ALIGNMENT" | "PRESENTING_OPTIONS" | "HUMAN_SELECTION" | "APPLICATION_SUPPORT" | "OUTCOME_RECORDING" | "ARCHIVED";
export interface OpportunityLifecycleState { currentState: OpportunityState; transitions: Array<{ from: OpportunityState; to: OpportunityState; transitionedAt: string; authorityIdentity: string; evidenceReferences: string[] }> }
export type OpportunityFailureCode = "INVALID_CONTEXT" | "FABRICATED_OPPORTUNITY" | "UNKNOWN_ORGANIZATION" | "UNSUPPORTED_ELIGIBILITY" | "MISSING_EVIDENCE" | "HIDDEN_CRITERIA" | "GUARANTEED_OUTCOME" | "UNAUTHORIZED_DECISION" | "PRIVACY_VIOLATION" | "RANKING_PROHIBITED" | "INVALID_TRANSITION" | "GOVERNANCE_BYPASS";
export interface OpportunityFailure { code: OpportunityFailureCode; message: string }
