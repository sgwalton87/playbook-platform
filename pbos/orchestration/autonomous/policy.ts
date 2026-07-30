import { artifactDigest } from "../../kernel/identity";
import type {
  AutonomousExecutionPolicy,
  AutonomousExecutionState,
} from "./types";

const TRANSITIONS: Readonly<
  Record<AutonomousExecutionState, readonly AutonomousExecutionState[]>
> = {
  PROPOSED: ["APPROVED", "FAILED"],
  APPROVED: ["EXECUTING", "FAILED"],
  EXECUTING: ["VALIDATING", "FAILED"],
  VALIDATING: ["COMPLETED", "FAILED"],
  COMPLETED: [],
  FAILED: [],
};

export function transitionAutonomousExecution(
  current: AutonomousExecutionPolicy,
  to: AutonomousExecutionState,
  actor: string,
  approvalReference: string | null,
  timestamp: string
): AutonomousExecutionPolicy {
  if (
    !TRANSITIONS[current.state].includes(to) ||
    !actor ||
    (to === "APPROVED" && !approvalReference) ||
    (to === "EXECUTING" &&
      (!current.approved_by || !current.approval_reference))
  ) {
    throw new Error("Autonomous execution transition rejected.");
  }
  const body: AutonomousExecutionPolicy = {
    ...current,
    state: to,
    approved_by: to === "APPROVED" ? actor : current.approved_by,
    approval_reference:
      to === "APPROVED" ? approvalReference : current.approval_reference,
    evidence: [
      ...current.evidence,
      ...(approvalReference ? [approvalReference] : []),
    ],
    timestamp,
    digest: "",
  };
  return {
    ...body,
    evidence: [...new Set(body.evidence)].sort(),
    digest: artifactDigest({ ...body, digest: undefined }),
  };
}
