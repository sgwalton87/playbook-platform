import type { ObjectiveLifecycleState } from "./types";

const NEXT_STATE: Partial<
  Record<ObjectiveLifecycleState, ObjectiveLifecycleState>
> = {
  PROPOSED: "REGISTERED",
  REGISTERED: "ELIGIBLE",
  ELIGIBLE: "PLANNED",
  PLANNED: "EXECUTING",
  EXECUTING: "COMPLETED",
  COMPLETED: "ARCHIVED",
};

export function assertObjectiveTransition(
  from: ObjectiveLifecycleState,
  to: ObjectiveLifecycleState
): void {
  if (NEXT_STATE[from] !== to) {
    throw new Error(
      `Invalid objective lifecycle transition: ${from} -> ${to}.`
    );
  }
}
