import type {
  ExecutionEnvironment,
  ExecutionResult,
} from "../runner";
import type { GovernedExecutionInput } from "../execution";

export type ExecutionLifecycleState =
  | "REQUESTED"
  | "AUTHORIZED"
  | "ADMITTED"
  | "RUNNING"
  | "VALIDATING"
  | "COMPLETED"
  | "BLOCKED"
  | "FAILED"
  | "ROLLED_BACK";

export interface ExecutionRequest {
  readonly id: string;
  readonly governed_input: GovernedExecutionInput;
  readonly kernel_admission_digest: string;
  readonly requested_by: string;
  readonly requested_at: string;
  readonly evidence_capture_required: true;
  readonly outcome_evaluation_required: true;
}

export interface ExecutionAdmission {
  readonly request_id: string;
  readonly admitted: boolean;
  readonly findings: readonly string[];
  readonly admitted_by: "PBOS-KERNEL-ADMISSION";
  readonly timestamp: string;
  readonly digest: string;
}

export interface ExecutionLifecycle {
  readonly execution_id: string;
  readonly request_id: string;
  readonly state: ExecutionLifecycleState;
  readonly history: readonly {
    readonly from: ExecutionLifecycleState | null;
    readonly to: ExecutionLifecycleState;
    readonly actor_id: string;
    readonly evidence_id: string;
    readonly timestamp: string;
  }[];
  readonly digest: string;
}

export interface QueuedExecution {
  readonly request: ExecutionRequest;
  readonly environment: ExecutionEnvironment;
  readonly admission: ExecutionAdmission | null;
}

export interface ExecutionQueueSnapshot {
  readonly items: readonly QueuedExecution[];
  readonly digest: string;
}

export interface ExecutionIncident {
  readonly id: string;
  readonly execution_id: string;
  readonly severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  readonly finding: string;
  readonly evidence_ids: readonly string[];
  readonly timestamp: string;
}

export interface ExecutionRecovery {
  readonly execution_id: string;
  readonly owner: string;
  readonly actions: readonly string[];
  readonly validation: readonly string[];
  readonly evidence_ids: readonly string[];
}

export interface RuntimeExecutionSummary {
  readonly lifecycle: ExecutionLifecycle;
  readonly result: ExecutionResult | null;
  readonly incidents: readonly ExecutionIncident[];
  readonly recovery: ExecutionRecovery | null;
  readonly evidence_ids: readonly string[];
  readonly outcome_id: string | null;
  readonly digest: string;
}
