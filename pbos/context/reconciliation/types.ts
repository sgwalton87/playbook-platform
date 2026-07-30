import type { RepositoryContextSnapshot } from "../schema";

export type ContextReconciliationState =
  | "DETECTED"
  | "ANALYZING"
  | "RECONCILING"
  | "VERIFIED"
  | "REJECTED";

export interface ContextDifference {
  readonly code:
    | "MISSING_CONTEXT"
    | "REPOSITORY_IDENTITY"
    | "REPOSITORY_ROOT"
    | "REMOTE_IDENTITY"
    | "BRANCH_IDENTITY"
    | "COMMIT_IDENTITY"
    | "CONTENT_IDENTITY"
    | "RUNTIME_IDENTITY"
    | "ARTIFACT_INVENTORY"
    | "ARTIFACT_IDENTITY";
  readonly previous: string | null;
  readonly current: string | null;
  readonly resolution: string;
}

export interface ContextReconciliationReport {
  readonly reconciliation_id: string;
  readonly state: ContextReconciliationState;
  readonly previous_identity: string | null;
  readonly current_identity: string;
  readonly previous_snapshot: RepositoryContextSnapshot | null;
  readonly current_snapshot: RepositoryContextSnapshot;
  readonly differences: readonly ContextDifference[];
  readonly resolution_actions: readonly string[];
  readonly confidence: number;
  readonly timestamp: string;
  readonly digest: string;
}
