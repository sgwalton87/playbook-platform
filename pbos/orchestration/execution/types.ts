import type { AuthorizationEvidence } from "../authorization";
import type { CodexExecutionPackage } from "../execution-packages";

export type GovernedExecutionState =
  | "PROPOSED"
  | "APPROVED"
  | "EXECUTING"
  | "VALIDATING"
  | "COMPLETED"
  | "AUDITED"
  | "BLOCKED"
  | "FAILED"
  | "ROLLED_BACK";

export interface GovernedExecutionInput {
  readonly trusted_context: boolean;
  readonly execution_package: CodexExecutionPackage;
  readonly authorization: AuthorizationEvidence;
  readonly dependencies_satisfied: boolean;
  readonly validations_passing: boolean;
}

export interface GovernedExecutionEvidence {
  readonly execution_id: string;
  readonly state: GovernedExecutionState;
  readonly package_id: string;
  readonly authorization_id: string;
  readonly changes_made: readonly string[];
  readonly files_affected: readonly string[];
  readonly validation_results: readonly string[];
  readonly failures: readonly string[];
  readonly rollback_information: readonly string[];
  readonly completion_evidence: readonly string[];
  readonly timestamp: string;
  readonly digest: string;
}
