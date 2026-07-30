import { artifactDigest } from "../../kernel/identity";
import { CodexExecutionPackageEngine } from "../execution-packages";
import type {
  ExecutionAdmission,
  ExecutionLifecycle,
  ExecutionLifecycleState,
  ExecutionQueueSnapshot,
  ExecutionRequest,
  QueuedExecution,
  RuntimeExecutionSummary,
} from "./types";

const TRANSITIONS: Readonly<
  Record<ExecutionLifecycleState, readonly ExecutionLifecycleState[]>
> = {
  REQUESTED: ["AUTHORIZED", "BLOCKED"],
  AUTHORIZED: ["ADMITTED", "BLOCKED"],
  ADMITTED: ["RUNNING", "BLOCKED"],
  RUNNING: ["VALIDATING", "FAILED", "ROLLED_BACK"],
  VALIDATING: ["COMPLETED", "FAILED", "ROLLED_BACK"],
  COMPLETED: [],
  BLOCKED: [],
  FAILED: ["ROLLED_BACK"],
  ROLLED_BACK: [],
};

export function admitExecution(
  request: ExecutionRequest,
  timestamp: string
): ExecutionAdmission {
  const input = request.governed_input;
  const findings = [
    ...(!input.trusted_context ? ["Context is not trusted."] : []),
    ...(!new CodexExecutionPackageEngine().validate(input.execution_package).valid
      ? ["Execution package is invalid."]
      : []),
    ...(!input.authorization.valid ||
    input.authorization.decision.decision !== "APPROVED"
      ? ["Human authorization is invalid."]
      : []),
    ...(!input.dependencies_satisfied ? ["Dependencies are not satisfied."] : []),
    ...(!input.validations_passing ? ["Required validation is not passing."] : []),
    ...(!request.kernel_admission_digest
      ? ["Kernel admission evidence is missing."]
      : []),
    ...(!request.evidence_capture_required
      ? ["Evidence capture is not required."]
      : []),
    ...(!request.outcome_evaluation_required
      ? ["Outcome evaluation is not required."]
      : []),
  ];
  const body: ExecutionAdmission = {
    request_id: request.id,
    admitted: findings.length === 0,
    findings,
    admitted_by: "PBOS-KERNEL-ADMISSION",
    timestamp,
    digest: "",
  };
  return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
}

export class ExecutionQueue {
  readonly #items: readonly QueuedExecution[];

  constructor(items: readonly QueuedExecution[] = []) {
    this.#items = [...items];
  }

  enqueue(item: QueuedExecution): ExecutionQueue {
    if (
      this.#items.some(({ request }) => request.id === item.request.id) ||
      item.admission !== null
    ) {
      throw new Error("Execution queue rejects duplicate or pre-admitted work.");
    }
    return new ExecutionQueue([...this.#items, item]);
  }

  snapshot(): ExecutionQueueSnapshot {
    const items = [...this.#items];
    return { items, digest: artifactDigest(items) };
  }
}

export function transitionExecution(
  current: ExecutionLifecycle,
  to: ExecutionLifecycleState,
  actorId: string,
  evidenceId: string,
  timestamp: string
): ExecutionLifecycle {
  if (
    !TRANSITIONS[current.state].includes(to) ||
    !actorId ||
    !evidenceId
  ) {
    throw new Error("Execution lifecycle transition rejected.");
  }
  const body: ExecutionLifecycle = {
    ...current,
    state: to,
    history: [
      ...current.history,
      { from: current.state, to, actor_id: actorId, evidence_id: evidenceId, timestamp },
    ],
    digest: "",
  };
  return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
}

export function summarizeRuntimeExecution(
  input: Omit<RuntimeExecutionSummary, "digest">
): RuntimeExecutionSummary {
  if (
    input.evidence_ids.length === 0 ||
    (input.lifecycle.state === "COMPLETED" &&
      (!input.result || !input.outcome_id))
  ) {
    throw new Error("Execution summary evidence or outcome is incomplete.");
  }
  return { ...input, digest: artifactDigest(input) };
}
