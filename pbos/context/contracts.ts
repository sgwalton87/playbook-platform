export type ValidationState = "verified" | "invalid" | "pending";
export type ApprovalStatus = "approved" | "pending" | "rejected" | "revoked";

export interface ConstitutionalRuleInput {
  id: string;
  effect: "required" | "forbidden" | "permitted" | "approval-required";
  subject: string;
  description: string;
}

export interface ConstraintInput {
  id: string;
  kind: "automation" | "approval" | "execution-block";
  description: string;
}

export interface ConstitutionalSource {
  identifier: string;
  title: string;
  version: string;
  location: string;
  status: string;
  owner: string;
  dependencies: string[];
  content: string;
  digest: string;
  validationState: ValidationState;
  rules?: ConstitutionalRuleInput[];
  constraints?: ConstraintInput[];
}

export interface GovernanceDecision {
  issueIdentifier: string;
  decisionType: "correction" | "exception" | "migration" | "supersession" | "amendment" | "rejection";
  affectedArtifacts: string[];
  approvalStatus: ApprovalStatus;
  evidence: string[];
  effectiveVersion: string;
}

export interface RegistryDocument {
  identifier: string;
  location: string;
  owner: string;
  version: string;
}

export interface ValidatedRegistry {
  version: string;
  validationState: ValidationState;
  documents: RegistryDocument[];
}

export interface ContextCompilationInput {
  sources: ConstitutionalSource[];
  governanceDecisions: GovernanceDecision[];
  registry: ValidatedRegistry;
  compilationTimestamp: string;
}

export interface RuleProvenance {
  sourceDocument: string;
  sourceIdentifier: string;
  version: string;
  digest: string;
  compilationTimestamp: string;
  validationStatus: "verified";
}

export interface ValidatedRule extends ConstitutionalRuleInput {
  provenance: RuleProvenance;
}

export interface RuntimeConstraint extends ConstraintInput {
  sourceIdentifier: string;
}

export interface DocumentInventoryEntry {
  identifier: string;
  title: string;
  version: string;
  location: string;
  owner: string;
  digest: string;
}

export interface DependencyEdge {
  source: string;
  target: string;
}

export interface ExclusionRecord {
  artifact: string;
  reason: string;
}

export interface PBOSRuntimeContext {
  contextVersion: "1.0.0";
  compilationTimestamp: string;
  sourceDigest: string;
  registryDigest: string;
  governanceDigest: string;
  contextDigest: string;
  documentInventory: DocumentInventoryEntry[];
  validatedRules: ValidatedRule[];
  constraints: RuntimeConstraint[];
  dependencyGraph: DependencyEdge[];
  exclusionRecords: ExclusionRecord[];
}

export type ContextFailureCode =
  | "MISSING_AUTHORITY"
  | "UNRESOLVED_DEPENDENCY"
  | "INVALID_DIGEST"
  | "PENDING_GOVERNANCE"
  | "CONFLICTING_AUTHORITY"
  | "INVALID_SOURCE";

export interface ContextFailure {
  code: ContextFailureCode;
  artifact: string;
  message: string;
}
