export interface CodexExecutionPackage {
  readonly package_id: string;
  readonly milestone_id: string;
  readonly mission: string;
  readonly context: readonly string[];
  readonly current_state: readonly string[];
  readonly dependencies: readonly string[];
  readonly required_changes: readonly string[];
  readonly implementation_requirements: readonly string[];
  readonly security_requirements: readonly string[];
  readonly validation_requirements: readonly string[];
  readonly documentation_requirements: readonly string[];
  readonly completion_criteria: readonly string[];
  readonly human_approval_required: true;
  readonly recommendation_digest: string;
  readonly timestamp: string;
  readonly digest: string;
}
