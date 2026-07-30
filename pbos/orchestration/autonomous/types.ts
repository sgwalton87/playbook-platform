export type AutonomousExecutionState =
  | "PROPOSED"
  | "APPROVED"
  | "EXECUTING"
  | "VALIDATING"
  | "COMPLETED"
  | "FAILED";

export interface AutonomousExecutionPolicy {
  readonly policy_id: string;
  readonly package_id: string;
  readonly state: AutonomousExecutionState;
  readonly human_approval_required: true;
  readonly approved_by: string | null;
  readonly approval_reference: string | null;
  readonly evidence: readonly string[];
  readonly timestamp: string;
  readonly digest: string;
}
